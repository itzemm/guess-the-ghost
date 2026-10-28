// Image file types tried for each ghost, in order: images/ghost-1.jpg, .jpeg, .png, .webp
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const PLACEHOLDER = 'images/placeholder.svg';

const $ = (sel) => document.querySelector(sel);
let config = null;

// ---------- Tabs ----------
function showView(name) {
  document.querySelectorAll('.tab').forEach((t) => {
    const active = t.dataset.view === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });
  document.querySelectorAll('.view').forEach((v) => (v.hidden = v.id !== `view-${name}`));
  if (name === 'leaderboard') loadLeaderboard();
}
document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => showView(t.dataset.view)));
$('#see-leaderboard').addEventListener('click', () => showView('leaderboard'));
$('#refresh-board').addEventListener('click', loadLeaderboard);

// ---------- Ghost cards ----------
function ghostImage(n) {
  const img = document.createElement('img');
  img.alt = `Eyes of ghost ${n}`;
  img.loading = 'lazy';
  let attempt = 0;
  img.src = `images/ghost-${n}.${IMAGE_EXTENSIONS[attempt]}`;
  img.addEventListener('error', () => {
    attempt++;
    img.src = attempt < IMAGE_EXTENSIONS.length ? `images/ghost-${n}.${IMAGE_EXTENSIONS[attempt]}` : PLACEHOLDER;
  });
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
  return img;
}

function renderGhosts() {
  const grid = $('#ghost-grid');
  grid.innerHTML = '';
  for (let n = 1; n <= config.ghostCount; n++) {
    const card = document.createElement('div');
    card.className = 'ghost-card';
    card.dataset.ghost = n;

    const body = document.createElement('div');
    body.className = 'body';

    const label = document.createElement('label');
    label.className = 'label';
    label.htmlFor = `ghost-${n}`;
    label.textContent = `Ghost ${n}`;

    const select = document.createElement('select');
    select.id = `ghost-${n}`;
    select.name = String(n);
    select.innerHTML = '<option value="">Who is this?</option>';
    for (const name of config.names) {
      const opt = document.createElement('option');
      opt.value = opt.textContent = name;
      select.appendChild(opt);
    }
    select.addEventListener('change', () => {
      showError('');
      updateSelections();
    });

    body.append(label, select);
    card.append(ghostImage(n), body);
    grid.appendChild(card);
  }
  updateSelections();
}

// Each name can only be used once — disable names already chosen for another ghost.
function updateSelections() {
  const selects = [...document.querySelectorAll('#ghost-grid select')];
  const taken = new Set(selects.map((s) => s.value).filter(Boolean));
  for (const s of selects) {
    for (const opt of s.options) {
      if (opt.value) opt.disabled = taken.has(opt.value) && opt.value !== s.value;
    }
    const card = s.closest('.ghost-card');
    card.classList.toggle('answered', !!s.value);
    if (s.value) card.classList.remove('missing');
  }
  $('#progress').textContent = `${taken.size} of ${selects.length} ghosts named`;
}

// ---------- Submit ----------
function showError(msg) {
  const el = $('#form-error');
  el.textContent = msg;
  el.hidden = !msg;
}

$('#game-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');

  const player = $('#player').value.trim();
  if (!player) {
    showError('Please enter your name first.');
    $('#player').focus();
    return;
  }

  const answers = {};
  let firstMissing = null;
  document.querySelectorAll('#ghost-grid select').forEach((s) => {
    if (s.value) answers[s.name] = s.value;
    else {
      s.closest('.ghost-card').classList.add('missing');
      firstMissing ??= s;
    }
  });
  if (firstMissing) {
    showError('Please name every ghost before submitting.');
    firstMissing.focus();
    return;
  }

  const btn = $('#submit-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, answers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    showResult(data);
  } catch (err) {
    showError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit my guesses';
  }
});

function showResult({ player, correct, total, results }) {
  $('#game-form').hidden = true;
  $('#result-title').textContent = `Thanks, ${player}!`;
  $('#result-score').textContent = `${correct} / ${total}`;
  if (results) {
    const list = document.createElement('ul');
    list.className = 'result-list';
    for (const [n, ok] of Object.entries(results)) {
      const li = document.createElement('li');
      li.textContent = `Ghost ${n} ${ok ? '✅' : '❌'}`;
      list.appendChild(li);
    }
    $('#result-score').after(list);
  }
  $('#result').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Leaderboard ----------
async function loadLeaderboard() {
  const tbody = $('#board-body');
  try {
    const res = await fetch('/api/leaderboard');
    const { rows, total } = await res.json();
    tbody.innerHTML = '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="muted">No one has played yet. Be the first!</td></tr>';
      return;
    }
    // Players with equal scores share a rank.
    let rank = 0;
    rows.forEach((row, i) => {
      if (i === 0 || row.correct !== rows[i - 1].correct) rank = i + 1;
      const tr = document.createElement('tr');
      if (rank <= 3) tr.className = `rank-${rank}`;
      const cells = [String(rank), row.player, `${row.correct} / ${total}`];
      cells.forEach((text, c) => {
        const td = document.createElement('td');
        td.textContent = text;
        if (c === 1) td.className = 'player';
        if (c === 2) td.className = 'num';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  } catch {
    tbody.innerHTML = '<tr><td colspan="3" class="error">Could not load the leaderboard.</td></tr>';
  }
}

// ---------- Lightbox ----------
function openLightbox(src, alt) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  box.appendChild(img);
  const close = () => box.remove();
  box.addEventListener('click', close);
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  });
  document.body.appendChild(box);
}

// ---------- Start ----------
(async function init() {
  try {
    const res = await fetch('/api/config');
    config = await res.json();
    renderGhosts();
    if (!config.submissionsOpen) {
      $('#closed-banner').hidden = false;
      $('#submit-btn').disabled = true;
    }
  } catch {
    $('#ghost-grid').innerHTML = '<p class="error">Could not load the game. Please refresh.</p>';
  }
})();
