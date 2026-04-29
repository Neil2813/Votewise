# VOTEWISE AI Backend

India-only, stateless, retrieval-first backend for election education.

## What this backend does

- Answers only with India-specific election knowledge.
- Never stores user data in a database.
- Uses local retrieval first from:
  - `election_rules.txt`
  - `misinformation.txt`
  - `voter_registration.txt`
- Falls back in this order:
  1. Gemini
  2. Groq
  3. Local rule-based response
  4. Safe failure message

## Endpoints

- `POST /chat`
- `POST /generate-guide`
- `POST /compare`
- `POST /misinformation-check`
- `POST /readiness-score`
- `POST /simulate`
- `GET /health`
- `GET /sources`

## Frontend fit

This backend maps cleanly to the current frontend pages already present in your app:
- Home
- Election Guide
- Compare Candidates
- Simulator
- Misinformation Check
- Readiness Score

The frontend currently includes those screens in a single-page route switch, so the backend is organized to match them. The current frontend also shows non-India options in the guide UI, but the backend here rejects non-India content and stays strictly India-only. fileciteturn0file0

## Run locally

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Notes

- No database is used.
- No user profile, session, or message history is persisted.
- Cached retrieval uses only in-memory source loading for performance.
- Optional files such as `voting_day.txt` and `faq.txt` are supported but not required.
