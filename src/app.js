import { state } from './js/state.js';
import { SPORTS, DC_POS, AI_COACH_ENDPOINT, CF_FLAGS } from './js/config.js';

// ═══════════════════════════════════════════════════════
//  DATA STORE
// ═══════════════════════════════════════════════════════
const DB = {
  get(k){try{return JSON.parse(localStorage.getItem('cf3_'+k))||null;}catch{return null;}},
  set(k,v){localStorage.setItem('cf3_'+k,JSON.stringify(v));},
};


// ─── Seed Data ───────────────────────────────────────
function seedBball(){
  const players = [
    {id:'c1',name:'Marcus Johnson',pos:'Point Guard',age:16,grade:'10th',goal:'Elite playmaker, improve 3PT shooting',weaknesses:'Left hand finishing, pull-up jumper, off-ball defense',avatar:'MJ',color:'#3b82f6',skills:{ballHandling:82,shooting:68,finishing:74,footwork:71,defense:60,conditioning:78},sessions:14,sport:'basketball'},
    {id:'c2',name:'Aaliyah Carter',pos:'Shooting Guard',age:15,grade:'9th',goal:'Consistent mid-range game',weaknesses:'Pick and roll defense, weak-hand layups',avatar:'AC',color:'#ef4444',skills:{ballHandling:75,shooting:84,finishing:70,footwork:78,defense:68,conditioning:82},sessions:11,sport:'basketball'},
    {id:'c3',name:'Devon Williams',pos:'Power Forward',age:17,grade:'11th',goal:'Extend range, dominant in post',weaknesses:'Shooting off dribble, lateral quickness',avatar:'DW',color:'#22c55e',skills:{ballHandling:65,shooting:72,finishing:88,footwork:76,defense:80,conditioning:85},sessions:18,sport:'basketball'},
    {id:'c4',name:'Brianna Scott',pos:'Point Guard',age:15,grade:'9th',goal:'Court vision, lead varsity offense',weaknesses:'Pull-up shooting, on-ball defense',avatar:'BS',color:'#f97316',skills:{ballHandling:88,shooting:70,finishing:76,footwork:82,defense:72,conditioning:80},sessions:12,sport:'basketball'},
  ];
  DB.set('bball_players', players);

  const captures = [
    {id:'cap1',playerId:'c1',type:'note',content:'Pull-up from left wing needs more hip load — leaking left before the catch',tags:['technique','weakness'],ts:Date.now()-2*3600000,sport:'basketball'},
    {id:'cap2',playerId:'c2',type:'stat',metric:'Free Throw %',value:84,unit:'%',ts:Date.now()-5*3600000,sport:'basketball'},
    {id:'cap3',playerId:'c3',type:'note',content:'Drop step is automatic now. Ready to add face-up game from elbow.',tags:['strength'],ts:Date.now()-86400000,sport:'basketball'},
    {id:'cap4',playerId:'c4',type:'note',content:'Court vision is elite for her age. Needs to read the DHO better in PnR.',tags:['game iq','technique'],ts:Date.now()-2*86400000,sport:'basketball'},
  ];
  DB.set('bball_captures', captures);

  const drillLinks = [
    {id:'dl1',title:'Mikan Drill — Both Hands',url:'https://www.youtube.com/watch?v=example1',platform:'youtube',cat:'Finishing',sport:'basketball',age:'All Ages',diff:'Beginner',notes:'Great for Devon — finish both sides daily',attachedTo:['c3'],ts:Date.now()-3*86400000},
    {id:'dl2',title:'Chair Shooting — Off Screen Footwork',url:'https://www.youtube.com/watch?v=example2',platform:'youtube',cat:'Shooting',sport:'basketball',age:'Teen',diff:'Intermediate',notes:'Perfect for Aaliyah — game speed catch and shoot',attachedTo:['c2'],ts:Date.now()-5*86400000},
    {id:'dl3',title:'Two-Ball Dribble Stationary',url:'https://www.youtube.com/watch?v=example3',platform:'youtube',cat:'Ball Handling',sport:'basketball',age:'All Ages',diff:'Beginner',notes:'Marcus needs this 10 min every session',attachedTo:['c1'],ts:Date.now()-7*86400000},
    {id:'dl4',title:'DHO Attack and Kick Reads',url:'https://www.youtube.com/watch?v=example4',platform:'youtube',cat:'IQ / Reads',sport:'basketball',age:'Teen',diff:'Intermediate',notes:'Brianna — reading the DHO coverage',attachedTo:['c4'],ts:Date.now()-10*86400000},
  ];
  DB.set('bball_drilllinks', drillLinks);

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);

  const focusWeeks = [
    {id:'fw1',playerId:'c1',weekStart:weekStart.toISOString().split('T')[0],weekEnd:weekEnd.toISOString().split('T')[0],sport:'basketball',status:'active'},
    {id:'fw2',playerId:'c2',weekStart:weekStart.toISOString().split('T')[0],weekEnd:weekEnd.toISOString().split('T')[0],sport:'basketball',status:'active'},
  ];
  DB.set('bball_focusweeks', focusWeeks);

  const focusItems = [
    {id:'fi1',weekId:'fw1',playerId:'c1',title:'50 left-hand finishes daily',cat:'Finishing',priority:'high',status:'pending',drillLinkId:null,ts:Date.now()-86400000},
    {id:'fi2',weekId:'fw1',playerId:'c1',title:'Pull-up mechanics — load hip before catch',cat:'Shooting',priority:'high',status:'completed',drillLinkId:null,ts:Date.now()-2*86400000},
    {id:'fi3',weekId:'fw1',playerId:'c1',title:'Off-ball defense footwork — don\'t flat-foot',cat:'Defense',priority:'medium',status:'pending',drillLinkId:null,ts:Date.now()-86400000},
    {id:'fi4',weekId:'fw2',playerId:'c2',title:'Come off screen on time — catch ready',cat:'Shooting',priority:'high',status:'completed',drillLinkId:'dl2',ts:Date.now()-86400000},
    {id:'fi5',weekId:'fw2',playerId:'c2',title:'Weak hand layup — left side of basket',cat:'Finishing',priority:'medium',status:'pending',drillLinkId:null,ts:Date.now()-86400000},
  ];
  DB.set('bball_focusitems', focusItems);
}

function seedFootball(){
  const players = [
    {id:'f1',name:'Jaylen Brooks',pos:'Wide Receiver',age:17,grade:'11th',goal:'D1 scholarship — elite route runner',weaknesses:'Press release, contested catches',avatar:'JB',color:'#22c55e',skills:{throwing:0,routeRunning:84,catching:76,footwork:80,blocking:45,conditioning:88},sessions:10,sport:'football'},
    {id:'f2',name:'Xavier Powell',pos:'Quarterback',age:16,grade:'10th',goal:'Develop pocket presence',weaknesses:'Footwork under pressure, reading zone',avatar:'XP',color:'#3b82f6',skills:{throwing:78,routeRunning:0,catching:0,footwork:68,blocking:0,conditioning:75},sessions:8,sport:'football'},
    {id:'f3',name:'Destiny Miles',pos:'Running Back',age:15,grade:'9th',goal:'Make varsity, pass-catching out of backfield',weaknesses:'Pass protection reads, lateral agility',avatar:'DM',color:'#f97316',skills:{throwing:0,routeRunning:72,catching:70,footwork:82,blocking:60,conditioning:84},sessions:6,sport:'football'},
  ];
  DB.set('football_players', players);
  DB.set('football_captures', [
    {id:'fcap1',playerId:'f1',type:'note',content:'Stem on the out route needs more upfield push before the break',tags:['technique','routes'],ts:Date.now()-3*3600000,sport:'football'},
    {id:'fcap2',playerId:'f2',type:'stat',metric:'Completion %',value:64,unit:'%',ts:Date.now()-86400000,sport:'football'},
  ]);
  DB.set('football_drilllinks', [
    {id:'fdl1',title:'Route Release vs Press Coverage',url:'https://www.youtube.com/watch?v=example',platform:'youtube',cat:'Route Running',sport:'football',age:'Teen',diff:'Advanced',notes:'Jaylen needs this — vary releases',attachedTo:['f1'],ts:Date.now()-86400000},
  ]);
  DB.set('football_focusweeks',[]);
  DB.set('football_focusitems',[]);
}

function init(){
  if(!DB.get('bball_players')) seedBball();
  if(!DB.get('football_players')) seedFootball();
}

// ─── Accessors ───────────────────────────────────────
function S(){ return SPORTS[state.SPORT]; }
function pfx(){ return state.SPORT==='basketball'?'bball':'football'; }
function getPlayers(){ return DB.get(pfx()+'_players')||[]; }
function getCaptures(){ return DB.get(pfx()+'_captures')||[]; }
function getDrillLinks(){ return DB.get(pfx()+'_drilllinks')||[]; }
function getPlans(){ return S().plans||[]; }
function getSessions(){ return DB.get(pfx()+'_sessions')||[]; }
function getFocusWeeks(){ return DB.get(pfx()+'_focusweeks')||[]; }
function getFocusItems(){ return DB.get(pfx()+'_focusitems')||[]; }
function getDepthChart(){ return DB.get('fb_depth')||{}; }

// ═══════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════
function goTab(id){
  document.body.classList.remove('summary-mode');
  document.querySelectorAll('.screen.tab-root').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.bni').forEach(b=>b.classList.remove('act'));
  const map={tHome:'bn-home',tPlayers:'bn-players',tDrills:'bn-drills',tAI:'bn-ai',tFocus:null,tDepth:null};
  const bn=map[id];if(bn) document.getElementById(bn).classList.add('act');
  state.currentTab=id;
  if(id==='tHome') renderHome();
  if(id==='tPlayers') renderPlayers();
  if(id==='tDrills') renderDrillLinks();
  if(id==='tFocus') renderFocus();
  if(id==='tDepth') renderDepthChart();
  if(id==='tAI') renderAI();
}

function push(id){
  if(id==='sSessionSummary') document.body.classList.add('summary-mode');
  document.querySelectorAll('.screen:not(.tab-root)').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  state.screenStack.push(id);
}

function back(fallback){
  const last=state.screenStack.pop();
  if(last==='sSessionSummary') document.body.classList.remove('summary-mode');
  if(last) document.getElementById(last).classList.remove('active');
  if(state.screenStack.length) document.getElementById(state.screenStack[state.screenStack.length-1]).classList.add('active');
  else goTab(fallback||state.currentTab);
}

function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }

// ═══════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════
function showToast(id,txt){ const t=document.getElementById(id);t.textContent=txt;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200); }
function fmtTs(ts){ const d=new Date(ts); const now=new Date(); const diff=Math.floor((now-d)/1000); if(diff<60) return'Just now'; if(diff<3600) return Math.floor(diff/60)+'m ago'; if(diff<86400) return Math.floor(diff/3600)+'h ago'; const days=Math.floor(diff/86400); if(days<7) return days+'d ago'; return d.toLocaleDateString('en',{month:'short',day:'numeric'}); }
function uid(){ return (Date.now()+Math.random()).toString(36).replace('.',''); }
function esc(v){ return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function jsString(v){ return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/</g,'\\x3C'); }
function safeColor(v){ return /^#[0-9a-f]{6}$/i.test(String(v||'')) ? v : '#777777'; }
function safePercent(v){ const n=Number(v); return Number.isFinite(n) ? Math.max(0,Math.min(100,n)) : 0; }
function validatedHttpsUrl(raw){
  try{
    const url=new URL(String(raw||'').trim());
    return url.protocol==='https:' ? url.href : null;
  }catch{return null;}
}
function detectPlatform(url){
  const host=(()=>{try{return new URL(url).hostname.toLowerCase();}catch{return'';}})();
  if(host.includes('youtube.com')||host.includes('youtu.be')) return 'youtube';
  if(host.includes('instagram.com')) return 'instagram';
  if(host.includes('tiktok.com')) return 'tiktok';
  return 'web';
}
function getYoutubeVideoId(raw){
  const safe=validatedHttpsUrl(raw);
  if(!safe) return null;
  try{
    const url=new URL(safe);
    if(url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0]||null;
    if(url.hostname.includes('youtube.com')) return url.searchParams.get('v');
  }catch{}
  return null;
}
function safeOpenUrl(raw){
  const url=validatedHttpsUrl(raw);
  if(!url){ showToast('tR','Unsafe or invalid URL'); return; }
  window.open(url,'_blank','noopener,noreferrer');
}
function getWeakLabel(p){ const s=S(); const active=s.skillKeys.filter(k=>p.skills[k]>0); const min=active.reduce((a,b)=>p.skills[b]<p.skills[a]?b:a); return s.skillLabels[min]; }
function getOvr(p){ const active=Object.keys(p.skills).filter(k=>p.skills[k]>0); return Math.round(active.reduce((a,k)=>a+p.skills[k],0)/active.length); }

function updateSportUI(){
  const sp=S();
  document.getElementById('scIco').textContent=sp.icon;
  document.getElementById('scLbl').textContent=sp.label;
  document.getElementById('qaDepth').style.display=state.SPORT==='football'?'':'none';
  // Reset AI on sport switch
  const aiLbl=document.getElementById('bnAILbl');
  if(aiLbl) aiLbl.textContent=state.SPORT==='basketball'?'CourtIQ':'FieldIQ';
}

// ═══════════════════════════════════════════════════════
//  FAB
// ═══════════════════════════════════════════════════════
function toggleFAB(){
  state.fabOpen=!state.fabOpen;
  document.getElementById('fabBtn').classList.toggle('open',state.fabOpen);
  document.getElementById('fabBtn').textContent=state.fabOpen?'✕':'+';
  if(state.fabOpen) openModal('mFAB');
  else closeModal('mFAB');
}
function closeFAB(){
  state.fabOpen=false;
  document.getElementById('fabBtn').classList.remove('open');
  document.getElementById('fabBtn').textContent='+';
  closeModal('mFAB');
}
document.getElementById('mFAB').addEventListener('click',e=>{if(e.target===document.getElementById('mFAB'))closeFAB();});

// ═══════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════
function renderHome(){
  const h=new Date().getHours();
  document.getElementById('htGreeting').textContent=(h<12?'Good morning':h<17?'Good afternoon':'Good evening')+', Coach';
  updateSportUI();
  const players=getPlayers(),captures=getCaptures(),drillLinks=getDrillLinks();
  document.getElementById('hPlayers').textContent=players.length;
  document.getElementById('hCaptures').textContent=captures.length;
  document.getElementById('hDrillLinks').textContent=drillLinks.length;

  // today sessions
  const hs=document.getElementById('homeSessions');
  const plans=getPlans();
  hs.innerHTML=players.slice(0,2).map((p,i)=>{
    const color=safeColor(p.color);
    return `
    <div class="row-item" onclick="openPlayerDetail('${p.id}')">
      <div class="row-av" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div class="row-info"><div class="row-name">${esc(p.name)}</div><div class="row-detail">${esc(p.pos)} · ${esc(plans[0]?.title||'Practice')}</div></div>
      <div class="row-right"><div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;color:var(--or)">${['3:00 PM','4:30 PM'][i]}</div></div>
    </div>`;
  }).join('')||'<div style="padding:14px;text-align:center;color:var(--mu);font-size:13px">No sessions today</div>';

  // recent players
  const hp=document.getElementById('homePlayers');
  hp.innerHTML=players.slice(0,3).map(p=>{
    const color=safeColor(p.color);
    return `
    <div class="row-item" onclick="openPlayerDetail('${p.id}')">
      <div class="row-av" style="background:${color}20;color:${color}">${esc(p.avatar)}</div>
      <div class="row-info"><div class="row-name">${esc(p.name)}</div><div class="row-detail">${esc(p.pos)} · ${Number(p.sessions)||0} sessions · <span style="color:var(--or)">⚠ ${esc(getWeakLabel(p))}</span></div></div>
      <div class="row-right" style="font-size:18px;color:var(--mu2)">›</div>
    </div>`;
  }).join('');

  // recent captures
  const hc=document.getElementById('homeCaptures');
  const recent=captures.slice().sort((a,b)=>b.ts-a.ts).slice(0,3);
  hc.innerHTML=recent.map(cap=>{
    const p=players.find(x=>x.id===cap.playerId);
    const typeBadge={note:'📝 Note',stat:'📊 Stat',drill:'🎯 Drill'}[cap.type];
    const content=cap.type==='stat'?`${esc(cap.metric)}: <strong style="color:var(--grn)">${esc(cap.value)}${esc(cap.unit)}</strong>`:esc(cap.content||cap.title||'');
    return`<div class="card" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:700;color:var(--or)">${typeBadge}</span>
        <span style="font-size:10px;color:var(--mu2)">${fmtTs(cap.ts)}</span>
      </div>
      ${p?`<div style="font-size:11px;font-weight:700;color:var(--mu);margin-bottom:4px">${esc(p.name)}</div>`:''}
      <div style="font-size:13px;color:var(--tx);line-height:1.5">${content}</div>
    </div>`;
  }).join('')||'<div style="text-align:center;color:var(--mu);font-size:12px">No notes yet — tap + to add one</div>';
}

// ═══════════════════════════════════════════════════════
//  PLAYERS
// ═══════════════════════════════════════════════════════
function renderPlayers(){
  const players=getPlayers();
  document.getElementById('playerCountLbl').textContent=players.length+' athletes';
  document.getElementById('playerListBody').innerHTML=players.map(p=>{
    const color=safeColor(p.color);
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
  }).join('')||'<div class="empty"><div class="empty-ico">👥</div><div class="empty-ttl">No players yet</div><div class="empty-dsc">Add your first athlete to get started</div></div>';
}

function openNewPlayerModal(){
  const sp=S();
  document.getElementById('npPos').innerHTML=sp.positions.map(p=>`<option>${esc(p)}</option>`).join('');
  document.getElementById('mNewPlayerTitle').textContent='Add '+(state.SPORT==='basketball'?'Basketball':'Football')+' Player';
  ['npName','npGoal','npWeak'].forEach(id=>document.getElementById(id).value='');
  openModal('mNewPlayer');
}

function saveNewPlayer(){
  const name=document.getElementById('npName').value.trim();
  if(!name){showToast('tO','Enter a name');return;}
  const players=getPlayers();
  const colors=['#3b82f6','#ef4444','#22c55e','#f97316','#9b5de5','#eab308','#00d4e0','#ec4899'];
  const skills={};
  S().skillKeys.forEach(k=>skills[k]=65);
  const p={id:uid(),name,pos:document.getElementById('npPos').value,age:parseInt(document.getElementById('npAge').value)||16,grade:document.getElementById('npGrade').value||'10th',goal:document.getElementById('npGoal').value||'Improve overall game',weaknesses:document.getElementById('npWeak').value||'To be assessed',avatar:name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),color:colors[players.length%colors.length],skills,sessions:0,sport:state.SPORT,created:Date.now()};
  players.push(p);
  DB.set(pfx()+'_players',players);
  closeModal('mNewPlayer');
  renderPlayers();
  showToast('tG','✓ Player added');
}

function openPlayerDetail(id){
  const p=getPlayers().find(x=>x.id===id);
  if(!p) return;
  state.currentPlayer=p;
  document.getElementById('pdName').textContent=p.name;
  document.getElementById('pdSub').textContent=p.pos+' · Grade '+p.grade+' · Age '+p.age;

  // hero
  const s=S();
  const color=safeColor(p.color);
  document.getElementById('pdHero').innerHTML=`
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
      ${s.skillKeys.filter(k=>p.skills[k]>0).map(k=>`
        <div class="skbar-row">
          <div class="skbar-lbl">${esc(s.skillLabels[k])}</div>
          <div class="skbar-track"><div class="skbar-fill" style="width:${safePercent(p.skills[k])}%;background:${s.skillColors[k]}"></div></div>
          <div class="skbar-val" style="color:${s.skillColors[k]}">${safePercent(p.skills[k])}</div>
        </div>`).join('')}
    </div>`;

  // reset tabs
  document.querySelectorAll('#pdTabBar .tbtn').forEach((b,i)=>b.classList.toggle('act',i===0));
  document.querySelectorAll('.tp').forEach(p=>p.classList.remove('act'));
  document.getElementById('pdTpTimeline').classList.add('act');

  renderPlayerTimeline(p);
  renderPlayerFocus(p);
  renderPlayerDrills(p);
  renderPlayerProgress(p);
  renderPlayerSessions(p);
  push('sPlayerDetail');
}

function pdTab(name){
  const map={timeline:0,focus:1,drills:2,progress:3,sessions:4};
  const idx=map[name];
  document.querySelectorAll('#pdTabBar .tbtn').forEach((b,i)=>b.classList.toggle('act',i===idx));
  document.querySelectorAll('.tp').forEach((p,i)=>p.classList.toggle('act',i===idx));
}

function pdOpenCapture(){
  if(state.currentPlayer) document.getElementById('capPlayer').value=state.currentPlayer.id;
  openCapture('note');
}

// ═══════════════════════════════════════════════════════
//  TIMELINE
// ═══════════════════════════════════════════════════════
function renderPlayerTimeline(p, filter='all'){
  const el=document.getElementById('pdTpTimeline');
  const captures=getCaptures().filter(c=>c.playerId===p.id);
  const sessions=getSessions().filter(s=>s.playerId===p.id);
  const drillLinks=getDrillLinks().filter(d=>d.attachedTo?.includes(p.id));
  const focusItems=getFocusItems().filter(fi=>fi.playerId===p.id&&fi.status==='completed');

  // Build unified timeline
  let events=[];
  captures.forEach(c=>events.push({...c,evType:c.type}));
  sessions.forEach(s=>events.push({...s,evType:'session',content:s.notes||'Session completed',title:getPlans().find(pl=>pl.id===s.planId)?.title||'Session'}));
  drillLinks.forEach(d=>events.push({...d,evType:'drill',content:d.notes||d.title,playerId:p.id}));

  events.sort((a,b)=>b.ts-a.ts);
  if(filter!=='all') events=events.filter(e=>e.evType===filter);

  const dotClass={note:'note',stat:'stat',drill:'drill',session:'session',focus:'focus'};
  const dotIco={note:'📝',stat:'📊',drill:'🔗',session:'🏀',focus:'🎯'};

  // Filter bar
  const filterBar=`<div class="tl-filter">
    ${['all','note','stat','drill','session'].map(f=>`<div class="tl-f-btn ${filter===f?'act':''}" onclick="filterPlayerTimeline('${f}')">${f.charAt(0).toUpperCase()+f.slice(1)}</div>`).join('')}
  </div>`;

  if(!events.length){
    el.innerHTML=filterBar+`<div class="empty" style="padding-top:32px"><div class="empty-ico">📋</div><div class="empty-ttl">Nothing captured yet</div><div class="empty-dsc">Use Quick Capture to start building ${esc(p.name.split(' ')[0])}'s timeline</div></div>`;
    return;
  }

  el.innerHTML=filterBar+`<div style="padding:14px 14px 80px">`+events.map(ev=>{
    const typeKey=ev.evType||'note';
    let bodyHTML='';
    if(ev.evType==='stat') bodyHTML=`<div class="tl-stat-val">${esc(ev.value)}${esc(ev.unit)}<span class="tl-stat-unit"> ${esc(ev.metric||'')}</span></div>`;
    else bodyHTML=`<div class="tl-body">${esc(ev.content||ev.title||'')}</div>`;
    const tags=ev.tags?.length?`<div class="tl-tags">${ev.tags.map(t=>`<span class="tl-tag-chip">${esc(t)}</span>`).join('')}</div>`:'';
    const parentBadge=ev.visibility==='parent_visible'?`<span class="parent-badge" style="margin-left:6px">👁 PARENT</span>`:'';
    return`<div class="tl-event">
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
  }).join('')+'</div>';
}

function deleteCapture(id, type){
  if(type==='drill'){
    const dls=getDrillLinks().filter(d=>d.id!==id);
    DB.set(pfx()+'_drilllinks',dls);
  } else {
    const caps=getCaptures().filter(c=>c.id!==id);
    DB.set(pfx()+'_captures',caps);
  }
  renderPlayerTimeline(state.currentPlayer);
  showToast('tG','Deleted');
}

function filterPlayerTimeline(filter){
  if(state.currentPlayer) renderPlayerTimeline(state.currentPlayer, filter);
}

function closeSessionSummary(){
  state.screenStack=[];
  goTab('tHome');
}

function openCaptureEdit(id, type){
  // Simple re-open capture with data pre-filled
  showToast('tO','Edit coming soon — re-create to update');
}

// ═══════════════════════════════════════════════════════
//  QUICK CAPTURE
// ═══════════════════════════════════════════════════════

function openCapture(type='note'){
  state.capType=type; state.capTags=[]; state.capVisibility='private';
  resetVisibilityToggle();
  setCapType(type);
  // populate player selector
  const players=getPlayers();
  const sel=document.getElementById('capPlayer');
  sel.innerHTML='<option value="">— No player —</option>'+players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if(state.currentPlayer) sel.value=state.currentPlayer.id;
  openModal('mCapture');
}

function setCapType(type){
  state.capType=type;
  ['note','stat','drill'].forEach(t=>{
    document.getElementById('capType'+t.charAt(0).toUpperCase()+t.slice(1))?.classList.toggle('act',t===type);
    document.getElementById('cap'+t.charAt(0).toUpperCase()+t.slice(1)+'Fields').style.display=t===type?'':'none';
  });
  const visRow=document.getElementById('capVisRow');
  if(visRow) visRow.style.display=type==='note'?'':'none';
  if(type!=='note') resetVisibilityToggle();
}

function toggleCapTag(el, tag){
  el.classList.toggle('sel');
  if(el.classList.contains('sel')) state.capTags.push(tag);
  else state.capTags=state.capTags.filter(t=>t!==tag);
}

function saveCapture(){
  const playerId=document.getElementById('capPlayer').value||null;
  const caps=getCaptures();
  let cap={id:uid(),playerId,ts:Date.now(),sport:state.SPORT,visibility:state.capType==='note'?state.capVisibility:'private'};

  if(state.capType==='note'){
    const txt=document.getElementById('capNoteText').value.trim();
    if(!txt){showToast('tO','Write a note first');return;}
    cap={...cap,type:'note',content:txt,tags:[...capTags]};
  } else if(state.capType==='stat'){
    const val=document.getElementById('capStatValue').value;
    if(!val){showToast('tO','Enter a value');return;}
    const metric=document.getElementById('capStatMetric').value;
    const unit=document.getElementById('capStatUnit').value||'';
    cap={...cap,type:'stat',metric,value:parseFloat(val),unit};
  } else {
    const title=document.getElementById('capDrillTitle').value.trim();
    if(!title){showToast('tO','Enter a drill name');return;}
    cap={...cap,type:'drill',title,content:document.getElementById('capDrillNote').value};
  }

  caps.push(cap);
  DB.set(pfx()+'_captures',caps);
  closeModal('mCapture');
  if(state.currentPlayer&&state.currentPlayer.id===playerId) renderPlayerTimeline(state.currentPlayer);
  renderHome();
  const visMsg=state.capVisibility==='parent_visible'?' · 👁 parent visible':'';
  showToast('tG','✓ Saved to timeline'+visMsg);

  // Reset fields
  document.getElementById('capNoteText').value='';
  document.getElementById('capStatValue').value='';
  document.getElementById('capDrillTitle').value='';
  document.getElementById('capDrillNote').value='';
  state.capTags=[];
  document.querySelectorAll('.cap-tag').forEach(t=>t.classList.remove('sel'));
  resetVisibilityToggle();
}

// ═══════════════════════════════════════════════════════
//  DRILL LINKS
// ═══════════════════════════════════════════════════════

function renderDrillLinks(){
  const links=getDrillLinks();
  document.getElementById('drillCountLbl').textContent=links.length+' links saved';
  const cats=['All',...new Set(links.map(d=>d.cat))];
  document.getElementById('drillCatBar').innerHTML=cats.map(c=>`<div class="tl-f-btn ${c===state.activeDrillCat?'act':''}" style="flex-shrink:0" onclick="setDrillCat('${esc(jsString(c))}')">${esc(c)}</div>`).join('');
  filterDrillLinks();
}

function setDrillCat(cat){ state.activeDrillCat=cat; renderDrillLinks(); }

function filterDrillLinks(){
  const links=getDrillLinks();
  const q=(document.getElementById('drillSearch')?.value||'').toLowerCase();
  const filtered=links.filter(d=>(state.activeDrillCat==='All'||d.cat===state.activeDrillCat)&&(!q||d.title.toLowerCase().includes(q)||d.cat.toLowerCase().includes(q)));
  const platIco={youtube:'▶️',instagram:'📸',tiktok:'🎵',web:'🌐',other:'🔗'};
  document.getElementById('drillListBody').innerHTML=filtered.map(d=>{
    const players=getPlayers();
    const attached=d.attachedTo?.map(id=>players.find(p=>p.id===id)?.name||'').filter(Boolean)||[];
    const ytId=getYoutubeVideoId(d.url);
    const thumbSrc=ytId?`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`:null;
    return`<div class="dl-card">
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
  }).join('')||'<div class="empty"><div class="empty-ico">🔗</div><div class="empty-ttl">No drill links yet</div><div class="empty-dsc">Paste a YouTube URL to save your first drill</div></div>';
}

function openDrillLinkSaver(){
  const sp=S();
  document.getElementById('dlCat').innerHTML=sp.drillCats.map(c=>`<option>${esc(c)}</option>`).join('');
  document.getElementById('dlSport').value=state.SPORT;
  const players=getPlayers();
  document.getElementById('dlPlayer').innerHTML='<option value="">— None —</option>'+players.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if(state.currentPlayer) document.getElementById('dlPlayer').value=state.currentPlayer.id;
  ['dlURL','dlTitle','dlNotes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('dlThumbPreview').style.display='none';
  openModal('mDrillLink');
}

function parseDrillURL(url){
  const videoId=getYoutubeVideoId(url);
  if(videoId){
    const thumb=document.getElementById('dlThumbPreview');
    const img=document.getElementById('dlThumbImg');
    img.src=`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    thumb.style.display='block';
    if(!document.getElementById('dlTitle').value){
      document.getElementById('dlTitle').value='YouTube Drill — Add Title';
    }
  } else {
    document.getElementById('dlThumbPreview').style.display='none';
  }
  // detect platform
  const platMap=[['youtube','youtube'],['youtu.be','youtube'],['instagram','instagram'],['tiktok','tiktok']];
  for(const [key,val] of platMap){ if(url.includes(key)){ document.getElementById('dlSport'); break; } }
}

function saveDrillLink(){
  const url=document.getElementById('dlURL').value.trim();
  const title=document.getElementById('dlTitle').value.trim();
  if(!url){showToast('tO','Enter a URL');return;}
  if(!title){showToast('tO','Add a title');return;}
  const safeUrl=validatedHttpsUrl(url);
  if(!safeUrl){showToast('tR','Use a valid https:// URL');return;}
  const platform=detectPlatform(safeUrl);
  const playerId=document.getElementById('dlPlayer').value||null;
  const links=getDrillLinks();
  const dl={id:uid(),title,url:safeUrl,platform,cat:document.getElementById('dlCat').value,sport:document.getElementById('dlSport').value,age:document.getElementById('dlAge').value,diff:document.getElementById('dlDiff').value,notes:document.getElementById('dlNotes').value,attachedTo:playerId?[playerId]:[],ts:Date.now()};
  links.push(dl);
  DB.set(pfx()+'_drilllinks',links);
  closeModal('mDrillLink');
  renderDrillLinks();
  if(state.currentPlayer) renderPlayerDrills(state.currentPlayer);
  showToast('tG','✓ Drill link saved');
}

function renderPlayerDrills(p){
  const el=document.getElementById('pdTpDrills');
  const links=getDrillLinks().filter(d=>d.attachedTo?.includes(p.id));
  el.innerHTML=`<button class="btn o sm" style="margin-bottom:14px;width:auto;padding:9px 18px" onclick="openDrillLinkSaver()">+ Save Drill Link for ${esc(p.name.split(' ')[0])}</button>`;
  if(!links.length){ el.innerHTML+=`<div class="empty"><div class="empty-ico">🔗</div><div class="empty-ttl">No drill links attached</div><div class="empty-dsc">Save a YouTube link and attach it to ${esc(p.name.split(' ')[0])}</div></div>`; return; }
  const platIco={youtube:'▶️',instagram:'📸',tiktok:'🎵',web:'🌐',other:'🔗'};
  el.innerHTML+=links.map(d=>`
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

function deleteDrillLink(id){
  DB.set(pfx()+'_drilllinks',getDrillLinks().filter(d=>d.id!==id));
  renderDrillLinks();
  if(state.currentPlayer) renderPlayerDrills(state.currentPlayer);
  showToast('tG','Deleted');
}

function attachDrillToPlayer(drillId){
  const players=getPlayers();
  const sel=prompt('Player name to attach to:');
  if(!sel) return;
  const p=players.find(x=>x.name.toLowerCase().includes(sel.toLowerCase()));
  if(!p){showToast('tO','Player not found');return;}
  const links=getDrillLinks();
  const dl=links.find(d=>d.id===drillId);
  if(dl&&!dl.attachedTo?.includes(p.id)){
    if(!dl.attachedTo) dl.attachedTo=[];
    dl.attachedTo.push(p.id);
    DB.set(pfx()+'_drilllinks',links);
    showToast('tG',`Attached to ${p.name}`);
    renderDrillLinks();
  }
}

function addDrillToFocus(drillId, playerId){
  // Add it as a focus item
  const items=getFocusItems();
  const dl=getDrillLinks().find(d=>d.id===drillId);
  const weeks=getFocusWeeks().filter(w=>w.playerId===playerId&&w.status==='active');
  if(!weeks.length){showToast('tO','No active focus week for this player');return;}
  items.push({id:uid(),weekId:weeks[0].id,playerId,title:'Watch & work: '+dl.title,cat:dl.cat,priority:'medium',status:'pending',drillLinkId:drillId,ts:Date.now()});
  DB.set(pfx()+'_focusitems',items);
  showToast('tG','✓ Added to Weekly Focus');
  if(document.getElementById('pdTpFocus').classList.contains('act')) renderPlayerFocus(state.currentPlayer);
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

function renderPlayerFocus(p){
  const el=document.getElementById('pdTpFocus');
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
  const prioCls={high:'high',medium:'medium',low:'low'};

  el.innerHTML=`
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
    ${items.length?items.map(fi=>`
      <div class="focus-item" style="margin:0 0 1px">
        <div class="fi-check ${fi.status==='completed'?'done':''}" onclick="toggleFocusItemPD('${fi.id}','${week.id}','${p.id}')">${fi.status==='completed'?'✓':''}</div>
        <div class="fi-content">
          <div class="fi-title ${fi.status==='completed'?'done':''}">${esc(fi.title)}</div>
          <div class="fi-meta"><div class="fi-priority ${prioCls[fi.priority]}"></div><span>${esc(fi.cat)}</span></div>
        </div>
      </div>`).join('')
    :`<div class="empty" style="padding:24px"><div class="empty-ico">🎯</div><div class="empty-ttl">No focus items</div><div class="empty-dsc">Open full view to add items</div></div>`}`;
}

function toggleFocusItemPD(itemId,weekId,playerId){
  const items=getFocusItems();
  const item=items.find(fi=>fi.id===itemId);
  if(item) item.status=item.status==='completed'?'pending':'completed';
  DB.set(pfx()+'_focusitems',items);
  const p=getPlayers().find(x=>x.id===playerId);
  if(p) renderPlayerFocus(p);
  if(item?.status==='completed') showToast('tG','✓ Done!');
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
//  PLAYER PROGRESS
// ═══════════════════════════════════════════════════════
function renderPlayerProgress(p){
  const el=document.getElementById('pdTpProgress');
  const caps=getCaptures().filter(c=>c.playerId===p.id&&c.type==='stat');
  const s=S();

  // Skill overview
  const weakKeys=s.skillKeys.filter(k=>p.skills[k]>0).sort((a,b)=>p.skills[a]-p.skills[b]);

  el.innerHTML=`
    <div class="sec">Skill Ratings</div>
    ${weakKeys.map(k=>{
      const v=p.skills[k];
      const cls=v>=80?'rtg-e':v>=65?'rtg-g':'rtg-l';
      return`<div class="trend-row">
        <div class="tr-ico">${{ballHandling:'🏀',shooting:'🎯',finishing:'💪',footwork:'👟',defense:'🛡️',conditioning:'⚡',throwing:'🏈',routeRunning:'💨',catching:'🤲',blocking:'🔒'}[k]||'📊'}</div>
        <div class="tr-info"><div class="tr-name">${esc(s.skillLabels[k])}</div><div class="tr-vals">${safePercent(v)}/100</div></div>
        <div class="tr-delta ${v>=75?'up':'down'}">${safePercent(v)}</div>
      </div>`;
    }).join('')}

    ${caps.length?`<div class="sec" style="margin-top:20px">Logged Stats</div>
    ${caps.slice().sort((a,b)=>b.ts-a.ts).slice(0,8).map(c=>`
      <div class="trend-row">
        <div class="tr-ico">📊</div>
        <div class="tr-info"><div class="tr-name">${esc(c.metric)}</div><div class="tr-vals">${fmtTs(c.ts)}</div></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:900;color:var(--grn)">${esc(c.value)}${esc(c.unit)}</div>
      </div>`).join('')}`:''}

    <div class="sec" style="margin-top:20px">AI Analysis</div>
    <div style="background:linear-gradient(135deg,rgba(249,115,22,.08),rgba(249,115,22,.03));border:1px solid rgba(249,115,22,.2);border-radius:var(--r);padding:13px">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:800;color:var(--wh);margin-bottom:6px">🤖 Development Insight</div>
      <div style="font-size:12px;color:var(--mu);line-height:1.6">${esc(getAIInsight(p))}</div>
      <button class="btn o sm" style="margin-top:10px;width:auto;padding:8px 16px" onclick="goTab('tAI')">Ask AI Coach</button>
    </div>`;
}

function getAIInsight(p){
  const s=S();
  const active=s.skillKeys.filter(k=>p.skills[k]>0);
  const min=active.reduce((a,b)=>p.skills[b]<p.skills[a]?b:a);
  return `${p.name.split(' ')[0]}'s lowest rated area is ${s.skillLabels[min]} (${p.skills[min]}/100). Based on goal: "${p.goal}" — recommend 2× weekly sessions targeting this first. Key area from notes: "${p.weaknesses.split(',')[0].trim()}"`;
}

function renderPlayerSessions(p){
  const el=document.getElementById('pdTpSessions');
  const sessions=getSessions().filter(s=>s.playerId===p.id);
  if(!sessions.length){el.innerHTML='<div class="empty"><div class="empty-ico">▶</div><div class="empty-ttl">No sessions yet</div><div class="empty-dsc">Start a session to build history</div></div>';return;}
  el.innerHTML=sessions.map(s=>{
    const plan=getPlans().find(pl=>pl.id===s.planId);
    const mins=Math.floor((s.duration||0)/60);
    return`<div class="card" style="margin-bottom:9px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:800;color:var(--wh)">${esc(plan?.title||'Open Session')}</div>
        <span class="pill m">${fmtTs(s.date||s.ts||Date.now())}</span>
      </div>
      <div style="font-size:11px;color:var(--mu);margin-bottom:5px">⏱ ${mins} min · ${s.results?.length||0} drills tracked</div>
      ${s.notes?`<div style="font-size:12px;color:var(--tx);line-height:1.5">${esc(s.notes)}</div>`:''}
    </div>`;
  }).join('');
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
//  ROSTER UPLOAD
// ═══════════════════════════════════════════════════════
function handleRosterUpload(event){
  const file=event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const text=e.target.result;
    parseCSVRoster(text, file.name);
  };
  if(file.name.toLowerCase().endsWith('.csv')) reader.readAsText(file);
  else showToast('tO','CSV files only for now');
}

function parseCSVRoster(csvText, filename){
  const lines=csvText.trim().split('\n');
  if(lines.length<2){showToast('tO','CSV needs at least 2 rows (header + data)');return;}
  const headers=lines[0].split(',').map(h=>h.trim().toLowerCase().replace(/['"]/g,''));
  state.rosterPreviewData=lines.slice(1).map((line,i)=>{
    const cols=line.split(',').map(c=>c.trim().replace(/['"]/g,''));
    const obj={};
    headers.forEach((h,idx)=>obj[h]=cols[idx]||'');
    // Normalize
    const name=obj.name||obj.full_name||(obj.first_name&&obj.last_name?obj.first_name+' '+obj.last_name:'')||obj.player||'Player '+(i+1);
    const pos=obj.position||obj.pos||'';
    const age=parseInt(obj.age)||0;
    const grade=obj.grade||obj.year||'';
    const existing=getPlayers().find(p=>p.name.toLowerCase()===name.toLowerCase());
    return{_name:name,_pos:pos,_age:age,_grade:grade,_dup:!!existing,_err:!name};
  }).filter(r=>!r._err);
  showRosterPreview(filename);
}

function parsePastedRoster(){
  const text=document.getElementById('rosterPasteArea').value.trim();
  if(!text){showToast('tO','Paste some player names first');return;}
  const lines=text.split('\n').filter(l=>l.trim());
  state.rosterPreviewData=lines.map((line,i)=>{
    const parts=line.split(',').map(p=>p.trim());
    const name=parts[0]||'Player '+(i+1);
    const pos=parts[1]||'';
    const age=parseInt(parts[2])||0;
    const existing=getPlayers().find(p=>p.name.toLowerCase()===name.toLowerCase());
    return{_name:name,_pos:pos,_age:age,_grade:'',_dup:!!existing,_err:!name};
  });
  showRosterPreview('Pasted Roster');
}

function showRosterPreview(filename){
  const el=document.getElementById('rosterPreview');
  const list=document.getElementById('rosterPreviewList');
  el.style.display='';
  const newCount=state.rosterPreviewData.filter(r=>!r._dup).length;
  const dupCount=state.rosterPreviewData.filter(r=>r._dup).length;
  list.innerHTML=`<div style="padding:10px 14px;background:var(--s2);border-bottom:1px solid var(--bdr);display:flex;gap:12px">
    <span class="pill g">✓ ${newCount} new</span>
    ${dupCount?`<span class="pill y">⚠ ${dupCount} duplicate</span>`:''}
  </div>`+state.rosterPreviewData.map((r,i)=>`
    <div class="roster-preview-row">
      <div class="rpr-num">${i+1}</div>
      <div class="rpr-info"><div class="rpr-name">${esc(r._name)}</div><div class="rpr-detail">${esc([r._pos,r._age?'Age '+r._age:'',r._grade].filter(Boolean).join(' · ')||'Position TBD')}</div></div>
      <div class="rpr-status ${r._dup?'dup':'new'}">${r._dup?'Exists':'New'}</div>
    </div>`).join('');
}

function importRoster(){
  if(!state.rosterPreviewData.length){showToast('tO','No players to import');return;}
  const players=getPlayers();
  const colors=['#3b82f6','#ef4444','#22c55e','#f97316','#9b5de5','#eab308','#00d4e0','#ec4899'];
  const sp=S();
  let added=0;
  state.rosterPreviewData.filter(r=>!r._dup).forEach(r=>{
    const skills={};sp.skillKeys.forEach(k=>skills[k]=65);
    players.push({id:uid(),name:r._name,pos:r._pos||sp.positions[0],age:r._age||16,grade:r._grade||'',goal:'To be defined',weaknesses:'To be assessed',avatar:r._name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(),color:colors[players.length%colors.length],skills,sessions:0,sport:state.SPORT,created:Date.now()});
    added++;
  });
  DB.set(pfx()+'_players',players);
  document.getElementById('rosterPreview').style.display='none';
  state.rosterPreviewData=[];
  renderPlayers();
  renderHome();
  showToast('tG',`✓ ${added} players imported`);
  back();
}

function downloadSampleCSV(){
  const csv='name,position,age,grade\nMarcus Johnson,Point Guard,16,10th\nAaliyah Carter,Shooting Guard,15,9th\nDevon Williams,Power Forward,17,11th';
  const blob=new Blob([csv],{type:'text/csv'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='courtflow_sample_roster.csv';a.click();
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
//  SPORT SWITCH
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
//  BLOCKER 1: ONBOARDING
// ═══════════════════════════════════════════════════════

function obSelectSport(s){
  state.obSport = s;
  document.querySelectorAll('#obStep1 .ob-card').forEach(c => c.classList.remove('sel'));
  document.getElementById('obBasketball').classList.toggle('sel', s==='basketball');
  document.getElementById('obFootball').classList.toggle('sel', s==='football');
  const btn = document.getElementById('obStep1Next');
  btn.style.opacity = '1'; btn.style.pointerEvents = 'auto';
}

function obSelectRole(r){
  state.obRole = r;
  ['Coach','Trainer','Player','Parent'].forEach(x =>
    document.getElementById('obRole'+x)?.classList.remove('sel')
  );
  document.getElementById('obRole'+r.charAt(0).toUpperCase()+r.slice(1)).classList.add('sel');
  const btn = document.getElementById('obStep2Next');
  btn.style.opacity = '1'; btn.style.pointerEvents = 'auto';
}

function obGoStep(n){
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('act'));
  document.getElementById('obStep'+n).classList.add('act');
  // sync dot states
  const isStep2 = n === 2;
  ['obD1','obD1b'].forEach(id => { const el=document.getElementById(id); if(el) el.classList.toggle('act',!isStep2); });
  ['obD2','obD2b'].forEach(id => { const el=document.getElementById(id); if(el) el.classList.toggle('act', isStep2); });
}

function obFinish(){
  if(!state.obSport || !state.obRole) return;
  DB.set('onboarding_complete', true);
  DB.set('sport', state.obSport);
  DB.set('user_sport', state.obSport);
  DB.set('user_role', state.obRole);
  state.SPORT = state.obSport;
  // Fade out onboarding
  const ob = document.getElementById('sOnboarding');
  ob.style.transition = 'opacity .4s ease';
  ob.style.opacity = '0';
  setTimeout(() => ob.classList.add('hidden'), 420);
  updateSportUI();
  renderHome();
}

function checkOnboarding(){
  // Always dismiss splash after 1.4s
  const splash = document.getElementById('sSplash');
  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => { splash.style.display = 'none'; }, 520);
  }, 1400);

  if(DB.get('onboarding_complete')){
    // Already onboarded — hide onboarding immediately after splash
    setTimeout(() => {
      document.getElementById('sOnboarding').classList.add('hidden');
    }, 1450);
  }
  // else onboarding stays visible after splash fades
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

function copyToClipboard(text){
  if(navigator.clipboard){
    navigator.clipboard.writeText(text).then(()=>showToast('tG','✓ Copied to clipboard'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast('tG','✓ Copied to clipboard');
  }
}

// ═══════════════════════════════════════════════════════
//  BLOCKER 3: NOTE VISIBILITY
// ═══════════════════════════════════════════════════════

function toggleCaptureVisibility(){
  state.capVisibility = state.capVisibility === 'private' ? 'parent_visible' : 'private';
  const toggle = document.getElementById('capVisToggle');
  const ico    = document.getElementById('capVisIco');
  const lbl    = document.getElementById('capVisLabel');
  const sub    = document.getElementById('capVisSub');
  if(state.capVisibility === 'parent_visible'){
    toggle.classList.add('parent-vis');
    ico.textContent = '👁';
    lbl.textContent = 'Parent Visible — Shows in summaries';
    sub.textContent = 'Tap to make private';
  } else {
    toggle.classList.remove('parent-vis');
    ico.textContent = '🔒';
    lbl.textContent = 'Private — Coach only';
    sub.textContent = 'Tap to make visible in parent summaries';
  }
}

function resetVisibilityToggle(){
  state.capVisibility = 'private';
  document.getElementById('capVisToggle')?.classList.remove('parent-vis');
  const ico = document.getElementById('capVisIco');
  const lbl = document.getElementById('capVisLabel');
  const sub = document.getElementById('capVisSub');
  if(ico) ico.textContent = '🔒';
  if(lbl) lbl.textContent = 'Private — Coach only';
  if(sub) sub.textContent = 'Tap to make visible in parent summaries';
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

init();
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
