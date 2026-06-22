// ═══════════════════════════════════════════════════════
//  ROSTER — CSV upload, paste-in roster, preview, and
//  bulk import. CSV-only by intent; the .xlsx pathway was
//  removed during the P0/P1 pass.
//
//  Imports add players to the active sport's collection
//  (pfx()), respecting state.SPORT.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { DB, S, pfx, getPlayers } from './storage.js';
import { esc, uid, showToast } from './utils.js';
import { back } from './navigation.js';
import { renderHome } from './home.js';
import { renderPlayers } from './players.js';

export function handleRosterUpload(event){
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    parseCSVRoster(text, file.name);
  };
  if (file.name.toLowerCase().endsWith('.csv')) reader.readAsText(file);
  else showToast('tO', 'CSV files only for now');
}

function parseCSVRoster(csvText, filename){
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) { showToast('tO', 'CSV needs at least 2 rows (header + data)'); return; }
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  state.rosterPreviewData = lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim().replace(/['"]/g, ''));
    const obj = {};
    headers.forEach((h, idx) => obj[h] = cols[idx] || '');
    const name = obj.name || obj.full_name
      || (obj.first_name && obj.last_name ? obj.first_name + ' ' + obj.last_name : '')
      || obj.player
      || 'Player ' + (i + 1);
    const pos = obj.position || obj.pos || '';
    const age = parseInt(obj.age) || 0;
    const grade = obj.grade || obj.year || '';
    const existing = getPlayers().find(p => p.name.toLowerCase() === name.toLowerCase());
    return { _name: name, _pos: pos, _age: age, _grade: grade, _dup: !!existing, _err: !name };
  }).filter(r => !r._err);
  showRosterPreview(filename);
}

export function parsePastedRoster(){
  const text = document.getElementById('rosterPasteArea').value.trim();
  if (!text) { showToast('tO', 'Paste some player names first'); return; }
  const lines = text.split('\n').filter(l => l.trim());
  state.rosterPreviewData = lines.map((line, i) => {
    const parts = line.split(',').map(p => p.trim());
    const name = parts[0] || 'Player ' + (i + 1);
    const pos = parts[1] || '';
    const age = parseInt(parts[2]) || 0;
    const existing = getPlayers().find(p => p.name.toLowerCase() === name.toLowerCase());
    return { _name: name, _pos: pos, _age: age, _grade: '', _dup: !!existing, _err: !name };
  });
  showRosterPreview('Pasted Roster');
}

function showRosterPreview(_filename){
  const el = document.getElementById('rosterPreview');
  const list = document.getElementById('rosterPreviewList');
  el.style.display = '';
  const newCount = state.rosterPreviewData.filter(r => !r._dup).length;
  const dupCount = state.rosterPreviewData.filter(r => r._dup).length;
  list.innerHTML = `<div style="padding:10px 14px;background:var(--s2);border-bottom:1px solid var(--bdr);display:flex;gap:12px">
    <span class="pill g">✓ ${newCount} new</span>
    ${dupCount ? `<span class="pill y">⚠ ${dupCount} duplicate</span>` : ''}
  </div>` + state.rosterPreviewData.map((r, i) => `
    <div class="roster-preview-row">
      <div class="rpr-num">${i + 1}</div>
      <div class="rpr-info"><div class="rpr-name">${esc(r._name)}</div><div class="rpr-detail">${esc([r._pos, r._age ? 'Age ' + r._age : '', r._grade].filter(Boolean).join(' · ') || 'Position TBD')}</div></div>
      <div class="rpr-status ${r._dup ? 'dup' : 'new'}">${r._dup ? 'Exists' : 'New'}</div>
    </div>`).join('');
}

export function importRoster(){
  if (!state.rosterPreviewData.length) { showToast('tO', 'No players to import'); return; }
  const players = getPlayers();
  const colors = ['#3b82f6','#ef4444','#22c55e','#f97316','#9b5de5','#eab308','#00d4e0','#ec4899'];
  const sp = S();
  let added = 0;
  state.rosterPreviewData.filter(r => !r._dup).forEach(r => {
    const skills = {};
    sp.skillKeys.forEach(k => skills[k] = 65);
    players.push({
      id: uid(),
      name: r._name,
      pos: r._pos || sp.positions[0],
      age: r._age || 16,
      grade: r._grade || '',
      goal: 'To be defined',
      weaknesses: 'To be assessed',
      avatar: r._name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      color: colors[players.length % colors.length],
      skills,
      sessions: 0,
      sport: state.SPORT,
      created: Date.now(),
    });
    added++;
  });
  DB.set(pfx() + '_players', players);
  document.getElementById('rosterPreview').style.display = 'none';
  state.rosterPreviewData = [];
  renderPlayers();
  renderHome();
  showToast('tG', `✓ ${added} players imported`);
  back();
}

export function downloadSampleCSV(){
  const csv = 'name,position,age,grade\nMarcus Johnson,Point Guard,16,10th\nAaliyah Carter,Shooting Guard,15,9th\nDevon Williams,Power Forward,17,11th';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'courtflow_sample_roster.csv';
  a.click();
}
