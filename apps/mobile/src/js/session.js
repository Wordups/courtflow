// ═══════════════════════════════════════════════════════
//  SESSION — live practice session: pick a player + what to
//  run, step through the drill queue with a per-drill timer,
//  then a full-screen summary that supports navigator.share()
//  with a clipboard fallback.
//
//  Two things can drive the queue:
//    • a structured workout (workouts.js) — blocks of drills,
//      each with a track type and a rep/make target. The screen
//      shows block context, a completion bar and the target.
//    • a practice plan (config.js) — the old generic four-step
//      shape, kept so existing plans still start.
//
//  Per-drill results are stored by index, not appended, so
//  stepping back and forward re-edits a drill instead of
//  logging it twice.
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
import { getWorkouts, getWorkout, workoutDrills, targetLabel } from './workouts.js';

// Select option values are prefixed so one picker can offer both.
const WORKOUT_PREFIX = 'w:';
const PLAN_PREFIX = 'p:';

export function openSessionPicker(preselectWorkoutId){
  const players = getPlayers();
  const workouts = getWorkouts(state.SPORT);
  const plans = getPlans();

  document.getElementById('spPlayer').innerHTML = players
    .map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');

  const workoutOpts = workouts.map(w =>
    `<option value="${esc(WORKOUT_PREFIX + w.id)}">${esc(w.title)} · ${Number(w.duration) || 0} min</option>`).join('');
  const planOpts = plans.map(p =>
    `<option value="${esc(PLAN_PREFIX + p.id)}">${esc(p.title)}</option>`).join('');

  document.getElementById('spPlan').innerHTML =
    (workoutOpts ? `<optgroup label="Tracked Workouts">${workoutOpts}</optgroup>` : '')
    + (planOpts ? `<optgroup label="Practice Plans">${planOpts}</optgroup>` : '');

  if (state.currentPlayer) document.getElementById('spPlayer').value = state.currentPlayer.id;
  if (preselectWorkoutId) document.getElementById('spPlan').value = WORKOUT_PREFIX + preselectWorkoutId;
  openModal('mSessionPicker');
}

export function startSession(){
  const playerId = document.getElementById('spPlayer').value;
  const choice = document.getElementById('spPlan').value || '';
  const player = getPlayers().find(p => p.id === playerId);
  if (!player || !choice) { showToast('tO', 'Select player and workout'); return; }

  const isWorkout = choice.startsWith(WORKOUT_PREFIX);
  const refId = choice.slice(isWorkout ? WORKOUT_PREFIX.length : PLAN_PREFIX.length);
  const workout = isWorkout ? getWorkout(refId) : null;
  const plan = isWorkout ? null : getPlans().find(p => p.id === refId);
  if (!workout && !plan) { showToast('tO', 'Select player and workout'); return; }
  closeModal('mSessionPicker');

  const drills = workout ? workoutDrills(workout) : [
    { title: 'Warm-Up', coaching: 'Dynamic movement, get loose', track: 'shots', target: 0 },
    { title: plan.title + ' — Main Set', coaching: 'Focus on quality over speed', track: 'shots', target: 0 },
    { title: 'Game Speed Reps', coaching: 'Simulate game situations', track: 'shots', target: 0 },
    { title: 'Cool Down Notes', coaching: 'Capture observations before leaving', track: 'shots', target: 0 },
  ];

  state.SESS = {
    playerId,
    planId: plan ? plan.id : null,
    workoutId: workout ? workout.id : null,
    title: workout ? workout.title : plan.title,
    idx: 0, makes: 0, atts: 0,
    start: Date.now(), elapsed: 0, drillElapsed: 0,
    timer: null, drillTimer: null,
    results: [], drills,
  };
  document.getElementById('sessPlayerName').textContent = player.name;
  document.getElementById('sessPlanName').textContent = state.SESS.title;

  state.SESS.timer = setInterval(() => {
    state.SESS.elapsed = Math.floor((Date.now() - state.SESS.start) / 1000);
    document.getElementById('sessElapsed').textContent = clock(state.SESS.elapsed);
  }, 1000);
  state.SESS.drillTimer = setInterval(() => {
    state.SESS.drillElapsed++;
    document.getElementById('saTimer').textContent = clock(state.SESS.drillElapsed);
  }, 1000);

  renderSessDrill();
  push('sSession');
}

function clock(secs){
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function renderSessDrill(){
  const sess = state.SESS;
  const d = sess.drills[sess.idx];
  const saved = sess.results[sess.idx];

  // Block context — only structured workouts carry it.
  const blockEl = document.getElementById('saBlock');
  if (d.blockTitle) {
    blockEl.style.display = '';
    blockEl.innerHTML =
      `<span class="sess-block-n">Block ${d.blockIdx + 1}/${d.blockCount}</span>`
      + `<span class="sess-block-t">${esc(d.blockTitle)}</span>`
      + (d.blockWindow ? `<span class="sess-block-w">${esc(d.blockWindow)}</span>` : '');
  } else {
    blockEl.style.display = 'none';
    blockEl.innerHTML = '';
  }

  document.getElementById('saDrillNum').textContent =
    `Drill ${sess.idx + 1} of ${sess.drills.length}`;
  document.getElementById('saDrillName').textContent = d.title;
  document.getElementById('saTip').textContent = d.coaching || '';

  // Completion bar — how far through the queue she is, so
  // stepping back walks the bar back with her.
  document.getElementById('saProgFill').style.width =
    Math.round((sess.idx / sess.drills.length) * 100) + '%';
  document.getElementById('saProgLbl').textContent = `${sess.idx}/${sess.drills.length}`;

  // Target line + counter mode.
  const target = document.getElementById('saTarget');
  const isTimed = d.track === 'time';
  const isReps = d.track === 'reps';
  target.textContent = (d.target || isTimed)
    ? `Target · ${targetLabel(d)}${d.optional ? ' (optional)' : ''}`
    : (d.optional ? 'Optional' : '');
  target.style.display = target.textContent ? '' : 'none';

  document.getElementById('saCtrs').style.display = isTimed ? 'none' : '';
  document.getElementById('saAttsCtr').style.display = isReps ? 'none' : '';
  document.getElementById('saMakesLbl').textContent = isReps ? 'Reps' : 'Makes';

  sess.makes = saved?.makes || 0;
  sess.atts = saved?.atts || 0;
  sess.drillElapsed = saved?.duration || 0;
  document.getElementById('saMakes').textContent = sess.makes;
  document.getElementById('saAtts').textContent = sess.atts;
  document.getElementById('saTimer').textContent = clock(sess.drillElapsed);
  document.getElementById('saNoteInp').value = saved?.notes || '';

  const isLast = sess.idx >= sess.drills.length - 1;
  const nextBtn = document.getElementById('saNextBtn');
  nextBtn.textContent = isLast ? '✓ Finish Session' : 'Next Drill →';
  nextBtn.className = 'btn ' + (isLast ? 'g' : 'o');
}

export function adj(t, n){
  const sess = state.SESS;
  if (t === 'makes') {
    sess.makes = Math.max(0, sess.makes + n);
    document.getElementById('saMakes').textContent = sess.makes;
    // Keep attempts honest: a make is also an attempt.
    if (n > 0 && sess.drills[sess.idx]?.track !== 'reps' && sess.atts < sess.makes) {
      sess.atts = sess.makes;
      document.getElementById('saAtts').textContent = sess.atts;
    }
  } else {
    sess.atts = Math.max(sess.makes, sess.atts + n);
    document.getElementById('saAtts').textContent = sess.atts;
  }
}

export function prevDrill(){
  if (state.SESS.idx === 0) return;
  saveSessDrill();
  state.SESS.idx--;
  renderSessDrill();
}

function saveSessDrill(){
  const sess = state.SESS;
  const d = sess.drills[sess.idx];
  // Indexed write — re-visiting a drill updates it in place.
  sess.results[sess.idx] = {
    drillTitle: d?.title,
    blockTitle: d?.blockTitle || '',
    track: d?.track || 'shots',
    target: d?.target || 0,
    makes: sess.makes,
    atts: sess.atts,
    notes: document.getElementById('saNoteInp').value,
    duration: sess.drillElapsed,
  };
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
      workoutId: state.SESS.workoutId,
      title: state.SESS.title,
      date: Date.now(),
      ts: Date.now(),
      startTs: state.SESS.start,
      duration: state.SESS.elapsed,
      results: state.SESS.results.filter(Boolean),
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
// Totals across every tracked drill — shown on the summary and
// reused in the share text.
function sessionTotals(results){
  return (results || []).reduce((t, r) => {
    if (r.track === 'reps') t.reps += r.makes || 0;
    else { t.makes += r.makes || 0; t.atts += r.atts || 0; }
    if (r.target) { t.targeted++; if ((r.makes || 0) >= r.target) t.hit++; }
    return t;
  }, { makes: 0, atts: 0, reps: 0, hit: 0, targeted: 0 });
}

function resultLine(r){
  if (r.track === 'reps') return `${r.makes || 0}${r.target ? '/' + r.target : ''} reps`;
  if (r.track === 'time') return r.duration ? clock(r.duration) : '';
  if (!r.makes && !r.atts) return '';
  const pct = r.atts ? Math.round((r.makes / r.atts) * 100) : 0;
  return `${r.makes}/${r.atts} makes${r.atts ? ` · ${pct}%` : ''}${r.target ? ` · target ${r.target}` : ''}`;
}

export function showSessionSummary(sessData){
  const player = getPlayers().find(p => p.id === sessData.playerId);
  const workout = sessData.workoutId ? getWorkout(sessData.workoutId) : null;
  const plan = getPlans().find(p => p.id === sessData.planId);
  const label = workout?.title || plan?.title || sessData.title || 'Open Session';
  const sportIcon = S().icon || '🏆';
  document.getElementById('ssIcon').textContent = sportIcon;
  document.getElementById('ssShareBtn').textContent = `${sportIcon} Send to Parent`;

  const mins = Math.floor((sessData.duration || 0) / 60);
  document.getElementById('ssStatDur').textContent = mins || '<1';
  document.getElementById('ssStatDrills').textContent = sessData.results?.length || 0;

  const totals = sessionTotals(sessData.results);
  const shotEl = document.getElementById('ssStatShots');
  const shotLbl = document.getElementById('ssStatShotsL');
  if (totals.atts) {
    shotEl.textContent = Math.round((totals.makes / totals.atts) * 100) + '%';
    shotLbl.textContent = `${totals.makes}/${totals.atts} MAKES`;
  } else {
    shotEl.textContent = totals.reps || 0;
    shotLbl.textContent = 'REPS';
  }
  const tgtEl = document.getElementById('ssTargets');
  if (totals.targeted) {
    tgtEl.style.display = '';
    tgtEl.textContent = `${totals.hit} of ${totals.targeted} drill targets hit`;
  } else {
    tgtEl.style.display = 'none';
  }

  const caps = getCaptures().filter(c =>
    c.playerId === sessData.playerId
    && c.ts >= (sessData.startTs || sessData.ts - (sessData.duration || 0) * 1000)
    && c.ts <= sessData.ts + 5000
  );
  document.getElementById('ssStatNotes').textContent = caps.length;

  document.getElementById('ssSummaryLine').textContent =
    (player?.name || 'Athlete') + ' · ' + label + ' · '
    + new Date(sessData.ts).toLocaleDateString('en', { month: 'short', day: 'numeric' });

  const notesEl = document.getElementById('ssSessNotes');
  const noteCaps = sessData.results?.filter(r => r.notes) || [];
  notesEl.innerHTML = noteCaps.length
    ? noteCaps.map(r => `<div class="card" style="margin-bottom:8px"><div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;color:var(--or);margin-bottom:4px">${esc(r.drillTitle)}</div><div style="font-size:13px;color:var(--tx);line-height:1.5">${esc(r.notes)}</div></div>`).join('')
    : '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drill notes recorded</div>';

  // Group the drill list by block when a workout drove the session.
  const results = sessData.results || [];
  let lastBlock = null;
  document.getElementById('ssDrillsList').innerHTML = results.map(r => {
    const head = r.blockTitle && r.blockTitle !== lastBlock
      ? `<div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;color:var(--or);text-transform:uppercase;margin:12px 0 4px">${esc(r.blockTitle)}</div>`
      : '';
    lastBlock = r.blockTitle || lastBlock;
    const line = resultLine(r);
    const hit = r.target && (r.makes || 0) >= r.target;
    return head + `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bdr)">
      <span style="font-size:16px;color:${hit ? 'var(--grn)' : 'var(--mu)'}">${hit ? '✓' : '•'}</span>
      <div style="flex:1">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--wh)">${esc(r.drillTitle)}</div>
        ${line ? `<div style="font-size:11px;color:var(--mu)">${esc(line)}</div>` : ''}
      </div>
    </div>`;
  }).join('') || '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drills tracked</div>';

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

  state._lastSession = { sessData, player, label, caps, noteCaps, parentNotes };
  push('sSessionSummary');
}

export async function shareSessionSummary(){
  const { sessData, player, label, noteCaps, parentNotes } = state._lastSession;
  const mins = Math.floor((sessData?.duration || 0) / 60);
  const date = new Date(sessData?.ts || Date.now()).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  const sportIcon = S().icon || '🏆';
  const results = sessData?.results || [];
  const totals = sessionTotals(results);

  let text = `${sportIcon} CourtFlow Session Summary\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Athlete: ${player?.name || '—'}\n`;
  text += `Date: ${date}\n`;
  text += `Workout: ${label || 'Open Session'}\n`;
  text += `Duration: ${mins} min | Drills: ${results.length}\n`;
  if (totals.atts) text += `Shooting: ${totals.makes}/${totals.atts} (${Math.round((totals.makes / totals.atts) * 100)}%)\n`;
  if (totals.reps) text += `Reps logged: ${totals.reps}\n`;
  if (totals.targeted) text += `Targets hit: ${totals.hit}/${totals.targeted}\n`;
  text += '\n';

  if (results.length) {
    let block = null;
    text += `🏋️ Drill Log:\n`;
    results.forEach(r => {
      if (r.blockTitle && r.blockTitle !== block) { block = r.blockTitle; text += `— ${block}\n`; }
      const line = resultLine(r);
      text += `• ${r.drillTitle}${line ? ` — ${line}` : ''}\n`;
    });
    text += '\n';
  }
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
  // goTab only clears tab-root screens, so the summary (and any
  // screen the session was started from) has to be torn down here
  // or it stays layered over Home.
  document.querySelectorAll('.screen:not(.tab-root)').forEach(s => s.classList.remove('active'));
  goTab('tHome');
}
