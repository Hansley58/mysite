const TN = {
  API_KEY: "s45f4ds5fgrtr4hytutyt45y4t54yty",
  ENDPOINT: "https://24h.webcup.fr/wp-json/webcup/v1/requests",
  INTERVAL: 30000,
  timer: null,
  refreshTimer: null,
  requests: [],
  session: {},
  knownCodes: new Set(),
  stats: { calls: 0, success: 0, lastCall: null, nextCall: null },
  charts: {},
  currentFilter: 'all',
  searchQuery: '',
};

/* ---------- API ---------- */
async function fetchRequests() {
  TN.stats.calls++;
  const url = `${TN.ENDPOINT}?api_key=${encodeURIComponent(TN.API_KEY)}`;
  try {
    const res = await fetch(url, { headers: { "X-Webcup-Api-Key": TN.API_KEY } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    TN.stats.success++;
    TN.stats.lastCall = new Date();
    TN.requests = data.requests || [];
    TN.session = data.session || {};
    updateApiStatus(true);
    renderAll();
  } catch (err) {
    console.error("Terra Nova API error:", err);
    updateApiStatus(false, err.message);
  }
}

function updateApiStatus(ok, msg) {
  const dot = document.querySelector('#apiStatusPill .api-dot');
  const txt = document.getElementById('apiStatusText');
  if (!dot || !txt) return;
  if (ok) {
    dot.classList.remove('offline');
    txt.textContent = `API connectée · ${TN.requests.length} demandes`;
  } else {
    dot.classList.add('offline');
    txt.textContent = `Erreur API${msg ? ' · ' + msg : ''}`;
  }
  document.getElementById('setStatus').textContent = ok ? 'Connectée' : 'Erreur';
  document.getElementById('setStatus').className = ok ? 'bst son' : 'bst sid';
  document.getElementById('setSuccess').textContent = TN.stats.success;
  if (TN.stats.lastCall) {
    document.getElementById('setLastCall').textContent =
      TN.stats.lastCall.toLocaleTimeString('fr-FR');
  }
}

function startPolling() {
  if (TN.timer) clearInterval(TN.timer);
  fetchRequests();
  TN.timer = setInterval(fetchRequests, TN.INTERVAL);
  updateNextCall();
}

function updateNextCall() {
  if (TN.refreshTimer) clearInterval(TN.refreshTimer);
  TN.refreshTimer = setInterval(() => {
    const next = new Date(Date.now() + TN.INTERVAL);
    const el = document.getElementById('setNextCall');
    if (el) el.textContent = next.toLocaleTimeString('fr-FR');
  }, 1000);
}

function refreshNow() {
  const icon = document.getElementById('refreshIcon');
  if (icon) icon.classList.add('fa-spin');
  fetchRequests().finally(() => {
    setTimeout(() => icon && icon.classList.remove('fa-spin'), 600);
  });
}

function saveApiSettings() {
  const key = document.getElementById('apiKeyInput').value.trim();
  const endpoint = document.getElementById('apiEndpoint').value.trim();
  const interval = parseInt(document.getElementById('apiInterval').value, 10);
  if (key) TN.API_KEY = key;
  if (endpoint) TN.ENDPOINT = endpoint;
  if (interval >= 10) TN.INTERVAL = interval * 1000;
  startPolling();
  alert('Paramètres enregistrés. Nouvelle synchronisation en cours.');
}

/* ---------- Helpers ---------- */
function formatDuration(minutes) {
  if (minutes == null || isNaN(minutes)) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h === 0) return `${m} min`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

function diffLabel(level) {
  return { 1: 'Facile', 2: 'Moyenne', 3: 'Difficile', 4: 'Expert' }[level] || '—';
}

function diffColor(level) {
  return { 1: '#34d399', 2: '#60a5fa', 3: '#fbbf24', 4: '#f87171' }[level] || '#a78bfa';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function truncate(str, n = 60) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

/* ---------- Renderers ---------- */
function renderAll() {
  renderSession();
  renderRequestsPreview();
  renderOverview();
  renderRequestsGrid();
  renderWaves();
  renderAnalytics();
  renderCitizens();
  renderCouncil();
}

function renderSession() {
  const s = TN.session || {};
  const txt = document.getElementById('heroSessionText');
  if (txt) {
    if (s.status === 'none' || !s.is_running) {
      txt.textContent = "Session non active — en attente du lancement";
    } else {
      txt.textContent = `Session ${s.status} · Vague ${s.current_wave} · ${s.visible_requests_count} demandes`;
    }
  }
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('hStatVisible', s.visible_requests_count ?? '—');
  set('hStatWave', s.current_wave ?? '—');
  set('hStatNext', s.next_wave_number || '—');
  set('hStatElapsed', s.elapsed_minutes != null ? formatDuration(s.elapsed_minutes) : '—');

  set('ovVisible', s.visible_requests_count ?? '—');
  set('ovWaveNum', s.current_wave ?? '—');
  set('ovElapsed', s.elapsed_minutes != null ? formatDuration(s.elapsed_minutes) : '—');
  set('ovInitial', s.initial_requests_count ?? '—');
  set('ovWaveReq', s.wave_requests_count ?? '—');
  set('ovNextWaveNum', s.next_wave_number || '0');
  set('ovNextWaveLabel', s.next_wave_number || '—');
  set('ovNextWaveMin',
    s.minutes_until_next_wave
      ? `dans ${formatDuration(s.minutes_until_next_wave)}`
      : 'Aucune vague planifiée'
  );

  set('proofRequests', s.visible_requests_count ?? '—');
  set('proofWave', s.current_wave ?? '—');
  set('proofElapsed', s.elapsed_minutes != null ? formatDuration(s.elapsed_minutes) : '—');

  const totalXP = TN.requests.reduce((a, r) => a + (r.xp_available || 0), 0);
  set('proofXP', totalXP.toLocaleString('fr-FR'));
  set('ovXP', totalXP.toLocaleString('fr-FR'));
  set('ovTotalXP', totalXP.toLocaleString('fr-FR'));

  const badge = document.getElementById('navReqBadge');
  if (badge) badge.textContent = TN.requests.length;

  const ovWave = document.getElementById('ovWave');
  if (ovWave) ovWave.textContent = `Vague ${s.current_wave ?? 0}`;
  const ovStatus = document.getElementById('ovStatus');
  if (ovStatus) {
    ovStatus.className = s.is_running ? 'bst son' : 'bst sid';
    ovStatus.innerHTML = `<span class="bdot"></span>${s.is_running ? 'Session active' : 'Session inactive'}`;
  }
}

function renderRequestsPreview() {
  const container = document.getElementById('requestsPreview');
  if (!container) return;
  if (!TN.requests.length) {
    container.innerHTML = `<div class="col-12 text-center" style="color:var(--tx3)"><i class="fa-solid fa-inbox me-2"></i>Aucune demande disponible pour le moment.</div>`;
    return;
  }
  // Show first 6
  const preview = TN.requests.slice(0, 6);
  container.innerHTML = preview.map(r => reqCardHTML(r)).join('');
}

function reqCardHTML(r) {
  const diff = r.difficulty_level || 0;
  const xp = r.xp_available ?? r.xp_total ?? 0;
  return `
    <div class="col-md-6 col-lg-4 rv in">
      <div class="req-card" data-diff="${diff}" onclick="openModal('${escapeHtml(r.request_code)}')">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="req-code">${escapeHtml(r.request_code)}</span>
          <span class="diff-tag" data-d="${diff}">${escapeHtml(r.difficulty || diffLabel(diff))}</span>
        </div>
        <div class="req-title">${escapeHtml(truncate(r.message_public, 70))}</div>
        <div class="req-msg">${escapeHtml(truncate(r.message_public, 160))}</div>
        <div class="req-meta">
          <span style="font-size:.78rem;color:var(--tx3)">
            <i class="fa-solid fa-user me-1"></i>${escapeHtml(r.requester_name || 'Citoyen')}
          </span>
          <span class="req-xp"><i class="fa-solid fa-star me-1"></i>${xp}<small>XP</small></span>
        </div>
      </div>
    </div>
  `;
}

function renderOverview() {
  const container = document.getElementById('ovLatestRequests');
  if (!container) return;
  if (!TN.requests.length) {
    container.innerHTML = `<div class="col-12 text-center" style="color:var(--tx3);padding:20px">Aucune demande.</div>`;
    return;
  }
  const latest = TN.requests.slice(-3).reverse();
  container.innerHTML = latest.map(r => `
    <div class="col-md-4">
      <div class="req-card" data-diff="${r.difficulty_level || 0}" onclick="openModal('${escapeHtml(r.request_code)}')">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <span class="req-code">${escapeHtml(r.request_code)}</span>
          <span class="diff-tag" data-d="${r.difficulty_level || 0}">${escapeHtml(r.difficulty || '—')}</span>
        </div>
        <div class="req-title">${escapeHtml(truncate(r.message_public, 60))}</div>
        <div class="req-meta" style="border:none;padding-top:6px;margin-top:6px">
          <span style="font-size:.75rem;color:var(--tx3)">${escapeHtml(r.requester_type || '')}</span>
          <span class="req-xp">${r.xp_available || 0}<small>XP</small></span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderRequestsGrid() {
  const grid = document.getElementById('requestsGrid');
  if (!grid) return;
  let list = TN.requests.slice();
  const f = TN.currentFilter;
  if (f === 'initial') list = list.filter(r => r.is_initial);
  else if (f === 'wave') list = list.filter(r => !r.is_initial);
  else if (['1','2','3','4'].includes(f)) list = list.filter(r => String(r.difficulty_level) === f);
  if (TN.searchQuery) {
    const q = TN.searchQuery.toLowerCase();
    list = list.filter(r =>
      (r.request_code || '').toLowerCase().includes(q) ||
      (r.message_public || '').toLowerCase().includes(q) ||
      (r.requester_name || '').toLowerCase().includes(q)
    );
  }
  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center" style="color:var(--tx3);padding:40px"><i class="fa-solid fa-inbox me-2"></i>Aucune demande ne correspond.</div>`;
    return;
  }
  grid.innerHTML = list.map(r => reqCardHTML(r)).join('');
}

function renderWaves() {
  const tl = document.getElementById('wavesTimeline');
  if (!tl) return;
  const s = TN.session || {};
  const current = s.current_wave ?? 0;
  const next = s.next_wave_number || 0;
  const items = [];
  // Wave 0 = initial
  items.push({
    num: 0,
    label: 'Lancement',
    title: 'Demandes initiales',
    count: s.initial_requests_count ?? 0,
    state: current >= 0 ? 'done' : 'future',
  });
  for (let i = 1; i <= Math.max(current + 1, 3); i++) {
    let state = 'future';
    if (i <= current) state = 'done';
    else if (i === next) state = 'current';
    const reqs = TN.requests.filter(r => r.wave_number === i);
    items.push({
      num: i,
      label: `Vague ${i}`,
      title: `Vague ${i}`,
      count: reqs.length,
      state,
    });
  }
  tl.innerHTML = items.map(it => `
    <div class="tl-item ${it.state}">
      <div class="tl-wave">${it.label}</div>
      <div class="tl-title">${it.title}</div>
      <div class="tl-count">
        ${it.count} demande${it.count > 1 ? 's' : ''}
        ${it.state === 'done' ? '<span class="bst son ms-2">Diffusée</span>' : ''}
        ${it.state === 'current' ? '<span class="bst sbz ms-2">En cours</span>' : ''}
        ${it.state === 'future' ? '<span class="bst sid ms-2">À venir</span>' : ''}
      </div>
    </div>
  `).join('');
}

function renderAnalytics() {
  const total = TN.requests.length;
  const totalXP = TN.requests.reduce((a, r) => a + (r.xp_available || 0), 0);
  const avg = total ? Math.round(totalXP / total) : 0;
  const max = TN.requests.reduce((a, r) => Math.max(a, r.xp_available || 0), 0);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('anTotal', total);
  set('anXP', totalXP.toLocaleString('fr-FR'));
  set('anAvg', avg.toLocaleString('fr-FR'));
  set('anMax', max.toLocaleString('fr-FR'));

  // Difficulty distribution
  const counts = [0, 0, 0, 0];
  TN.requests.forEach(r => {
    const d = (r.difficulty_level || 1) - 1;
    if (d >= 0 && d < 4) counts[d]++;
  });
  renderDiffChart(counts);
  renderXpDiffChart(counts, totalXP);
}

function renderDiffChart(counts) {
  const ctx = document.getElementById('diffChart');
  if (!ctx) return;
  if (TN.charts.diff) TN.charts.diff.destroy();
  TN.charts.diff = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Facile', 'Moyenne', 'Difficile', 'Expert'],
      datasets: [{
        data: counts,
        backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#a8a8c8', padding: 14, font: { size: 12 } } }
      },
      cutout: '65%',
    }
  });
}

function renderXpDiffChart(counts, totalXP) {
  const ctx = document.getElementById('xpDiffChart');
  if (!ctx) return;
  // Sum XP per difficulty
  const xpByDiff = [0, 0, 0, 0];
  TN.requests.forEach(r => {
    const d = (r.difficulty_level || 1) - 1;
    if (d >= 0 && d < 4) xpByDiff[d] += (r.xp_available || 0);
  });
  if (TN.charts.xpDiff) TN.charts.xpDiff.destroy();
  TN.charts.xpDiff = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Facile', 'Moyenne', 'Difficile', 'Expert'],
      datasets: [{
        label: 'XP',
        data: xpByDiff,
        backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171'],
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#6b6b8a' } },
        x: { grid: { display: false }, ticks: { color: '#6b6b8a' } }
      }
    }
  });
}

function renderCitizens() {
  const grid = document.getElementById('citizensGrid');
  if (!grid) return;
  const map = new Map();
  TN.requests.forEach(r => {
    const key = r.requester_name || 'Inconnu';
    if (!map.has(key)) map.set(key, { name: key, type: r.requester_type || 'Citoyen', count: 0, xp: 0 });
    const c = map.get(key);
    c.count++;
    c.xp += (r.xp_available || 0);
  });
  const list = [...map.values()].sort((a, b) => b.count - a.count);
  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center" style="color:var(--tx3);padding:40px">Aucun citoyen pour le moment.</div>`;
    return;
  }
  grid.innerHTML = list.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="citizen-card">
        <div class="citizen-avatar">${escapeHtml(c.name.charAt(0).toUpperCase())}</div>
        <div>
          <div style="font-weight:600;font-size:.9rem">${escapeHtml(c.name)}</div>
          <div class="citizen-type">${escapeHtml(c.type)}</div>
        </div>
        <div class="citizen-count">${c.count} demande${c.count > 1 ? 's' : ''}</div>
      </div>
    </div>
  `).join('');
}

function renderCouncil() {
  const grid = document.getElementById('councilGrid');
  if (!grid) return;
  // Group by requester_type
  const map = new Map();
  TN.requests.forEach(r => {
    const key = r.requester_type || 'Citoyen';
    if (!map.has(key)) map.set(key, { type: key, count: 0, xp: 0 });
    const c = map.get(key);
    c.count++;
    c.xp += (r.xp_available || 0);
  });
  const list = [...map.values()].sort((a, b) => b.count - a.count);
  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center" style="color:var(--tx3);padding:40px">Aucune donnée.</div>`;
    return;
  }
  grid.innerHTML = list.map(c => `
    <div class="col-md-6 col-lg-4">
      <div class="gc p-4">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="ftico" style="margin:0"><i class="fa-solid fa-building-columns"></i></div>
          <div>
            <div style="font-weight:600">${escapeHtml(c.type)}</div>
            <div style="font-size:.75rem;color:var(--tx3)">${c.count} demande${c.count > 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="d-flex justify-content-between" style="font-size:.82rem">
          <span style="color:var(--tx3)">XP total</span>
          <span style="font-weight:700;color:#fbbf24">${c.xp.toLocaleString('fr-FR')} XP</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---------- Modal ---------- */
function openModal(code) {
  const r = TN.requests.find(x => x.request_code === code);
  if (!r) return;
  document.getElementById('mReqCode').textContent = r.request_code;
  document.getElementById('mReqTitle').textContent = truncate(r.message_public, 90);
  document.getElementById('mReqRequester').textContent =
    `${r.requester_name || '—'} (${r.requester_type || '—'})`;
  document.getElementById('mReqMessage').textContent = r.message_public || '—';

  const diff = r.difficulty_level || 0;
  const badges = document.getElementById('mReqBadges');
  badges.innerHTML = `
    <span class="diff-tag" data-d="${diff}">${escapeHtml(r.difficulty || diffLabel(diff))}</span>
    ${r.is_initial
      ? '<span class="bst sbz">Initiale</span>'
      : `<span class="bst son">Vague ${r.wave_number}</span>`}
  `;
  document.getElementById('mReqDiff').innerHTML =
    `<span style="font-weight:600;color:${diffColor(diff)}">${escapeHtml(r.difficulty || diffLabel(diff))}</span>
     <span style="color:var(--tx3);font-size:.85rem"> (niveau ${diff})</span>`;
  const arrival = r.is_initial
    ? 'Disponible au lancement'
    : `Vague ${r.wave_number}${r.arrival_time ? ' · H+' + r.arrival_time.replace(/:00$/, '') : ''}`;
  document.getElementById('mReqArrival').textContent = arrival;

  document.getElementById('mReqXP').innerHTML = `
    <div class="xp-cell"><div class="xp-cell-val">${r.xp_base ?? 0}</div><div class="xp-cell-lbl">XP base</div></div>
    <div class="xp-cell"><div class="xp-cell-val">+${r.xp_time_bonus ?? 0}</div><div class="xp-cell-lbl">Bonus temps</div></div>
    <div class="xp-cell"><div class="xp-cell-val">${r.xp_total ?? 0}</div><div class="xp-cell-lbl">Total</div></div>
    <div class="xp-cell"><div class="xp-cell-val">${r.xp_available ?? 0}</div><div class="xp-cell-lbl">Disponibles</div></div>
  `;
  document.getElementById('reqModal').classList.add('open');
}
function closeModal() {
  document.getElementById('reqModal').classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('click', e => {
  const m = document.getElementById('reqModal');
  if (e.target === m) closeModal();
});

/* ---------- Platform navigation ---------- */
function openPlatform() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('platform').style.display = 'block';
  window.scrollTo(0, 0);
  if (!TN.timer) startPolling();
}
function closePlatform() {
  document.getElementById('platform').style.display = 'none';
  document.getElementById('landing').style.display = 'block';
  window.scrollTo(0, 0);
}

function dbNav(section, btn) {
  document.querySelectorAll('.db-section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('sec-' + section);
  if (sec) sec.classList.add('active');
  document.querySelectorAll('.db-nl').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Close mobile sidebar
  document.getElementById('dbSidebar').classList.remove('mob-open');
}

/* ---------- Filters & search ---------- */
document.addEventListener('click', e => {
  const fb = e.target.closest('.filter-btn');
  if (fb) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    fb.classList.add('active');
    TN.currentFilter = fb.dataset.filter;
    renderRequestsGrid();
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'searchRequests') {
    TN.searchQuery = e.target.value.trim();
    renderRequestsGrid();
  }
});

/* ---------- Theme ---------- */
function toggleTheme() {
  document.documentElement.classList.toggle('lm');
  const isLight = document.documentElement.classList.contains('lm');
  localStorage.setItem('tn-theme', isLight ? 'light' : 'dark');
  updateThemeIcons();
}
function updateThemeIcons() {
  const isLight = document.documentElement.classList.contains('lm');
  ['suni', 'mooni', 'dbSunI', 'dbMoonI'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const show = id.toLowerCase().includes('sun') ? isLight : !isLight;
    el.style.display = show ? '' : 'none';
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('tn-theme');
  if (saved === 'light') document.documentElement.classList.add('lm');
  updateThemeIcons();

  const thbtn = document.getElementById('thbtn');
  if (thbtn) thbtn.addEventListener('click', toggleTheme);
});

/* ---------- Mobile menu ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const mbtog = document.getElementById('mbtog');
  const mbmenu = document.getElementById('mbmenu');
  if (mbtog && mbmenu) {
    mbtog.addEventListener('click', () => {
      mbmenu.classList.toggle('open');
      const bar = document.getElementById('barIcon');
      const x = document.getElementById('xIcon');
      if (bar && x) {
        bar.style.display = mbmenu.classList.contains('open') ? 'none' : '';
        x.style.display = mbmenu.classList.contains('open') ? '' : 'none';
      }
    });
  }

  // Scroll effect on navbar
  window.addEventListener('scroll', () => {
    const n = document.getElementById('nbar');
    if (n) n.classList.toggle('scr', window.scrollY > 20);
  });

  // Start polling
  startPolling();

  // Update "next call" timer
  updateNextCall();
});

/* ---------- XP chart on overview ---------- */
function renderOverviewXPChart() {
  const ctx = document.getElementById('xpChart');
  if (!ctx) return;
  const xpByDiff = [0, 0, 0, 0];
  TN.requests.forEach(r => {
    const d = (r.difficulty_level || 1) - 1;
    if (d >= 0 && d < 4) xpByDiff[d] += (r.xp_available || 0);
  });
  if (TN.charts.xp) TN.charts.xp.destroy();
  TN.charts.xp = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Facile', 'Moyenne', 'Difficile', 'Expert'],
      datasets: [{
        label: 'XP disponibles',
        data: xpByDiff,
        backgroundColor: ['#34d399', '#60a5fa', '#fbbf24', '#f87171'],
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#6b6b8a' } },
        x: { grid: { display: false }, ticks: { color: '#6b6b8a' } }
      }
    }
  });
}

/* Hook overview chart into renderAll */
const _origRenderAll = renderAll;
renderAll = function() {
  _origRenderAll();
  renderOverviewXPChart();
  renderDiffBars();
};

/* Difficulty bars on hero */
function renderDiffBars() {
  const counts = [0, 0, 0, 0];
  TN.requests.forEach(r => {
    const d = (r.difficulty_level || 1) - 1;
    if (d >= 0 && d < 4) counts[d]++;
  });
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  counts.forEach((c, i) => {
    const fill = document.querySelector(`.diff-fill[data-diff="${i + 1}"]`);
    const count = document.querySelector(`.diff-count[data-diff-count="${i + 1}"]`);
    if (fill) fill.style.width = Math.round((c / total) * 100) + '%';
    if (count) count.textContent = c;
  });
}

/* Hero last request ticker */
function updateHeroLastReq() {
  const el = document.getElementById('heroLastReq');
  if (!el) return;
  if (!TN.requests.length) {
    el.innerHTML = '<strong>Aucune demande</strong> pour le moment.';
    return;
  }
  const last = TN.requests[TN.requests.length - 1];
  el.innerHTML = `<strong>${escapeHtml(last.request_code)}</strong> · ${escapeHtml(truncate(last.message_public, 70))}`;
}

/* Hook into render */
const _origRenderSession = renderSession;
renderSession = function() {
  _origRenderSession();
  updateHeroLastReq();
};

/* Make functions global */
window.openPlatform = openPlatform;
window.closePlatform = closePlatform;
window.dbNav = dbNav;
window.openModal = openModal;
window.closeModal = closeModal;
window.saveApiSettings = saveApiSettings;
window.refreshNow = refreshNow;
window.toggleTheme = toggleTheme;