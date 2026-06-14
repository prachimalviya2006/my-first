

// ── State ────────────────────────────────────────────────────────────────────
const State = (() => {
  const KEY = 'ecotrace_v1';
  const defaults = {
    logs:        [],
    completedActions: [],
    profile:     { name: 'Eco Warrior', country: 'India', vehicle: 'None / Walk', diet: 'Vegetarian', home: 'Mostly Renewable' },
    ecoScore:    72,
    totalSaved:  0,
  };

  let _state = defaults;

  function load() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) _state = { ...defaults, ...JSON.parse(saved) };
    } catch (_) { _state = { ...defaults }; }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(_state)); } catch (_) {}
  }

  function get(key) { return key ? _state[key] : _state; }

  function set(key, val) {
    _state[key] = val;
    save();
  }

  return { load, save, get, set };
})();

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Router ───────────────────────────────────────────────────────────────────
const Router = (() => {
  function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById(`page-${pageId}`);
    const nav  = document.querySelector(`.nav-item[data-page="${pageId}"]`);

    if (page) page.classList.add('active');
    if (nav)  nav.classList.add('active');

    // Lazy-render charts on first visit
    if (pageId === 'dashboard')  Dashboard.renderCharts();
    if (pageId === 'insights')   Insights.render();
    if (pageId === 'track')      Track.renderRecentList();
    if (pageId === 'actions')    Actions.render();
    if (pageId === 'profile')    Profile.render();

    // Close mobile menu
    document.getElementById('sidebar').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigate(link.dataset.page);
      });
    });

    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.addEventListener('click', e => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !e.target.closest('#menuToggle')) {
        sidebar.classList.remove('open');
      }
    });
  }

  return { init, navigate };
})();

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = (() => {
  let chartsDrawn = false;

  function renderGauge() {
    const footprint = 4.2; // tonnes
    const maxTonne  = 8;
    const pct = footprint / maxTonne;
    const totalDash = 283;
    const offset = totalDash - pct * totalDash;
    const fill = document.getElementById('gaugeFill');
    if (fill) {
      setTimeout(() => { fill.style.strokeDashoffset = offset; }, 100);
    }
    document.getElementById('gaugeNumber').textContent = footprint;
  }

  function renderTips() {
    const grid = document.getElementById('tipsGrid');
    if (!grid) return;
    const shuffled = [...TIPS].sort(() => Math.random() - .5).slice(0, 4);
    grid.innerHTML = shuffled.map(t => `
      <div class="tip-item">
        <div class="tip-icon">${t.icon}</div>
        <div class="tip-title">${t.title}</div>
        <div class="tip-desc">${t.desc}</div>
        <span class="tip-impact">${t.impact}</span>
      </div>`).join('');
  }

  function renderCharts() {
    if (chartsDrawn) return;
    chartsDrawn = true;
    Charts.drawTrendChart('trendChart', MONTHLY_DATA);
    Charts.drawBreakdownChart('breakdownChart', 'breakdownLegend', BREAKDOWN_DATA);
  }

  function init() {
    // Date
    const d = document.getElementById('headerDate');
    if (d) d.textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

    renderGauge();
    renderTips();

    document.getElementById('refreshTips')?.addEventListener('click', renderTips);
  }

  return { init, renderCharts };
})();

// ── Track / Log Activity ──────────────────────────────────────────────────────
const Track = (() => {
  let currentCat = 'transport';
  let currentEmission = 0;

  function getCatOptions(cat) {
    return Object.entries(EMISSION_FACTORS[cat]).map(([k, v]) =>
      `<option value="${k}">${v.label}</option>`
    ).join('');
  }

  function renderForm(cat) {
    const factors = EMISSION_FACTORS[cat];
    const firstKey = Object.keys(factors)[0];
    const firstF   = factors[firstKey];

    const form = document.getElementById('logForm');
    form.innerHTML = `
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-select" id="actType">${getCatOptions(cat)}</select>
      </div>
      <div class="form-group">
        <label class="form-label" id="amountLabel">Amount (${firstF.unit})</label>
        <input type="number" class="form-input" id="actAmount" placeholder="e.g. 15" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-input" id="actDate" value="${new Date().toISOString().split('T')[0]}" />
      </div>
      <div class="form-group">
        <label class="form-label">Notes (optional)</label>
        <input type="text" class="form-input" id="actNotes" placeholder="Add any notes…" />
      </div>
      <div class="emission-preview">
        <span class="emission-label">Estimated Emission</span>
        <span class="emission-val" id="emissionPreview">0 kg CO₂e</span>
      </div>
      <button class="btn-primary" id="logSubmit">Log Activity</button>`;

    // Live preview
    function updatePreview() {
      const type   = document.getElementById('actType').value;
      const amount = parseFloat(document.getElementById('actAmount').value) || 0;
      const factor = EMISSION_FACTORS[cat][type].factor;
      const unit   = EMISSION_FACTORS[cat][type].unit;
      currentEmission = +(amount * factor).toFixed(3);
      document.getElementById('emissionPreview').textContent = `${currentEmission} kg CO₂e`;
      document.getElementById('amountLabel').textContent = `Amount (${unit})`;
    }

    document.getElementById('actType').addEventListener('change', updatePreview);
    document.getElementById('actAmount').addEventListener('input', updatePreview);

    document.getElementById('logSubmit').addEventListener('click', () => {
      const type   = document.getElementById('actType').value;
      const amount = parseFloat(document.getElementById('actAmount').value);
      const date   = document.getElementById('actDate').value;
      const notes  = document.getElementById('actNotes').value;

      if (!amount || amount <= 0) { showToast('⚠️ Please enter a valid amount'); return; }

      const log = {
        id: Date.now(),
        category: cat,
        type,
        label: EMISSION_FACTORS[cat][type].label,
        amount,
        unit: EMISSION_FACTORS[cat][type].unit,
        emission: currentEmission,
        date,
        notes,
        icon: CATEGORY_ICONS[cat],
      };

      const logs = State.get('logs');
      logs.unshift(log);
      if (logs.length > 100) logs.pop();
      State.set('logs', logs);

      // Show result
      document.getElementById('logForm').classList.add('hidden');
      const result = document.getElementById('logResult');
      result.classList.remove('hidden');
      document.getElementById('resultText').innerHTML =
        `You logged <strong>${amount} ${log.unit}</strong> of <strong>${log.label}</strong><br>
         Estimated: <strong>${currentEmission} kg CO₂e</strong>${currentEmission === 0 ? ' — great choice! 🎉' : ''}`;

      renderRecentList();
      showToast(`✅ Activity logged: ${currentEmission} kg CO₂e`);
    });

    document.getElementById('logAnother')?.addEventListener('click', () => {
      document.getElementById('logForm').classList.remove('hidden');
      document.getElementById('logResult').classList.add('hidden');
      document.getElementById('actAmount').value = '';
      updatePreview();
    });
  }

  function renderRecentList() {
    const list = document.getElementById('recentList');
    if (!list) return;
    const logs = State.get('logs');

    if (logs.length === 0) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No activities logged yet.<br>Start tracking to see your data!</p></div>`;
      return;
    }

    list.innerHTML = logs.slice(0, 20).map(log => `
      <div class="recent-item">
        <div class="recent-icon">${log.icon}</div>
        <div class="recent-info">
          <div class="recent-title">${log.label} — ${log.amount} ${log.unit}</div>
          <div class="recent-date">${new Date(log.date).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}${log.notes ? ' · ' + log.notes : ''}</div>
        </div>
        <div class="recent-co2">${log.emission} kg</div>
      </div>`).join('');
  }

  function init() {
    renderForm('transport');
    renderRecentList();

    document.getElementById('categoryTabs')?.addEventListener('click', e => {
      const btn = e.target.closest('.cat-tab');
      if (!btn) return;
      document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      document.getElementById('logForm').classList.remove('hidden');
      document.getElementById('logResult').classList.add('hidden');
      renderForm(currentCat);
    });

    document.getElementById('clearLogs')?.addEventListener('click', () => {
      if (!confirm('Clear all logged activities?')) return;
      State.set('logs', []);
      renderRecentList();
      showToast('🗑️ All logs cleared');
    });
  }

  return { init, renderRecentList };
})();

// ── Insights ──────────────────────────────────────────────────────────────────
const Insights = (() => {
  let rendered = false;

  function buildHeatmap() {
    const el = document.getElementById('weeklyHeatmap');
    if (!el) return;
    const days = ['M','T','W','T','F','S','S'];
    // Generate 4 weeks × 7 days
    const cells = Array.from({ length: 28 }, (_, i) => {
      const level = Math.floor(Math.random() * 5);
      const day   = days[i % 7];
      return `<div class="heat-day level-${level}" title="Day ${i + 1}: Level ${level}">${day}</div>`;
    });
    el.innerHTML = cells.join('');
  }

  function buildWins() {
    const el = document.getElementById('winsList');
    if (!el) return;
    const wins = [
      { icon:'🚴', text:'Cycled instead of driving 4 times', amount:'Save 12 kg CO₂' },
      { icon:'🥗', text:'Chose vegetarian meals 6 days', amount:'Save 8 kg CO₂' },
      { icon:'💡', text:'Reduced home energy by 8% this month', amount:'Save 5 kg CO₂' },
    ];
    el.innerHTML = wins.map(w => `
      <div class="win-item">
        <span class="win-icon">${w.icon}</span>
        <span class="win-text">${w.text}</span>
        <span class="win-amount">${w.amount}</span>
      </div>`).join('');
  }

  function render() {
    if (rendered) return;
    rendered = true;
    document.getElementById('storyText').innerHTML = STORY_TEXT;
    buildWins();
    buildHeatmap();
    setTimeout(() => Charts.drawComparisonChart('comparisonChart', COMPARISON_DATA), 80);
  }

  return { render };
})();

// ── Actions ───────────────────────────────────────────────────────────────────
const Actions = (() => {
  let filter = 'all';

  function render() {
    const completed = State.get('completedActions');
    const grid = document.getElementById('actionsGrid');
    if (!grid) return;

    const filtered = filter === 'all'
      ? ACTIONS
      : ACTIONS.filter(a => a.filter.includes(filter));

    grid.innerHTML = filtered.map(a => {
      const done = completed.includes(a.id);
      return `
      <div class="action-card${done ? ' completed' : ''}" data-id="${a.id}">
        <div class="action-icon">${a.icon}</div>
        <div class="action-title">${a.title}</div>
        <div class="action-desc">${a.desc}</div>
        <div class="action-meta">
          <span class="action-impact">🌱 ${a.impact}</span>
          <span class="effort-badge effort-${a.effort}">${a.effort.charAt(0).toUpperCase() + a.effort.slice(1)}</span>
        </div>
        <button class="action-check-btn" data-id="${a.id}" ${done ? 'disabled' : ''}>
          ${done ? '✓ Completed' : '✓ Mark as Done'}
        </button>
      </div>`;
    }).join('');

    updateSaved();
  }

  function updateSaved() {
    const total = State.get('totalSaved');
    const el = document.getElementById('totalSaved');
    if (el) el.textContent = `${total} kg`;
  }

  function init() {
    document.getElementById('actionsFilter')?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });

    document.querySelector('.actions-filter')?.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });

    document.getElementById('actionsGrid')?.addEventListener('click', e => {
      const btn = e.target.closest('.action-check-btn');
      if (!btn) return;
      const id = btn.dataset.id;
      const action = ACTIONS.find(a => a.id === id);
      if (!action) return;

      const completed = State.get('completedActions');
      if (!completed.includes(id)) {
        completed.push(id);
        State.set('completedActions', completed);

        // Parse kg from impact string
        const match = action.impact.match(/[\d.]+/);
        if (match) {
          const saved = State.get('totalSaved') + parseFloat(match[0]);
          State.set('totalSaved', Math.round(saved));
        }
        render();
        showToast(`🎉 Action completed! ${action.impact}`);
      }
    });
  }

  return { init, render };
})();

// ── Profile ───────────────────────────────────────────────────────────────────
const Profile = (() => {
  function renderForm() {
    const form = document.getElementById('profileForm');
    const prof = State.get('profile');
    if (!form) return;

    form.innerHTML = PROFILE_FIELDS.map(f => {
      if (f.type === 'select') {
        const opts = f.options.map(o =>
          `<option value="${o}"${prof[f.id.replace('pf-','')] === o ? ' selected' : ''}>${o}</option>`
        ).join('');
        return `
          <div class="form-group">
            <label class="form-label">${f.label}</label>
            <select class="form-select" id="${f.id}">${opts}</select>
          </div>`;
      }
      return `
        <div class="form-group">
          <label class="form-label">${f.label}</label>
          <input type="${f.type}" class="form-input" id="${f.id}"
            value="${prof[f.id.replace('pf-','')] || f.value}"
            placeholder="${f.placeholder || ''}">
        </div>`;
    }).join('');

    // Save button
    form.innerHTML += `<button class="btn-primary" id="saveProfile" style="margin-top:8px">Save Profile</button>`;

    document.getElementById('saveProfile')?.addEventListener('click', () => {
      const newProf = {};
      PROFILE_FIELDS.forEach(f => {
        const key = f.id.replace('pf-', '');
        const el  = document.getElementById(f.id);
        if (el) newProf[key] = el.value;
      });
      State.set('profile', newProf);
      document.getElementById('profileName').textContent = newProf.name || 'Eco Warrior';
      showToast('✅ Profile saved!');
    });
  }

  function renderGoals() {
    const el = document.getElementById('goalsList');
    if (!el) return;
    el.innerHTML = DEFAULT_GOALS.map((g, i) => `
      <div class="goal-item">
        <div class="goal-header">
          <span class="goal-name">${g.name}</span>
          <span class="goal-target">${g.target}</span>
        </div>
        <div class="goal-progress-wrap">
          <div class="goal-progress" style="width:${g.progress}%" data-goal="${i}"></div>
        </div>
      </div>`).join('');
  }

  function renderAchievements() {
    const el = document.getElementById('achievementsGrid');
    if (!el) return;
    el.innerHTML = ACHIEVEMENTS.map(a => `
      <div class="achievement${a.locked ? ' locked' : ''}" title="${a.name}: ${a.desc}">
        <span>${a.emoji}</span>
        <span class="achievement-name">${a.name}</span>
      </div>`).join('');
  }

  function render() {
    renderForm();
    renderGoals();
    renderAchievements();
    const prof = State.get('profile');
    document.getElementById('profileName').textContent = prof.name || 'Eco Warrior';
  }

  function init() {
    document.getElementById('saveGoals')?.addEventListener('click', () => {
      showToast('🎯 Goals saved!');
    });
  }

  return { init, render };
})();

// ── Eco Score sidebar sync ───────────────────────────────────────────────────
function syncEcoScore() {
  const score = State.get('ecoScore');
  const bar   = document.getElementById('sidebarEcoBar');
  const val   = document.getElementById('sidebarEcoValue');
  const mob   = document.getElementById('mobileScore');
  if (bar) bar.style.width = `${score}%`;
  if (val) val.textContent  = score;
  if (mob) mob.textContent  = score;
}

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  State.load();

  Router.init();
  Dashboard.init();
  Track.init();
  Actions.init();
  Profile.init();
  syncEcoScore();

  // Start on Dashboard
  Router.navigate('dashboard');
});

// Resize: redraw charts
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    Charts.drawTrendChart('trendChart', MONTHLY_DATA);
    Charts.drawBreakdownChart('breakdownChart', 'breakdownLegend', BREAKDOWN_DATA);
    if (document.getElementById('page-insights').classList.contains('active')) {
      Charts.drawComparisonChart('comparisonChart', COMPARISON_DATA);
    }
  }, 200);
});