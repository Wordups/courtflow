// ═══════════════════════════════════════════════════════
//  ONBOARDING — splash + two-step (sport, role) setup.
//
//  obSelectSport writes to state.SPORT only on obFinish; the
//  selection stays in state.obSport until the user commits
//  to it (so a back-button in the future would not corrupt
//  state.SPORT).
//
//  Sport persistence: the canonical key is `sport`. We also
//  write `user_sport` and `user_role` for future profile use.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { DB } from './storage.js';
import { updateSportUI, renderHome } from './home.js';

export function obSelectSport(s){
  state.obSport = s;
  document.querySelectorAll('#obStep1 .ob-card').forEach(c => c.classList.remove('sel'));
  document.getElementById('obBasketball').classList.toggle('sel', s === 'basketball');
  document.getElementById('obFootball').classList.toggle('sel', s === 'football');
  const btn = document.getElementById('obStep1Next');
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
}

export function obSelectRole(r){
  state.obRole = r;
  ['Coach','Trainer','Player','Parent'].forEach(x =>
    document.getElementById('obRole' + x)?.classList.remove('sel')
  );
  document.getElementById('obRole' + r.charAt(0).toUpperCase() + r.slice(1)).classList.add('sel');
  const btn = document.getElementById('obStep2Next');
  btn.style.opacity = '1';
  btn.style.pointerEvents = 'auto';
}

export function obGoStep(n){
  document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('act'));
  document.getElementById('obStep' + n).classList.add('act');
  const isStep2 = n === 2;
  ['obD1','obD1b'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('act', !isStep2); });
  ['obD2','obD2b'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('act',  isStep2); });
}

export function obFinish(){
  if (!state.obSport || !state.obRole) return;
  DB.set('onboarding_complete', true);
  DB.set('sport', state.obSport);
  DB.set('user_sport', state.obSport);
  DB.set('user_role', state.obRole);
  state.SPORT = state.obSport;
  const ob = document.getElementById('sOnboarding');
  ob.style.transition = 'opacity .4s ease';
  ob.style.opacity = '0';
  setTimeout(() => ob.classList.add('hidden'), 420);
  updateSportUI();
  renderHome();
}

export function checkOnboarding(){
  const splash = document.getElementById('sSplash');
  setTimeout(() => {
    splash.style.opacity = '0';
    setTimeout(() => { splash.style.display = 'none'; }, 520);
  }, 1400);

  if (DB.get('onboarding_complete')) {
    setTimeout(() => {
      document.getElementById('sOnboarding').classList.add('hidden');
    }, 1450);
  }
}
