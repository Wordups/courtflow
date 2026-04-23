# CourtFlow

CourtFlow is a mobile-first coaching app for tracking athletes, session notes, drill links, weekly focus items, and player development.

## App Store Direction

This repo is set up as the clean home for the CourtFlow app. The current priority is to harden the single-page prototype before native packaging:

1. Fix data persistence and app-state bugs.
2. Remove direct client-side LLM calls.
3. Escape or safely render all user-controlled values.
4. Validate external drill URLs.
5. Prepare the app for Capacitor iOS packaging.

## Structure

```text
src/
  index.html      Current mobile web app shell
backend/
  README.md       AI/backend proxy boundary notes
docs/
  app-store.md    App Store readiness checklist
```

## Local Use

For now, open `src/index.html` directly in a browser. After the prototype is added and hardened, this repo can add a lightweight build step and Capacitor.
