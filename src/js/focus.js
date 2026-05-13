// ═══════════════════════════════════════════════════════
//  FOCUS — weekly focus tab + per-player detail screen.
//
//  Three surfaces share this module:
//   - renderFocus: the standalone Weekly Focus tab
//   - renderPlayerFocusInTab: the body of that tab, re-used
//     because the picker swaps the active player without
//     re-running the tab shell
//   - renderFocusDetail / openFocusDetail: the pushed
//     detail screen with full add/delete + new-week.
//
//  renderPlayerFocus (the in-player-detail mini-view) lives
//  in players.js because it's part of the player tab set.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import {
  DB, pfx,
  getPlayers, getFocusWeeks, getFocusItems, getDrillLinks,
} from './storage.js';
import { esc, uid, showToast, safeColor } from './utils.js';
import { openModal, closeModal, push } from './navigation.js';

export function renderFocus(){
  const p = state.focusPlayerId ? getPlayers().find(x => x.id === state.focusPlayerId) : null;
  if (!p) {
    document.getElementById('wfWeekTitle').textContent = 'Choose a player to begin';
    document.getElementById('wfWeekSub').textContent = 'Track weekly development goals';
    document.getElementById('focusItemsList').innerHTML =
      '<div class="empty"><div class="empty-ico">🎯</div><div class="empty-ttl">Select a player</div><div class="empty-dsc">Tap the player button above to choose who you\'re planning for</div></div>';
    document.getElementById('focusAddBar').style.display = 'none';
    return;
  }
  document.getElementById('focusPlayerBtn').textContent = p.name + ' ▾';
  document.getElementById('focusAddBar').style.display = '';
  renderPlayerFocusInTab(p);
}

export function renderPlayerFocusInTab(p, elId = null){
  const weeks = getFocusWeeks().filter(w => w.playerId === p.id && w.status === 'active');
  let week = weeks[0];

  if (!week) {
    const now = new Date(); const dow = now.getDay();
    const start = new Date(now); start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    const end = new Date(start); end.setDate(start.getDate() + 6);
    week = { id: uid(), playerId: p.id, weekStart: start.toISOString().split('T')[0], weekEnd: end.toISOString().split('T')[0], sport: state.SPORT, status: 'active' };
    const weeks2 = getFocusWeeks(); weeks2.push(week); DB.set(pfx() + '_focusweeks', weeks2);
  }

  const items = getFocusItems().filter(fi => fi.weekId === week.id);
  const done = items.filter(fi => fi.status === 'completed').length;
  const total = items.length;

  const wt = document.getElementById('wfWeekTitle');
  const ws = document.getElementById('wfWeekSub');
  const wf = document.getElementById('wfProgFill');
  const wl = document.getElementById('wfProgLbl');
  const wl2 = document.getElementById('focusWeekLbl');
  if (wt) wt.textContent = p.name + "'s Weekly Focus";
  if (ws) ws.textContent = `${week.weekStart} → ${week.weekEnd} · ${state.SPORT}`;
  if (wf) wf.style.width = total ? ((done / total * 100) + '%') : '0%';
  if (wl) wl.textContent = done + '/' + total + ' done';
  if (wl2) wl2.textContent = week.weekStart + ' — ' + week.weekEnd;

  const renderTarget = elId ? document.getElementById(elId) : document.getElementById('focusItemsList');
  if (!renderTarget) return;

  if (!items.length) {
    renderTarget.innerHTML = '<div class="empty"><div class="empty-ico">✅</div><div class="empty-ttl">No focus items yet</div><div class="empty-dsc">Add a focus item below — keep it specific and actionable</div></div>';
    return;
  }

  const prioCls = { high:'high', medium:'medium', low:'low' };
  renderTarget.innerHTML = items.map(fi => `
    <div class="focus-item" id="fi-${fi.id}">
      <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItem('${fi.id}','${week.id}','${p.id}',${elId?`'${elId}'`:'null'})">${fi.status==='completed'?'✓':''}</div>
      <div class="fi-content">
        <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
        <div class="fi-meta">
          <div class="fi-priority ${prioCls[fi.priority]}"></div>
          <span>${esc(fi.cat)}</span>
          ${fi.priority==='high'?'<span style="color:var(--red);font-size:10px;font-weight:700">HIGH</span>':''}
        </div>
        ${fi.drillLinkId?`<div class="fi-drill-link">🔗 ${esc(getDrillLinks().find(d=>d.id===fi.drillLinkId)?.title||'Drill attached')}</div>`:''}
      </div>
      <div class="fi-del" onclick="deleteFocusItem('${fi.id}','${week.id}','${p.id}',${elId?`'${elId}'`:'null'})">✕</div>
    </div>`).join('');
}

export function toggleFocusItem(itemId, _weekId, playerId, elId){
  const items = getFocusItems();
  const item = items.find(fi => fi.id === itemId);
  if (item) item.status = item.status === 'completed' ? 'pending' : 'completed';
  DB.set(pfx() + '_focusitems', items);
  const p = getPlayers().find(x => x.id === playerId);
  if (p) { if (elId) renderPlayerFocusInTab(p, elId); else renderPlayerFocusInTab(p); }
  if (item?.status === 'completed') showToast('tG', '✓ Focus item completed!');
}

export function deleteFocusItem(itemId, _weekId, playerId, elId){
  DB.set(pfx() + '_focusitems', getFocusItems().filter(fi => fi.id !== itemId));
  const p = getPlayers().find(x => x.id === playerId);
  if (p) { if (elId) renderPlayerFocusInTab(p, elId); else renderPlayerFocusInTab(p); }
}

export function openFocusPlayerPicker(){
  const players = getPlayers();
  document.getElementById('focusPlayerPickerList').innerHTML = players.map(p => {
    const color = safeColor(p.color);
    return `
    <div class="player-row" onclick="selectFocusPlayer('${p.id}')">
      <div class="pav" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div><div class="pname">${esc(p.name)}</div><div class="pdetail">${esc(p.pos)} · Age ${Number(p.age)||''}</div></div>
    </div>`;
  }).join('');
  openModal('mFocusPlayer');
}

export function selectFocusPlayer(id){
  state.focusPlayerId = id;
  closeModal('mFocusPlayer');
  renderFocus();
}

export function addFocusItem(){
  if (!state.focusPlayerId) { showToast('tO', 'Select a player first'); return; }
  const title = document.getElementById('focusNewItem').value.trim();
  if (!title) { showToast('tO', 'Enter a focus item'); return; }
  const p = getPlayers().find(x => x.id === state.focusPlayerId);
  if (!p) return;
  const weeks = getFocusWeeks().filter(w => w.playerId === state.focusPlayerId && w.status === 'active');
  if (!weeks.length) { renderFocus(); setTimeout(addFocusItem, 100); return; }
  const items = getFocusItems();
  items.push({
    id: uid(),
    weekId: weeks[0].id,
    playerId: state.focusPlayerId,
    title,
    cat: 'General',
    priority: 'medium',
    status: 'pending',
    drillLinkId: null,
    ts: Date.now(),
  });
  DB.set(pfx() + '_focusitems', items);
  document.getElementById('focusNewItem').value = '';
  renderFocus();
  showToast('tG', '✓ Focus item added');
}

// ── Pushed detail screen ───────────────────────────────
export function openFocusDetail(playerId){
  state.focusDetailPlayerId = playerId;
  const p = getPlayers().find(x => x.id === playerId);
  if (!p) return;
  document.getElementById('fdName').textContent = p.name + "'s Focus";
  renderFocusDetail(p);
  push('sFocusDetail');
}

function renderFocusDetail(p){
  const weeks = getFocusWeeks().filter(w => w.playerId === p.id && w.status === 'active');
  let week = weeks[0];
  if (!week) {
    const now = new Date(); const dow = now.getDay();
    const start = new Date(now); start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    const end = new Date(start); end.setDate(start.getDate() + 6);
    week = { id: uid(), playerId: p.id, weekStart: start.toISOString().split('T')[0], weekEnd: end.toISOString().split('T')[0], sport: state.SPORT, status: 'active' };
    const wks = getFocusWeeks(); wks.push(week); DB.set(pfx() + '_focusweeks', wks);
  }
  const items = getFocusItems().filter(fi => fi.weekId === week.id);
  const done = items.filter(fi => fi.status === 'completed').length;
  document.getElementById('fdTitle').textContent = p.name + "'s Week";
  document.getElementById('fdWeekRange').textContent = week.weekStart + ' → ' + week.weekEnd;
  document.getElementById('fdSub').textContent = `${state.SPORT} · ${items.length} focus items`;
  document.getElementById('fdFill').style.width = items.length ? ((done / items.length * 100) + '%') : '0%';
  document.getElementById('fdLbl').textContent = done + '/' + items.length + ' done';

  const el = document.getElementById('fdItemsList');
  if (!items.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">✅</div><div class="empty-ttl">No items this week</div><div class="empty-dsc">Add focus items below</div></div>';
    return;
  }

  const prioCls = { high:'high', medium:'medium', low:'low' };
  el.innerHTML = items.map(fi => `
    <div class="focus-item">
      <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItemDetail('${fi.id}','${week.id}','${p.id}')">${fi.status==='completed'?'✓':''}</div>
      <div class="fi-content">
        <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
        <div class="fi-meta">
          <div class="fi-priority ${prioCls[fi.priority]}"></div>
          <span>${esc(fi.cat)} · ${esc(fi.priority)}</span>
        </div>
        ${fi.drillLinkId?`<div class="fi-drill-link">🔗 ${esc(getDrillLinks().find(d=>d.id===fi.drillLinkId)?.title||'Drill attached')}</div>`:''}
      </div>
      <div class="fi-del" onclick="deleteFocusItemDetail('${fi.id}','${p.id}')">✕</div>
    </div>`).join('');
}

export function toggleFocusItemDetail(itemId, _weekId, playerId){
  const items = getFocusItems();
  const item = items.find(fi => fi.id === itemId);
  if (item) item.status = item.status === 'completed' ? 'pending' : 'completed';
  DB.set(pfx() + '_focusitems', items);
  const p = getPlayers().find(x => x.id === playerId);
  if (p) renderFocusDetail(p);
  if (item?.status === 'completed') showToast('tG', '✓ Done!');
}

export function deleteFocusItemDetail(itemId, playerId){
  DB.set(pfx() + '_focusitems', getFocusItems().filter(fi => fi.id !== itemId));
  const p = getPlayers().find(x => x.id === playerId);
  if (p) renderFocusDetail(p);
}

export function addFocusItemDirect(){
  if (!state.focusDetailPlayerId) return;
  const title = document.getElementById('fdNewItem').value.trim();
  if (!title) { showToast('tO', 'Enter an item'); return; }
  const p = getPlayers().find(x => x.id === state.focusDetailPlayerId);
  if (!p) return;
  const weeks = getFocusWeeks().filter(w => w.playerId === state.focusDetailPlayerId && w.status === 'active');
  if (!weeks.length) { renderFocusDetail(p); setTimeout(addFocusItemDirect, 100); return; }
  const items = getFocusItems();
  const priority = document.getElementById('fdPriority').value || 'medium';
  items.push({
    id: uid(),
    weekId: weeks[0].id,
    playerId: state.focusDetailPlayerId,
    title,
    cat: 'General',
    priority,
    status: 'pending',
    drillLinkId: null,
    ts: Date.now(),
  });
  DB.set(pfx() + '_focusitems', items);
  document.getElementById('fdNewItem').value = '';
  renderFocusDetail(p);
  showToast('tG', '✓ Focus item added');
}

export function newFocusWeek(){
  if (!state.focusDetailPlayerId) return;
  const weeks = getFocusWeeks();
  const active = weeks.filter(w => w.playerId === state.focusDetailPlayerId && w.status === 'active');
  active.forEach(w => { w.status = 'completed'; });
  const now = new Date(); const dow = now.getDay();
  const start = new Date(now); start.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1) + 7);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  const week = {
    id: uid(),
    playerId: state.focusDetailPlayerId,
    weekStart: start.toISOString().split('T')[0],
    weekEnd: end.toISOString().split('T')[0],
    sport: state.SPORT,
    status: 'active',
  };
  weeks.push(week);
  DB.set(pfx() + '_focusweeks', weeks);
  const p = getPlayers().find(x => x.id === state.focusDetailPlayerId);
  if (p) renderFocusDetail(p);
  showToast('tG', '✓ New week started');
}
