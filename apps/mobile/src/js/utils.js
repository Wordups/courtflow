// ═══════════════════════════════════════════════════════
//  UTILS — small, mostly-pure helpers used by every UI module.
//
//  Escaping (esc / jsString) and URL validation
//  (validatedHttpsUrl) implement the hardening rules from the
//  P0/P1 pass — keep these strict, never inline-render an
//  un-escaped user string and never open a non-HTTPS URL.
// ═══════════════════════════════════════════════════════

import { S } from './storage.js';

// ── Toast banner ───────────────────────────────────────
export function showToast(id, txt){
  const t = document.getElementById(id);
  if (!t) return;
  t.textContent = txt;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Time + ids ─────────────────────────────────────────
export function fmtTs(ts){
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  const days = Math.floor(diff / 86400);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export function uid(){
  return (Date.now() + Math.random()).toString(36).replace('.', '');
}

// ── HTML / JS string escaping ──────────────────────────
export function esc(v){
  return String(v ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

export function jsString(v){
  return String(v ?? '')
    .replace(/\\/g,'\\\\')
    .replace(/'/g,"\\'")
    .replace(/\r/g,'\\r')
    .replace(/\n/g,'\\n')
    .replace(/</g,'\\x3C');
}

export function safeColor(v){
  return /^#[0-9a-f]{6}$/i.test(String(v||'')) ? v : '#777777';
}

export function safePercent(v){
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

// ── URL validation ─────────────────────────────────────
export function validatedHttpsUrl(raw){
  try {
    const url = new URL(String(raw||'').trim());
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

export function detectPlatform(url){
  const host = (()=>{ try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }})();
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('tiktok.com')) return 'tiktok';
  return 'web';
}

export function getYoutubeVideoId(raw){
  const safe = validatedHttpsUrl(raw);
  if (!safe) return null;
  try {
    const url = new URL(safe);
    if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || null;
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
  } catch {}
  return null;
}

export function safeOpenUrl(raw){
  const url = validatedHttpsUrl(raw);
  if (!url) { showToast('tR', 'Unsafe or invalid URL'); return; }
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ── Player skill summaries ─────────────────────────────
export function getWeakLabel(p){
  const s = S();
  const active = s.skillKeys.filter(k => p.skills[k] > 0);
  const min = active.reduce((a, b) => p.skills[b] < p.skills[a] ? b : a);
  return s.skillLabels[min];
}

export function getOvr(p){
  const active = Object.keys(p.skills).filter(k => p.skills[k] > 0);
  return Math.round(active.reduce((a, k) => a + p.skills[k], 0) / active.length);
}

// ── Clipboard fallback used by share flow ──────────────
export function copyToClipboard(text){
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('tG', '✓ Copied to clipboard'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('tG', '✓ Copied to clipboard');
  }
}
