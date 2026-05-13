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

function closeSessionSummary(){
  state.screenStack=[];
  goTab('tHome');
}

// ═══════════════════════════════════════════════════════
//  WEEKLY FOCUS
// ═══════════════════════════════════════════════════════
function renderFocus(){
  const p=state.focusPlayerId?getPlayers().find(x=>x.id===state.focusPlayerId):null;
  if(!p){
    document.getElementById('wfWeekTitle').textContent='Choose a player to begin';
    document.getElementById('wfWeekSub').textContent='Track weekly development goals';
    document.getElementById('focusItemsList').innerHTML='<div class="empty"><div class="empty-ico">🎯</div><div class="empty-ttl">Select a player</div><div class="empty-dsc">Tap the player button above to choose who you\'re planning for</div></div>';
    document.getElementById('focusAddBar').style.display='none';
    return;
  }
  document.getElementById('focusPlayerBtn').textContent=p.name+' ▾';
  document.getElementById('focusAddBar').style.display='';
  renderPlayerFocusInTab(p);
}

function renderPlayerFocusInTab(p, elId=null){
  const weeks=getFocusWeeks().filter(w=>w.playerId===p.id&&w.status==='active');
  let week=weeks[0];

  // Create week if none exists
  if(!week){
    const now=new Date(); const dow=now.getDay();
    const start=new Date(now); start.setDate(now.getDate()-(dow===0?6:dow-1));
    const end=new Date(start); end.setDate(start.getDate()+6);
    week={id:uid(),playerId:p.id,weekStart:start.toISOString().split('T')[0],weekEnd:end.toISOString().split('T')[0],sport:state.SPORT,status:'active'};
    const weeks2=getFocusWeeks(); weeks2.push(week); DB.set(pfx()+'_focusweeks',weeks2);
  }

  const items=getFocusItems().filter(fi=>fi.weekId===week.id);
  const done=items.filter(fi=>fi.status==='completed').length;
  const total=items.length;

  // Update week header
  const wt=document.getElementById('wfWeekTitle'); const ws=document.getElementById('wfWeekSub');
  const wf=document.getElementById('wfProgFill'); const wl=document.getElementById('wfProgLbl');
  const wl2=document.getElementById('focusWeekLbl');
  if(wt) wt.textContent=p.name+"'s Weekly Focus";
  if(ws) ws.textContent=`${week.weekStart} → ${week.weekEnd} · ${state.SPORT}`;
  if(wf) wf.style.width=total?((done/total*100)+'%'):'0%';
  if(wl) wl.textContent=done+'/'+total+' done';
  if(wl2) wl2.textContent=week.weekStart+' — '+week.weekEnd;

  const renderTarget = elId ? document.getElementById(elId) : document.getElementById('focusItemsList');
  if(!renderTarget) return;

  if(!items.length){
    renderTarget.innerHTML='<div class="empty"><div class="empty-ico">✅</div><div class="empty-ttl">No focus items yet</div><div class="empty-dsc">Add a focus item below — keep it specific and actionable</div></div>';
    return;
  }

  const prioCls={high:'high',medium:'medium',low:'low'};
  renderTarget.innerHTML=items.map(fi=>`
    <div class="focus-item" id="fi-${fi.id}">
      <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItem('${fi.id}','${week.id}','${p.id}',${elId?`'${elId}'`:'null'})">${fi.status==='completed'?'✓':''}</div>
      <div class="fi-content">
        <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
        <div class="fi-meta">
          <div class="fi-priority ${prioCls[fi.priority]}"></div>
          <span>${esc(fi.cat)}</span>
          ${fi.priority==='high'?'<span style="color:var(--red);font-size:10px;font-weight:700">HIGH</span>':''}
        </div>
        ${fi.drillLinkId?`<div class="fi-drill-link">🔗 ${esc(getDrillLinks().find(d=>d.id===fi.drillLinkId)?.title||'Drill attached')}</div>`:''}
      </div>
      <div class="fi-del" onclick="deleteFocusItem('${fi.id}','${week.id}','${p.id}',${elId?`'${elId}'`:'null'})">✕</div>
    </div>`).join('');
}

function toggleFocusItem(itemId, weekId, playerId, elId){
  const items=getFocusItems();
  const item=items.find(fi=>fi.id===itemId);
  if(item) item.status=item.status==='completed'?'pending':'completed';
  DB.set(pfx()+'_focusitems',items);
  const p=getPlayers().find(x=>x.id===playerId);
  if(p){ if(elId) renderPlayerFocusInTab(p,elId); else renderPlayerFocusInTab(p); }
  if(item?.status==='completed') showToast('tG','✓ Focus item completed!');
}

function deleteFocusItem(itemId, weekId, playerId, elId){
  DB.set(pfx()+'_focusitems',getFocusItems().filter(fi=>fi.id!==itemId));
  const p=getPlayers().find(x=>x.id===playerId);
  if(p){ if(elId) renderPlayerFocusInTab(p,elId); else renderPlayerFocusInTab(p); }
}

function openFocusPlayerPicker(){
  const players=getPlayers();
  document.getElementById('focusPlayerPickerList').innerHTML=players.map(p=>{
    const color=safeColor(p.color);
    return `
    <div class="player-row" onclick="selectFocusPlayer('${p.id}')">
      <div class="pav" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div><div class="pname">${esc(p.name)}</div><div class="pdetail">${esc(p.pos)} · Age ${Number(p.age)||''}</div></div>
    </div>`;
  }).join('');
  openModal('mFocusPlayer');
}

function selectFocusPlayer(id){
  state.focusPlayerId=id;
  closeModal('mFocusPlayer');
  renderFocus();
}

function addFocusItem(){
  if(!state.focusPlayerId){showToast('tO','Select a player first');return;}
  const title=document.getElementById('focusNewItem').value.trim();
  if(!title){showToast('tO','Enter a focus item');return;}
  const p=getPlayers().find(x=>x.id===state.focusPlayerId);
  if(!p) return;
  const weeks=getFocusWeeks().filter(w=>w.playerId===state.focusPlayerId&&w.status==='active');
  if(!weeks.length){renderFocus();setTimeout(addFocusItem,100);return;}
  const items=getFocusItems();
  items.push({id:uid(),weekId:weeks[0].id,playerId:state.focusPlayerId,title,cat:'General',priority:'medium',status:'pending',drillLinkId:null,ts:Date.now()});
  DB.set(pfx()+'_focusitems',items);
  document.getElementById('focusNewItem').value='';
  renderFocus();
  showToast('tG','✓ Focus item added');
}

// ═══════════════════════════════════════════════════════
//  SESSION
// ═══════════════════════════════════════════════════════
function openSessionPicker(){
  const players=getPlayers(); const plans=getPlans();
  document.getElementById('spPlayer').innerHTML=players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  document.getElementById('spPlan').innerHTML=plans.map(p=>`<option value="${esc(p.id)}">${esc(p.title)}</option>`).join('');
  if(state.currentPlayer) document.getElementById('spPlayer').value=state.currentPlayer.id;
  openModal('mSessionPicker');
}

function startSession(){
  const playerId=document.getElementById('spPlayer').value;
  const planId=document.getElementById('spPlan').value;
  const player=getPlayers().find(p=>p.id===playerId);
  const plan=getPlans().find(p=>p.id===planId);
  if(!player||!plan){showToast('tO','Select player and plan');return;}
  closeModal('mSessionPicker');

  const drills=[{title:'Warm-Up',coaching:'Dynamic movement, get loose'},{title:plan.title+' — Main Set',coaching:'Focus on quality over speed'},{title:'Game Speed Reps',coaching:'Simulate game situations'},{title:'Cool Down Notes',coaching:'Capture observations before leaving'}];

  state.SESS={playerId,planId,idx:0,makes:0,atts:0,start:Date.now(),elapsed:0,drillElapsed:0,timer:null,drillTimer:null,results:[],drills};
  document.getElementById('sessPlayerName').textContent=player.name;
  document.getElementById('sessPlanName').textContent=plan.title;

  state.SESS.timer=setInterval(()=>{state.SESS.elapsed=Math.floor((Date.now()-state.SESS.start)/1000);const m=Math.floor(state.SESS.elapsed/60),s=state.SESS.elapsed%60;document.getElementById('sessElapsed').textContent=m+':'+String(s).padStart(2,'0');},1000);
  state.SESS.drillTimer=setInterval(()=>{state.SESS.drillElapsed++;const m=Math.floor(state.SESS.drillElapsed/60),s=state.SESS.drillElapsed%60;document.getElementById('saTimer').textContent=m+':'+String(s).padStart(2,'0');},1000);

  renderSessDrill();
  push('sSession');
}

function renderSessDrill(){
  const d=state.SESS.drills[state.SESS.idx];
  document.getElementById('saDrillNum').textContent=`Drill ${state.SESS.idx+1} of ${state.SESS.drills.length}`;
  document.getElementById('saDrillName').textContent=d.title;
  document.getElementById('saTip').textContent=d.coaching;
  document.getElementById('saMakes').textContent=state.SESS.makes=0;
  document.getElementById('saAtts').textContent=state.SESS.atts=0;
  document.getElementById('saTimer').textContent='0:00';
  document.getElementById('saNoteInp').value='';
  state.SESS.drillElapsed=0;
  const isLast=state.SESS.idx>=state.SESS.drills.length-1;
  document.getElementById('saNextBtn').textContent=isLast?'✓ Finish Session':'Next Drill →';
  document.getElementById('saNextBtn').className='btn '+(isLast?'g':'o');
}

function adj(t,n){if(t==='makes'){state.SESS.makes=Math.max(0,state.SESS.makes+n);document.getElementById('saMakes').textContent=state.SESS.makes;}else{state.SESS.atts=Math.max(0,state.SESS.atts+n);document.getElementById('saAtts').textContent=state.SESS.atts;}}
function prevDrill(){if(state.SESS.idx===0)return;saveSessDrill();state.SESS.idx--;renderSessDrill();}

function saveSessDrill(){ state.SESS.results.push({drillTitle:state.SESS.drills[state.SESS.idx]?.title,makes:state.SESS.makes,atts:state.SESS.atts,notes:document.getElementById('saNoteInp').value,duration:state.SESS.drillElapsed}); }

function nextDrill(){
  saveSessDrill();
  if(state.SESS.idx<state.SESS.drills.length-1){state.SESS.idx++;renderSessDrill();}
  else endSession(true);
}

function endSession(completed=false){
  clearInterval(state.SESS.timer);clearInterval(state.SESS.drillTimer);
  if(completed){
    const sessId=uid();
    const sessObj={id:sessId,playerId:state.SESS.playerId,planId:state.SESS.planId,date:Date.now(),ts:Date.now(),startTs:state.SESS.start,duration:state.SESS.elapsed,results:state.SESS.results,notes:'',sport:state.SPORT};
    const sessions=getSessions();
    sessions.push(sessObj);
    DB.set(pfx()+'_sessions',sessions);
    const players=getPlayers();const ci=players.findIndex(p=>p.id===state.SESS.playerId);
    if(ci>=0){players[ci].sessions++;DB.set(pfx()+'_players',players);}
    // Remove session screen then push summary
    document.getElementById('sSession').classList.remove('active');
    state.screenStack=state.screenStack.filter(s=>s!=='sSession');
    showSessionSummary(sessObj);
  } else {
    back();
  }
}

// ═══════════════════════════════════════════════════════
//  DEPTH CHART
// ═══════════════════════════════════════════════════════

function setDepthPhase(p){
  state.dcPhase=p;
  ['O','D','ST'].forEach(x=>document.getElementById('dcp'+x).classList.toggle('act',x===p));
  renderDepthBody();
}

function renderDepthChart(){
  if(state.SPORT!=='football'){document.getElementById('depthBody').innerHTML='<div class="empty"><div class="empty-ico">🏈</div><div class="empty-ttl">Football Only</div><div class="empty-dsc">Switch to Football mode to use the depth chart</div></div>';return;}
  renderDepthBody();
}

function renderDepthBody(){
  if(state.SPORT!=='football'){document.getElementById('depthBody').innerHTML='<div class="empty"><div class="empty-ico">🏈</div><div class="empty-ttl">Switch to Football</div></div>';return;}
  const dc=getDepthChart(),players=getPlayers();
  const groups=DC_POS[state.dcPhase];
  const phCls={O:'off',D:'def',ST:'st'}[state.dcPhase];
  let html='<div style="padding:10px 0 24px">';
  groups.forEach(grp=>{
    html+=`<div style="margin:0 12px 4px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;color:var(--mu);text-transform:uppercase;padding:10px 0 4px">${grp.g}</div>`;
    grp.p.forEach(pos=>{
      const slots=dc[pos.a]||[];
      html+=`<div class="pos-group">
        <div class="pos-group-hdr"><span style="font-size:15px">${pos.ico}</span><span class="pgh-name">${pos.n}</span><span class="pgh-count">${pos.a} · ${slots.filter(Boolean).length}/${pos.max}</span></div>`;
      for(let i=0;i<pos.max;i++){
        const pid=slots[i]||null;const player=pid?players.find(p=>p.id===pid):null;
        const numCls='depth-num d'+(i+1<4?i+1:3);
        if(player){
          const sk=player.skills[pos.sk]||70;const ovr=getOvr(player);
          const oc=ovr>=90?'rtg-e':ovr>=75?'rtg-g':ovr>=60?'rtg-a':'rtg-l';
          const sc=sk>=90?'rtg-e':sk>=75?'rtg-g':sk>=60?'rtg-a':'rtg-l';
          html+=`<div class="depth-slot" onclick="openDepthAssign('${pos.a}',${i})">
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
          const lbl=i===0?'1st':i===1?'2nd':'3rd';
          html+=`<div class="depth-slot" onclick="openDepthAssign('${pos.a}',${i})">
            <div class="${numCls}">${i+1}</div>
            <span class="pos-abbr ${phCls}">${pos.a}</span>
            <div class="slot-empty">— Tap to assign ${lbl} string —</div>
            <span style="font-size:18px;color:var(--mu2)">+</span>
          </div>`;
        }
      }
      html+='</div>';
    });
  });
  html+='</div>';
  document.getElementById('depthBody').innerHTML=html;
}

function openDepthAssign(posAbbr,slotIdx){
  state.dcAssigning={posAbbr,slotIdx};
  const dc=getDepthChart(),players=getPlayers();
  const current=(dc[posAbbr]||[])[slotIdx];
  const lbl=slotIdx===0?'1st':slotIdx===1?'2nd':'3rd';
  document.getElementById('mDepthAssignTitle').textContent=`${posAbbr} — ${lbl} String`;
  const usedAt=Object.entries(dc).reduce((m,[pos,ids])=>{(ids||[]).forEach((id,i)=>{if(id){if(!m[id])m[id]=[];m[id].push(pos+'#'+(i+1));}});return m;},{});
  document.getElementById('depthAssignList').innerHTML=
    (current?`<div class="player-row" onclick="removeDepthSlot('${posAbbr}',${slotIdx})" style="background:rgba(239,68,68,.05)"><div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--red)">Remove from slot</div></div>`:'')
    +players.map(p=>{
      const ovr=getOvr(p);const oc=ovr>=90?'rtg-e':ovr>=75?'rtg-g':ovr>=60?'rtg-a':'rtg-l';
      const also=(usedAt[p.id]||[]).filter(s=>!(posAbbr+'#'+(slotIdx+1)===s)).join(', ');
      return`<div class="player-row" onclick="assignDepthSlot('${p.id}')">
        <div class="pav" style="background:${safeColor(p.color)}20;color:${safeColor(p.color)}">${esc(p.avatar)}</div>
        <div style="flex:1"><div class="pname">${esc(p.name)}${current===p.id?' ✓':''}</div><div class="pdetail">${esc(p.pos)}${also?' · Also: '+esc(also):''}</div></div>
        <div class="${oc}" style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900">${ovr}</div>
      </div>`;
    }).join('');
  openModal('mDepthAssign');
}

function assignDepthSlot(playerId){
  if(!state.dcAssigning) return;
  const dc=getDepthChart();const{posAbbr,slotIdx}=state.dcAssigning;
  if(!dc[posAbbr]) dc[posAbbr]=[];
  while(dc[posAbbr].length<=slotIdx) dc[posAbbr].push(null);
  dc[posAbbr][slotIdx]=playerId;
  DB.set('fb_depth',dc);closeModal('mDepthAssign');renderDepthBody();showToast('tG','✓ Depth chart updated');
}

function removeDepthSlot(posAbbr,slotIdx){
  const dc=getDepthChart();if(dc[posAbbr]) dc[posAbbr][slotIdx]=null;
  DB.set('fb_depth',dc);closeModal('mDepthAssign');renderDepthBody();
}

function clearDepthChart(){if(!confirm('Clear depth chart?')) return;DB.set('fb_depth',{});renderDepthBody();showToast('tO','Depth chart cleared');}

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
//  FOCUS DETAIL SCREEN
// ═══════════════════════════════════════════════════════

function openFocusDetail(playerId){
  state.focusDetailPlayerId=playerId;
  const p=getPlayers().find(x=>x.id===playerId);
  if(!p) return;
  document.getElementById('fdName').textContent=p.name+"'s Focus";
  renderFocusDetail(p);
  push('sFocusDetail');
}

function renderFocusDetail(p){
  const weeks=getFocusWeeks().filter(w=>w.playerId===p.id&&w.status==='active');
  let week=weeks[0];
  if(!week){
    const now=new Date();const dow=now.getDay();
    const start=new Date(now);start.setDate(now.getDate()-(dow===0?6:dow-1));
    const end=new Date(start);end.setDate(start.getDate()+6);
    week={id:uid(),playerId:p.id,weekStart:start.toISOString().split('T')[0],weekEnd:end.toISOString().split('T')[0],sport:state.SPORT,status:'active'};
    const wks=getFocusWeeks();wks.push(week);DB.set(pfx()+'_focusweeks',wks);
  }
  const items=getFocusItems().filter(fi=>fi.weekId===week.id);
  const done=items.filter(fi=>fi.status==='completed').length;
  document.getElementById('fdTitle').textContent=p.name+"'s Week";
  document.getElementById('fdWeekRange').textContent=week.weekStart+' → '+week.weekEnd;
  document.getElementById('fdSub').textContent=`${state.SPORT} · ${items.length} focus items`;
  document.getElementById('fdFill').style.width=items.length?((done/items.length*100)+'%'):'0%';
  document.getElementById('fdLbl').textContent=done+'/'+items.length+' done';

  const el=document.getElementById('fdItemsList');
  if(!items.length){el.innerHTML='<div class="empty"><div class="empty-ico">✅</div><div class="empty-ttl">No items this week</div><div class="empty-dsc">Add focus items below</div></div>';return;}

  const prioCls={high:'high',medium:'medium',low:'low'};
  el.innerHTML=items.map(fi=>`
    <div class="focus-item">
      <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItemDetail('${fi.id}','${week.id}','${p.id}')">${fi.status==='completed'?'✓':''}</div>
      <div class="fi-content">
        <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
        <div class="fi-meta">
          <div class="fi-priority ${prioCls[fi.priority]}"></div>
          <span>${esc(fi.cat)} · ${esc(fi.priority)}</span>
        </div>
        ${fi.drillLinkId?`<div class="fi-drill-link">🔗 ${esc(getDrillLinks().find(d=>d.id===fi.drillLinkId)?.title||'Drill attached')}</div>`:''}
      </div>
      <div class="fi-del" onclick="deleteFocusItemDetail('${fi.id}','${p.id}')">✕</div>
    </div>`).join('');
}

function toggleFocusItemDetail(itemId,weekId,playerId){
  const items=getFocusItems();
  const item=items.find(fi=>fi.id===itemId);
  if(item) item.status=item.status==='completed'?'pending':'completed';
  DB.set(pfx()+'_focusitems',items);
  const p=getPlayers().find(x=>x.id===playerId);
  if(p) renderFocusDetail(p);
  if(item?.status==='completed') showToast('tG','✓ Done!');
}

function deleteFocusItemDetail(itemId,playerId){
  DB.set(pfx()+'_focusitems',getFocusItems().filter(fi=>fi.id!==itemId));
  const p=getPlayers().find(x=>x.id===playerId);
  if(p) renderFocusDetail(p);
}

function addFocusItemDirect(){
  if(!state.focusDetailPlayerId){return;}
  const title=document.getElementById('fdNewItem').value.trim();
  if(!title){showToast('tO','Enter an item');return;}
  const p=getPlayers().find(x=>x.id===state.focusDetailPlayerId);
  if(!p) return;
  const weeks=getFocusWeeks().filter(w=>w.playerId===state.focusDetailPlayerId&&w.status==='active');
  if(!weeks.length){renderFocusDetail(p);setTimeout(addFocusItemDirect,100);return;}
  const items=getFocusItems();
  const priority=document.getElementById('fdPriority').value||'medium';
  items.push({id:uid(),weekId:weeks[0].id,playerId:state.focusDetailPlayerId,title,cat:'General',priority,status:'pending',drillLinkId:null,ts:Date.now()});
  DB.set(pfx()+'_focusitems',items);
  document.getElementById('fdNewItem').value='';
  renderFocusDetail(p);
  showToast('tG','✓ Focus item added');
}

function newFocusWeek(){
  if(!state.focusDetailPlayerId) return;
  const weeks=getFocusWeeks();
  const active=weeks.filter(w=>w.playerId===state.focusDetailPlayerId&&w.status==='active');
  active.forEach(w=>{w.status='completed';});
  const now=new Date();const dow=now.getDay();
  const start=new Date(now);start.setDate(now.getDate()-(dow===0?6:dow-1)+7);
  const end=new Date(start);end.setDate(start.getDate()+6);
  const week={id:uid(),playerId:state.focusDetailPlayerId,weekStart:start.toISOString().split('T')[0],weekEnd:end.toISOString().split('T')[0],sport:state.SPORT,status:'active'};
  weeks.push(week);DB.set(pfx()+'_focusweeks',weeks);
  const p=getPlayers().find(x=>x.id===state.focusDetailPlayerId);
  if(p) renderFocusDetail(p);
  showToast('tG','✓ New week started');
}

// ═══════════════════════════════════════════════════════
//  BLOCKER 2: SESSION SUMMARY + SHARE
// ═══════════════════════════════════════════════════════

function showSessionSummary(sessData){
  const player = getPlayers().find(p => p.id === sessData.playerId);
  const plan   = getPlans().find(p => p.id === sessData.planId);
  const sportIcon = S().icon || '🏆';
  document.getElementById('ssIcon').textContent = sportIcon;
  document.getElementById('ssShareBtn').textContent = `${sportIcon} Send to Parent`;

  // Stat boxes
  const mins = Math.floor((sessData.duration||0)/60);
  document.getElementById('ssStatDur').textContent    = mins||'<1';
  document.getElementById('ssStatDrills').textContent = sessData.results?.length||0;

  // Notes captured during session
  const caps = getCaptures().filter(c =>
    c.playerId === sessData.playerId &&
    c.ts >= (sessData.startTs || sessData.ts - (sessData.duration||0)*1000) &&
    c.ts <= sessData.ts + 5000
  );
  document.getElementById('ssStatNotes').textContent = caps.length;

  document.getElementById('ssSummaryLine').textContent =
    (player?.name||'Athlete') + ' · ' + (plan?.title||'Open Session') + ' · ' + new Date(sessData.ts).toLocaleDateString('en',{month:'short',day:'numeric'});

  // Session notes list
  const notesEl = document.getElementById('ssSessNotes');
  const noteCaps = sessData.results?.filter(r=>r.notes) || [];
  notesEl.innerHTML = noteCaps.length
    ? noteCaps.map(r=>`<div class="card" style="margin-bottom:8px"><div style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;color:var(--or);margin-bottom:4px">${esc(r.drillTitle)}</div><div style="font-size:13px;color:var(--tx);line-height:1.5">${esc(r.notes)}</div></div>`).join('')
    : '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drill notes recorded</div>';

  // Drills list
  document.getElementById('ssDrillsList').innerHTML = (sessData.results||[]).map(r=>`
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bdr)">
      <span style="font-size:16px">✓</span>
      <div style="flex:1">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:800;color:var(--wh)">${esc(r.drillTitle)}</div>
        ${r.makes||r.atts?`<div style="font-size:11px;color:var(--mu)">${r.makes}/${r.atts} makes</div>`:''}
      </div>
    </div>`).join('') || '<div style="font-size:12px;color:var(--mu);padding:4px 0">No drills tracked</div>';

  // Parent-visible notes
  const parentNotes = caps.filter(c => c.visibility === 'parent_visible');
  const psec = document.getElementById('ssParentSec');
  const pnotesEl = document.getElementById('ssParentNotes');
  if(parentNotes.length){
    psec.style.display = '';
    pnotesEl.innerHTML = parentNotes.map(c=>`<div class="card" style="margin-bottom:8px;border-color:rgba(59,130,246,.3)"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span class="parent-badge">👁 PARENT VISIBLE</span><span style="font-size:10px;color:var(--mu2)">${fmtTs(c.ts)}</span></div><div style="font-size:13px;color:var(--tx);line-height:1.5">${esc(c.content||c.title||'')}</div></div>`).join('');
  } else {
    psec.style.display = 'none';
    pnotesEl.innerHTML = '';
  }

  state._lastSession = { sessData, player, plan, caps, noteCaps, parentNotes };
  push('sSessionSummary');
}

async function shareSessionSummary(){
  const { sessData, player, plan, noteCaps, parentNotes } = state._lastSession;
  const mins = Math.floor((sessData?.duration||0)/60);
  const date = new Date(sessData?.ts||Date.now()).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'});
  const sportIcon = S().icon || '🏆';

  let text = `${sportIcon} CourtFlow Session Summary\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Athlete: ${player?.name||'—'}\n`;
  text += `Date: ${date}\n`;
  text += `Plan: ${plan?.title||'Open Session'}\n`;
  text += `Duration: ${mins} min | Drills: ${sessData?.results?.length||0}\n\n`;

  if(noteCaps?.length){
    text += `📋 Session Notes:\n`;
    noteCaps.forEach(r => { text += `• [${r.drillTitle}] ${r.notes}\n`; });
    text += '\n';
  }
  if(parentNotes?.length){
    text += `📌 Coach Notes:\n`;
    parentNotes.forEach(c => { text += `• ${c.content}\n`; });
    text += '\n';
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Sent via CourtFlow — courtflowapp.com`;

  if(navigator.share){
    try{
      await navigator.share({ title: `${player?.name||'Athlete'} — Session Summary`, text });
      showToast('tG','✓ Summary shared');
    } catch(e){ if(e.name!=='AbortError') copyToClipboard(text); }
  } else {
    copyToClipboard(text);
  }
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
