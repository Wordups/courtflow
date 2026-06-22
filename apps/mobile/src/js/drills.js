// ═══════════════════════════════════════════════════════
//  DRILLS — drill-link library, saver modal, and the
//  "attach to player" / "add to weekly focus" actions.
//
//  Drill URLs MUST be HTTPS (validatedHttpsUrl). The saver
//  rejects anything else; saved links are opened through
//  safeOpenUrl which re-validates at click time.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import {
  DB, S, pfx,
  getPlayers, getDrillLinks, getFocusItems, getFocusWeeks,
} from './storage.js';
import {
  esc, jsString, uid, showToast,
  validatedHttpsUrl, detectPlatform, getYoutubeVideoId,
} from './utils.js';
import { openModal, closeModal } from './navigation.js';
import { renderPlayerDrills, renderPlayerFocus } from './players.js';

export function renderDrillLinks(){
  const links = getDrillLinks();
  document.getElementById('drillCountLbl').textContent = links.length + ' links saved';
  const cats = ['All', ...new Set(links.map(d => d.cat))];
  document.getElementById('drillCatBar').innerHTML = cats.map(c =>
    `<div class="tl-f-btn ${c===state.activeDrillCat?'act':''}" style="flex-shrink:0" onclick="setDrillCat('${esc(jsString(c))}')">${esc(c)}</div>`
  ).join('');
  filterDrillLinks();
}

export function setDrillCat(cat){
  state.activeDrillCat = cat;
  renderDrillLinks();
}

export function filterDrillLinks(){
  const links = getDrillLinks();
  const q = (document.getElementById('drillSearch')?.value || '').toLowerCase();
  const filtered = links.filter(d =>
    (state.activeDrillCat === 'All' || d.cat === state.activeDrillCat)
    && (!q || d.title.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q))
  );
  const platIco = { youtube:'▶️', instagram:'📸', tiktok:'🎵', web:'🌐', other:'🔗' };
  document.getElementById('drillListBody').innerHTML = filtered.map(d => {
    const players = getPlayers();
    const attached = d.attachedTo?.map(id => players.find(p => p.id === id)?.name || '').filter(Boolean) || [];
    const ytId = getYoutubeVideoId(d.url);
    const thumbSrc = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
    return `<div class="dl-card">
      <div class="dl-card-top">
        <div class="dl-thumb">${thumbSrc?`<img src="${thumbSrc}" onerror="this.parentElement.textContent='🎯'">`:platIco[d.platform]||'🔗'}</div>
        <div class="dl-info">
          <div class="dl-title">${esc(d.title)}</div>
          <div class="dl-pills">
            <span class="pill o">${esc(d.cat)}</span>
            <span class="pill m">${esc(d.diff)}</span>
            <span class="pill m">${esc(d.age)}</span>
          </div>
          ${d.notes?`<div class="dl-notes">${esc(d.notes)}</div>`:''}
        </div>
      </div>
      ${attached.length?`<div style="font-size:11px;color:var(--mu);margin-top:4px">👤 ${attached.map(esc).join(', ')}</div>`:''}
      <div class="dl-actions">
        <div class="dl-act primary" onclick="safeOpenUrl('${esc(jsString(d.url))}')">▶ Open Video</div>
        <div class="dl-act" onclick="attachDrillToPlayer('${d.id}')">Attach to Player</div>
        <div class="dl-act" onclick="deleteDrillLink('${d.id}')">Delete</div>
      </div>
    </div>`;
  }).join('') || '<div class="empty"><div class="empty-ico">🔗</div><div class="empty-ttl">No drill links yet</div><div class="empty-dsc">Paste a YouTube URL to save your first drill</div></div>';
}

export function openDrillLinkSaver(){
  const sp = S();
  document.getElementById('dlCat').innerHTML = sp.drillCats.map(c => `<option>${esc(c)}</option>`).join('');
  document.getElementById('dlSport').value = state.SPORT;
  const players = getPlayers();
  document.getElementById('dlPlayer').innerHTML = '<option value="">— None —</option>'
    + players.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if (state.currentPlayer) document.getElementById('dlPlayer').value = state.currentPlayer.id;
  ['dlURL','dlTitle','dlNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('dlThumbPreview').style.display = 'none';
  openModal('mDrillLink');
}

export function parseDrillURL(url){
  const videoId = getYoutubeVideoId(url);
  if (videoId) {
    const thumb = document.getElementById('dlThumbPreview');
    const img = document.getElementById('dlThumbImg');
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    thumb.style.display = 'block';
    if (!document.getElementById('dlTitle').value) {
      document.getElementById('dlTitle').value = 'YouTube Drill — Add Title';
    }
  } else {
    document.getElementById('dlThumbPreview').style.display = 'none';
  }
}

export function saveDrillLink(){
  const url = document.getElementById('dlURL').value.trim();
  const title = document.getElementById('dlTitle').value.trim();
  if (!url) { showToast('tO', 'Enter a URL'); return; }
  if (!title) { showToast('tO', 'Add a title'); return; }
  const safeUrl = validatedHttpsUrl(url);
  if (!safeUrl) { showToast('tR', 'Use a valid https:// URL'); return; }
  const platform = detectPlatform(safeUrl);
  const playerId = document.getElementById('dlPlayer').value || null;
  const links = getDrillLinks();
  const dl = {
    id: uid(),
    title,
    url: safeUrl,
    platform,
    cat: document.getElementById('dlCat').value,
    sport: document.getElementById('dlSport').value,
    age: document.getElementById('dlAge').value,
    diff: document.getElementById('dlDiff').value,
    notes: document.getElementById('dlNotes').value,
    attachedTo: playerId ? [playerId] : [],
    ts: Date.now(),
  };
  links.push(dl);
  DB.set(pfx() + '_drilllinks', links);
  closeModal('mDrillLink');
  renderDrillLinks();
  if (state.currentPlayer) renderPlayerDrills(state.currentPlayer);
  showToast('tG', '✓ Drill link saved');
}

export function deleteDrillLink(id){
  DB.set(pfx() + '_drilllinks', getDrillLinks().filter(d => d.id !== id));
  renderDrillLinks();
  if (state.currentPlayer) renderPlayerDrills(state.currentPlayer);
  showToast('tG', 'Deleted');
}

export function attachDrillToPlayer(drillId){
  const players = getPlayers();
  const sel = prompt('Player name to attach to:');
  if (!sel) return;
  const p = players.find(x => x.name.toLowerCase().includes(sel.toLowerCase()));
  if (!p) { showToast('tO', 'Player not found'); return; }
  const links = getDrillLinks();
  const dl = links.find(d => d.id === drillId);
  if (dl && !dl.attachedTo?.includes(p.id)) {
    if (!dl.attachedTo) dl.attachedTo = [];
    dl.attachedTo.push(p.id);
    DB.set(pfx() + '_drilllinks', links);
    showToast('tG', `Attached to ${p.name}`);
    renderDrillLinks();
  }
}

export function addDrillToFocus(drillId, playerId){
  const items = getFocusItems();
  const dl = getDrillLinks().find(d => d.id === drillId);
  const weeks = getFocusWeeks().filter(w => w.playerId === playerId && w.status === 'active');
  if (!weeks.length) { showToast('tO', 'No active focus week for this player'); return; }
  items.push({
    id: uid(),
    weekId: weeks[0].id,
    playerId,
    title: 'Watch & work: ' + dl.title,
    cat: dl.cat,
    priority: 'medium',
    status: 'pending',
    drillLinkId: drillId,
    ts: Date.now(),
  });
  DB.set(pfx() + '_focusitems', items);
  showToast('tG', '✓ Added to Weekly Focus');
  if (document.getElementById('pdTpFocus').classList.contains('act')) {
    renderPlayerFocus(state.currentPlayer);
  }
}
