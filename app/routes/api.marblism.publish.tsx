import { json, type ActionFunctionArgs } from '@remix-run/node'

const getEnv = (name: string) => process.env[name]?.trim()

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json(
      {
        success: false,
        error: 'Method not allowed',
        detail: `Expected POST, received ${request.method}.`,
      },
      { status: 405 },
    )
  }

  try {
    const bridgeUrl = getEnv('SERVER_MARBLISM_BRIDGE_URL')
    const bridgeSecret = getEnv('SERVER_MARBLISM_BRIDGE_SECRET')

    if (!bridgeUrl || !bridgeSecret) {
      return json(
        {
          success: false,
          error: 'Missing bridge configuration',
          detail:
            'Set SERVER_MARBLISM_BRIDGE_URL and SERVER_MARBLISM_BRIDGE_SECRET in your environment.',
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const content = typeof body?.content === 'string' ? body.content : ''

    if (!title || !content) {
      return json(
        {
          success: false,
          error: 'Invalid payload',
          detail: 'Both title and content are required.',
        },
        { status: 400 },
      )
    }

    const bridgeResponse = await fetch(bridgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': bridgeSecret,
      },
      body: JSON.stringify({
        title,
        content,
        source: 'marblism-app',
      }),
    })

    const raw = await bridgeResponse.text()
    let data: unknown = null

    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = raw
    }

    if (!bridgeResponse.ok) {
      return json(
        {
          success: false,
          error: 'Bridge request failed',
          status: bridgeResponse.status,
          bridgeResponse: data,
        },
        { status: 502 },
      )
    }

    return json({
      success: true,
      message: 'Content forwarded to bridge successfully.',
      bridgeResponse: data,
    })
  } catch (error) {
    console.error('api.marblism.publish error', error)

    return json(
      {
        success: false,
        error: 'Failed to publish content',
      },
      { status: 500 },
    )
  }
}
