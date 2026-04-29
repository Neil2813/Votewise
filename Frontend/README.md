# VOTEWISE AI Frontend

This is the frontend for the India-only VOTEWISE AI backend.

## What is connected

- `POST /chat`
- `POST /generate-guide`
- `POST /compare`
- `POST /misinformation-check`
- `POST /readiness-score`
- `POST /simulate`
- `GET /health`
- `GET /sources`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment

Set the backend base URL:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

If your backend runs on a different host or port, update this value accordingly.

## Notes

- The frontend keeps no persistent user database.
- Conversation state lives only in the browser session.
- The app is built to stay neutral and India-only.
- The backend should allow the frontend origin through CORS.

## Structure

- `src/lib/api.ts` — typed API client
- `src/components/` — reusable UI blocks
- `src/pages/` — page-level screens
- `src/App.tsx` — layout and routing by page state
