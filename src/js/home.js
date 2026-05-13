// ═══════════════════════════════════════════════════════
//  HOME — the default landing tab. Renders stat strip,
//  quick-action grid, today's sessions, recent players,
//  and recent captures.
//
//  updateSportUI lives here because it's home-shell state
//  (sport chip, depth-chart quick action visibility, AI tab
//  label). Called from sport-switch and onboarding flows.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { getPlayers, getCaptures, getDrillLinks, getPlans, S } from './storage.js';
import { esc, fmtTs, safeColor, getWeakLabel } from './utils.js';

export function updateSportUI(){
  const sp = S();
  const ico = document.getElementById('scIco');
  if (ico) ico.textContent = sp.icon;
  const lbl = document.getElementById('scLbl');
  if (lbl) lbl.textContent = sp.label;
  const depth = document.getElementById('qaDepth');
  if (depth) depth.style.display = state.SPORT === 'football' ? '' : 'none';
  const aiLbl = document.getElementById('bnAILbl');
  if (aiLbl) aiLbl.textContent = state.SPORT === 'basketball' ? 'CourtIQ' : 'FieldIQ';
}

export function renderHome(){
  const h = new Date().getHours();
  const greeting = document.getElementById('htGreeting');
  if (greeting) greeting.textContent = (h<12?'Good morning':h<17?'Good afternoon':'Good evening') + ', Coach';
  updateSportUI();

  const players = getPlayers();
  const captures = getCaptures();
  const drillLinks = getDrillLinks();
  document.getElementById('hPlayers').textContent = players.length;
  document.getElementById('hCaptures').textContent = captures.length;
  document.getElementById('hDrillLinks').textContent = drillLinks.length;

  // today's sessions (mocked — first two players, fixed times)
  const hs = document.getElementById('homeSessions');
  const plans = getPlans();
  hs.innerHTML = players.slice(0,2).map((p,i) => {
    const color = safeColor(p.color);
    return `
    <div class="row-item" onclick="openPlayerDetail('${p.id}')">
      <div class="row-av" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div class="row-info"><div class="row-name">${esc(p.name)}</div><div class="row-detail">${esc(p.pos)} · ${esc(plans[0]?.title||'Practice')}</div></div>
      <div class="row-right"><div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--or)">${['3:00 PM','4:30 PM'][i]}</div></div>
    </div>`;
  }).join('') || '<div style="padding:14px;text-align:center;color:var(--mu);font-size:13px">No sessions today</div>';

  // recent players
  const hp = document.getElementById('homePlayers');
  hp.innerHTML = players.slice(0,3).map(p => {
    const color = safeColor(p.color);
    return `
    <div class="row-item" onclick="openPlayerDetail('${p.id}')">
      <div class="row-av" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div class="row-info"><div class="row-name">${esc(p.name)}</div><div class="row-detail">${esc(p.pos)} · ${Number(p.sessions)||0} sessions · <span style="color:var(--or)">⚠ ${esc(getWeakLabel(p))}</span></div></div>
      <div class="row-right" style="font-size:18px;color:var(--mu2)">›</div>
    </div>`;
  }).join('');

  // recent captures
  const hc = document.getElementById('homeCaptures');
  const recent = captures.slice().sort((a,b)=>b.ts-a.ts).slice(0,3);
  hc.innerHTML = recent.map(cap => {
    const p = players.find(x => x.id === cap.playerId);
    const typeBadge = {note:'📝 Note',stat:'📊 Stat',drill:'🎯 Drill'}[cap.type];
    const content = cap.type === 'stat'
      ? `${esc(cap.metric)}: <strong style="color:var(--grn)">${esc(cap.value)}${esc(cap.unit)}</strong>`
      : esc(cap.content||cap.title||'');
    return `<div class="card" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--or)">${typeBadge}</span>
        <span style="font-size:10px;color:var(--mu2)">${fmtTs(cap.ts)}</span>
      </div>
      ${p?`<div style="font-size:11px;font-weight:700;color:var(--mu);margin-bottom:4px">${esc(p.name)}</div>`:''}
      <div style="font-size:13px;color:var(--tx);line-height:1.5">${content}</div>
    </div>`;
  }).join('') || '<div style="text-align:center;color:var(--mu);font-size:12px">No notes yet — tap + to add one</div>';
}
