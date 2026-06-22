# CourtFlow

CourtFlow is a multi-tenant coaching platform with a mobile coaching app, a
separate organization portal, and an authenticated FastAPI/Supabase backend.

## Repository layout

```text
apps/mobile/            Existing mobile UI, Vite build, Capacitor config
apps/portal/            Miller organization administration surface
backend/                FastAPI API and tests
supabase/migrations/    Multi-tenant schema, RLS, storage, transaction RPC
supabase/seed/          Optional organization-scoped development seed
docs/                   Smoke tests and product/deployment notes
render.yaml             Backend deployment blueprint
netlify.toml            Combined mobile + /portal web deployment
```

## Local development

```bash
npm install
npm run dev -w @courtflow/mobile
npm run dev -w @courtflow/portal

python -m pip install -r backend/requirements-dev.txt
uvicorn backend.app.main:app --reload
```

## Verification

```bash
npm test
npm run build
```

The deployed web bundle serves the mobile application at `/` and the Miller
Portal at `/portal/`. AI and cloud sync remain disabled until authenticated
Supabase and provider configuration are supplied server-side.
