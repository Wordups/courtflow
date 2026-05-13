// ═══════════════════════════════════════════════════════
//  SETTINGS — profile save, data export, onboarding reset,
//  and sport switching (settings adjacent — triggered from
//  the settings row but renders the home shell).
//
//  switchSport lives here because:
//   1. It's a settings-level action (an "Active Sport" row)
//   2. It cuts across multiple state slices (currentPlayer,
//      focus selections, AI chat state), so keeping it next
//      to the rest of the settings-side state plumbing keeps
//      the side effects discoverable.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { SPORTS } from './config.js';
import {
  DB,
  getPlayers, getCaptures, getSessions, getDrillLinks,
  getFocusWeeks, getFocusItems,
} from './storage.js';
import { showToast } from './utils.js';
import { closeModal, goTab } from './navigation.js';
import { renderHome, updateSportUI } from './home.js';

export function saveSettingsProfile(){
  const name = document.getElementById('settingsName').value.trim();
  if (name) DB.set('coach_name', name);
  renderHome();
  showToast('tG', '✓ Profile saved');
}

export function exportData(){
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
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'courtflow-export.json';
  a.click();
  showToast('tG', '✓ Data exported');
}

export function resetOnboarding(){
  if (confirm('Reset onboarding? App will restart.')) {
    DB.set('onboarding_complete', false);
    location.reload();
  }
}

export function switchSport(s){
  state.SPORT = s;
  DB.set('sport', state.SPORT);
  closeModal('mSportSwitch');
  updateSportUI();
  // Sport switch clears selections + AI chat (so we don't show
  // basketball context after switching to football, etc.)
  state.currentPlayer = null;
  state.focusPlayerId = null;
  state.focusDetailPlayerId = null;
  state.aiReady = false;
  state.aiMessages = [];
  document.getElementById('aiChat').innerHTML = '';
  document.getElementById('aiInsightArea').innerHTML = '';
  goTab('tHome');
  showToast('tG', SPORTS[s].icon + ' Switched to ' + SPORTS[s].label);
}
