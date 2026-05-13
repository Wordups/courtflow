import { state } from './js/state.js';
import { SPORTS, DC_POS, AI_COACH_ENDPOINT, CF_FLAGS } from './js/config.js';
import {
  DB, S, pfx,
  getPlayers, getCaptures, getDrillLinks, getPlans,
  getSessions, getFocusWeeks, getFocusItems, getDepthChart,
  init as initDB,
} from './js/storage.js';
import {
  showToast, fmtTs, uid, esc, jsString,
  safeColor, safePercent, validatedHttpsUrl, detectPlatform,
  getYoutubeVideoId, safeOpenUrl, getWeakLabel, getOvr,
  copyToClipboard,
} from './js/utils.js';
import {
  registerTab, goTab, push, back, openModal, closeModal,
  toggleFAB, closeFAB,
} from './js/navigation.js';
import { renderHome, updateSportUI } from './js/home.js';
import {
  obSelectSport, obSelectRole, obGoStep, obFinish, checkOnboarding,
} from './js/onboarding.js';
import {
  renderPlayers, openNewPlayerModal, saveNewPlayer,
  openPlayerDetail, pdTab, pdOpenCapture,
  renderPlayerTimeline, deleteCapture, filterPlayerTimeline,
  openCaptureEdit,
  renderPlayerFocus, toggleFocusItemPD,
  renderPlayerDrills, renderPlayerProgress, renderPlayerSessions,
} from './js/players.js';
import {
  openCapture, setCapType, toggleCapTag, saveCapture,
  toggleCaptureVisibility,
} from './js/captures.js';
import {
  renderDrillLinks, setDrillCat, filterDrillLinks,
  openDrillLinkSaver, parseDrillURL, saveDrillLink,
  deleteDrillLink, attachDrillToPlayer, addDrillToFocus,
} from './js/drills.js';
import {
  handleRosterUpload, parsePastedRoster, importRoster,
  downloadSampleCSV,
} from './js/roster.js';
import {
  renderFocus, renderPlayerFocusInTab,
  toggleFocusItem, deleteFocusItem,
  openFocusPlayerPicker, selectFocusPlayer, addFocusItem,
  openFocusDetail,
  toggleFocusItemDetail, deleteFocusItemDetail,
  addFocusItemDirect, newFocusWeek,
} from './js/focus.js';
import {
  openSessionPicker, startSession, adj, prevDrill, nextDrill,
  endSession, showSessionSummary, shareSessionSummary,
  closeSessionSummary,
} from './js/session.js';
import {
  setDepthPhase, renderDepthChart,
  openDepthAssign, assignDepthSlot, removeDepthSlot, clearDepthChart,
} from './js/depth-chart.js';

// ═══════════════════════════════════════════════════════
//  state.SPORT SWITCH
// ═══════════════════════════════════════════════════════
function switchSport(s){
  state.SPORT=s;DB.set('sport',state.SPORT);closeModal('mSportSwitch');
  updateSportUI();
  state.currentPlayer=null;state.focusPlayerId=null;state.focusDetailPlayerId=null;
  state.aiReady=false;state.aiMessages=[];
  document.getElementById('aiChat').innerHTML='';
  document.getElementById('aiInsightArea').innerHTML='';
  goTab('tHome');showToast('tG',SPORTS[s].icon+' Switched to '+SPORTS[s].label);
}

// ═══════════════════════════════════════════════════════
//  AI COACH — CourtIQ / FieldIQ
// ═══════════════════════════════════════════════════════

function renderAI(){
  const sp=S();
  document.getElementById('aiTabName').innerHTML=state.SPORT==='basketball'
    ?'Court<span style="color:var(--or)">IQ</span>'
    :'Field<span style="color:var(--or)">IQ</span>';
  document.getElementById('bnAILbl').textContent=state.SPORT==='basketball'?'CourtIQ':'FieldIQ';

  if(state.aiReady) return;
  state.aiReady=true;
  state.aiMessages=[];

  // Build insight cards
  buildAIInsights();

  // Welcome message
  const players=getPlayers();
  const firstName=players[0]?.name.split(' ')[0]||'your player';
  addAIMsg('bot',`Hey Coach! I'm **${sp.aiNavLabel||'CourtIQ'}**, your AI ${sp.label} coaching assistant.\n\nI've analyzed your squad of ${players.length} athletes and have insights ready. Ask me anything — player development, drill suggestions, game prep, or training plans.\n\nTry: _"Build a plan for ${firstName}"_ or _"What should I work on this week?"_`);
}

function buildAIInsights(){
  const players=getPlayers();
  const el=document.getElementById('aiInsightArea');
  if(!players.length){el.innerHTML='';return;}
  const s=S();
  const allWeak=players.map(p=>{
    const active=s.skillKeys.filter(k=>p.skills[k]>0);
    const min=active.reduce((a,b)=>p.skills[b]<p.skills[a]?b:a);
    return{p,skill:min,val:p.skills[min]};
  }).sort((a,b)=>a.val-b.val);
  const w=allWeak[0];

  // Squad average
  const avgOvr=Math.round(players.reduce((a,p)=>a+getOvr(p),0)/players.length);

  el.innerHTML=`<div style="display:flex;gap:9px;overflow-x:auto;padding-bottom:4px">
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

function addAIMsg(role,text){
  const el=document.getElementById('aiChat');
  const div=document.createElement('div');
  div.className='ai-msg '+role;
  div.innerHTML=esc(text)
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/_(.*?)_/g,'<em style="color:var(--or)">$1</em>')
    .replace(/\n/g,'<br>');
  el.appendChild(div);
  el.scrollTop=el.scrollHeight;
  state.aiMessages.push({role:role==='bot'?'assistant':'user',content:text});
}

function addAILoading(){
  const el=document.getElementById('aiChat');
  const div=document.createElement('div');
  div.className='ai-msg bot';div.id='aiLoad';
  div.innerHTML='<span style="color:var(--mu)">Thinking</span><span style="animation:blink 1s infinite;color:var(--or)">...</span>';
  el.appendChild(div);el.scrollTop=el.scrollHeight;
}
function removeAILoading(){const e=document.getElementById('aiLoad');if(e)e.remove();}

async function sendAI(){
  const inp=document.getElementById('aiInput');
  const msg=inp.value.trim();if(!msg) return;
  inp.value='';
  addAIMsg('user',msg);
  addAILoading();
  await callAI(msg);
}

function aiAsk(q){goTab('tAI');setTimeout(()=>{document.getElementById('aiInput').value=q;sendAI();},100);}

function aiSuggest(playerId){
  const p=getPlayers().find(x=>x.id===playerId);if(!p) return;
  const s=S();
  const active=s.skillKeys.filter(k=>p.skills[k]>0);
  const weak=active.reduce((a,b)=>p.skills[b]<p.skills[a]?b:a);
  aiAsk(`Build a personalized 60-minute ${s.label} practice plan for ${p.name}. They play ${p.pos}, age ${p.age}. Weakest skill: ${s.skillLabels[weak]} (${p.skills[weak]}/100). Goal: "${p.goal}". Development areas: ${p.weaknesses}. Give me specific drills, reps/sets, coaching cues, and a drill order.`);
}

async function callAI(userMsg){
  const players=getPlayers();
  const drillLinks=getDrillLinks();
  const sp=S();
  const aiName=state.SPORT==='basketball'?'CourtIQ':'FieldIQ';
  try{
    const payload={
      sport:state.SPORT,
      assistantName:aiName,
      message:userMsg,
      messages:state.aiMessages.slice(-8),
      context:{
        players:players.map(p=>({
          id:p.id,
          name:p.name,
          position:p.pos,
          age:p.age,
          goal:p.goal,
          weaknesses:p.weaknesses,
          skills:p.skills
        })),
        drillLinks:drillLinks.map(d=>({
          id:d.id,
          title:d.title,
          category:d.cat,
          attachedTo:d.attachedTo||[]
        }))
      }
    };
    const res=await fetch(AI_COACH_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('AI proxy unavailable');
    const data=await res.json();
    removeAILoading();
    const reply=data.reply||data.text||"I couldn't process that. Try again.";
    addAIMsg('bot',reply);
  }catch(e){
    removeAILoading();
    addAIMsg('bot',generateOfflineAI(userMsg));
  }
}

function generateOfflineAI(msg){
  const lower=msg.toLowerCase();
  const players=getPlayers();
  const sp=S();
  const mentioned=players.find(p=>lower.includes(p.name.split(' ')[0].toLowerCase()));

  if(mentioned){
    const active=sp.skillKeys.filter(k=>mentioned.skills[k]>0);
    const weak=active.reduce((a,b)=>mentioned.skills[b]<mentioned.skills[a]?b:a);
    const drill=getDrillLinks().filter(d=>d.attachedTo?.includes(mentioned.id))[0];
    return`**${mentioned.name} — Training Plan** ${sp.icon}\n\nWeakest: **${sp.skillLabels[weak]}** (${mentioned.skills[weak]}/100)\n\n**60-Min Session:**\n\n1. **Warm-Up** (10 min) — Dynamic movement, jump rope series\n2. **${sp.skillLabels[weak]} Work** (20 min) — 4 sets, form over speed. Reset each rep.\n3. **Game Speed Reps** (15 min) — Full intensity, simulate real situations\n4. **Weak Area Isolation** (10 min) — Solo reps on biggest gap\n5. **Cool Down + Coach Note** (5 min) — Capture one thing before leaving\n\n**Key focus:** ${mentioned.weaknesses.split(',')[0].trim()}\n\n${drill?`🔗 Use saved drill: _${drill.title}_`:'Save a drill link to attach specific video work.'}`;
  }

  if(lower.includes('week')||lower.includes('schedule')){
    return`**Weekly Training Schedule** 📅\n\n**Monday** — Skill focus (weakest area first)\n**Tuesday** — Conditioning + secondary skill\n**Wednesday** — Rest or light film\n**Thursday** — Game speed, decision making\n**Friday** — Pre-game prep, shootaround style\n**Weekend** — Games or open gym\n\nWant me to build this specifically for one of your players?`;
  }

  if(lower.includes('drill')){
    return`**Drill Recommendations** 🎯\n\nFor your squad's weak areas:\n\n1. **Ball Handling** — Two-ball stationary, 3-cone weave\n2. **Shooting** — Form shooting 5 spots, free throw routine\n3. **Finishing** — Mikan drill, euro step series\n4. **Defense** — Zig-zag slides, closeout & contest\n\nSave YouTube links in the Drills tab to attach specific videos to each player.`;
  }

  return`**${state.SPORT==='basketball'?'CourtIQ':'FieldIQ'}** here. Your squad has ${players.length} athletes. ${players.length?`Average OVR: ${Math.round(players.reduce((a,p)=>a+getOvr(p),0)/players.length)}/100.\n\nAsk me about a specific player by first name for a personalized plan, or ask for "this week's schedule" to get a full training plan.`:'Add players to get personalized recommendations.'}`;
}

// ═══════════════════════════════════════════════════════
//  BLOCKER 4: SETTINGS
// ═══════════════════════════════════════════════════════
function saveSettingsProfile(){
  const name = document.getElementById('settingsName').value.trim();
  if(name) DB.set('coach_name', name);
  renderHome();
  showToast('tG','✓ Profile saved');
}

function exportData(){
  const data = {
    exported: new Date().toISOString(),
    sport: state.SPORT,
    players: getPlayers(),
    captures: getCaptures(),
    sessions: getSessions(),
    drillLinks: getDrillLinks(),
    focusWeeks: getFocusWeeks(),
    focusItems: getFocusItems(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'courtflow-export.json'; a.click();
  showToast('tG','✓ Data exported');
}

// ═══════════════════════════════════════════════════════
//  INIT — ORIGINAL

// ── Wire tab renderers into the navigation registry ──
registerTab('tHome', renderHome);
registerTab('tPlayers', renderPlayers);
registerTab('tDrills', renderDrillLinks);
registerTab('tFocus', renderFocus);
registerTab('tDepth', renderDepthChart);
registerTab('tAI', renderAI);

initDB();
checkOnboarding();
updateSportUI();

// Greeting — use saved coach name if set
const _coachName = DB.get('coach_name') || 'Coach';
const _h=new Date().getHours();
document.getElementById('htGreeting').textContent=(_h<12?'Good morning':_h<17?'Good afternoon':'Good evening')+', '+_coachName;

// Pre-fill settings name field
const _sn = document.getElementById('settingsName');
if(_sn && DB.get('coach_name')) _sn.value = DB.get('coach_name');

// Settings role label
const _sr = document.getElementById('settingsRoleLbl');
if(_sr) _sr.textContent = (DB.get('user_role')||'Coach').charAt(0).toUpperCase()+(DB.get('user_role')||'coach').slice(1);

// Settings sport label
const _ssl = document.getElementById('settingsSportLbl');
if(_ssl) _ssl.textContent = SPORTS[state.SPORT]?.label||'Basketball';

renderHome();

// ═══════════════════════════════════════════════════════
//  RESET ONBOARDING (used by inline settings handler)
// ═══════════════════════════════════════════════════════
function resetOnboarding(){
  if(confirm('Reset onboarding? App will restart.')){
    DB.set('onboarding_complete', false);
    location.reload();
  }
}

// ═══════════════════════════════════════════════════════
//  WINDOW BINDINGS
//  Inline `onclick=` attributes evaluate in the global scope.
//  Since this file is loaded as <script type="module">, declarations
//  are module-scoped by default. Expose handlers on window so inline
//  HTML attributes can find them.
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  // navigation
  goTab, push, back, openModal, closeModal,
  // fab
  toggleFAB, closeFAB,
  // onboarding
  obSelectSport, obSelectRole, obGoStep, obFinish,
  // capture
  openCapture, setCapType, toggleCapTag, saveCapture, toggleCaptureVisibility,
  openCaptureEdit, deleteCapture, filterPlayerTimeline,
  // players
  openPlayerDetail, openNewPlayerModal, saveNewPlayer, pdTab, pdOpenCapture,
  // drills
  openDrillLinkSaver, parseDrillURL, saveDrillLink, safeOpenUrl,
  attachDrillToPlayer, deleteDrillLink, addDrillToFocus, setDrillCat,
  filterDrillLinks,
  // roster
  handleRosterUpload, parsePastedRoster, importRoster, downloadSampleCSV,
  // focus
  openFocusPlayerPicker, selectFocusPlayer, addFocusItem,
  openFocusDetail, addFocusItemDirect, newFocusWeek,
  toggleFocusItem, toggleFocusItemPD, toggleFocusItemDetail,
  deleteFocusItem, deleteFocusItemDetail,
  // session
  openSessionPicker, startSession, prevDrill, nextDrill, endSession,
  adj, shareSessionSummary, closeSessionSummary,
  // depth chart
  setDepthPhase, openDepthAssign, assignDepthSlot, removeDepthSlot,
  clearDepthChart,
  // ai
  sendAI, aiAsk, aiSuggest,
  // sport / settings
  switchSport, saveSettingsProfile, exportData, resetOnboarding,
});
