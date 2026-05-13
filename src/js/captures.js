// ═══════════════════════════════════════════════════════
//  CAPTURES — quick-capture modal (note / stat / drill)
//  and the parent-visibility toggle.
//
//  Visibility behavior:
//  - Only note captures can be marked parent-visible. Stat
//    and drill captures always save as private.
//  - Switching capture type away from 'note' must reset the
//    visibility toggle, since the field is hidden.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { DB, pfx, getCaptures, getPlayers } from './storage.js';
import { esc, uid, showToast } from './utils.js';
import { openModal, closeModal } from './navigation.js';
import { renderHome } from './home.js';
// Player timeline re-renders after save when the modal was scoped to a player.
// We import lazily inside the function to avoid a hard circular dep with players.js.
import { renderPlayerTimeline } from './players.js';

export function openCapture(type = 'note'){
  state.capType = type;
  state.capTags = [];
  state.capVisibility = 'private';
  resetVisibilityToggle();
  setCapType(type);
  const players = getPlayers();
  const sel = document.getElementById('capPlayer');
  sel.innerHTML = '<option value="">— No player —</option>'
    + players.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if (state.currentPlayer) sel.value = state.currentPlayer.id;
  openModal('mCapture');
}

export function setCapType(type){
  state.capType = type;
  ['note','stat','drill'].forEach(t => {
    document.getElementById('capType' + t.charAt(0).toUpperCase() + t.slice(1))
      ?.classList.toggle('act', t === type);
    document.getElementById('cap' + t.charAt(0).toUpperCase() + t.slice(1) + 'Fields')
      .style.display = t === type ? '' : 'none';
  });
  const visRow = document.getElementById('capVisRow');
  if (visRow) visRow.style.display = type === 'note' ? '' : 'none';
  if (type !== 'note') resetVisibilityToggle();
}

export function toggleCapTag(el, tag){
  el.classList.toggle('sel');
  if (el.classList.contains('sel')) state.capTags.push(tag);
  else state.capTags = state.capTags.filter(t => t !== tag);
}

export function saveCapture(){
  const playerId = document.getElementById('capPlayer').value || null;
  const caps = getCaptures();
  let cap = {
    id: uid(),
    playerId,
    ts: Date.now(),
    sport: state.SPORT,
    visibility: state.capType === 'note' ? state.capVisibility : 'private',
  };

  if (state.capType === 'note') {
    const txt = document.getElementById('capNoteText').value.trim();
    if (!txt) { showToast('tO', 'Write a note first'); return; }
    cap = { ...cap, type: 'note', content: txt, tags: [...state.capTags] };
  } else if (state.capType === 'stat') {
    const val = document.getElementById('capStatValue').value;
    if (!val) { showToast('tO', 'Enter a value'); return; }
    const metric = document.getElementById('capStatMetric').value;
    const unit = document.getElementById('capStatUnit').value || '';
    cap = { ...cap, type: 'stat', metric, value: parseFloat(val), unit };
  } else {
    const title = document.getElementById('capDrillTitle').value.trim();
    if (!title) { showToast('tO', 'Enter a drill name'); return; }
    cap = { ...cap, type: 'drill', title, content: document.getElementById('capDrillNote').value };
  }

  caps.push(cap);
  DB.set(pfx() + '_captures', caps);
  closeModal('mCapture');
  if (state.currentPlayer && state.currentPlayer.id === playerId) {
    renderPlayerTimeline(state.currentPlayer);
  }
  renderHome();
  const visMsg = state.capVisibility === 'parent_visible' ? ' · 👁 parent visible' : '';
  showToast('tG', '✓ Saved to timeline' + visMsg);

  // Reset fields
  document.getElementById('capNoteText').value = '';
  document.getElementById('capStatValue').value = '';
  document.getElementById('capDrillTitle').value = '';
  document.getElementById('capDrillNote').value = '';
  state.capTags = [];
  document.querySelectorAll('.cap-tag').forEach(t => t.classList.remove('sel'));
  resetVisibilityToggle();
}

// ── Visibility toggle (only enabled for note captures) ─
export function toggleCaptureVisibility(){
  state.capVisibility = state.capVisibility === 'private' ? 'parent_visible' : 'private';
  const toggle = document.getElementById('capVisToggle');
  const ico = document.getElementById('capVisIco');
  const lbl = document.getElementById('capVisLabel');
  const sub = document.getElementById('capVisSub');
  if (state.capVisibility === 'parent_visible') {
    toggle.classList.add('parent-vis');
    ico.textContent = '👁';
    lbl.textContent = 'Parent Visible — Shows in summaries';
    sub.textContent = 'Tap to make private';
  } else {
    toggle.classList.remove('parent-vis');
    ico.textContent = '🔒';
    lbl.textContent = 'Private — Coach only';
    sub.textContent = 'Tap to make visible in parent summaries';
  }
}

export function resetVisibilityToggle(){
  state.capVisibility = 'private';
  document.getElementById('capVisToggle')?.classList.remove('parent-vis');
  const ico = document.getElementById('capVisIco');
  const lbl = document.getElementById('capVisLabel');
  const sub = document.getElementById('capVisSub');
  if (ico) ico.textContent = '🔒';
  if (lbl) lbl.textContent = 'Private — Coach only';
  if (sub) sub.textContent = 'Tap to make visible in parent summaries';
}
