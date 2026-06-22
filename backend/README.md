# CourtFlow API

FastAPI boundary for authenticated CourtFlow data, box-score ingestion, and
AI coaching. The service never exposes provider or Supabase service-role keys
to either browser application.

## Local development

```bash
python -m pip install -r backend/requirements-dev.txt
uvicorn backend.app.main:app --reload
python -m pytest backend/tests
```

`GET /health` deliberately works without Supabase or AI configuration. All
tenant routes require a verified Supabase JWT and an active membership.
