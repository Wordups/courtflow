// ═══════════════════════════════════════════════════════
//  PLAYERS — list + detail screens.
//
//  The detail screen has five tabs (Timeline, Focus, Drills,
//  Progress, Sessions). Each tab's renderer lives here so the
//  whole player surface stays in one place — even though
//  Focus has a separate stand-alone surface in focus.js.
//
//  renderPlayerFocus draws the in-detail focus mini-view; the
//  weekly focus tab uses focus.js / renderPlayerFocusInTab.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import {
  DB, S, pfx,
  getPlayers, getCaptures, getDrillLinks, getSessions,
  getPlans, getFocusWeeks, getFocusItems,
} from './storage.js';
import {
  esc, jsString, uid, fmtTs,
  safeColor, safePercent, getWeakLabel,
} from './utils.js';
import { openModal, closeModal, push } from './navigation.js';
import { renderHome } from './home.js';
import { openCapture } from './captures.js';

// ── List screen ────────────────────────────────────────
export function renderPlayers(){
  const players = getPlayers();
  document.getElementById('playerCountLbl').textContent = players.length + ' athletes';
  document.getElementById('playerListBody').innerHTML = players.map(p => {
    const color = safeColor(p.color);
    return `
    <div class="player-row" onclick="openPlayerDetail('${p.id}')">
      <div class="pav" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div style="flex:1;min-width:0">
        <div class="pname">${esc(p.name)}</div>
        <div class="pdetail">${esc(p.pos)} · Age ${Number(p.age)||''} · ${Number(p.sessions)||0} sessions</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <span class="weak-lbl">⚠ ${esc(getWeakLabel(p))}</span>
        <span style="color:var(--mu2);font-size:16px">›</span>
      </div>
    </div>`;
  }).join('') || '<div class="empty"><div class="empty-ico">👥</div><div class="empty-ttl">No players yet</div><div class="empty-dsc">Add your first athlete to get started</div></div>';
}

export function openNewPlayerModal(){
  const sp = S();
  document.getElementById('npPos').innerHTML = sp.positions.map(p => `<option>${esc(p)}</option>`).join('');
  document.getElementById('mNewPlayerTitle').textContent = 'Add ' + (state.SPORT === 'basketball' ? 'Basketball' : 'Football') + ' Player';
  ['npName','npGoal','npWeak'].forEach(id => document.getElementById(id).value = '');
  openModal('mNewPlayer');
}

export function saveNewPlayer(){
  const name = document.getElementById('npName').value.trim();
  if (!name) { showToast('tO', 'Enter a name'); return; }
  const players = getPlayers();
  const colors = ['#3b82f6','#ef4444','#22c55e','#f97316','#9b5de5','#eab308','#00d4e0','#ec4899'];
  const skills = {};
  S().skillKeys.forEach(k => skills[k] = 65);
  const p = {
    id: uid(),
    name,
    pos: document.getElementById('npPos').value,
    age: parseInt(document.getElementById('npAge').value) || 16,
    grade: document.getElementById('npGrade').value || '10th',
    goal: document.getElementById('npGoal').value || 'Improve overall game',
    weaknesses: document.getElementById('npWeak').value || 'To be assessed',
    avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: colors[players.length % colors.length],
    skills,
    sessions: 0,
    sport: state.SPORT,
    created: Date.now(),
  };
  players.push(p);
  DB.set(pfx() + '_players', players);
  closeModal('mNewPlayer');
  renderPlayers();
  showToast('tG', '✓ Player added');
}

// ── Detail screen ──────────────────────────────────────
export function openPlayerDetail(id){
  const p = getPlayers().find(x => x.id === id);
  if (!p) return;
  state.currentPlayer = p;
  document.getElementById('pdName').textContent = p.name;
  document.getElementById('pdSub').textContent = p.pos + ' · Grade ' + p.grade + ' · Age ' + p.age;

  const s = S();
  const color = safeColor(p.color);
  document.getElementById('pdHero').innerHTML = `
    <div class="pd-hero-row">
      <div class="pd-av" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div style="flex:1">
        <div class="pd-name">${esc(p.name)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">
          <span class="pill o">${esc(p.pos)}</span>
          <span class="pill b">Age ${Number(p.age)||''}</span>
          <span class="pill g">${Number(p.sessions)||0} Sessions</span>
        </div>
        <div class="pd-goal">🎯 ${esc(p.goal)}</div>
      </div>
    </div>
    <div style="margin-top:12px">
      ${s.skillKeys.filter(k => p.skills[k] > 0).map(k => `
        <div class="skbar-row">
          <div class="skbar-lbl">${esc(s.skillLabels[k])}</div>
          <div class="skbar-track"><div class="skbar-fill" style="width:${safePercent(p.skills[k])}%;background:${s.skillColors[k]}"></div></div>
          <div class="skbar-val" style="color:${s.skillColors[k]}">${safePercent(p.skills[k])}</div>
        </div>`).join('')}
    </div>`;

  document.querySelectorAll('#pdTabBar .tbtn').forEach((b, i) => b.classList.toggle('act', i === 0));
  document.querySelectorAll('.tp').forEach(p => p.classList.remove('act'));
  document.getElementById('pdTpTimeline').classList.add('act');

  renderPlayerTimeline(p);
  renderPlayerFocus(p);
  renderPlayerDrills(p);
  renderPlayerProgress(p);
  renderPlayerSessions(p);
  push('sPlayerDetail');
}

export function pdTab(name){
  const map = { timeline:0, focus:1, drills:2, progress:3, sessions:4 };
  const idx = map[name];
  document.querySelectorAll('#pdTabBar .tbtn').forEach((b, i) => b.classList.toggle('act', i === idx));
  document.querySelectorAll('.tp').forEach((p, i) => p.classList.toggle('act', i === idx));
}

export function pdOpenCapture(){
  if (state.currentPlayer) document.getElementById('capPlayer').value = state.currentPlayer.id;
  openCapture('note');
}

// ── Timeline tab ───────────────────────────────────────
export function renderPlayerTimeline(p, filter = 'all'){
  const el = document.getElementById('pdTpTimeline');
  const captures = getCaptures().filter(c => c.playerId === p.id);
  const sessions = getSessions().filter(s => s.playerId === p.id);
  const drillLinks = getDrillLinks().filter(d => d.attachedTo?.includes(p.id));

  let events = [];
  captures.forEach(c => events.push({ ...c, evType: c.type }));
  sessions.forEach(s => events.push({
    ...s,
    evType: 'session',
    content: s.notes || 'Session completed',
    title: getPlans().find(pl => pl.id === s.planId)?.title || 'Session',
  }));
  drillLinks.forEach(d => events.push({ ...d, evType: 'drill', content: d.notes || d.title, playerId: p.id }));

  events.sort((a, b) => b.ts - a.ts);
  if (filter !== 'all') events = events.filter(e => e.evType === filter);

  const dotClass = { note:'note', stat:'stat', drill:'drill', session:'session', focus:'focus' };
  const dotIco = { note:'📝', stat:'📊', drill:'🔗', session:'🏀', focus:'🎯' };

  const filterBar = `<div class="tl-filter">
    ${['all','note','stat','drill','session'].map(f =>
      `<div class="tl-f-btn ${filter===f?'act':''}" onclick="filterPlayerTimeline('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</div>`
    ).join('')}
  </div>`;

  if (!events.length) {
    el.innerHTML = filterBar + `<div class="empty" style="padding-top:32px"><div class="empty-ico">📋</div><div class="empty-ttl">Nothing captured yet</div><div class="empty-dsc">Use Quick Capture to start building ${esc(p.name.split(' ')[0])}'s timeline</div></div>`;
    return;
  }

  el.innerHTML = filterBar + `<div style="padding:14px 14px 80px">` + events.map(ev => {
    const typeKey = ev.evType || 'note';
    let bodyHTML = '';
    if (ev.evType === 'stat') {
      bodyHTML = `<div class="tl-stat-val">${esc(ev.value)}${esc(ev.unit)}<span class="tl-stat-unit"> ${esc(ev.metric||'')}</span></div>`;
    } else {
      bodyHTML = `<div class="tl-body">${esc(ev.content||ev.title||'')}</div>`;
    }
    const tags = ev.tags?.length ? `<div class="tl-tags">${ev.tags.map(t => `<span class="tl-tag-chip">${esc(t)}</span>`).join('')}</div>` : '';
    const parentBadge = ev.visibility === 'parent_visible' ? `<span class="parent-badge" style="margin-left:6px">👁 PARENT</span>` : '';
    return `<div class="tl-event">
      <div class="tl-dot ${dotClass[typeKey]}">${dotIco[typeKey]}</div>
      <div class="tl-card" style="${ev.visibility==='parent_visible'?'border-color:rgba(59,130,246,.3)':''}">
        <div class="tl-card-top">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px">
            <span class="tl-type-badge ${typeKey}">${typeKey.toUpperCase()}</span>
            ${parentBadge}
          </div>
          <span class="tl-ts">${fmtTs(ev.ts||ev.created||Date.now())}</span>
        </div>
        ${bodyHTML}${tags}
        <div class="tl-actions">
          <span class="tl-act-btn" onclick="openCaptureEdit('${ev.id}','${typeKey}')">Edit</span>
          <span class="tl-act-btn del" onclick="deleteCapture('${ev.id}','${typeKey}')">Delete</span>
        </div>
      </div>
    </div>`;
  }).join('') + '</div>';
}

export function filterPlayerTimeline(filter){
  if (state.currentPlayer) renderPlayerTimeline(state.currentPlayer, filter);
}

export function deleteCapture(id, type){
  if (type === 'drill') {
    DB.set(pfx() + '_drilllinks', getDrillLinks().filter(d => d.id !== id));
  } else {
    DB.set(pfx() + '_captures', getCaptures().filter(c => c.id !== id));
  }
  renderPlayerTimeline(state.currentPlayer);
  showToast('tG', 'Deleted');
}

export function openCaptureEdit(_id, _type){
  // Inline-edit is not implemented yet; the user re-creates and deletes.
  showToast('tO', 'Edit coming soon — re-create to update');
}

// ── Focus tab (in-detail mini-view) ────────────────────
export function renderPlayerFocus(p){
  const el = document.getElementById('pdTpFocus');
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
  const prioCls = { high:'high', medium:'medium', low:'low' };

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--wh)">Week of ${week.weekStart}</div>
        <div style="font-size:11px;color:var(--mu)">${done}/${items.length} items complete</div>
      </div>
      <button class="btn o sm" style="width:auto;padding:8px 14px" onclick="openFocusDetail('${p.id}')">Open Full View →</button>
    </div>
    <div style="height:4px;background:var(--s3);border-radius:2px;overflow:hidden;margin-bottom:14px">
      <div style="height:100%;background:var(--grn);border-radius:2px;width:${items.length?((done/items.length*100)+'%'):'0%'};transition:width .4s"></div>
    </div>
    ${items.length ? items.map(fi => `
      <div class="focus-item" style="margin:0 0 1px">
        <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItemPD('${fi.id}','${week.id}','${p.id}')">${fi.status==='completed'?'✓':''}</div>
        <div class="fi-content">
          <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
          <div class="fi-meta"><div class="fi-priority ${prioCls[fi.priority]}"></div><span>${esc(fi.cat)}</span></div>
        </div>
      </div>`).join('')
    : `<div class="empty" style="padding:24px"><div class="empty-ico">🎯</div><div class="empty-ttl">No focus items</div><div class="empty-dsc">Open full view to add items</div></div>`}`;
}

export function toggleFocusItemPD(itemId, _weekId, playerId){
  const items = getFocusItems();
  const item = items.find(fi => fi.id === itemId);
  if (item) item.status = item.status === 'completed' ? 'pending' : 'completed';
  DB.set(pfx() + '_focusitems', items);
  const p = getPlayers().find(x => x.id === playerId);
  if (p) renderPlayerFocus(p);
  if (item?.status === 'completed') showToast('tG', '✓ Done!');
}

// ── Drills tab (in-detail mini-view) ───────────────────
export function renderPlayerDrills(p){
  const el = document.getElementById('pdTpDrills');
  const links = getDrillLinks().filter(d => d.attachedTo?.includes(p.id));
  el.innerHTML = `<button class="btn o sm" style="margin-bottom:14px;width:auto;padding:9px 18px" onclick="openDrillLinkSaver()">+ Save Drill Link for ${esc(p.name.split(' ')[0])}</button>`;
  if (!links.length) {
    el.innerHTML += `<div class="empty"><div class="empty-ico">🔗</div><div class="empty-ttl">No drill links attached</div><div class="empty-dsc">Save a YouTube link and attach it to ${esc(p.name.split(' ')[0])}</div></div>`;
    return;
  }
  const platIco = { youtube:'▶️', instagram:'📸', tiktok:'🎵', web:'🌐', other:'🔗' };
  el.innerHTML += links.map(d => `
    <div class="dl-card">
      <div class="dl-card-top">
        <div class="dl-thumb">${platIco[d.platform]||'🔗'}</div>
        <div class="dl-info">
          <div class="dl-title">${esc(d.title)}</div>
          <div class="dl-pills"><span class="pill o">${esc(d.cat)}</span><span class="pill m">${esc(d.diff)}</span></div>
          ${d.notes?`<div class="dl-notes">${esc(d.notes)}</div>`:''}
        </div>
      </div>
      <div class="dl-actions">
        <div class="dl-act primary" onclick="safeOpenUrl('${esc(jsString(d.url))}')">▶ Open</div>
        <div class="dl-act" onclick="addDrillToFocus('${d.id}','${p.id}')">Add to Weekly Focus</div>
      </div>
    </div>`).join('');
}

// ── Progress tab ───────────────────────────────────────
export function renderPlayerProgress(p){
  const el = document.getElementById('pdTpProgress');
  const caps = getCaptures().filter(c => c.playerId === p.id && c.type === 'stat');
  const s = S();
  const weakKeys = s.skillKeys.filter(k => p.skills[k] > 0).sort((a, b) => p.skills[a] - p.skills[b]);

  el.innerHTML = `
    <div class="sec">Skill Ratings</div>
    ${weakKeys.map(k => {
      const v = p.skills[k];
      return `<div class="trend-row">
        <div class="tr-ico">${{ballHandling:'🏀',shooting:'🎯',finishing:'💪',footwork:'👟',defense:'🛡️',conditioning:'⚡',throwing:'🏈',routeRunning:'💨',catching:'🤲',blocking:'🔒'}[k]||'📊'}</div>
        <div class="tr-info"><div class="tr-name">${esc(s.skillLabels[k])}</div><div class="tr-vals">${safePercent(v)}/100</div></div>
        <div class="tr-delta ${v>=75?'up':'down'}">${safePercent(v)}</div>
      </div>`;
    }).join('')}

    ${caps.length ? `<div class="sec" style="margin-top:20px">Logged Stats</div>
    ${caps.slice().sort((a,b)=>b.ts-a.ts).slice(0,8).map(c => `
      <div class="trend-row">
        <div class="tr-ico">📊</div>
        <div class="tr-info"><div class="tr-name">${esc(c.metric)}</div><div class="tr-vals">${fmtTs(c.ts)}</div></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;color:var(--grn)">${esc(c.value)}${esc(c.unit)}</div>
      </div>`).join('')}` : ''}

    <div class="sec" style="margin-top:20px">AI Analysis</div>
    <div style="background:linear-gradient(135deg,rgba(249,115,22,.08),rgba(249,115,22,.03));border:1px solid rgba(249,115,22,.2);border-radius:var(--r);padding:13px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;color:var(--wh);margin-bottom:6px">🤖 Development Insight</div>
      <div style="font-size:12px;color:var(--mu);line-height:1.6">${esc(getAIInsight(p))}</div>
      <button class="btn o sm" style="margin-top:10px;width:auto;padding:8px 16px" onclick="goTab('tAI')">Ask AI Coach</button>
    </div>`;
}

function getAIInsight(p){
  const s = S();
  const active = s.skillKeys.filter(k => p.skills[k] > 0);
  const min = active.reduce((a, b) => p.skills[b] < p.skills[a] ? b : a);
  return `${p.name.split(' ')[0]}'s lowest rated area is ${s.skillLabels[min]} (${p.skills[min]}/100). Based on goal: "${p.goal}" — recommend 2× weekly sessions targeting this first. Key area from notes: "${p.weaknesses.split(',')[0].trim()}"`;
}

// ── Sessions tab ───────────────────────────────────────
export function renderPlayerSessions(p){
  const el = document.getElementById('pdTpSessions');
  const sessions = getSessions().filter(s => s.playerId === p.id);
  if (!sessions.length) {
    el.innerHTML = '<div class="empty"><div class="empty-ico">▶</div><div class="empty-ttl">No sessions yet</div><div class="empty-dsc">Start a session to build history</div></div>';
    return;
  }
  el.innerHTML = sessions.map(s => {
    const plan = getPlans().find(pl => pl.id === s.planId);
    const mins = Math.floor((s.duration || 0) / 60);
    return `<div class="card" style="margin-bottom:9px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;color:var(--wh)">${esc(plan?.title||'Open Session')}</div>
        <span class="pill m">${fmtTs(s.date||s.ts||Date.now())}</span>
      </div>
      <div style="font-size:11px;color:var(--mu);margin-bottom:5px">⏱ ${mins} min · ${s.results?.length||0} drills tracked</div>
      ${s.notes?`<div style="font-size:12px;color:var(--tx);line-height:1.5">${esc(s.notes)}</div>`:''}
    </div>`;
  }).join('');
}

// Local import — kept at bottom to avoid clutter at the top
import { showToast } from './utils.js';
