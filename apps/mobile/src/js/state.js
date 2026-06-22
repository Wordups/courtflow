// ═══════════════════════════════════════════════════════
//  STATE — the single mutable singleton for app state.
//
//  Every module that needs to read or write app state imports
//  this object and goes through `state.X`. Object mutations are
//  visible to all importers (ES modules export live bindings).
//
//  SPORT is the only field initialized from storage at import
//  time. Everything else starts at its empty/default value and
//  gets set during the user flow.
// ═══════════════════════════════════════════════════════

const STORAGE_SPORT_KEY = 'cf3_sport';

function initialSport() {
  try {
    const raw = localStorage.getItem(STORAGE_SPORT_KEY);
    if (!raw) return 'basketball';
    return JSON.parse(raw) || 'basketball';
  } catch {
    return 'basketball';
  }
}

export const state = {
  // sport + navigation
  SPORT: initialSport(),
  screenStack: [],
  currentTab: 'tHome',

  // selection
  currentPlayer: null,
  focusPlayerId: null,
  focusDetailPlayerId: null,

  // quick capture modal
  capType: 'note',
  capTags: [],
  capVisibility: 'private', // 'private' | 'parent_visible'
  _activeCaptureSessionId: null,

  // FAB
  fabOpen: false,

  // depth chart
  dcPhase: 'O',
  dcAssigning: null,

  // roster
  rosterPreviewData: [],

  // session
  SESS: {},
  _lastSession: {},

  // AI tab
  aiMessages: [],
  aiReady: false,

  // drills tab filter
  activeDrillCat: 'All',

  // onboarding flow
  obSport: null,
  obRole: null,
};
