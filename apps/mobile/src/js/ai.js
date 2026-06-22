// ═══════════════════════════════════════════════════════
//  AI COACH — CourtIQ / FieldIQ chat surface.
//
//  Network discipline:
//  - All AI calls go to the server-side /api/ai/coach proxy.
//    Never to a provider SDK directly.
//  - On fetch failure (proxy unreachable or non-2xx) we fall
//    back to generateOfflineAI(), which builds a canned plan
//    from local player data.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { AI_COACH_ENDPOINT, CF_FLAGS } from './config.js';
import { S, getPlayers, getDrillLinks } from './storage.js';
import { esc, safePercent, getOvr } from './utils.js';

export function renderAI(){
  const sp = S();
  document.getElementById('aiTabName').innerHTML = state.SPORT === 'basketball'
    ? 'Court<span style="color:var(--or)">IQ</span>'
    : 'Field<span style="color:var(--or)">IQ</span>';
  document.getElementById('bnAILbl').textContent = state.SPORT === 'basketball' ? 'CourtIQ' : 'FieldIQ';

  if (state.aiReady) return;
  state.aiReady = true;
  state.aiMessages = [];

  buildAIInsights();

  const players = getPlayers();
  const firstName = players[0]?.name.split(' ')[0] || 'your player';
  addAIMsg('bot',
    `Hey Coach! I'm **${sp.aiNavLabel || 'CourtIQ'}**, your AI ${sp.label} coaching assistant.\n\n`
    + `I've analyzed your squad of ${players.length} athletes and have insights ready. Ask me anything — player development, drill suggestions, game prep, or training plans.\n\n`
    + `Try: _"Build a plan for ${firstName}"_ or _"What should I work on this week?"_`
  );
}

export function buildAIInsights(){
  const players = getPlayers();
  const el = document.getElementById('aiInsightArea');
  if (!players.length) { el.innerHTML = ''; return; }
  const s = S();
  const allWeak = players.map(p => {
    const active = s.skillKeys.filter(k => p.skills[k] > 0);
    const min = active.reduce((a, b) => p.skills[b] < p.skills[a] ? b : a);
    return { p, skill: min, val: p.skills[min] };
  }).sort((a, b) => a.val - b.val);
  const w = allWeak[0];
  const avgOvr = Math.round(players.reduce((a, p) => a + getOvr(p), 0) / players.length);

  el.innerHTML = `<div style="display:flex;gap:9px;overflow-x:auto;padding-bottom:4px">
    <div class="ai-insight">
      <div class="ai-insight-head"><span class="ai-insight-ico">⚠️</span><span class="ai-insight-title">Needs Work</span></div>
      <div class="ai-insight-body">${esc(w.p.name.split(' ')[0])} — ${esc(s.skillLabels[w.skill])} at ${safePercent(w.val)}/100</div>
      <div class="ai-insight-acts">
        <span class="ai-ia" onclick="aiSuggest('${w.p.id}')">Build Plan</span>
        <span class="ai-ia" onclick="aiAsk('Drills for ${s.skillLabels[w.skill].toLowerCase()}?')">Drill Ideas</span>
      </div>
    </div>
    <div class="ai-insight">
      <div class="ai-insight-head"><span class="ai-insight-ico">📊</span><span class="ai-insight-title">Squad OVR</span></div>
      <div class="ai-insight-body">Team average rating: <strong style="color:var(--or)">${avgOvr}</strong>/100 across ${players.length} athletes</div>
      <div class="ai-insight-acts">
        <span class="ai-ia" onclick="aiAsk('How can I improve my squad overall rating?')">Improve Squad</span>
      </div>
    </div>
    <div class="ai-insight">
      <div class="ai-insight-head"><span class="ai-insight-ico">🎯</span><span class="ai-insight-title">This Week</span></div>
      <div class="ai-insight-body">Focus on weak areas. ${players.length} players need attention before next game.</div>
      <div class="ai-insight-acts">
        <span class="ai-ia" onclick="aiAsk('Build me a full week training schedule for my squad')">Week Plan</span>
      </div>
    </div>
  </div>`;
}

function addAIMsg(role, text){
  const el = document.getElementById('aiChat');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + role;
  div.innerHTML = esc(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em style="color:var(--or)">$1</em>')
    .replace(/\n/g, '<br>');
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
  state.aiMessages.push({ role: role === 'bot' ? 'assistant' : 'user', content: text });
}

function addAILoading(){
  const el = document.getElementById('aiChat');
  const div = document.createElement('div');
  div.className = 'ai-msg bot'; div.id = 'aiLoad';
  div.innerHTML = '<span style="color:var(--mu)">Thinking</span><span style="animation:blink 1s infinite;color:var(--or)">...</span>';
  el.appendChild(div); el.scrollTop = el.scrollHeight;
}

function removeAILoading(){ const e = document.getElementById('aiLoad'); if (e) e.remove(); }

export async function sendAI(){
  // Feature flag: hide the AI proxy entirely until the backend lands.
  // The send button itself is also gated via data-flag in markup, but
  // we guard the entry point as defense in depth (e.g. against
  // programmatic invocation from aiAsk).
  if (!CF_FLAGS.AI_ENABLED) return;
  const inp = document.getElementById('aiInput');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  addAIMsg('user', msg);
  addAILoading();
  await callAI(msg);
}

export function aiAsk(q){
  // Switch to the AI tab first, then prefill + submit.
  // The setTimeout gives goTab a tick to swap the active surface
  // before we focus the input.
  // (Caller imports goTab dynamically to avoid pulling navigation
  //  into ai.js's hot path.)
  import('./navigation.js').then(({ goTab }) => {
    goTab('tAI');
    setTimeout(() => {
      document.getElementById('aiInput').value = q;
      sendAI();
    }, 100);
  });
}

export function aiSuggest(playerId){
  const p = getPlayers().find(x => x.id === playerId);
  if (!p) return;
  const s = S();
  const active = s.skillKeys.filter(k => p.skills[k] > 0);
  const weak = active.reduce((a, b) => p.skills[b] < p.skills[a] ? b : a);
  aiAsk(`Build a personalized 60-minute ${s.label} practice plan for ${p.name}. They play ${p.pos}, age ${p.age}. Weakest skill: ${s.skillLabels[weak]} (${p.skills[weak]}/100). Goal: "${p.goal}". Development areas: ${p.weaknesses}. Give me specific drills, reps/sets, coaching cues, and a drill order.`);
}

async function callAI(userMsg){
  // Second guard at the network boundary — keeps any direct caller
  // (or a future code path) honest. Falls back to the offline plan
  // so the chat surface still shows something useful.
  if (!CF_FLAGS.AI_ENABLED) {
    removeAILoading();
    addAIMsg('bot', generateOfflineAI(userMsg));
    return;
  }
  const players = getPlayers();
  const drillLinks = getDrillLinks();
  const aiName = state.SPORT === 'basketball' ? 'CourtIQ' : 'FieldIQ';
  try {
    const payload = {
      sport: state.SPORT,
      assistantName: aiName,
      message: userMsg,
      messages: state.aiMessages.slice(-8),
      context: {
        players: players.map(p => ({
          id: p.id,
          name: p.name,
          position: p.pos,
          age: p.age,
          goal: p.goal,
          weaknesses: p.weaknesses,
          skills: p.skills,
        })),
        drillLinks: drillLinks.map(d => ({
          id: d.id,
          title: d.title,
          category: d.cat,
          attachedTo: d.attachedTo || [],
        })),
      },
    };
    const res = await fetch(AI_COACH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI proxy unavailable');
    const data = await res.json();
    removeAILoading();
    const reply = data.reply || data.text || "I couldn't process that. Try again.";
    addAIMsg('bot', reply);
  } catch (e) {
    removeAILoading();
    addAIMsg('bot', generateOfflineAI(userMsg));
  }
}

export function generateOfflineAI(msg){
  const lower = msg.toLowerCase();
  const players = getPlayers();
  const sp = S();
  const mentioned = players.find(p => lower.includes(p.name.split(' ')[0].toLowerCase()));

  if (mentioned) {
    const active = sp.skillKeys.filter(k => mentioned.skills[k] > 0);
    const weak = active.reduce((a, b) => mentioned.skills[b] < mentioned.skills[a] ? b : a);
    const drill = getDrillLinks().filter(d => d.attachedTo?.includes(mentioned.id))[0];
    return `**${mentioned.name} — Training Plan** ${sp.icon}\n\nWeakest: **${sp.skillLabels[weak]}** (${mentioned.skills[weak]}/100)\n\n**60-Min Session:**\n\n1. **Warm-Up** (10 min) — Dynamic movement, jump rope series\n2. **${sp.skillLabels[weak]} Work** (20 min) — 4 sets, form over speed. Reset each rep.\n3. **Game Speed Reps** (15 min) — Full intensity, simulate real situations\n4. **Weak Area Isolation** (10 min) — Solo reps on biggest gap\n5. **Cool Down + Coach Note** (5 min) — Capture one thing before leaving\n\n**Key focus:** ${mentioned.weaknesses.split(',')[0].trim()}\n\n${drill?`🔗 Use saved drill: _${drill.title}_`:'Save a drill link to attach specific video work.'}`;
  }

  if (lower.includes('week') || lower.includes('schedule')) {
    return `**Weekly Training Schedule** 📅\n\n**Monday** — Skill focus (weakest area first)\n**Tuesday** — Conditioning + secondary skill\n**Wednesday** — Rest or light film\n**Thursday** — Game speed, decision making\n**Friday** — Pre-game prep, shootaround style\n**Weekend** — Games or open gym\n\nWant me to build this specifically for one of your players?`;
  }

  if (lower.includes('drill')) {
    return `**Drill Recommendations** 🎯\n\nFor your squad's weak areas:\n\n1. **Ball Handling** — Two-ball stationary, 3-cone weave\n2. **Shooting** — Form shooting 5 spots, free throw routine\n3. **Finishing** — Mikan drill, euro step series\n4. **Defense** — Zig-zag slides, closeout & contest\n\nSave YouTube links in the Drills tab to attach specific videos to each player.`;
  }

  return `**${state.SPORT === 'basketball' ? 'CourtIQ' : 'FieldIQ'}** here. Your squad has ${players.length} athletes. ${players.length?`Average OVR: ${Math.round(players.reduce((a,p)=>a+getOvr(p),0)/players.length)}/100.\n\nAsk me about a specific player by first name for a personalized plan, or ask for "this week's schedule" to get a full training plan.`:'Add players to get personalized recommendations.'}`;
}
