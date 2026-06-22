// ═══════════════════════════════════════════════════════
//  DEPTH CHART — football only. Three phases (Offense /
//  Defense / Special Teams). Each position has 1st / 2nd /
//  3rd string slots; tapping a slot opens the assign modal.
//
//  Stored under the 'fb_depth' key (not pfx-prefixed —
//  basketball doesn't use it).
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { DC_POS } from './config.js';
import { DB, getPlayers, getDepthChart } from './storage.js';
import { esc, safeColor, getOvr, showToast } from './utils.js';
import { openModal, closeModal } from './navigation.js';

export function setDepthPhase(p){
  state.dcPhase = p;
  ['O','D','ST'].forEach(x => document.getElementById('dcp' + x).classList.toggle('act', x === p));
  renderDepthBody();
}

export function renderDepthChart(){
  if (state.SPORT !== 'football') {
    document.getElementById('depthBody').innerHTML =
      '<div class="empty"><div class="empty-ico">🏈</div><div class="empty-ttl">Football Only</div><div class="empty-dsc">Switch to Football mode to use the depth chart</div></div>';
    return;
  }
  renderDepthBody();
}

function renderDepthBody(){
  if (state.SPORT !== 'football') {
    document.getElementById('depthBody').innerHTML =
      '<div class="empty"><div class="empty-ico">🏈</div><div class="empty-ttl">Switch to Football</div></div>';
    return;
  }
  const dc = getDepthChart();
  const players = getPlayers();
  const groups = DC_POS[state.dcPhase];
  const phCls = { O:'off', D:'def', ST:'st' }[state.dcPhase];
  let html = '<div style="padding:10px 0 24px">';
  groups.forEach(grp => {
    html += `<div style="margin:0 12px 4px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;color:var(--mu);text-transform:uppercase;padding:10px 0 4px">${grp.g}</div>`;
    grp.p.forEach(pos => {
      const slots = dc[pos.a] || [];
      html += `<div class="pos-group">
        <div class="pos-group-hdr"><span style="font-size:15px">${pos.ico}</span><span class="pgh-name">${pos.n}</span><span class="pgh-count">${pos.a} · ${slots.filter(Boolean).length}/${pos.max}</span></div>`;
      for (let i = 0; i < pos.max; i++) {
        const pid = slots[i] || null;
        const player = pid ? players.find(p => p.id === pid) : null;
        const numCls = 'depth-num d' + (i + 1 < 4 ? i + 1 : 3);
        if (player) {
          const sk = player.skills[pos.sk] || 70;
          const ovr = getOvr(player);
          const oc = ovr >= 90 ? 'rtg-e' : ovr >= 75 ? 'rtg-g' : ovr >= 60 ? 'rtg-a' : 'rtg-l';
          const sc = sk >= 90 ? 'rtg-e' : sk >= 75 ? 'rtg-g' : sk >= 60 ? 'rtg-a' : 'rtg-l';
          html += `<div class="depth-slot" onclick="openDepthAssign('${pos.a}',${i})">
            ${i===0?'<div class="starter-bar"></div>':''}
            <div class="${numCls}">${i+1}</div>
            <span class="pos-abbr ${phCls}">${pos.a}</span>
            <div class="slot-player"><div class="slot-pname">${esc(player.name)}</div><div class="slot-ppos">${esc(player.pos)} · Age ${Number(player.age)||''}</div></div>
            <div class="slot-ratings">
              <div class="slot-rtg ${oc}">${ovr}<span>OVR</span></div>
              <div class="slot-rtg ${sc}">${sk}<span>${pos.sk.replace(/([A-Z])/g,' $1').trim().split(' ')[0].toUpperCase()}</span></div>
            </div>
          </div>`;
        } else {
          const lbl = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';
          html += `<div class="depth-slot" onclick="openDepthAssign('${pos.a}',${i})">
            <div class="${numCls}">${i+1}</div>
            <span class="pos-abbr ${phCls}">${pos.a}</span>
            <div class="slot-empty">— Tap to assign ${lbl} string —</div>
            <span style="font-size:18px;color:var(--mu2)">+</span>
          </div>`;
        }
      }
      html += '</div>';
    });
  });
  html += '</div>';
  document.getElementById('depthBody').innerHTML = html;
}

export function openDepthAssign(posAbbr, slotIdx){
  state.dcAssigning = { posAbbr, slotIdx };
  const dc = getDepthChart();
  const players = getPlayers();
  const current = (dc[posAbbr] || [])[slotIdx];
  const lbl = slotIdx === 0 ? '1st' : slotIdx === 1 ? '2nd' : '3rd';
  document.getElementById('mDepthAssignTitle').textContent = `${posAbbr} — ${lbl} String`;
  const usedAt = Object.entries(dc).reduce((m, [pos, ids]) => {
    (ids || []).forEach((id, i) => {
      if (id) { if (!m[id]) m[id] = []; m[id].push(pos + '#' + (i + 1)); }
    });
    return m;
  }, {});
  document.getElementById('depthAssignList').innerHTML =
    (current ? `<div class="player-row" onclick="removeDepthSlot('${posAbbr}',${slotIdx})" style="background:rgba(239,68,68,.05)"><div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--red)">Remove from slot</div></div>` : '')
    + players.map(p => {
      const ovr = getOvr(p);
      const oc = ovr >= 90 ? 'rtg-e' : ovr >= 75 ? 'rtg-g' : ovr >= 60 ? 'rtg-a' : 'rtg-l';
      const also = (usedAt[p.id] || []).filter(s => !(posAbbr + '#' + (slotIdx + 1) === s)).join(', ');
      return `<div class="player-row" onclick="assignDepthSlot('${p.id}')">
        <div class="pav" style="background:${safeColor(p.color)}20;color:${safeColor(p.color)}">${esc(p.avatar)}</div>
        <div style="flex:1"><div class="pname">${esc(p.name)}${current===p.id?' ✓':''}</div><div class="pdetail">${esc(p.pos)}${also?' · Also: '+esc(also):''}</div></div>
        <div class="${oc}" style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900">${ovr}</div>
      </div>`;
    }).join('');
  openModal('mDepthAssign');
}

export function assignDepthSlot(playerId){
  if (!state.dcAssigning) return;
  const dc = getDepthChart();
  const { posAbbr, slotIdx } = state.dcAssigning;
  if (!dc[posAbbr]) dc[posAbbr] = [];
  while (dc[posAbbr].length <= slotIdx) dc[posAbbr].push(null);
  dc[posAbbr][slotIdx] = playerId;
  DB.set('fb_depth', dc);
  closeModal('mDepthAssign');
  renderDepthBody();
  showToast('tG', '✓ Depth chart updated');
}

export function removeDepthSlot(posAbbr, slotIdx){
  const dc = getDepthChart();
  if (dc[posAbbr]) dc[posAbbr][slotIdx] = null;
  DB.set('fb_depth', dc);
  closeModal('mDepthAssign');
  renderDepthBody();
}

export function clearDepthChart(){
  if (!confirm('Clear depth chart?')) return;
  DB.set('fb_depth', {});
  renderDepthBody();
  showToast('tO', 'Depth chart cleared');
}
