# Backend Boundary

CourtFlow should not call LLM providers directly from the client app.

The production backend should own:

- AI provider credentials and rate limits.
- Authenticated `/api/ai/coach` requests.
- Athlete/team data sync.
- Audit-friendly privacy controls for parent-visible notes.

The client should call a CourtFlow-owned endpoint and gracefully fall back to local/offline guidance when unavailable.
