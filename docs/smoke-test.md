# Smoke test — Court Flow PWA

A 10-step manual walkthrough that exercises every screen and the
key save/share flows. Run this after any refactor before declaring
the app stable.

## How to run

1. Open `src/index.html` in Chrome (drag-and-drop, or `file://`).
   **Important:** because the app uses native ES modules
   (`<script type="module">`), some browsers block module loading
   from `file://`. If you see CORS errors in DevTools, serve the
   `src/` directory via a tiny local server, e.g.:
   ```
   cd src && python -m http.server 8000
   # then open http://localhost:8000/
   ```
2. Open DevTools → Console. The page should load with **zero**
   `console.error`. Warnings are OK; errors are not.
3. Walk through each step below in order. Mark `✓` next to anything
   that passes, `✗` next to anything that breaks.

## The 10 checks

1. **Splash + onboarding** — first-run users land on splash, then
   the two-step onboarding (sport then role). After "Let's Go" the
   home tab renders.
2. **Sport switch** — tap the sport chip in the home header. Switch
   from Basketball to Football and back. The chip icon, the AI tab
   label (CourtIQ ↔ FieldIQ), and the depth-chart quick-action
   visibility all update.
3. **Add a new player via FAB** — tap the center `+` FAB → the FAB
   menu shows. From outside the FAB menu, also exercise the
   Players tab `+ Add` button. New player appears in the list.
4. **Quick capture: note + stat + drill** — tap FAB → Quick Note.
   Save a note. Then re-open and switch to Stat (enter value +
   unit), then Drill (enter a title). Each saves to the
   timeline.
5. **Save a drill link with a valid https:// URL** — Drills tab →
   `+ Save Link`. Paste a real `https://www.youtube.com/...` URL.
   Verify the thumb preview appears and the link saves. Then try
   a `http://...` URL and confirm it's rejected (red toast).
6. **Weekly Focus** — Focus tab → pick a player → add an item →
   toggle complete → delete. Progress bar updates with each
   change.
7. **Session flow** — Home → Start Session → pick player + plan
   → advance through 4 drills (next, makes/atts adjusters, drill
   note) → end on the last drill → summary screen renders with
   correct duration, drill count, note count.
8. **Football depth chart** — switch sport to Football → bottom
   tabs don't show Depth (it's a stack push), so go via Home →
   Depth Chart quick action. Pick a position slot → assign a
   player. Verify the slot fills and the position group count
   updates.
9. **AI tab — offline state** — open the AI tab (CourtIQ /
   FieldIQ). The welcome bubble renders. The Send button and
   insight cards are **hidden** because `CF_FLAGS.AI_ENABLED` is
   false. The tab itself remains visible.
10. **Settings** — open via the gear icon. Tap Export My Data →
    JSON file downloads. Tap Privacy / Terms links — they open
    in a new tab. Tap Reset Onboarding → confirm → app reloads
    into the onboarding flow.

## What "pass" means

Every step renders the expected screen and saves/loads its data
without throwing. Zero `console.error` for the entire session.
Visual layout matches the pre-refactor app on every screen.
