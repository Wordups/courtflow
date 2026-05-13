// ═══════════════════════════════════════════════════════
//  CONFIG — sport definitions, depth chart positions,
//  feature flags, endpoint paths, app-level constants.
//
//  Pure constants only. No mutable state, no DOM.
// ═══════════════════════════════════════════════════════

// Feature flags — gate incomplete features off in production
// builds without ripping their code out.
export const CF_FLAGS = {
  AI_ENABLED: false,
  MULTI_TENANT: false,
  BILLING: false,
};

// Also attach to window so non-module code (transition period) can read it.
if (typeof window !== 'undefined') window.CF_FLAGS = CF_FLAGS;

// Server-side AI proxy endpoint. Never call providers directly from the client.
export const AI_COACH_ENDPOINT = '/api/ai/coach';

// localStorage key prefix.
export const DB_PREFIX = 'cf3_';

export const SPORTS = {
  basketball:{
    label:'Basketball', icon:'🏀',
    positions:['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
    skillKeys:['ballHandling','shooting','finishing','footwork','defense','conditioning'],
    skillLabels:{ballHandling:'Ball Handling',shooting:'Shooting',finishing:'Finishing',footwork:'Footwork',defense:'Defense',conditioning:'Conditioning'},
    skillColors:{ballHandling:'#3b82f6',shooting:'#f97316',finishing:'#22c55e',footwork:'#eab308',defense:'#ef4444',conditioning:'#00d4e0'},
    drillCats:['Ball Handling','Shooting','Finishing','Footwork','Defense','Conditioning','Passing','IQ / Reads'],
    planFocuses:['Ball Handling','Shooting','Finishing','Footwork','Defense','Conditioning','Full Body','IQ / Reads'],
    plans:[
      {id:'bp1',title:'Ball Handling Fundamentals',focus:'Ball Handling',duration:45,drills:[]},
      {id:'bp2',title:'Shooting Off Screens',focus:'Shooting',duration:60,drills:[]},
      {id:'bp3',title:'Finishing Package',focus:'Finishing',duration:45,drills:[]},
      {id:'bp4',title:'Defense Intensity',focus:'Defense',duration:50,drills:[]},
    ],
    focusTags:['Technique','Footwork','Shooting','Handle','Defense','Conditioning','IQ','Film'],
  },
  football:{
    label:'Football', icon:'🏈',
    positions:['Quarterback','Running Back','Wide Receiver','Tight End','Offensive Line','Defensive Line','Linebacker','Cornerback','Safety','Kicker'],
    skillKeys:['throwing','routeRunning','catching','footwork','blocking','conditioning'],
    skillLabels:{throwing:'Throwing',routeRunning:'Routes',catching:'Hands',footwork:'Footwork',blocking:'Blocking',conditioning:'Conditioning'},
    skillColors:{throwing:'#3b82f6',routeRunning:'#f97316',catching:'#22c55e',footwork:'#eab308',blocking:'#ef4444',conditioning:'#00d4e0'},
    drillCats:['Route Running','Throwing','Catching','Footwork','Blocking','Conditioning','Film Study','Reads'],
    planFocuses:['Route Running','Throwing Mechanics','Catching','Footwork','Blocking','Conditioning','Red Zone','2-Minute Drill'],
    plans:[
      {id:'fp1',title:'WR Route Tree',focus:'Route Running',duration:50,drills:[]},
      {id:'fp2',title:'QB Mechanics & Timing',focus:'Throwing Mechanics',duration:55,drills:[]},
      {id:'fp3',title:'Footwork & Agility',focus:'Footwork',duration:40,drills:[]},
    ],
    focusTags:['Routes','Hands','Footwork','Reads','Coverage','Blocking','Conditioning','Film'],
  },
};

// Depth chart positions (football only).
export const DC_POS = {
  O:[
    {g:'Backfield',p:[{a:'QB',n:'Quarterback',ico:'🏈',max:3,sk:'throwing'},{a:'HB',n:'Halfback',ico:'💨',max:3,sk:'routeRunning'},{a:'FB',n:'Fullback',ico:'🔨',max:2,sk:'blocking'}]},
    {g:'Receivers',p:[{a:'WR',n:'Wide Receiver',ico:'⚡',max:5,sk:'catching'},{a:'TE',n:'Tight End',ico:'🎯',max:3,sk:'catching'}]},
    {g:'O-Line',p:[{a:'LT',n:'Left Tackle',ico:'🛡️',max:2,sk:'blocking'},{a:'LG',n:'Left Guard',ico:'🛡️',max:2,sk:'blocking'},{a:'C',n:'Center',ico:'🛡️',max:2,sk:'blocking'},{a:'RG',n:'Right Guard',ico:'🛡️',max:2,sk:'blocking'},{a:'RT',n:'Right Tackle',ico:'🛡️',max:2,sk:'blocking'}]},
  ],
  D:[
    {g:'D-Line',p:[{a:'LE',n:'Left End',ico:'💥',max:3,sk:'conditioning'},{a:'RE',n:'Right End',ico:'💥',max:3,sk:'conditioning'},{a:'DT',n:'Defensive Tackle',ico:'🏋️',max:3,sk:'blocking'}]},
    {g:'Linebackers',p:[{a:'LOLB',n:'Left OLB',ico:'🔍',max:3,sk:'footwork'},{a:'MLB',n:'Middle LB',ico:'🔍',max:2,sk:'footwork'},{a:'ROLB',n:'Right OLB',ico:'🔍',max:3,sk:'footwork'}]},
    {g:'Secondary',p:[{a:'CB',n:'Cornerback',ico:'🚫',max:4,sk:'footwork'},{a:'FS',n:'Free Safety',ico:'👁️',max:2,sk:'routeRunning'},{a:'SS',n:'Strong Safety',ico:'👊',max:2,sk:'footwork'}]},
  ],
  ST:[
    {g:'Kicking',p:[{a:'K',n:'Kicker',ico:'⚽',max:2,sk:'conditioning'},{a:'P',n:'Punter',ico:'💢',max:2,sk:'conditioning'},{a:'LS',n:'Long Snapper',ico:'🎯',max:1,sk:'throwing'}]},
    {g:'Returns',p:[{a:'KR',n:'Kick Returner',ico:'💨',max:2,sk:'routeRunning'},{a:'PR',n:'Punt Returner',ico:'💨',max:2,sk:'routeRunning'}]},
  ],
};
