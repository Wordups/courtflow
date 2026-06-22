// ═══════════════════════════════════════════════════════
//  NAVIGATION — tab switching, screen-stack push/back,
//  modal open/close, FAB toggling.
//
//  goTab needs to call each tab's renderer, but those
//  renderers live in their own modules (home, players,
//  drills, focus, depth-chart, ai). Direct imports would
//  create circular dependencies (goTab -> renderX -> goTab),
//  so we expose a small registry instead: each tab module
//  calls registerTab(id, renderFn) at wiring time.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';

// ── Tab renderer registry ──────────────────────────────
const tabRenderers = Object.create(null);

export function registerTab(id, fn){
  tabRenderers[id] = fn;
}

// ── Tab + screen navigation ────────────────────────────
export function goTab(id){
  document.body.classList.remove('summary-mode');
  document.querySelectorAll('.screen.tab-root').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
  document.querySelectorAll('.bni').forEach(b => b.classList.remove('act'));
  const map = { tHome:'bn-home', tPlayers:'bn-players', tDrills:'bn-drills', tAI:'bn-ai', tFocus:null, tDepth:null };
  const bn = map[id];
  if (bn) document.getElementById(bn)?.classList.add('act');
  state.currentTab = id;
  const render = tabRenderers[id];
  if (render) render();
}

export function push(id){
  if (id === 'sSessionSummary') document.body.classList.add('summary-mode');
  document.querySelectorAll('.screen:not(.tab-root)').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  state.screenStack.push(id);
}

export function back(fallback){
  const last = state.screenStack.pop();
  if (last === 'sSessionSummary') document.body.classList.remove('summary-mode');
  if (last) document.getElementById(last)?.classList.remove('active');
  if (state.screenStack.length) {
    document.getElementById(state.screenStack[state.screenStack.length - 1])?.classList.add('active');
  } else {
    goTab(fallback || state.currentTab);
  }
}

// ── Modal helpers ──────────────────────────────────────
export function openModal(id){ document.getElementById(id)?.classList.add('show'); }
export function closeModal(id){ document.getElementById(id)?.classList.remove('show'); }

// ── FAB ────────────────────────────────────────────────
export function toggleFAB(){
  state.fabOpen = !state.fabOpen;
  const btn = document.getElementById('fabBtn');
  btn.classList.toggle('open', state.fabOpen);
  btn.textContent = state.fabOpen ? '✕' : '+';
  if (state.fabOpen) openModal('mFAB');
  else closeModal('mFAB');
}

export function closeFAB(){
  state.fabOpen = false;
  const btn = document.getElementById('fabBtn');
  if (btn) {
    btn.classList.remove('open');
    btn.textContent = '+';
  }
  closeModal('mFAB');
}

// FAB modal click-outside-to-close handler.
// Wired at module load — the markup is part of the static shell.
const fabBg = document.getElementById('mFAB');
if (fabBg) {
  fabBg.addEventListener('click', e => { if (e.target === fabBg) closeFAB(); });
}
