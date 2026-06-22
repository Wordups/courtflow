// ═══════════════════════════════════════════════════════
//  STORAGE — localStorage wrapper, sport-aware data
//  accessors, and one-time seed of demo content.
//
//  All persistence flows through DB. Keys are namespaced by
//  the cf3_ prefix; per-sport collections are split via
//  pfx() ('bball' or 'football'). Cross-sport keys (like
//  'fb_depth' or 'sport') are written directly.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { SPORTS } from './config.js';

export const DB = {
  get(k){try{return JSON.parse(localStorage.getItem('cf3_'+k))||null;}catch{return null;}},
  set(k,v){localStorage.setItem('cf3_'+k,JSON.stringify(v));},
};

// Sport config for the currently-active sport.
export function S(){ return SPORTS[state.SPORT]; }

// Per-sport key prefix. Used to namespace player/capture/etc. collections.
export function pfx(){ return state.SPORT==='basketball'?'bball':'football'; }

// ── Data accessors ─────────────────────────────────────
export function getPlayers(){ return DB.get(pfx()+'_players')||[]; }
export function getCaptures(){ return DB.get(pfx()+'_captures')||[]; }
export function getDrillLinks(){ return DB.get(pfx()+'_drilllinks')||[]; }
export function getPlans(){ return S().plans||[]; }
export function getSessions(){ return DB.get(pfx()+'_sessions')||[]; }
export function getFocusWeeks(){ return DB.get(pfx()+'_focusweeks')||[]; }
export function getFocusItems(){ return DB.get(pfx()+'_focusitems')||[]; }
export function getDepthChart(){ return DB.get('fb_depth')||{}; }

// ── Demo seed ──────────────────────────────────────────
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

export function init(){
  if(!DB.get('bball_players')) seedBball();
  if(!DB.get('football_players')) seedFootball();
}
