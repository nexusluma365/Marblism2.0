# Marblism → Netlify Bridge Integration

This project now includes a Remix action route at:

`/api/marblism/publish`

## Required environment variables

Add these to the app's `.env` file and deployment environment:

```bash
SERVER_MARBLISM_BRIDGE_URL=https://glistening-cheesecake-22a4f5.netlify.app/.netlify/functions/marblism-bridge
SERVER_MARBLISM_BRIDGE_SECRET=your-bridge-secret
```

## Test the new endpoint

```bash
curl -X POST http://localhost:8099/api/marblism/publish \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Marblism Publish Test",
    "content": "This was forwarded from the Remix app to the Netlify bridge."
  }'
```

## What this route does

1. Accepts a POST request with `title` and `content`
2. Validates the payload
3. Forwards the content to the Netlify bridge using the stored bridge secret
4. Returns the bridge response

## Next step

Call `/api/marblism/publish` from the part of the Marblism app that creates or finalizes content.
