// ═══════════════════════════════════════════════════════
//  SESSION — live practice session: pick a player + plan,
//  step through four drills with per-drill timer, then a
//  full-screen summary that supports navigator.share()
//  with a clipboard fallback.
//
//  The summary screen runs in "summary mode" (bottom nav
//  + FAB hidden via body.summary-mode); push('sSessionSummary')
//  sets that class, back/closeSessionSummary clears it.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import {
  DB, S, pfx,
  getPlayers, getCaptures, getSessions, getPlans,
} from './storage.js';
import { esc, uid, fmtTs, showToast, copyToClipboard } from './utils.js';
import { openModal, closeModal, push, back, goTab } from './navigation.js';

export function openSessionPicker(){
  const players = getPlayers();
  const plans = getPlans();
  document.getElementById('spPlayer').innerHTML = players.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  document.getElementById('spPlan').innerHTML = plans.map(p => `<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
  if (state.currentPlayer) document.getElementById('spPlayer').value = state.currentPlayer.id;
  openModal('mSessionPicker');
}

export function startSession(){
  const playerId = document.getElementById('spPlayer').value;
  const planId = document.getElementById('spPlan').value;
  const player = getPlayers().find(p => p.id === playerId);
  const plan = getPlans().find(p => p.id === planId);
  if (!player || !plan) { showToast('tO', 'Select player and plan'); return; }
  closeModal('mSessionPicker');

  const drills = [
    { title: 'Warm-Up', coaching: 'Dynamic movement, get loose' },
    { title: plan.title + ' — Main Set', coaching: 'Focus on quality over speed' },
    { title: 'Game Speed Reps', coaching: 'Simulate game situations' },
    { title: 'Cool Down Notes', coaching: 'Capture observations before leaving' },
  ];

  state.SESS = {
    playerId, planId,
    idx: 0, makes: 0, atts: 0,
    start: Date.now(), elapsed: 0, drillElapsed: 0,
    timer: null, drillTimer: null,
    results: [], drills,
  };
  document.getElementById('sessPlayerName').textContent = player.name;
  document.getElementById('sessPlanName').textContent = plan.title;

  state.SESS.timer = setInterval(() => {
    state.SESS.elapsed = Math.floor((Date.now() - state.SESS.start) / 1000);
    const m = Math.floor(state.SESS.elapsed / 60);
    const s = state.SESS.elapsed % 60;
    document.getElementById('sessElapsed').textContent = m + ':' + String(s).padStart(2, '0');
  }, 1000);
  state.SESS.drillTimer = setInterval(() => {
    state.SESS.drillElapsed++;
    const m = Math.floor(state.SESS.drillElapsed / 60);
    const s = state.SESS.drillElapsed % 60;
    document.getElementById('saTimer').textContent = m + ':' + String(s).padStart(2, '0');
  }, 1000);

  renderSessDrill();
  push('sSession');
}

function renderSessDrill(){
  const d = state.SESS.drills[state.SESS.idx];
  document.getElementById('saDrillNum').textContent = `Drill ${state.SESS.idx + 1} of ${state.SESS.drills.length}`;
  document.getElementById('saDrillName').textContent = d.title;
  document.getElementById('saTip').textContent = d.coaching;
  document.getElementById('saMakes').textContent = state.SESS.makes = 0;
  document.getElementById('saAtts').textContent = state.SESS.atts = 0;
  document.getElementById('saTimer').textContent = '0:00';
  document.getElementById('saNoteInp').value = '';
  state.SESS.drillElapsed = 0;
  const isLast = state.SESS.idx >= state.SESS.drills.length - 1;
  document.getElementById('saNextBtn').textContent = isLast ? '✓ Finish Session' : 'Next Drill →';
  document.getElementById('saNextBtn').className = 'btn ' + (isLast ? 'g' : 'o');
}

export function adj(t, n){
  if (t === 'makes') {
    state.SESS.makes = Math.max(0, state.SESS.makes + n);
    document.getElementById('saMakes').textContent = state.SESS.makes;
  } else {
    state.SESS.atts = Math.max(0, state.SESS.atts + n);
    document.getElementById('saAtts').textContent = state.SESS.atts;
  }
}

export function prevDrill(){
  if (state.SESS.idx === 0) return;
  saveSessDrill();
  state.SESS.idx--;
  renderSessDrill();
}

function saveSessDrill(){
  state.SESS.results.push({
    drillTitle: state.SESS.drills[state.SESS.idx]?.title,
    makes: state.SESS.makes,
    atts: state.SESS.atts,
    notes: document.getElementById('saNoteInp').value,
    duration: state.SESS.drillElapsed,
  });
}

export function nextDrill(){
  saveSessDrill();
  if (state.SESS.idx < state.SESS.drills.length - 1) {
    state.SESS.idx++;
    renderSessDrill();
  } else {
    endSession(true);
  }
}

export function endSession(completed = false){
  clearInterval(state.SESS.timer);
  clearInterval(state.SESS.drillTimer);
  if (completed) {
    const sessObj = {
      id: uid(),
      playerId: state.SESS.playerId,
      planId: state.SESS.planId,
      date: Date.now(),
      ts: Date.now(),
      startTs: state.SESS.start,
      duration: state.SESS.elapsed,
      results: state.SESS.results,
      notes: '',
      sport: state.SPORT,
    };
    const sessions = getSessions();
    sessions.push(sessObj);
    DB.set(pfx() + '_sessions', sessions);
    const players = getPlayers();
    const ci = players.findIndex(p => p.id === state.SESS.playerId);
    if (ci >= 0) { players[ci].sessions++; DB.set(pfx() + '_players', players); }
    // Remove session screen then push summary
    document.getElementById('sSession').classList.remove('active');
    state.screenStack = state.screenStack.filter(s => s !== 'sSession');
    showSessionSummary(sessObj);
  } else {
    back();
  }
}

// ── Summary ────────────────────────────────────────────
export function showSessionSummary(sessData){
  const player = getPlayers().find(p => p.id === sessData.playerId);
  const plan = getPlans().find(p => p.id === sessData.planId);
  const sportIcon = S().icon || '🏆';
  document.getElementById('ssIcon').textContent = sportIcon;
  document.getElementById('ssShareBtn').textContent = `${sportIcon} Send to Parent`;

  const mins = Math.floor((sessData.duration || 0) / 60);
  document.getElementById('ssStatDur').textContent = mins || '<1';
  document.getElementById('ssStatDrills').textContent = sessData.results?.length || 0;

  const caps = getCaptures().filter(c =>
    c.playerId === sessData.playerId
    && c.ts >= (sessData.startTs || sessData.ts - (sessData.duration || 0) * 1000)
    && c.ts <= sessData.ts + 5000
  );
  document.getElementById('ssStatNotes').textContent = caps.length;

  document.getElementById('ssSummaryLine').textContent =
    (player?.name || 'Athlete') + ' · ' + (plan?.title || 'Open Session') + ' · '
    + new Date(sessData.ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  const notesEl = document.getElementById('ssSessNotes');
  const noteCaps = sessData.results?.filter(r => r.notes) || [];
  notesEl.innerHTML = noteCaps.length
    ? noteCaps.map(r => `<div class="card" style="margin-bottom:8px"><div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;color:var(--or);margin-bottom:4px">${esc(r.drillTitle)}</div><div style="font-size:13px;color:var(--tx);line-height:1.5">${esc(r.notes)}</div></div>`).join('')
    : '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drill notes recorded</div>';

  document.getElementById('ssDrillsList').innerHTML = (sessData.results || []).map(r => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bdr)">
      <span style="font-size:16px">✓</span>
      <div style="flex:1">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--wh)">${esc(r.drillTitle)}</div>
        ${r.makes||r.atts?`<div style="font-size:11px;color:var(--mu)">${r.makes}/${r.atts} makes</div>`:''}
      </div>
    </div>`).join('') || '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drills tracked</div>';

  const parentNotes = caps.filter(c => c.visibility === 'parent_visible');
  const psec = document.getElementById('ssParentSec');
  const pnotesEl = document.getElementById('ssParentNotes');
  if (parentNotes.length) {
    psec.style.display = '';
    pnotesEl.innerHTML = parentNotes.map(c => `<div class="card" style="margin-bottom:8px;border-color:rgba(59,130,246,.3)"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="parent-badge">👁 PARENT VISIBLE</span><span style="font-size:10px;color:var(--mu2)">${fmtTs(c.ts)}</span></div><div style="font-size:13px;color:var(--tx);line-height:1.5">${esc(c.content||c.title||'')}</div></div>`).join('');
  } else {
    psec.style.display = 'none';
    pnotesEl.innerHTML = '';
  }

  state._lastSession = { sessData, player, plan, caps, noteCaps, parentNotes };
  push('sSessionSummary');
}

export async function shareSessionSummary(){
  const { sessData, player, plan, noteCaps, parentNotes } = state._lastSession;
  const mins = Math.floor((sessData?.duration || 0) / 60);
  const date = new Date(sessData?.ts || Date.now()).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  const sportIcon = S().icon || '🏆';

  let text = `${sportIcon} CourtFlow Session Summary\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Athlete: ${player?.name || '—'}\n`;
  text += `Date: ${date}\n`;
  text += `Plan: ${plan?.title || 'Open Session'}\n`;
  text += `Duration: ${mins} min | Drills: ${sessData?.results?.length || 0}\n\n`;

  if (noteCaps?.length) {
    text += `📋 Session Notes:\n`;
    noteCaps.forEach(r => { text += `• [${r.drillTitle}] ${r.notes}\n`; });
    text += '\n';
  }
  if (parentNotes?.length) {
    text += `📌 Coach Notes:\n`;
    parentNotes.forEach(c => { text += `• ${c.content}\n`; });
    text += '\n';
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Sent via CourtFlow — courtflowapp.com`;

  if (navigator.share) {
    try {
      await navigator.share({ title: `${player?.name || 'Athlete'} — Session Summary`, text });
      showToast('tG', '✓ Summary shared');
    } catch (e) { if (e.name !== 'AbortError') copyToClipboard(text); }
  } else {
    copyToClipboard(text);
  }
}

export function closeSessionSummary(){
  state.screenStack = [];
  goTab('tHome');
}
