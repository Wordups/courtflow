# Backend Boundary

CourtFlow should not call LLM providers directly from the client app.

The production backend should own:

- AI provider credentials and rate limits.
- Authenticated `/api/ai/coach` requests.
- Athlete/team data sync.
- Audit-friendly privacy controls for parent-visible notes.

The client should call a CourtFlow-owned endpoint and gracefully fall back to local/offline guidance when unavailable.

## Current Client Boundary

The prototype calls `POST /api/ai/coach` with:

- `sport`
- `assistantName`
- `message`
- recent chat `messages`
- a compact `context` object for players and drill links

That endpoint is intentionally not implemented in the browser. A future serverless function should receive this payload, authenticate it, call the selected model provider with server-side credentials, and return `{ "reply": "..." }`.
