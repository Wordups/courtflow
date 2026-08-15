// ═══════════════════════════════════════════════════════
//  WORKOUTS — structured, block-based workout templates and
//  the browse/detail screens that front them.
//
//  A plan (config.js SPORTS[x].plans) is just a title + a
//  focus. A workout is the trackable version: an ordered list
//  of blocks, each block an ordered list of drills, each drill
//  carrying how it gets counted (`track`) and what a full set
//  looks like (`target`). session.js flattens that into the
//  live drill queue, so every rep the coach taps lands against
//  a known target instead of a bare counter.
//
//  track values:
//    'shots' — makes + attempts, target is makes
//    'reps'  — a single rep counter, target is reps
//    'time'  — no counters, the drill timer is the record
//
//  Data only + rendering. No session state lives here.
// ═══════════════════════════════════════════════════════

import { state } from './state.js';
import { esc } from './utils.js';
import { push } from './navigation.js';

export const WORKOUTS = [
  {
    id: 'wk-female-guard-hybrid',
    title: 'Female Guard Hybrid',
    subtitle: '60-minute guard development',
    sport: 'basketball',
    focus: 'Footwork',
    duration: 60,
    level: 'HS Guard',
    summary:
      'Same skill foundation as the standard guard workout with extra weight on '
      + 'deceleration, change of direction, balance and finishing angles. '
      + 'Individualize the volume to the athlete — good guard development is good guard development.',
    watchPoints: [
      'Footwork', 'Deceleration', 'Balance',
      'Pace changes', 'Touch off the glass', 'Wasted dribbles',
    ],
    blocks: [
      {
        id: 'b1',
        title: 'Warm-Up + Foot Activation',
        window: '0–8 min',
        note: 'Jump rope 25 reps between sets.',
        drills: [
          { title: 'Dynamic warm-up', track: 'time', cue: 'Full range, no rushing through it' },
          { title: 'Hip / ankle activation', track: 'time', cue: 'Ankles have to be ready to decelerate' },
          { title: 'Low dribble movement', track: 'reps', target: 4, cue: 'Stay low the whole rep, not just the start' },
          { title: 'Change-of-pace ball handling', track: 'reps', target: 4, cue: 'Real speed change — slow has to look slow' },
          { title: 'Controlled stops', track: 'reps', target: 6, cue: 'Stop balanced, no drift after the stop' },
        ],
      },
      {
        id: 'b2',
        title: 'Boring Stuff: Footwork',
        window: '8–18 min',
        note: 'Both sides of the floor.',
        teach: 'Feet should look the same whether she is fresh or tired. No extra steps.',
        drills: [
          { title: 'Catch → right foot, left foot → rise up', track: 'shots', target: 10, cue: '5 each side of the floor' },
          { title: 'Catch → left foot, right foot → rise up', track: 'shots', target: 10, cue: '5 each side of the floor' },
          { title: 'Sprint into catch → balance → jumper', track: 'shots', target: 10, cue: 'Balance before the rise, not during it' },
          { title: 'Lift → catch → shoot', track: 'shots', target: 10, cue: 'Feet set on the lift, hands ready early' },
          { title: 'Drift → catch → shoot', track: 'shots', target: 10, cue: 'Square the shoulders while drifting' },
        ],
      },
      {
        id: 'b3',
        title: 'Middy + Downhill Work',
        window: '18–28 min',
        teach: 'Going fast and being able to stop fast.',
        drills: [
          { title: 'Downhill catch around cone → middy', track: 'shots', target: 10, cue: 'Get downhill before the catch settles' },
          { title: '1-dribble pull-up', track: 'shots', target: 10, cue: 'One dribble, one gather — nothing extra' },
          { title: '2-dribble pull-up', track: 'shots', target: 10, cue: 'Second dribble has to gain ground' },
          { title: 'Hard downhill attack → stop → jumper', track: 'shots', target: 10, cue: 'Stop on balance, no fade to bail out' },
          { title: 'Misdirection → downhill → pull-up', track: 'shots', target: 10, cue: 'Sell the first direction' },
        ],
      },
      {
        id: 'b4',
        title: 'Finishing Package',
        window: '28–38 min',
        note: 'Add light contact once she is comfortable.',
        drills: [
          { title: 'Glass kisses', track: 'shots', target: 10, cue: 'Soft touch, same spot on the square' },
          { title: 'Inside-hand glass', track: 'shots', target: 10, cue: 'Protect with the body, finish high' },
          { title: 'Outside-hand glass', track: 'shots', target: 10, cue: 'Extend away from the help' },
          { title: 'Wrong-foot finish', track: 'shots', target: 8, cue: 'Rise off the unexpected foot on purpose' },
          { title: 'Two-foot power finish', track: 'shots', target: 8, cue: 'Land balanced, absorb the contact' },
          { title: 'Raise-up floater high off glass', track: 'shots', target: 8, cue: 'High arc over the second defender' },
          { title: 'Same-foot / same-hand finish', track: 'shots', target: 8, cue: 'Uncomfortable on purpose — reps build it' },
        ],
      },
      {
        id: 'b5',
        title: 'Counter Series — Half Spin',
        window: '38–46 min',
        teach: 'Do not over-teach it. Introduce it, get clean reps, come back to it next workout.',
        drills: [
          { title: 'Downhill → cut off → half spin → finish', track: 'shots', target: 8, cue: 'Spin off the cut-off, not before it' },
          { title: 'Half spin → jumper', track: 'shots', target: 8, cue: 'Come out of the spin on balance' },
          { title: 'Half spin → re-attack', track: 'shots', target: 8, cue: 'Second burst after the spin' },
          { title: 'Misdirection → half spin counter', track: 'shots', target: 8, cue: 'Read first, counter second' },
        ],
      },
      {
        id: 'b6',
        title: 'Three-Level Shooting',
        window: '46–54 min',
        teach: 'Connect 3 → middy → rim instead of training each level separately.',
        drills: [
          { title: 'Lift threes', track: 'shots', target: 10, cue: 'Lift to the ball, feet ready on the catch' },
          { title: 'Catch-and-shoot three', track: 'shots', target: 10, cue: 'Same feet as the footwork block' },
          { title: 'Attack closeout → middy', track: 'shots', target: 10, cue: 'Read the closeout, then decide' },
          { title: 'Attack closeout → rim', track: 'shots', target: 10, cue: 'Get all the way through the shoulder' },
          { title: '1-dribble three', track: 'shots', target: 10, optional: true, cue: 'Only if it is already in her game' },
        ],
      },
      {
        id: 'b7',
        title: 'Pressure Finish',
        window: '54–60 min',
        drills: [
          { title: 'Free throws', track: 'shots', target: 10, cue: 'Same routine every rep' },
          { title: 'Jump rope', track: 'reps', target: 25, cue: '25 reps, keep the feet quiet' },
          { title: 'Sprint / movement into jumper', track: 'shots', target: 10, cue: 'Tired feet still have to look the same' },
          { title: 'Free throws', track: 'shots', target: 10, cue: 'Breathe, then routine' },
          { title: 'Finish on a make requirement', track: 'shots', target: 5, cue: 'Make 5 before she leaves the gym' },
        ],
      },
    ],
  },
];

// ── Lookups ────────────────────────────────────────────
export function getWorkouts(sport){
  return WORKOUTS.filter(w => !sport || w.sport === sport);
}

export function getWorkout(id){
  return WORKOUTS.find(w => w.id === id) || null;
}

// Flatten a workout into the ordered drill queue the live
// session steps through. Each entry keeps its block context so
// the session screen can show where in the hour she is.
export function workoutDrills(workout){
  const blocks = workout?.blocks || [];
  return blocks.flatMap((block, bi) => block.drills.map(d => ({
    title: d.title,
    coaching: d.cue || block.teach || '',
    track: d.track || 'shots',
    target: d.target || 0,
    optional: !!d.optional,
    blockId: block.id,
    blockTitle: block.title,
    blockWindow: block.window || '',
    blockIdx: bi,
    blockCount: blocks.length,
    blockNote: block.note || '',
  })));
}

export function workoutDrillCount(workout){
  return (workout?.blocks || []).reduce((n, b) => n + b.drills.length, 0);
}

// ── Library screen ─────────────────────────────────────
export function openWorkouts(){
  renderWorkouts();
  push('sWorkouts');
}

export function renderWorkouts(){
  const list = document.getElementById('workoutList');
  if (!list) return;
  const workouts = getWorkouts(state.SPORT);
  list.innerHTML = workouts.map(w => `
    <div class="wo-card" onclick="openWorkoutDetail('${esc(w.id)}')">
      <div class="wo-card-top">
        <div class="wo-card-info">
          <div class="wo-card-title">${esc(w.title)}</div>
          <div class="wo-card-sub">${esc(w.subtitle)}</div>
        </div>
        <div class="wo-dur">${Number(w.duration) || 0}<span>min</span></div>
      </div>
      <div class="wo-pills">
        <span class="pill m">${esc(w.level)}</span>
        <span class="pill m">${esc(w.focus)}</span>
        <span class="pill m">${(w.blocks || []).length} blocks</span>
        <span class="pill m">${workoutDrillCount(w)} drills</span>
      </div>
    </div>`).join('')
    || '<div style="padding:14px;text-align:center;color:var(--mu);font-size:13px">No workouts for this sport yet</div>';
}

// ── Detail screen ──────────────────────────────────────
// Which workout the detail screen is showing — the Start
// Tracking button reads it instead of carrying the id through
// an inline attribute.
let openWorkoutId = null;

export function startOpenWorkout(){
  if (openWorkoutId) window.openSessionPicker?.(openWorkoutId);
}

export function openWorkoutDetail(id){
  const w = getWorkout(id);
  if (!w) return;
  openWorkoutId = w.id;

  document.getElementById('wdTitle').textContent = w.title;
  document.getElementById('wdSub').textContent = `${w.duration} min · ${w.level}`;
  document.getElementById('wdSummary').textContent = w.summary;

  document.getElementById('wdWatch').innerHTML = (w.watchPoints || [])
    .map(p => `<span class="pill m">${esc(p)}</span>`).join('');

  document.getElementById('wdBlocks').innerHTML = (w.blocks || []).map((b, i) => `
    <div class="wo-block">
      <div class="wo-block-head">
        <div class="wo-block-n">${i + 1}</div>
        <div style="flex:1;min-width:0">
          <div class="wo-block-title">${esc(b.title)}</div>
          <div class="wo-block-win">${esc(b.window || '')}${b.note ? ' · ' + esc(b.note) : ''}</div>
        </div>
      </div>
      ${(b.drills || []).map(d => `
        <div class="wo-drill">
          <div class="wo-drill-name">${esc(d.title)}${d.optional ? '<span class="wo-opt">optional</span>' : ''}</div>
          <div class="wo-drill-tgt">${esc(targetLabel(d))}</div>
        </div>`).join('')}
      ${b.teach ? `<div class="wo-teach">${esc(b.teach)}</div>` : ''}
    </div>`).join('');

  push('sWorkoutDetail');
}

// "10 makes" / "25 reps" / "Timed" — used on the detail list and
// on the live session screen.
export function targetLabel(drill){
  if (!drill) return '';
  if (drill.track === 'time') return 'Timed';
  if (!drill.target) return drill.track === 'reps' ? 'Reps' : 'Makes';
  return `${drill.target} ${drill.track === 'reps' ? 'reps' : 'makes'}`;
}
