// ═══════════════════════════════════════════════════════
//  app.js — entry point.
//
//  Pulls every module together, wires the tab-renderer
//  registry, runs the boot sequence, and exposes the inline
//  onclick handlers on window (the markup still uses inline
//  attributes; under <script type="module"> those need the
//  bindings to live on window).
// ═══════════════════════════════════════════════════════

import { state } from './js/state.js';
import { SPORTS, CF_FLAGS } from './js/config.js';
import { DB, init as initDB } from './js/storage.js';
import { safeOpenUrl } from './js/utils.js';

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
  deleteCapture, filterPlayerTimeline,
  openCaptureEdit,
  toggleFocusItemPD,
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
  renderFocus,
  toggleFocusItem, deleteFocusItem,
  openFocusPlayerPicker, selectFocusPlayer, addFocusItem,
  openFocusDetail,
  toggleFocusItemDetail, deleteFocusItemDetail,
  addFocusItemDirect, newFocusWeek,
} from './js/focus.js';
import {
  openSessionPicker, startSession, adj, prevDrill, nextDrill,
  endSession, shareSessionSummary, closeSessionSummary,
} from './js/session.js';
import {
  setDepthPhase, renderDepthChart,
  openDepthAssign, assignDepthSlot, removeDepthSlot, clearDepthChart,
} from './js/depth-chart.js';
import {
  renderAI, sendAI, aiAsk, aiSuggest,
} from './js/ai.js';
import {
  switchSport, saveSettingsProfile, exportData, resetOnboarding,
} from './js/settings.js';

// ── Wire tab renderers into the navigation registry ──
registerTab('tHome', renderHome);
registerTab('tPlayers', renderPlayers);
registerTab('tDrills', renderDrillLinks);
registerTab('tFocus', renderFocus);
registerTab('tDepth', renderDepthChart);
registerTab('tAI', renderAI);

// ── Feature flag activation ───────────────────────────
// Mark every [data-flag="X"] element with data-flag-active when its
// flag is currently on. Combined with the CSS rule
// `[data-flag]:not([data-flag-active]){display:none}`, this hides
// every gated element by default and reveals only the ones whose
// flag is set to true in CF_FLAGS.
function activateFlags(){
  document.querySelectorAll('[data-flag]').forEach(el => {
    const flag = el.getAttribute('data-flag');
    if (CF_FLAGS[flag]) el.setAttribute('data-flag-active', '');
  });
}

// ── Boot ──────────────────────────────────────────────
activateFlags();
initDB();
checkOnboarding();
updateSportUI();

// Greeting — use saved coach name if set
const _coachName = DB.get('coach_name') || 'Coach';
const _h = new Date().getHours();
document.getElementById('htGreeting').textContent =
  (_h < 12 ? 'Good morning' : _h < 17 ? 'Good afternoon' : 'Good evening') + ', ' + _coachName;

// Pre-fill settings name field
const _sn = document.getElementById('settingsName');
if (_sn && DB.get('coach_name')) _sn.value = DB.get('coach_name');

// Settings role label
const _sr = document.getElementById('settingsRoleLbl');
if (_sr) _sr.textContent = (DB.get('user_role') || 'Coach').charAt(0).toUpperCase()
  + (DB.get('user_role') || 'coach').slice(1);

// Settings sport label
const _ssl = document.getElementById('settingsSportLbl');
if (_ssl) _ssl.textContent = SPORTS[state.SPORT]?.label || 'Basketball';

renderHome();

// ═══════════════════════════════════════════════════════
//  WINDOW BINDINGS
//  Inline `onclick=` attributes evaluate in the global scope.
//  Since this file is loaded as <script type="module">, module
//  declarations are scoped per-module. Expose handlers on window
//  so the inline HTML can resolve them.
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  // navigation
  goTab, push, back, openModal, closeModal,
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
