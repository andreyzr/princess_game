/* ═══════════════════════════════════════════
   PIXEL PRINCESS ADVENTURE — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ────────────────────────────── */
const G = {
  char: null,
  stagesDone: [false, false, false, false],
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ─── ПЕРСОНАЖИ (жена, 3 образа) ──────────── */
// Цветовые индексы пиксель-сетки:
// 0=прозрачный  1=волосы  2=топ  3=кожа  4=глаз
// 5=рот         6=обувь   7=низ  8=пояс/акцент
const CHARS = {
  1: { name:'Повседневная',
       hair:'#6D3A1F', top:'#F0ECD8', bot:'#6B9AC4',
       skin:'#FDBCB4', shoe:'#DEDBC8', eye:'#2D7A3A',
       belt:'#5D4037', mouth:'#E17055' },
  2: { name:'Путешественница',
       hair:'#6D3A1F', top:'#4A6741', bot:'#6B4C35',
       skin:'#FDBCB4', shoe:'#3A2510', eye:'#2D7A3A',
       belt:'#8B6030', mouth:'#E17055' },
  3: { name:'Элегантная',
       hair:'#6D3A1F', top:'#C4A882', bot:'#2D2D3D',
       skin:'#FDBCB4', shoe:'#1A1A2A', eye:'#2D7A3A',
       belt:'#8B7050', mouth:'#E17055' },
};

/* Пиксельная сетка персонажа 10×15.
   Индексы: 0=прозр, 1=hair, 2=top, 3=skin,
            4=eye,   5=mouth,6=shoe,7=bot, 8=belt/accent */
const SPRITE_GRID = [
  [0,0,1,1,1,1,1,0,0,0], //  0  верхушка волос
  [0,1,1,1,1,1,1,1,0,0], //  1  волосы
  [1,1,3,3,3,3,3,1,0,0], //  2  волосы + лицо
  [0,0,3,4,3,4,3,0,0,0], //  3  глаза
  [0,0,3,3,3,3,3,0,0,0], //  4  щёки
  [0,0,3,5,3,3,3,0,0,0], //  5  рот
  [0,0,0,3,3,3,0,0,0,0], //  6  шея
  [0,2,2,2,2,2,2,0,0,0], //  7  плечи (топ)
  [2,2,2,2,2,2,2,2,0,0], //  8  торс
  [0,2,8,8,8,8,2,0,0,0], //  9  пояс
  [0,0,7,7,7,7,0,0,0,0], // 10  бёдра (низ)
  [0,0,7,7,0,7,7,0,0,0], // 11  ноги
  [0,0,7,7,0,7,7,0,0,0], // 12  ноги
  [0,0,3,0,0,0,3,0,0,0], // 13  лодыжки
  [0,6,6,0,0,0,6,6,0,0], // 14  обувь
];

/**
 * Рисует спрайт жены на canvas.
 * s = размер 1 пикселя в экранных px.
 */
function drawSprite(canvas, charId, s) {
  const c   = CHARS[charId];
  const PAL = [null, c.hair, c.top, c.skin, c.eye, c.mouth, c.shoe, c.bot, c.belt];
  const ctx = canvas.getContext('2d');
  canvas.width  = SPRITE_GRID[0].length * s;
  canvas.height = SPRITE_GRID.length    * s;
  ctx.imageSmoothingEnabled = false;
  SPRITE_GRID.forEach((row, y) =>
    row.forEach((idx, x) => {
      if (PAL[idx]) { ctx.fillStyle = PAL[idx]; ctx.fillRect(x*s, y*s, s, s); }
    })
  );
}

/* ─── ДОЧЬ ─────────────────────────────────── */
// Сетка малышки (9×12, пухленькие пропорции)
const DAUGHTER_GRID = [
  [0,0,1,1,1,1,0,0,0], //  0  хвостики
  [0,1,1,1,1,1,1,0,0], //  1
  [1,1,3,3,3,3,1,0,0], //  2
  [0,0,3,4,3,4,3,0,0], //  3  голубые глаза
  [0,0,3,3,3,3,0,0,0], //  4
  [0,0,0,3,5,0,0,0,0], //  5  рот
  [0,2,2,2,2,2,0,0,0], //  6  куртка
  [2,2,2,2,2,2,2,0,0], //  7
  [0,0,7,7,7,7,0,0,0], //  8  штаны
  [0,0,7,7,7,7,0,0,0], //  9
  [0,0,6,0,0,6,0,0,0], // 10  ноги
  [0,6,6,0,0,6,6,0,0], // 11  кроссовки
];
const DAUGHTER_PAL = [
  null,
  '#F9A825', // 1 hair (blonde)
  '#F9A825', // 2 top (yellow jacket)
  '#FDBCB4', // 3 skin
  '#4A90D9', // 4 eye (blue)
  '#E17055', // 5 mouth
  '#A78BFA', // 6 shoe (purple)
  '#8B5CF6', // 7 bot (purple pants)
];

function drawDaughter(canvas, s) {
  const ctx = canvas.getContext('2d');
  canvas.width  = DAUGHTER_GRID[0].length * s;
  canvas.height = DAUGHTER_GRID.length    * s;
  ctx.imageSmoothingEnabled = false;
  DAUGHTER_GRID.forEach((row, y) =>
    row.forEach((idx, x) => {
      if (DAUGHTER_PAL[idx]) { ctx.fillStyle = DAUGHTER_PAL[idx]; ctx.fillRect(x*s, y*s, s, s); }
    })
  );
}

/* ─── ЗВЁЗДЫ ────────────────────────────────── */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;`+
      `--d:${(2+Math.random()*3).toFixed(1)}s;--dl:${(-Math.random()*4).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* ─── ВЫБОР ПЕРСОНАЖА ───────────────────────── */
function selectChar(id) {
  G.char = id;
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`.char-card[data-char="${id}"]`).classList.add('picked');
  document.getElementById('btn-start').disabled = false;
}

/* ─── СТАРТ ─────────────────────────────────── */
function startGame() {
  if (!G.char) return;

  // Шапка
  drawSprite(document.getElementById('cv-header'), G.char, 3);
  document.getElementById('header-name-lbl').textContent = CHARS[G.char].name;

  // Токен на поле
  drawSprite(document.getElementById('cv-token'), G.char, 3);

  // Строим изометрическое поле
  drawBoard();

  // Переключаем экраны
  document.getElementById('screen-select').classList.remove('active');
  document.getElementById('screen-board').classList.add('active');
}

/* ══════════════════════════════════════════════
   ИЗОМЕТРИЧЕСКОЕ ПОЛЕ
   ══════════════════════════════════════════════ */
const TILE_W  = 80;   // ширина клетки
const TILE_H  = 40;   // высота клетки
const OX      = 310;  // origin x
const OY      = 20;   // origin y
const GRID_W  = 7;
const GRID_H  = 7;

function isoXY(c, r) {
  return {
    x: OX + (c - r) * (TILE_W / 2),
    y: OY + (c + r) * (TILE_H / 2),
  };
}

/* Карта тайлов: 'path'|'s1'|'s2'|'s3'|'s4'|'tree'|'water'|'flower' | undefined=grass */
const TILE_MAP = {
  // Путь (ортогональные шаги)
  '0,2':'path','1,2':'path','2,2':'path','3,2':'path','4,2':'path',
  '4,1':'path',
  '5,2':'path','5,3':'path',
  '4,4':'path','3,4':'path','2,4':'path',
  '1,5':'path',
  // Этапы
  '5,1':'s1','5,4':'s2','1,4':'s3','1,6':'s4',
  // Деревья (края карты)
  '0,0':'tree','1,0':'tree','2,0':'tree','3,0':'tree','4,0':'tree','5,0':'tree','6,0':'tree',
  '0,1':'tree','6,1':'tree',
  '0,3':'tree','6,2':'tree','6,3':'tree',
  '0,4':'tree','6,4':'tree',
  '0,5':'tree','6,5':'tree',
  '0,6':'tree','6,6':'tree',
  // Вода (пруд)
  '3,3':'water','4,3':'water',
  // Цветочные полянки
  '1,1':'flower','2,1':'flower','3,1':'flower',
  '1,3':'flower','2,3':'flower',
  '2,5':'flower','3,5':'flower','4,5':'flower','5,5':'flower',
  '2,6':'flower','3,6':'flower','4,6':'flower','5,6':'flower',
};

/* Состояние этапа → цвет платформы */
function stageColors(key) {
  const idx = {s1:0,s2:1,s3:2,s4:3}[key];
  if (G.stagesDone[idx])        return { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' };
  if (isNextStage(idx))         return { top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' };
  return                               { top:'#C0C0C0', lft:'#888',    rgt:'#A0A0A0', brd:'#666' };
}
function isNextStage(idx) {
  for (let i = 0; i < idx; i++) if (!G.stagesDone[i]) return false;
  return !G.stagesDone[idx];
}

/* ─── Отрисовка ромба (плоская клетка) ────── */
function drawDiamond(ctx, x, y, fill, stroke) {
  const hw = TILE_W/2, hh = TILE_H/2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+hw, y+hh);
  ctx.lineTo(x, y+TILE_H);
  ctx.lineTo(x-hw, y+hh);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.7; ctx.stroke(); }
}

/* ─── Платформа этапа (приподнятый куб) ──── */
function drawPlatform(ctx, x, y, col) {
  const hw = TILE_W/2, hh = TILE_H/2;
  const bH = 18; // высота куба

  // Левая грань
  ctx.beginPath();
  ctx.moveTo(x-hw, y+hh-bH); ctx.lineTo(x, y+TILE_H-bH);
  ctx.lineTo(x, y+TILE_H);   ctx.lineTo(x-hw, y+hh);
  ctx.closePath(); ctx.fillStyle = col.lft; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();

  // Правая грань
  ctx.beginPath();
  ctx.moveTo(x+hw, y+hh-bH); ctx.lineTo(x, y+TILE_H-bH);
  ctx.lineTo(x, y+TILE_H);   ctx.lineTo(x+hw, y+hh);
  ctx.closePath(); ctx.fillStyle = col.rgt; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();

  // Верхняя грань
  ctx.beginPath();
  ctx.moveTo(x, y-bH);
  ctx.lineTo(x+hw, y+hh-bH);
  ctx.lineTo(x, y+TILE_H-bH);
  ctx.lineTo(x-hw, y+hh-bH);
  ctx.closePath(); ctx.fillStyle = col.top; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();
}

/* ─── Дерево ─────────────────────────────── */
function drawTree(ctx, x, y) {
  const base = y + TILE_H - 4;
  const trH  = 14;
  // Ствол
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(x-5, base-trH);  ctx.lineTo(x, base-trH+3);
  ctx.lineTo(x, base+2);      ctx.lineTo(x-5, base);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E342E';
  ctx.beginPath();
  ctx.moveTo(x+5, base-trH);  ctx.lineTo(x, base-trH+3);
  ctx.lineTo(x, base+2);      ctx.lineTo(x+5, base);
  ctx.closePath(); ctx.fill();

  // Крона
  const leafY = base - trH;
  ctx.fillStyle = '#3A6B28';
  ctx.beginPath();
  ctx.moveTo(x, leafY-24);
  ctx.lineTo(x+18, leafY-3);
  ctx.lineTo(x, leafY+6);
  ctx.lineTo(x-18, leafY-3);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E8C35';
  ctx.beginPath();
  ctx.moveTo(x, leafY-16);
  ctx.lineTo(x+12, leafY);
  ctx.lineTo(x, leafY+5);
  ctx.lineTo(x-12, leafY);
  ctx.closePath(); ctx.fill();
}

/* ─── Цветки на траве ────────────────────── */
function drawFlowerDots(ctx, x, y) {
  const dots = [[-14,14,'#FF8FAB'],[-4,18,'#FFD166'],[10,12,'#FF8FAB'],[16,20,'#A3B856']];
  dots.forEach(([dx,dy,col]) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x+dx, y+dy, 2.5, 0, Math.PI*2);
    ctx.fill();
  });
}

/* ─── Вода ───────────────────────────────── */
function drawWater(ctx, x, y) {
  const hw = TILE_W/2, hh = TILE_H/2;
  // Тёмная рамка
  drawDiamond(ctx, x, y, '#4A9BB8', '#3A8BA8');
  // Светлые блики
  ctx.fillStyle = 'rgba(180,230,255,.45)';
  ctx.beginPath();
  ctx.ellipse(x-10, y+hh-4, 8, 3, -0.3, 0, Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x+8, y+hh+2, 6, 2, 0.2, 0, Math.PI*2);
  ctx.fill();
}

/* ─── ГЛАВНАЯ ОТРИСОВКА ПОЛЯ ─────────────── */
function drawBoard() {
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Фоновый градиент
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#E8F4FD');
  bg.addColorStop(1, '#D8EDA8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Рисуем тайлы по алгоритму художника (col+row по возрастанию)
  for (let sum = 0; sum < GRID_W + GRID_H - 1; sum++) {
    for (let c = 0; c < GRID_W; c++) {
      const r = sum - c;
      if (r < 0 || r >= GRID_H) continue;

      const key  = `${c},${r}`;
      const type = TILE_MAP[key] || 'grass';
      const {x, y} = isoXY(c, r);

      // 1) Базовый тайл
      if      (type === 'path')   drawDiamond(ctx, x, y, '#C8A84B', '#A89030');
      else if (type === 'water')  drawWater(ctx, x, y);
      else if (type === 'flower') { drawDiamond(ctx, x, y, '#8AAA42', '#7A9A32'); drawFlowerDots(ctx, x, y); }
      else if (type.startsWith('s')) drawDiamond(ctx, x, y, '#C8A84B', '#A89030'); // путь под платформой
      else                        drawDiamond(ctx, x, y, '#7A9A3A', '#6A8A2A');

      // 2) Приподнятые элементы
      if (type === 'tree') {
        drawTree(ctx, x, y);
      } else if (type.startsWith('s')) {
        const col = stageColors(type);
        drawPlatform(ctx, x, y, col);
        // Иконка на платформе
        const bH = 18;
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons = {s1:'⭐',s2:'🍽',s3:'❓',s4:'🏆'};
        ctx.fillText(icons[type] || '?', x, y + TILE_H/2 - bH - 1);
      }
    }
  }
}

/* ─── НАВИГАЦИЯ ПО ЭТАПАМ ─────────────────── */
function goToStage(n) {
  // Проверить: разблокирован ли этап?
  for (let i = 0; i < n-1; i++) {
    if (!G.stagesDone[i]) {
      flashBtn(n); return;
    }
  }
  if (G.stagesDone[n-1]) return; // уже пройден

  if (n === 1) openS1();
  else if (n === 2) openS2();
  else if (n === 3) openS3();
  else if (n === 4) triggerWin();
}

function flashBtn(n) {
  const btn = document.getElementById(`sbtn-${n}`);
  btn.style.background = '#FF8FAB';
  setTimeout(() => btn.style.background = '', 400);
}

function updateButtons() {
  const states = ['s1','s2','s3','s4'];
  states.forEach((_, i) => {
    const btn = document.getElementById(`sbtn-${i+1}`);
    btn.className = 'stage-btn ' +
      (G.stagesDone[i] ? 's-done' : isNextStage(i) ? 's-active' : 's-locked');
  });
  document.getElementById('stages-done').textContent = G.stagesDone.filter(Boolean).length;
  drawBoard(); // перерисовываем с новыми цветами
}

/* ══════════════════════════════════════════════
   ЭТАП 1 — ЗАГАДКА + БАБОЧКИ
   ══════════════════════════════════════════════ */
function openS1() {
  document.getElementById('phase-riddle').classList.remove('hidden');
  document.getElementById('phase-catch').classList.add('hidden');
  const inp = document.getElementById('riddle-input');
  inp.value = ''; inp.classList.remove('shake');
  document.getElementById('riddle-fb').textContent = '';
  document.getElementById('riddle-fb').className = 'riddle-fb';
  document.getElementById('overlay-s1').classList.remove('hidden');
}

function checkRiddle() {
  const val = document.getElementById('riddle-input').value.trim().toLowerCase();
  const inp = document.getElementById('riddle-input');
  const fb  = document.getElementById('riddle-fb');

  if (val.includes('картин')) {
    fb.textContent = 'Верно! 🎉 Теперь — ловим бабочек!';
    fb.className = 'riddle-fb ok';
    inp.disabled = true;
    setTimeout(startCatchGame, 1000);
  } else {
    fb.textContent = 'Не угадала... попробуй ещё! 🤔';
    fb.className = 'riddle-fb bad';
    inp.classList.remove('shake');
    void inp.offsetWidth; // reflow
    inp.classList.add('shake');
  }
}

/* ─── Игра: ловля бабочек ─────────────────── */
function startCatchGame() {
  G.butterfliesCaught = 0;
  document.getElementById('caught-n').textContent = '0';
  document.getElementById('total-n').textContent  = G.TOTAL_BUTTERFLIES;
  document.getElementById('catch-win').classList.add('hidden');
  document.getElementById('phase-riddle').classList.add('hidden');
  document.getElementById('phase-catch').classList.remove('hidden');

  // Рисуем дочь-помощницу
  drawDaughter(document.getElementById('cv-daughter'), 6);

  const field = document.getElementById('catch-field');
  // Удалить старые объекты (кроме дочери)
  [...field.querySelectorAll('.fly-obj')].forEach(el => el.remove());

  setTimeout(() => {
    const fW = field.clientWidth  || 340;
    const fH = field.clientHeight || 200;

    // 8 бабочек
    for (let i = 0; i < G.TOTAL_BUTTERFLIES; i++) {
      spawnObj(field, fW, fH, '🦋', true, i);
    }
    // 6 "не бабочек"
    const decoys = ['🌸','⭐','🍃','🌼','🐝','☁️'];
    decoys.forEach((em, i) => spawnObj(field, fW, fH, em, false, i));
  }, 80);
}

function spawnObj(field, fW, fH, emoji, isButterfly, idx) {
  const el = document.createElement('div');
  el.className  = 'fly-obj' + (isButterfly ? ' butterfly' : ' decoy');
  el.textContent = emoji;
  el.style.left = (8 + Math.random() * (fW - 56)) + 'px';
  el.style.top  = (8 + Math.random() * (fH - 52)) + 'px';
  el.style.setProperty('--dur', (2.2 + Math.random() * 2.8).toFixed(1) + 's');
  el.style.setProperty('--dly', (-Math.random() * 3).toFixed(1)         + 's');

  if (isButterfly) {
    el.addEventListener('click',     () => catchButterfly(el));
    el.addEventListener('touchstart', e => { e.preventDefault(); catchButterfly(el); }, {passive:false});
  } else {
    el.addEventListener('click',     () => wrongClick(el));
    el.addEventListener('touchstart', e => { e.preventDefault(); wrongClick(el); }, {passive:false});
  }
  field.appendChild(el);
}

function catchButterfly(el) {
  if (el.classList.contains('caught')) return;
  el.classList.add('caught');
  G.butterfliesCaught++;
  document.getElementById('caught-n').textContent = G.butterfliesCaught;
  setTimeout(() => el.remove(), 360);
  if (G.butterfliesCaught >= G.TOTAL_BUTTERFLIES) {
    setTimeout(() => document.getElementById('catch-win').classList.remove('hidden'), 450);
  }
}

function wrongClick(el) {
  // Объект продолжает летать, только мигает
  el.classList.remove('wrong-flash');
  void el.offsetWidth;
  el.classList.add('wrong-flash');
  setTimeout(() => el.classList.remove('wrong-flash'), 420);
}

function completeS1() {
  G.stagesDone[0] = true;
  document.getElementById('overlay-s1').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════════
   ЭТАП 2 — РЕСТОРАН
   ══════════════════════════════════════════════ */
function openS2() {
  document.getElementById('rest-row').style.opacity    = '1';
  document.getElementById('rest-row').style.pointerEvents = '';
  document.getElementById('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  document.getElementById('overlay-s2').classList.remove('hidden');
}

function pickRest(card, name) {
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  card.classList.add('chosen');
  document.getElementById('rest-row').style.opacity = '0.5';
  document.getElementById('rest-row').style.pointerEvents = 'none';
  document.getElementById('chosen-name').textContent = name;
  document.getElementById('rest-chosen').classList.remove('hidden');
}

function completeS2() {
  G.stagesDone[1] = true;
  document.getElementById('overlay-s2').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════════
   ЭТАП 3 — ЗАГЛУШКА
   ══════════════════════════════════════════════ */
function openS3() {
  document.getElementById('overlay-s3').classList.remove('hidden');
}
function completeS3() {
  G.stagesDone[2] = true;
  document.getElementById('overlay-s3').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════════
   ФИНИШ
   ══════════════════════════════════════════════ */
function triggerWin() {
  G.stagesDone[3] = true;
  updateButtons();
  if (G.char) drawSprite(document.getElementById('cv-win'), G.char, 8);
  document.getElementById('overlay-win').classList.remove('hidden');
}

/* ─── СБРОС ──────────────────────────────────── */
function resetGame() {
  G.char = null;
  G.stagesDone = [false, false, false, false];
  G.butterfliesCaught = 0;

  ['overlay-win','overlay-s1','overlay-s2','overlay-s3'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
  document.getElementById('screen-board').classList.remove('active');
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('picked'));
  document.getElementById('btn-start').disabled = true;
  document.getElementById('screen-select').classList.add('active');
}

/* ─── ИНИЦИАЛИЗАЦИЯ ─────────────────────────── */
function init() {
  makeStars();
  // Рисуем превью персонажей
  [1,2,3].forEach(id => drawSprite(document.getElementById(`cv-${id}`), id, 6));
}

window.addEventListener('DOMContentLoaded', init);
