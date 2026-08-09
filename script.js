const board = document.getElementById('board');
const timerEl = document.getElementById('timer');
const roundsEl = document.getElementById('rounds');
const scoreEl = document.getElementById('score');
const winOverlay = document.getElementById('winOverlay');
const winTime = document.getElementById('winTime');
const winRounds = document.getElementById('winRounds');
const winScore = document.getElementById('winScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const difficultyGroup = document.getElementById('difficultyGroup');
const themeGroup = document.getElementById('themeGroup');
const resetBtn = document.getElementById('resetBtn');
const closeBtn = document.getElementById('closeBtn');
const exitBtn = document.getElementById('exitBtn');
const startOverlay = document.getElementById('startOverlay');
const startLight = document.getElementById('startLight');
const startDark = document.getElementById('startDark');

const COUNTS = { easy: 6, medium: 10, hard: 14 };
const LAYOUT = { easy: { cols: 3, rows: 2 }, medium: { cols: 5, rows: 2 }, hard: { cols: 7, rows: 2 } };
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const THEMES = ['light', 'dark'];
const LIGHT_IMAGES = [
  'bo-katan.jpg',
  'CHEWBACCA.jpg',
  'Finn.jpg',
  'Grogu.jpg',
  'Han solo.jpg',
  'lando.jpg',
  'Leia.jpg',
  'Luke Skywalker.jpg',
  'Mando and Grogu.jpg',
  'obiwan.jpg',
  'Poe and BB8.jpg',
  'R2D2 C3P0.jpg',
  'REY.jpg',
  'Wicket.jpg'
];

const DARK_IMAGES = [
  'ATST.jpg',
  'Biker Scout.jpg',
  'Count Dooku.jpg',
  'Darth Maul.jpg',
  'Darth Vader.jpg',
  'Emperor Palpatine.jpg',
  'First Order Trooper.jpg',
  'Krennic.jpg',
  'Kylo Ren.jpg',
  'Probe droid.jpg',
  'Snow Trooper.jpg',
  'Storm Trooper.jpg',
  'Tarkin.jpg',
  'Tie Pilot.jpg'
];

const settings = { difficulty: 'medium', theme: 'light' };
let pending = { ...settings };

let deck = [];
let flipped = [];
let matched = 0;
let rounds = 0;
let elapsed = 0;
let timerId = null;
let paused = false;
let lock = false;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function beep(frequency, type, duration, volume) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playFlip() {
  beep(520, 'sine', 0.12, 0.08);
}

function playMatch() {
  beep(660, 'triangle', 0.2, 0.1);
  setTimeout(() => beep(880, 'triangle', 0.3, 0.1), 120);
}

function playMismatch() {
  beep(180, 'sawtooth', 0.35, 0.08);
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function startTimer() {
  stopTimer();
  elapsed = 0;
  paused = false;
  updateStats();
  timerId = setInterval(() => {
    if (!paused) {
      elapsed += 1;
      updateStats();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateStats() {
  timerEl.textContent = formatTime(elapsed);
  roundsEl.textContent = rounds;
  scoreEl.textContent = elapsed + rounds;
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCard(item, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.shape = item.id;
  card.dataset.index = index;
  card.setAttribute('role', 'listitem');

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('div');
  front.className = 'card-face card-front';
  const img = document.createElement('img');
  img.className = 'card-image';
  img.src = item.src;
  img.alt = item.id;
  img.draggable = false;
  front.appendChild(img);

  const back = document.createElement('div');
  back.className = 'card-face card-back';

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.addEventListener('click', () => handleCardClick(card));
  return card;
}

function handleCardClick(card) {
  if (lock || card.classList.contains('flipped') || card.classList.contains('hidden')) {
    return;
  }
  initAudio();
  card.classList.add('flipped');
  playFlip();
  flipped.push(card);

  if (flipped.length === 2) {
    lock = true;
    rounds += 1;
    updateStats();
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flipped;
  if (a.dataset.shape === b.dataset.shape) {
    playMatch();
    setTimeout(() => {
      a.classList.add('hidden');
      b.classList.add('hidden');
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      matched += 2;
      flipped = [];
      lock = false;

      if (matched === deck.length) {
        endGame();
      }
    }, 400);
  } else {
    playMismatch();
    setTimeout(() => {
      a.classList.remove('flipped');
      b.classList.remove('flipped');
      flipped = [];
      lock = false;
    }, 900);
  }
}

function endGame() {
  stopTimer();
  winTime.textContent = formatTime(elapsed);
  winRounds.textContent = rounds;
  winScore.textContent = elapsed + rounds;
  winOverlay.classList.remove('hidden');
}

function resetGame() {
  winOverlay.classList.add('hidden');
  stopTimer();
  board.innerHTML = '';

  const { cols, rows } = LAYOUT[settings.difficulty];
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  matched = 0;
  rounds = 0;
  elapsed = 0;
  flipped = [];
  lock = false;

  const count = COUNTS[settings.difficulty];
  const imagePool = settings.theme === 'dark' ? DARK_IMAGES : LIGHT_IMAGES;
  const folder = settings.theme === 'dark' ? 'Dark' : 'Light';
  const faceImages = shuffle(imagePool).slice(0, count / 2);
  const faceCards = faceImages.map((name) => ({
    id: name,
    src: `img/${folder}/${encodeURIComponent(name)}`
  }));
  const pairs = [...faceCards, ...faceCards];
  deck = shuffle(pairs);
  deck.forEach((item, index) => {
    board.appendChild(createCard(item, index));
  });

  startOverlay.classList.remove('hidden');
}

function applyTheme() {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(settings.theme);
}

function openSettings() {
  pending = { ...settings };
  paused = true;
  updateSettingsUI();
  settingsOverlay.classList.remove('hidden');
}

function closeSettings(save) {
  settingsOverlay.classList.add('hidden');
  if (save) {
    const changed = pending.difficulty !== settings.difficulty || pending.theme !== settings.theme;
    Object.assign(settings, pending);
    if (changed) {
      resetGame();
    } else {
      paused = false;
    }
  } else {
    paused = false;
  }
  applyTheme();
}

function updateSettingsUI() {
  DIFFICULTIES.forEach((d) => {
    const btn = difficultyGroup.querySelector(`[data-value="${d}"]`);
    btn.classList.toggle('active', d === pending.difficulty);
  });
  THEMES.forEach((t) => {
    const btn = themeGroup.querySelector(`[data-value="${t}"]`);
    btn.classList.toggle('active', t === pending.theme);
  });
}

function startGame(theme) {
  settings.theme = theme;
  pending.theme = theme;
  applyTheme();
  updateSettingsUI();
  startOverlay.classList.add('hidden');
  startTimer();
}

settingsBtn.addEventListener('click', openSettings);
playAgainBtn.addEventListener('click', resetGame);

resetBtn.addEventListener('click', () => {
  Object.assign(settings, pending);
  settingsOverlay.classList.add('hidden');
  paused = false;
  resetGame();
});

closeBtn.addEventListener('click', () => closeSettings(true));

exitBtn.addEventListener('click', () => {
  window.close();
});

startLight.addEventListener('click', () => startGame('light'));
startDark.addEventListener('click', () => startGame('dark'));

difficultyGroup.addEventListener('click', (e) => {
  if (e.target.classList.contains('option')) {
    pending.difficulty = e.target.dataset.value;
    updateSettingsUI();
  }
});

themeGroup.addEventListener('click', (e) => {
  if (e.target.classList.contains('option')) {
    pending.theme = e.target.dataset.value;
    updateSettingsUI();
  }
});

document.addEventListener('contextmenu', (e) => e.preventDefault());

applyTheme();
resetGame();
