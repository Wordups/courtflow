const STORAGE_KEY = 'courtflow_admin_v1';
const DEV_HEADERS = [
  'Identity',
  'Defensive concept',
  'Offensive priorities',
  'Skill development',
  'Conditioning',
  'Culture and accountability',
];

const PROGRAM_META = {
  basketball: { code: 'BB', color: '#f97316' },
  football: { code: 'FB', color: '#38d9e6' },
  baseball: { code: 'BS', color: '#37c978' },
  softball: { code: 'SB', color: '#e7b93e' },
  soccer: { code: 'SC', color: '#9b8cff' },
};

const VIEW_META = {
  overview: { eyebrow: 'PROGRAM CONTROL', title: 'Overview', action: 'Add athlete', actionType: 'player' },
  programs: { eyebrow: 'ORGANIZATION MAP', title: 'Programs', action: 'Add team', actionType: 'team' },
  roster: { eyebrow: 'TEAM OPERATIONS', title: 'Rosters', action: 'Add athlete', actionType: 'player' },
  games: { eyebrow: 'COMPETITION', title: 'Games', action: 'Add game', actionType: 'game' },
  uploads: { eyebrow: 'INGEST', title: 'Box Score Inbox', action: 'Upload image', actionType: 'upload' },
  development: { eyebrow: 'DEVELOPMENT SYSTEM', title: 'Team Development', action: 'Save plan', actionType: 'save-development' },
  settings: { eyebrow: 'WORKSPACE', title: 'Settings', action: 'Save settings', actionType: 'save-settings' },
};

function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function seedState() {
  return {
    version: 1,
    organization: {
      id: 'org_milford_mill',
      name: 'Milford Mill High School',
      shortName: 'MMHS',
      location: 'Baltimore County, Maryland',
    },
    season: { id: 'season_2026_27', label: '2026-27' },
    programs: [
      { id: 'basketball', name: 'Basketball', code: 'BB', color: '#f97316' },
      { id: 'football', name: 'Football', code: 'FB', color: '#38d9e6' },
      { id: 'baseball', name: 'Baseball', code: 'BS', color: '#37c978' },
      { id: 'softball', name: 'Softball', code: 'SB', color: '#e7b93e' },
      { id: 'soccer', name: 'Soccer', code: 'SC', color: '#9b8cff' },
    ],
    teams: [
      { id: 'bb_vg', programId: 'basketball', name: 'Varsity Girls', code: 'VG', level: 'Varsity', gender: 'Girls' },
      { id: 'bb_jvg', programId: 'basketball', name: 'JV Girls', code: 'JVG', level: 'JV', gender: 'Girls' },
      { id: 'bb_vb', programId: 'basketball', name: 'Varsity Boys', code: 'VB', level: 'Varsity', gender: 'Boys' },
      { id: 'bb_jvb', programId: 'basketball', name: 'JV Boys', code: 'JVB', level: 'JV', gender: 'Boys' },
      { id: 'fb_v', programId: 'football', name: 'Varsity', code: 'V', level: 'Varsity', gender: 'Open' },
      { id: 'fb_jv', programId: 'football', name: 'JV', code: 'JV', level: 'JV', gender: 'Open' },
      { id: 'bs_v', programId: 'baseball', name: 'Varsity', code: 'V', level: 'Varsity', gender: 'Boys' },
      { id: 'bs_jv', programId: 'baseball', name: 'JV', code: 'JV', level: 'JV', gender: 'Boys' },
      { id: 'sb_v', programId: 'softball', name: 'Varsity', code: 'V', level: 'Varsity', gender: 'Girls' },
      { id: 'sb_jv', programId: 'softball', name: 'JV', code: 'JV', level: 'JV', gender: 'Girls' },
      { id: 'sc_vg', programId: 'soccer', name: 'Varsity Girls', code: 'VG', level: 'Varsity', gender: 'Girls' },
      { id: 'sc_jvg', programId: 'soccer', name: 'JV Girls', code: 'JVG', level: 'JV', gender: 'Girls' },
      { id: 'sc_vb', programId: 'soccer', name: 'Varsity Boys', code: 'VB', level: 'Varsity', gender: 'Boys' },
      { id: 'sc_jvb', programId: 'soccer', name: 'JV Boys', code: 'JVB', level: 'JV', gender: 'Boys' },
    ],
    players: [
      { id: 'p_marcus', teamId: 'bb_vb', number: 3, name: 'Marcus Johnson', position: 'Point Guard', grade: '11', status: 'Active', demo: true },
      { id: 'p_aaliyah', teamId: 'bb_vg', number: 12, name: 'Aaliyah Carter', position: 'Shooting Guard', grade: '10', status: 'Active', demo: true },
      { id: 'p_brianna', teamId: 'bb_vg', number: 2, name: 'Brianna Scott', position: 'Point Guard', grade: '10', status: 'Active', demo: true },
      { id: 'p_jaylen', teamId: 'fb_v', number: 11, name: 'Jaylen Brooks', position: 'Wide Receiver', grade: '12', status: 'Active', demo: true },
      { id: 'p_xavier', teamId: 'fb_v', number: 7, name: 'Xavier Powell', position: 'Quarterback', grade: '11', status: 'Active', demo: true },
      { id: 'p_devon', teamId: 'bs_v', number: 18, name: 'Devon Williams', position: 'Shortstop', grade: '12', status: 'Active', demo: true },
      { id: 'p_destiny', teamId: 'sb_v', number: 6, name: 'Destiny Miles', position: 'Center Field', grade: '10', status: 'Active', demo: true },
    ],
    games: [
      { id: 'g_1', teamId: 'bb_vg', date: '2026-01-08', opponent: 'North County', usScore: 58, themScore: 44, tournament: '', source: 'Manual' },
      { id: 'g_2', teamId: 'bb_vb', date: '2026-01-10', opponent: 'Franklin', usScore: 67, themScore: 71, tournament: '', source: 'Manual' },
      { id: 'g_3', teamId: 'fb_v', date: '2026-09-04', opponent: 'Owings Mills', usScore: 28, themScore: 14, tournament: '', source: 'Manual' },
    ],
    uploads: [],
    development: {},
    activity: [
      { id: 'a_1', type: 'setup', text: 'Program map created', detail: '5 sports and 14 teams', at: new Date().toISOString() },
      { id: 'a_2', type: 'roster', text: 'Sample roster loaded', detail: 'Replace demo athletes as you work', at: new Date().toISOString() },
    ],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.programs) || !Array.isArray(parsed.teams)) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

let data = loadState();
let ui = {
  view: 'overview',
  selectedTeamId: data.teams[0]?.id || null,
};

const el = {
  view: document.getElementById('view'),
  pageEyebrow: document.getElementById('pageEyebrow'),
  pageTitle: document.getElementById('pageTitle'),
  teamSelect: document.getElementById('globalTeamSelect'),
  primaryAction: document.getElementById('primaryActionBtn'),
  sidebarOrg: document.getElementById('sidebarOrgName'),
  sidebarSeason: document.getElementById('sidebarSeason'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalTitle: document.getElementById('modalTitle'),
  modalEyebrow: document.getElementById('modalEyebrow'),
  modalForm: document.getElementById('modalForm'),
  toast: document.getElementById('toast'),
  jsonImport: document.getElementById('jsonImportInput'),
  boxscoreInput: document.getElementById('boxscoreInput'),
};

function e(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => el.toast.classList.remove('show'), 2400);
}

function teamById(id) {
  return data.teams.find(team => team.id === id) || null;
}

function programById(id) {
  return data.programs.find(program => program.id === id) || null;
}

function selectedTeam() {
  return teamById(ui.selectedTeamId) || data.teams[0] || null;
}

function programForTeam(team) {
  return team ? programById(team.programId) : null;
}

function teamLabel(team) {
  const program = programForTeam(team);
  return `${program?.name || 'Program'} · ${team.name}`;
}

function formatDate(value) {
  if (!value) return 'Date TBD';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function recordForTeam(teamId) {
  const games = data.games.filter(game => game.teamId === teamId);
  let wins = 0;
  let losses = 0;
  let ties = 0;
  games.forEach(game => {
    if (Number(game.usScore) > Number(game.themScore)) wins += 1;
    else if (Number(game.usScore) < Number(game.themScore)) losses += 1;
    else ties += 1;
  });
  return `${wins}-${losses}${ties ? `-${ties}` : ''}`;
}

function addActivity(type, text, detail) {
  data.activity.unshift({ id: uid('activity'), type, text, detail, at: new Date().toISOString() });
  data.activity = data.activity.slice(0, 20);
}

function renderTeamSelect() {
  el.teamSelect.innerHTML = data.programs.map(program => {
    const options = data.teams
      .filter(team => team.programId === program.id)
      .map(team => `<option value="${e(team.id)}" ${team.id === ui.selectedTeamId ? 'selected' : ''}>${e(team.name)}</option>`)
      .join('');
    return `<optgroup label="${e(program.name)}">${options}</optgroup>`;
  }).join('');
}

function syncShell() {
  const meta = VIEW_META[ui.view];
  el.pageEyebrow.textContent = meta.eyebrow;
  el.pageTitle.textContent = meta.title;
  el.primaryAction.dataset.action = meta.actionType;
  el.primaryAction.innerHTML = `<span>${meta.actionType.startsWith('save') ? '✓' : meta.actionType === 'upload' ? '⇧' : '＋'}</span>${e(meta.action)}`;
  el.sidebarOrg.textContent = data.organization.name;
  el.sidebarSeason.textContent = `${data.season.label} season`;
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.view === ui.view));
  renderTeamSelect();
}

function sectionHeader(kicker, title, actions = '') {
  return `<div class="section-head"><div><span class="eyebrow">${e(kicker)}</span><h2>${e(title)}</h2></div><div class="section-actions">${actions}</div></div>`;
}

function renderProgramMap() {
  return `<div class="program-map">${data.programs.map(program => {
    const teams = data.teams.filter(team => team.programId === program.id);
    const athletes = data.players.filter(player => teams.some(team => team.id === player.teamId)).length;
    return `<article class="program-row">
      <div class="program-identity">
        <span class="sport-swatch" style="border-color:${e(program.color)};color:${e(program.color)}">${e(program.code)}</span>
        <div><strong>${e(program.name)}</strong><span>${teams.length} teams · ${athletes} athletes</span></div>
      </div>
      <div class="team-lane">${teams.map(team => {
        const playerCount = data.players.filter(player => player.teamId === team.id).length;
        return `<button class="team-chip ${team.id === ui.selectedTeamId ? 'active' : ''}" data-open-team="${e(team.id)}">
          <span class="team-name">${e(team.name)}</span>
          <span class="team-meta">${playerCount} athletes · ${e(recordForTeam(team.id))}</span>
        </button>`;
      }).join('')}</div>
      <div class="program-count">${athletes}<br>ATHLETES</div>
    </article>`;
  }).join('')}</div>`;
}

function renderOverview() {
  const recentGames = [...data.games].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
  const pendingUploads = data.uploads.filter(upload => upload.status !== 'confirmed').length;
  return `<div class="view-stack">
    <section class="metric-grid" aria-label="Program totals">
      <div class="metric"><span class="eyebrow">SPORT PROGRAMS</span><strong>${data.programs.length}</strong><small>Across one organization</small></div>
      <div class="metric"><span class="eyebrow">ACTIVE TEAMS</span><strong>${data.teams.length}</strong><small>${data.season.label} season map</small></div>
      <div class="metric"><span class="eyebrow">ATHLETES</span><strong>${data.players.length}</strong><small>Current local roster</small></div>
      <div class="metric"><span class="eyebrow">INBOX</span><strong>${pendingUploads}</strong><small>Box scores awaiting review</small></div>
    </section>

    <section class="section">
      ${sectionHeader('ORGANIZATION MAP', `${data.organization.name} athletics`, '<button class="text-button" data-view-link="programs">Manage programs →</button>')}
      ${renderProgramMap()}
    </section>

    <div class="split-grid">
      <section class="section">
        ${sectionHeader('RECENT RESULTS', 'Games across the program', '<button class="text-button" data-view-link="games">View games →</button>')}
        <div class="data-panel"><div class="table-wrap"><table>
          <thead><tr><th>DATE</th><th>TEAM</th><th>OPPONENT</th><th>RESULT</th></tr></thead>
          <tbody>${recentGames.length ? recentGames.map(game => {
            const team = teamById(game.teamId);
            const won = Number(game.usScore) > Number(game.themScore);
            const tied = Number(game.usScore) === Number(game.themScore);
            return `<tr><td>${e(formatDate(game.date))}</td><td>${e(teamLabel(team))}</td><td>${e(game.opponent)}</td><td><span class="badge ${tied ? 'warn' : won ? 'good' : 'loss'}">${tied ? 'T' : won ? 'W' : 'L'} ${e(game.usScore)}-${e(game.themScore)}</span></td></tr>`;
          }).join('') : '<tr><td colspan="4">No games entered yet.</td></tr>'}</tbody>
        </table></div></div>
      </section>

      <section class="section">
        ${sectionHeader('WORKSPACE', 'Build status')}
        <div class="data-panel"><ul class="setup-list">
          <li class="setup-item"><span class="setup-step">01</span><div><strong>Program map</strong><span>Ready and editable locally</span></div><span class="badge good">READY</span></li>
          <li class="setup-item"><span class="setup-step">02</span><div><strong>Supabase sync</strong><span>Multi-tenant schema pending</span></div><span class="badge warn">NEXT</span></li>
          <li class="setup-item"><span class="setup-step">03</span><div><strong>Box-score parser</strong><span>Backend scaffold available</span></div><span class="badge warn">GATED</span></li>
          <li class="setup-item"><span class="setup-step">04</span><div><strong>CourtFlow mobile</strong><span>Separate coach-facing app</span></div><span class="badge">LINK LATER</span></li>
        </ul></div>
      </section>
    </div>
  </div>`;
}

function renderPrograms() {
  return `<div class="view-stack">
    <section class="section">
      ${sectionHeader('SCHOOL → SPORT → TEAM', 'Program map', '<button class="secondary-button" data-action="team">＋ Add team</button>')}
      ${renderProgramMap()}
    </section>
    <section class="section">
      ${sectionHeader('MODEL', 'How this workspace scales')}
      <div class="data-panel"><div class="empty-state"><div><strong>${e(data.organization.name)} is the organization.</strong><p>Every sport is a program. Varsity, JV, gender, and age-level groups are teams. Rosters and games belong to a team in the ${e(data.season.label)} season.</p></div></div></div>
    </section>
  </div>`;
}

function renderRoster() {
  const team = selectedTeam();
  if (!team) return '<div class="empty-state"><div><strong>No team selected.</strong></div></div>';
  const program = programForTeam(team);
  const players = data.players.filter(player => player.teamId === team.id).sort((a, b) => Number(a.number) - Number(b.number));
  return `<div class="view-stack">
    <section class="section">
      ${sectionHeader(program?.name || 'PROGRAM', team.name, `<span class="badge">${players.length} ATHLETES</span><button class="secondary-button" data-action="player">＋ Add athlete</button>`)}
      <div class="data-panel"><div class="table-wrap"><table>
        <thead><tr><th>#</th><th>ATHLETE</th><th>POSITION</th><th>GRADE</th><th>STATUS</th><th></th></tr></thead>
        <tbody>${players.length ? players.map(player => `<tr>
          <td class="number-cell">${e(player.number || '—')}</td>
          <td><strong>${e(player.name)}</strong>${player.demo ? ' <span class="badge">SAMPLE</span>' : ''}</td>
          <td>${e(player.position || '—')}</td><td>${e(player.grade || '—')}</td>
          <td><span class="badge good">${e(player.status || 'Active')}</span></td>
          <td><button class="text-button" data-delete-player="${e(player.id)}">Remove</button></td>
        </tr>`).join('') : '<tr><td colspan="6">No athletes on this roster yet.</td></tr>'}</tbody>
      </table></div></div>
    </section>
  </div>`;
}

function renderGames() {
  const team = selectedTeam();
  const games = data.games.filter(game => game.teamId === team?.id).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return `<div class="view-stack">
    <section class="section">
      ${sectionHeader('SEASON RESULTS', team ? teamLabel(team) : 'No team selected', `<span class="badge">RECORD ${team ? e(recordForTeam(team.id)) : '0-0'}</span><button class="secondary-button" data-action="game">＋ Add game</button>`)}
      <div class="data-panel"><div class="table-wrap"><table>
        <thead><tr><th>DATE</th><th>OPPONENT</th><th>SCORE</th><th>RESULT</th><th>EVENT</th><th>SOURCE</th><th></th></tr></thead>
        <tbody>${games.length ? games.map(game => {
          const won = Number(game.usScore) > Number(game.themScore);
          const tied = Number(game.usScore) === Number(game.themScore);
          return `<tr><td>${e(formatDate(game.date))}</td><td><strong>${e(game.opponent)}</strong></td><td>${e(game.usScore)}-${e(game.themScore)}</td><td><span class="badge ${tied ? 'warn' : won ? 'good' : 'loss'}">${tied ? 'T' : won ? 'W' : 'L'}</span></td><td>${e(game.tournament || 'Regular season')}</td><td>${e(game.source || 'Manual')}</td><td><button class="text-button" data-delete-game="${e(game.id)}">Remove</button></td></tr>`;
        }).join('') : '<tr><td colspan="7">No games entered for this team.</td></tr>'}</tbody>
      </table></div></div>
    </section>
  </div>`;
}

function renderUploads() {
  const uploads = [...data.uploads].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return `<div class="view-stack">
    <section class="section">
      ${sectionHeader('LOCAL INBOX', 'Box-score images')}
      <div class="drop-zone" id="dropZone">
        <div><strong>Drop box-score images here</strong><p>PNG, JPG, or WebP. Files are recorded as local drafts until the parser backend is connected.</p><button class="primary-button" type="button" data-action="upload">Choose images</button></div>
      </div>
    </section>
    <section class="section">
      ${sectionHeader('REVIEW QUEUE', `${uploads.length} local drafts`)}
      <div class="data-panel">${uploads.length ? `<ul class="upload-list">${uploads.map(upload => `<li class="upload-item"><span class="activity-icon">IMG</span><div><strong>${e(upload.fileName)}</strong><span>${e(teamLabel(teamById(upload.teamId)))} · ${e(upload.sizeLabel)}</span></div><div><span class="badge warn">LOCAL DRAFT</span> <button class="text-button" data-delete-upload="${e(upload.id)}">Remove</button></div></li>`).join('')}</ul>` : '<div class="empty-state"><div><strong>Inbox is clear.</strong><p>Add an image when you have a box score ready to review. No file leaves this browser in local mode.</p></div></div>'}</div>
    </section>
  </div>`;
}

function renderDevelopment() {
  const team = selectedTeam();
  if (!team) return '<div class="empty-state"><div><strong>No team selected.</strong></div></div>';
  const values = data.development[team.id] || {};
  return `<div class="view-stack">
    <section class="section">
      ${sectionHeader('TEAM PLAN', teamLabel(team), '<button class="secondary-button" data-save-development>✓ Save plan</button>')}
      <div class="dev-grid">${DEV_HEADERS.map(header => `<div class="dev-item"><label for="dev_${e(header.replaceAll(' ', '_'))}">${e(header)}</label><textarea id="dev_${e(header.replaceAll(' ', '_'))}" data-dev-key="${e(header)}" placeholder="Define what good looks like for this team...">${e(values[header] || '')}</textarea></div>`).join('')}</div>
    </section>
  </div>`;
}

function renderSettings() {
  return `<div class="view-stack">
    <section class="settings-band">
      <h3>Organization details</h3><p>This labels the local workspace. Authentication and tenant membership arrive with Supabase.</p>
      <div class="form-grid">
        <div class="field"><label for="settingsOrgName">ORGANIZATION NAME</label><input id="settingsOrgName" value="${e(data.organization.name)}"></div>
        <div class="field"><label for="settingsShortName">SHORT NAME</label><input id="settingsShortName" value="${e(data.organization.shortName)}"></div>
        <div class="field"><label for="settingsLocation">LOCATION</label><input id="settingsLocation" value="${e(data.organization.location)}"></div>
        <div class="field"><label for="settingsSeason">SEASON</label><input id="settingsSeason" value="${e(data.season.label)}"></div>
      </div>
    </section>
    <section class="settings-band">
      <h3>Workspace data</h3><p>Export before switching browsers or clearing site data. Imports replace the current local workspace.</p>
      <div class="settings-actions"><button class="secondary-button" id="settingsExportBtn">↓ Export JSON</button><button class="secondary-button" id="settingsImportBtn">⇧ Import JSON</button><button class="danger-button" id="settingsResetBtn">Reset sample workspace</button></div>
    </section>
    <section class="settings-band">
      <h3>Backend status</h3><p>The Supabase project, authentication, multi-tenant schema, and parser API are intentionally not connected yet.</p>
      <div class="settings-actions"><span class="badge good">LOCAL MODE ACTIVE</span><span class="badge warn">CLOUD SYNC PENDING</span><span class="badge warn">PARSER PENDING</span></div>
    </section>
  </div>`;
}

function render() {
  syncShell();
  const views = {
    overview: renderOverview,
    programs: renderPrograms,
    roster: renderRoster,
    games: renderGames,
    uploads: renderUploads,
    development: renderDevelopment,
    settings: renderSettings,
  };
  el.view.innerHTML = (views[ui.view] || renderOverview)();
  wireViewEvents();
}

function setView(view) {
  if (!VIEW_META[view]) return;
  ui.view = view;
  render();
  el.view.focus({ preventScroll: true });
}

function modalTeamOptions(selected = ui.selectedTeamId) {
  return data.programs.map(program => `<optgroup label="${e(program.name)}">${data.teams.filter(team => team.programId === program.id).map(team => `<option value="${e(team.id)}" ${team.id === selected ? 'selected' : ''}>${e(team.name)}</option>`).join('')}</optgroup>`).join('');
}

function openModal(type) {
  const forms = {
    player: {
      eyebrow: 'ROSTER', title: 'Add athlete', html: `<div class="form-grid">
        <div class="field full"><label>TEAM</label><select name="teamId" required>${modalTeamOptions()}</select></div>
        <div class="field full"><label>FULL NAME</label><input name="name" required autocomplete="off" placeholder="Athlete name"></div>
        <div class="field"><label>JERSEY NUMBER</label><input name="number" type="number" min="0" max="99" placeholder="12"></div>
        <div class="field"><label>GRADE</label><input name="grade" placeholder="10"></div>
        <div class="field full"><label>POSITION</label><input name="position" placeholder="Position or role"></div>
        <div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">Add athlete</button></div>
      </div>`, submit: submitPlayer,
    },
    game: {
      eyebrow: 'COMPETITION', title: 'Add game', html: `<div class="form-grid">
        <div class="field full"><label>TEAM</label><select name="teamId" required>${modalTeamOptions()}</select></div>
        <div class="field"><label>DATE</label><input name="date" type="date" required></div>
        <div class="field"><label>OPPONENT</label><input name="opponent" required placeholder="Opponent"></div>
        <div class="field"><label>OUR SCORE</label><input name="usScore" type="number" min="0" required></div>
        <div class="field"><label>THEIR SCORE</label><input name="themScore" type="number" min="0" required></div>
        <div class="field full"><label>EVENT / TOURNAMENT</label><input name="tournament" placeholder="Optional"></div>
        <div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">Save game</button></div>
      </div>`, submit: submitGame,
    },
    team: {
      eyebrow: 'PROGRAM MAP', title: 'Add team', html: `<div class="form-grid">
        <div class="field full"><label>SPORT PROGRAM</label><select name="programId" required>${data.programs.map(program => `<option value="${e(program.id)}">${e(program.name)}</option>`).join('')}</select></div>
        <div class="field"><label>TEAM NAME</label><input name="name" required placeholder="Varsity Girls"></div>
        <div class="field"><label>SHORT CODE</label><input name="code" required maxlength="6" placeholder="VG"></div>
        <div class="field"><label>LEVEL</label><select name="level"><option>Varsity</option><option>JV</option><option>Freshman</option><option>Middle School</option><option>Club</option></select></div>
        <div class="field"><label>GROUP</label><select name="gender"><option>Girls</option><option>Boys</option><option>Open</option></select></div>
        <div class="modal-actions"><button type="button" class="secondary-button" data-close-modal>Cancel</button><button class="primary-button" type="submit">Add team</button></div>
      </div>`, submit: submitTeam,
    },
  };
  const form = forms[type];
  if (!form) return;
  el.modalEyebrow.textContent = form.eyebrow;
  el.modalTitle.textContent = form.title;
  el.modalForm.innerHTML = form.html;
  el.modalForm.onsubmit = event => {
    event.preventDefault();
    form.submit(new FormData(el.modalForm));
  };
  el.modalBackdrop.hidden = false;
  el.modalForm.querySelector('input,select')?.focus();
}

function closeModal() {
  el.modalBackdrop.hidden = true;
  el.modalForm.innerHTML = '';
  el.modalForm.onsubmit = null;
}

function submitPlayer(form) {
  const player = {
    id: uid('player'), teamId: String(form.get('teamId')), name: String(form.get('name')).trim(),
    number: String(form.get('number')).trim(), grade: String(form.get('grade')).trim(),
    position: String(form.get('position')).trim(), status: 'Active', demo: false,
  };
  if (!player.name || !teamById(player.teamId)) return;
  data.players.push(player);
  ui.selectedTeamId = player.teamId;
  addActivity('roster', `${player.name} added`, teamLabel(teamById(player.teamId)));
  save(); closeModal(); setView('roster'); showToast('Athlete added to roster.');
}

function submitGame(form) {
  const game = {
    id: uid('game'), teamId: String(form.get('teamId')), date: String(form.get('date')),
    opponent: String(form.get('opponent')).trim(), usScore: Number(form.get('usScore')),
    themScore: Number(form.get('themScore')), tournament: String(form.get('tournament')).trim(), source: 'Manual',
  };
  if (!game.opponent || !teamById(game.teamId)) return;
  data.games.push(game);
  ui.selectedTeamId = game.teamId;
  addActivity('game', `Game vs ${game.opponent} entered`, `${game.usScore}-${game.themScore}`);
  save(); closeModal(); setView('games'); showToast('Game saved.');
}

function submitTeam(form) {
  const programId = String(form.get('programId'));
  const team = {
    id: uid('team'), programId, name: String(form.get('name')).trim(), code: String(form.get('code')).trim().toUpperCase(),
    level: String(form.get('level')), gender: String(form.get('gender')),
  };
  if (!team.name || !programById(programId)) return;
  data.teams.push(team);
  ui.selectedTeamId = team.id;
  addActivity('team', `${team.name} created`, programById(programId).name);
  save(); closeModal(); setView('programs'); showToast('Team added to program map.');
}

function saveDevelopment() {
  const team = selectedTeam();
  if (!team) return;
  data.development[team.id] = {};
  document.querySelectorAll('[data-dev-key]').forEach(area => { data.development[team.id][area.dataset.devKey] = area.value.trim(); });
  addActivity('development', `${team.name} development plan updated`, programForTeam(team)?.name || 'Program');
  save(); showToast('Development plan saved locally.');
}

function saveSettings() {
  const name = document.getElementById('settingsOrgName')?.value.trim();
  const shortName = document.getElementById('settingsShortName')?.value.trim();
  const location = document.getElementById('settingsLocation')?.value.trim();
  const season = document.getElementById('settingsSeason')?.value.trim();
  if (name) data.organization.name = name;
  if (shortName) data.organization.shortName = shortName;
  if (location) data.organization.location = location;
  if (season) data.season.label = season;
  save(); render(); showToast('Workspace settings saved.');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function queueFiles(files) {
  const team = selectedTeam();
  [...files].filter(file => /^image\/(png|jpeg|webp)$/.test(file.type)).forEach(file => {
    data.uploads.push({ id: uid('upload'), teamId: team?.id || null, fileName: file.name, fileType: file.type, size: file.size, sizeLabel: formatBytes(file.size), status: 'local_draft', createdAt: new Date().toISOString() });
    addActivity('upload', file.name, `Queued for ${team ? teamLabel(team) : 'review'}`);
  });
  save(); render(); showToast('Box-score draft added. File remains local.');
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `courtflow-${data.organization.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Workspace exported.');
}

async function importData(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed.organization || !Array.isArray(parsed.programs) || !Array.isArray(parsed.teams) || !Array.isArray(parsed.players)) throw new Error('Invalid CourtFlow export');
    data = parsed;
    ui.selectedTeamId = data.teams[0]?.id || null;
    save(); render(); showToast('Workspace imported.');
  } catch (error) {
    showToast(error.message || 'Import failed.');
  } finally {
    el.jsonImport.value = '';
  }
}

function deleteRecord(kind, id) {
  const labels = { player: 'athlete', game: 'game', upload: 'upload draft' };
  if (!window.confirm(`Remove this ${labels[kind]}?`)) return;
  if (kind === 'player') data.players = data.players.filter(item => item.id !== id);
  if (kind === 'game') data.games = data.games.filter(item => item.id !== id);
  if (kind === 'upload') data.uploads = data.uploads.filter(item => item.id !== id);
  save(); render(); showToast(`${labels[kind]} removed.`);
}

function handleAction(action) {
  if (['player', 'game', 'team'].includes(action)) openModal(action);
  if (action === 'upload') el.boxscoreInput.click();
  if (action === 'save-development') saveDevelopment();
  if (action === 'save-settings') saveSettings();
}

function wireViewEvents() {
  el.view.querySelectorAll('[data-view-link]').forEach(button => button.addEventListener('click', () => setView(button.dataset.viewLink)));
  el.view.querySelectorAll('[data-open-team]').forEach(button => button.addEventListener('click', () => {
    ui.selectedTeamId = button.dataset.openTeam;
    setView('roster');
  }));
  el.view.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action)));
  el.view.querySelectorAll('[data-delete-player]').forEach(button => button.addEventListener('click', () => deleteRecord('player', button.dataset.deletePlayer)));
  el.view.querySelectorAll('[data-delete-game]').forEach(button => button.addEventListener('click', () => deleteRecord('game', button.dataset.deleteGame)));
  el.view.querySelectorAll('[data-delete-upload]').forEach(button => button.addEventListener('click', () => deleteRecord('upload', button.dataset.deleteUpload)));
  el.view.querySelector('[data-save-development]')?.addEventListener('click', saveDevelopment);
  document.getElementById('settingsExportBtn')?.addEventListener('click', exportData);
  document.getElementById('settingsImportBtn')?.addEventListener('click', () => el.jsonImport.click());
  document.getElementById('settingsResetBtn')?.addEventListener('click', () => {
    if (!window.confirm('Reset this browser to the original Miller sample workspace?')) return;
    data = seedState(); ui.selectedTeamId = data.teams[0]?.id || null; save(); render(); showToast('Sample workspace restored.');
  });
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.add('dragging'); }));
    ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
    dropZone.addEventListener('drop', event => queueFiles(event.dataTransfer.files));
  }
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
el.teamSelect.addEventListener('change', () => { ui.selectedTeamId = el.teamSelect.value; render(); });
el.primaryAction.addEventListener('click', () => handleAction(el.primaryAction.dataset.action));
document.getElementById('exportQuickBtn').addEventListener('click', exportData);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
el.modalBackdrop.addEventListener('click', event => { if (event.target === el.modalBackdrop) closeModal(); });
document.addEventListener('click', event => { if (event.target.closest('[data-close-modal]')) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !el.modalBackdrop.hidden) closeModal(); });
el.jsonImport.addEventListener('change', () => { if (el.jsonImport.files[0]) importData(el.jsonImport.files[0]); });
el.boxscoreInput.addEventListener('change', () => { if (el.boxscoreInput.files.length) queueFiles(el.boxscoreInput.files); el.boxscoreInput.value = ''; });

save();
render();
