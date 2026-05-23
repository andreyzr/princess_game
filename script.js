/* ═══════════════════════════════════════════
   PIXEL PRINCESS ADVENTURE — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ИГРЫ ─────────────────────── */
const G = {
  char: null,
  pos: 0,
  rolling: false,
  stages: [false, false, false],
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ─── ПЕРСОНАЖИ ──────────────────────────── */
const CHARS = {
  1: { name: 'Аня',  hair: '#E91E8C', dress: '#3CC9C0', skin: '#FDBCB4', shoe: '#5D4037', eye: '#2D1B00' },
  2: { name: 'Маша', hair: '#6D4C41', dress: '#7A8C3E', skin: '#FDBCB4', shoe: '#3E2723', eye: '#1A1A1A' },
  3: { name: 'Соня', hair: '#F9A825', dress: '#FF8FAB', skin: '#FDBCB4', shoe: '#6D4C41', eye: '#2D1B00' },
};

/* ─── МАРШРУТ ПО ПОЛЮ ────────────────────── */
// l = left%, t = top% от размеров контейнера
const PATH = [
  { l:  7, t: 18, type: 'start'              }, // 0  СТАРТ
  { l: 22, t: 18, type: 'normal'             }, // 1
  { l: 37, t: 18, type: 'normal'             }, // 2
  { l: 52, t: 18, type: 'stage',  stage: 1  }, // 3  ⭐ ЭТАП 1
  { l: 67, t: 18, type: 'normal'             }, // 4
  { l: 82, t: 18, type: 'normal'             }, // 5
  { l: 93, t: 18, type: 'normal'             }, // 6  поворот
  { l: 93, t: 50, type: 'normal'             }, // 7
  { l: 82, t: 50, type: 'normal'             }, // 8
  { l: 67, t: 50, type: 'stage',  stage: 2  }, // 9  ⭐ ЭТАП 2
  { l: 52, t: 50, type: 'normal'             }, // 10
  { l: 37, t: 50, type: 'normal'             }, // 11
  { l: 22, t: 50, type: 'normal'             }, // 12
  { l:  7, t: 50, type: 'normal'             }, // 13 поворот
  { l:  7, t: 82, type: 'normal'             }, // 14
  { l: 22, t: 82, type: 'normal'             }, // 15
  { l: 37, t: 82, type: 'normal'             }, // 16
  { l: 52, t: 82, type: 'normal'             }, // 17
  { l: 67, t: 82, type: 'normal'             }, // 18
  { l: 82, t: 82, type: 'stage',  stage: 3  }, // 19 🏆 ФИНИШ
];
const TOTAL = PATH.length; // 20 клеток

/* ─── ПИКСЕЛЬНЫЙ СПРАЙТ ──────────────────── */
// Сетка 10×15 пикселей. Индексы цветов:
// 0=прозр, 1=волосы, 2=платье, 3=кожа, 4=глаза, 5=рот, 6=туфли
const SPRITE_GRID = [
  [0,0,1,1,1,1,1,0,0,0], // 0  верхушка волос
  [0,1,1,1,1,1,1,1,0,0], // 1  волосы
  [1,1,3,3,3,3,3,1,0,0], // 2  волосы + лицо
  [0,0,3,4,3,4,3,0,0,0], // 3  глаза
  [0,0,3,3,3,3,3,0,0,0], // 4  щёки
  [0,0,3,5,3,3,0,0,0,0], // 5  рот
  [0,0,0,3,3,3,0,0,0,0], // 6  шея
  [0,2,2,2,2,2,2,2,0,0], // 7  плечи / платье
  [2,2,2,2,2,2,2,2,2,0], // 8  тело
  [0,2,2,2,2,2,2,2,0,0], // 9  платье
  [0,0,2,2,2,2,2,0,0,0], // 10 подол
  [0,0,3,3,0,3,3,0,0,0], // 11 ноги
  [0,0,3,3,0,3,3,0,0,0], // 12 ноги
  [0,0,3,0,0,0,3,0,0,0], // 13 лодыжки
  [0,6,6,0,0,0,6,6,0,0], // 14 туфли
];

/**
 * Рисует пиксельный спрайт на canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {number} charId — 1, 2 или 3
 * @param {number} s — размер одного пикселя в CSS px
 */
function drawSprite(canvas, charId, s = 6) {
  const c = CHARS[charId];
  const PAL = [null, c.hair, c.dress, c.skin, c.eye, '#E17055', c.shoe];
  const ctx = canvas.getContext('2d');
  const W = SPRITE_GRID[0].length;
  const H = SPRITE_GRID.length;
  canvas.width  = W * s;
  canvas.height = H * s;
  ctx.imageSmoothingEnabled = false;
  SPRITE_GRID.forEach((row, y) => {
    row.forEach((idx, x) => {
      if (PAL[idx]) {
        ctx.fillStyle = PAL[idx];
        ctx.fillRect(x * s, y * s, s, s);
      }
    });
  });
}

/* ─── ЗВЁЗДЫ НА ФОНЕ ─────────────────────── */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;` +
      `top:${Math.random()*100}%;` +
      `--d:${(2 + Math.random() * 3).toFixed(1)}s;` +
      `--delay:${(-Math.random() * 4).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* ─── ВЫБОР ПЕРСОНАЖА ────────────────────── */
function selectChar(id) {
  G.char = id;
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.char-card[data-char="${id}"]`).classList.add('selected');
  document.getElementById('btn-start').disabled = false;
}

/* ─── СТАРТ ИГРЫ ─────────────────────────── */
function startGame() {
  if (!G.char) return;

  // Маленький спрайт в шапке
  const hs = document.getElementById('header-sprite-wrap');
  hs.innerHTML = '';
  const hc = document.createElement('canvas');
  drawSprite(hc, G.char, 3);
  hs.appendChild(hc);
  document.getElementById('header-name').textContent = CHARS[G.char].name;

  // Строим поле
  buildBoard();
  drawPath();

  // Фишка игрока
  const pt = document.getElementById('player-token-sprite');
  pt.innerHTML = '';
  const pc = document.createElement('canvas');
  drawSprite(pc, G.char, 4);
  pt.appendChild(pc);

  // Начальная позиция (без анимации)
  setPlayerPos(0, false);

  // Сброс UI
  document.getElementById('btn-roll').disabled = false;
  document.getElementById('dice-msg').textContent = 'Брось кубик!';
  document.getElementById('dice-face').textContent = '?';
  document.getElementById('stage-display').textContent = '0';

  // Переключаем экраны
  document.getElementById('screen-select').classList.remove('active');
  document.getElementById('screen-board').classList.add('active');
}

/* ─── ПОСТРОЕНИЕ ПОЛЯ ────────────────────── */
function buildBoard() {
  const container = document.getElementById('cells-container');
  container.innerHTML = '';

  PATH.forEach((cell, i) => {
    const div = document.createElement('div');
    div.id = `cell-${i}`;
    div.className = 'cell';

    if (i === 0)              div.classList.add('cell-start');
    else if (cell.type === 'stage') div.classList.add('cell-stage');

    div.style.left = cell.l + '%';
    div.style.top  = cell.t + '%';

    // Иконка клетки
    if (i === 0)                    div.textContent = '🏠';
    else if (cell.type === 'stage') div.textContent = '⭐';
    else                            div.textContent = i;

    container.appendChild(div);
  });
}

/* ─── SVG МАРШРУТ ────────────────────────── */
// viewBox = "0 0 600 350", l%*6 → x, t%*3.5 → y
function drawPath() {
  const svg = document.getElementById('path-svg');
  const pts = PATH.map(p => `${p.l * 6},${p.t * 3.5}`).join(' ');
  svg.innerHTML = `
    <polyline
      points="${pts}"
      fill="none"
      stroke="#C8A84B"
      stroke-width="7"
      stroke-dasharray="14 9"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.65"
    />`;
}

/* ─── ПОЗИЦИЯ ФИШКИ ──────────────────────── */
function setPlayerPos(idx, animate = true) {
  const cell  = PATH[idx];
  const token = document.getElementById('player-token');
  token.style.transition = animate
    ? 'left .45s cubic-bezier(.34,1.56,.64,1), top .45s cubic-bezier(.34,1.56,.64,1)'
    : 'none';
  token.style.left = cell.l + '%';
  token.style.top  = cell.t + '%';
}

/* ─── БРОСОК КУБИКА ──────────────────────── */
function rollDice() {
  if (G.rolling) return;
  G.rolling = true;
  document.getElementById('btn-roll').disabled = true;

  const face = document.getElementById('dice-face');
  const dice = document.getElementById('dice');
  const msg  = document.getElementById('dice-msg');

  dice.classList.add('rolling');
  msg.textContent = 'Бросаем...';

  let ticks = 0;
  const iv = setInterval(() => {
    face.textContent = Math.ceil(Math.random() * 6);
    if (++ticks >= 15) {
      clearInterval(iv);
      const roll = Math.ceil(Math.random() * 6);
      face.textContent = roll;
      dice.classList.remove('rolling');
      msg.textContent = `Выпало: ${roll}! Идём!`;
      movePlayer(roll);
    }
  }, 65);
}

/* ─── ДВИЖЕНИЕ ФИШКИ ─────────────────────── */
async function movePlayer(steps) {
  const token = document.getElementById('player-token');

  for (let i = 0; i < steps; i++) {
    await sleep(360);
    if (G.pos >= TOTAL - 1) break;

    G.pos++;
    setPlayerPos(G.pos);

    // Пометить пройденную клетку
    const prev = document.getElementById(`cell-${G.pos - 1}`);
    if (prev && !prev.classList.contains('cell-stage') && !prev.classList.contains('cell-start')) {
      prev.classList.add('cell-visited');
    }

    // Анимация прыжка
    token.classList.remove('hop');
    void token.offsetWidth; // reflow для сброса анимации
    token.classList.add('hop');
  }

  await sleep(420);

  // Проверка: финиш?
  if (G.pos >= TOTAL - 1) {
    triggerWin();
    return;
  }

  // Проверка: этап?
  const cell = PATH[G.pos];
  if (cell.type === 'stage' && !G.stages[cell.stage - 1]) {
    triggerStage(cell.stage);
    return;
  }

  // Продолжаем ход
  resumeDice('Твой ход!');
}

/* ─── ЭТАПЫ ──────────────────────────────── */
function triggerStage(n) {
  if (n === 1) openStage1();
  else if (n === 2) openStage2();
  else             triggerWin();
}

/* ══ ЭТАП 1: Вопрос → Бабочки ══ */
function openStage1() {
  // Сбрасываем фазы
  document.getElementById('s1-question').classList.remove('hidden');
  document.getElementById('s1-butterflies').classList.add('hidden');
  document.querySelectorAll('.answer-btn').forEach(b => {
    b.disabled = false;
    b.classList.remove('picked');
  });
  document.getElementById('overlay-s1').classList.remove('hidden');
}

function pickAnswer(btn) {
  // Все ответы правильные — просто радуемся
  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
  btn.classList.add('picked');
  setTimeout(() => {
    document.getElementById('s1-question').classList.add('hidden');
    startButterflies();
  }, 750);
}

/* ══ МИНИ-ИГРА: БАБОЧКИ ══ */
function startButterflies() {
  G.butterfliesCaught = 0;
  document.getElementById('caught').textContent  = '0';
  document.getElementById('btotal').textContent  = G.TOTAL_BUTTERFLIES;
  document.getElementById('bwin').classList.add('hidden');
  document.getElementById('s1-butterflies').classList.remove('hidden');

  const field = document.getElementById('bfield');
  field.innerHTML = '';

  // Небольшая задержка, чтобы DOM отрисовал field перед замером размеров
  setTimeout(() => {
    const fW = field.clientWidth  || 320;
    const fH = field.clientHeight || 200;
    const emojis = ['🦋','🦋','🦋','🌸','🦋','🦋','🌼','🦋'];

    for (let i = 0; i < G.TOTAL_BUTTERFLIES; i++) {
      const b = document.createElement('div');
      b.className = 'butterfly';
      b.textContent = emojis[i];

      // Случайная позиция в поле (с отступом от краёв)
      b.style.left = (8 + Math.random() * (fW - 56)) + 'px';
      b.style.top  = (8 + Math.random() * (fH - 50)) + 'px';

      // Разная скорость и задержка анимации полёта
      b.style.setProperty('--dur', (2.5 + Math.random() * 2.5).toFixed(1) + 's');
      b.style.setProperty('--dly', (-Math.random() * 3).toFixed(1) + 's');

      // Обработчики клика / тапа
      b.addEventListener('click', () => catchButterfly(b));
      b.addEventListener('touchstart', e => {
        e.preventDefault();
        catchButterfly(b);
      }, { passive: false });

      field.appendChild(b);
    }
  }, 60);
}

function catchButterfly(b) {
  if (b.classList.contains('caught')) return;
  b.classList.add('caught');
  G.butterfliesCaught++;
  document.getElementById('caught').textContent = G.butterfliesCaught;

  // Удаляем после анимации исчезновения
  setTimeout(() => b.remove(), 360);

  // Все пойманы?
  if (G.butterfliesCaught >= G.TOTAL_BUTTERFLIES) {
    setTimeout(() => {
      document.getElementById('bwin').classList.remove('hidden');
    }, 420);
  }
}

function finishStage1() {
  G.stages[0] = true;
  document.getElementById('stage-display').textContent = '1';
  document.getElementById('overlay-s1').classList.add('hidden');
  resumeDice('Этап 1 пройден! 🎉');
}

/* ══ ЭТАП 2: ЗАГЛУШКА ══ */
function openStage2() {
  document.getElementById('overlay-s2').classList.remove('hidden');
}

function finishStage2() {
  G.stages[1] = true;
  document.getElementById('stage-display').textContent = '2';
  document.getElementById('overlay-s2').classList.add('hidden');
  resumeDice('Этап 2 пройден! 🎉');
}

/* ─── ПОБЕДА ─────────────────────────────── */
function triggerWin() {
  // Рисуем большой спрайт
  const ws = document.getElementById('win-sprite-wrap');
  ws.innerHTML = '';
  if (G.char) {
    const c = document.createElement('canvas');
    drawSprite(c, G.char, 9);
    ws.appendChild(c);
  }
  document.getElementById('overlay-win').classList.remove('hidden');
}

/* ─── СБРОС ИГРЫ ─────────────────────────── */
function resetGame() {
  // Сбрасываем состояние
  G.char = null;
  G.pos  = 0;
  G.rolling = false;
  G.stages  = [false, false, false];
  G.butterfliesCaught = 0;

  // Скрываем все оверлеи
  ['overlay-win', 'overlay-s1', 'overlay-s2'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );

  // Возвращаемся на выбор персонажа
  document.getElementById('screen-board').classList.remove('active');
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btn-start').disabled = true;
  document.getElementById('screen-select').classList.add('active');
}

/* ─── ВСПОМОГАТЕЛЬНЫЕ ────────────────────── */
function resumeDice(msg = 'Твой ход!') {
  G.rolling = false;
  document.getElementById('btn-roll').disabled = false;
  document.getElementById('dice-msg').textContent = msg;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─── ИНИЦИАЛИЗАЦИЯ ──────────────────────── */
function init() {
  makeStars();

  // Рисуем спрайты на экране выбора
  [1, 2, 3].forEach(id => {
    const wrap = document.getElementById(`sprite-wrap-${id}`);
    const c = document.createElement('canvas');
    drawSprite(c, id, 6);
    wrap.appendChild(c);
  });
}

window.addEventListener('DOMContentLoaded', init);
