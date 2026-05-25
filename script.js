/* ═══════════════════════════════════════════
   PIXEL PRINCESS ADVENTURE — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ─── */
const G = {
  wife: null,
  daughter: null,
  stagesDone: [false, false, false, false],
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ══════════════════════════════════════════
   СПРАЙТЫ — точные размеры кадра

   wife.png    853×575  → 3 персонажа по 284px
   daughter    1344×896 → 3 персонажа по 448px

   Для каждого контекста:
     background-size  = ширина_блока × 3
     background-pos-x = -(id-1) × ширина_блока
   ══════════════════════════════════════════ */
const CTX_W = {
  card:   120,   // карточка выбора
  header:  28,   // шапка
  token:   44,   // токен на поле
  field:   60,   // поле бабочек
  win:     90,   // экран победы
};

function setSprite(el, src, charId, ctx) {
  if (!el) return;
  const w   = CTX_W[ctx];
  const ofx = (charId - 1) * w;
  el.style.backgroundImage    = `url('${src}')`;
  el.style.backgroundSize     = `${w * 3}px auto`;
  el.style.backgroundPosition = `-${ofx}px 0px`;
  el.style.backgroundRepeat   = 'no-repeat';
}

/* Для всех карточек выбора сразу */
function initSelectCards() {
  [1, 2, 3].forEach(id => {
    setSprite(document.getElementById(`w-img-${id}`), 'wife.png',     id, 'card');
    setSprite(document.getElementById(`d-img-${id}`), 'daughter.png', id, 'card');
  });
}

/* ─── ЗВЁЗДЫ ─── */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `--d:${(2 + Math.random()*3).toFixed(1)}s;` +
      `--dl:${(-Math.random()*4).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* ══════════════════════════════════════════
   ЭКРАН 1: ВЫБОР ЖЕНЫ
   ══════════════════════════════════════════ */
function selectWife(id) {
  G.wife = id;
  document.querySelectorAll('#screen-wife .char-card')
          .forEach(c => c.classList.remove('picked'));
  document.querySelector(`#screen-wife .char-card[data-id="${id}"]`)
          .classList.add('picked');
  document.getElementById('btn-wife-next').disabled = false;
}

function goToDaughter() {
  if (!G.wife) return;
  show('screen-daughter');
}

function backToWife() {
  show('screen-wife');
}

/* ══════════════════════════════════════════
   ЭКРАН 2: ВЫБОР НАПАРНИЦЫ
   ══════════════════════════════════════════ */
function selectDaughter(id) {
  G.daughter = id;
  document.querySelectorAll('.d-card')
          .forEach(c => c.classList.remove('picked'));
  document.querySelector(`.d-card[data-id="${id}"]`)
          .classList.add('picked');
  document.getElementById('btn-start').disabled = false;
}

/* ══════════════════════════════════════════
   СТАРТ ИГРЫ
   ══════════════════════════════════════════ */
function startGame() {
  if (!G.wife || !G.daughter) return;

  /* Шапка */
  setSprite(document.getElementById('hdr-wife'),   'wife.png',     G.wife,     'header');
  setSprite(document.getElementById('hdr-daught'), 'daughter.png', G.daughter, 'header');
  document.getElementById('hdr-name').textContent =
    ['Повседневная','Путешественница','Элегантная'][G.wife - 1];

  /* Токен на поле */
  setSprite(document.getElementById('token-sprite'), 'wife.png', G.wife, 'token');

  /* Изометрическое поле */
  drawBoard();
  updateButtons();

  show('screen-board');
}

/* ══════════════════════════════════════════
   ИЗОМЕТРИЧЕСКОЕ ПОЛЕ (Canvas)
   ══════════════════════════════════════════ */
const TILE_W = 80, TILE_H = 40, OX = 310, OY = 20;

function isoXY(c, r) {
  return {
    x: OX + (c - r) * (TILE_W / 2),
    y: OY + (c + r) * (TILE_H / 2),
  };
}

/* Тип каждого тайла */
const TILE_MAP = {
  // PATH
  '0,2':'path','1,2':'path','2,2':'path','3,2':'path','4,2':'path',
  '4,1':'path','5,2':'path','5,3':'path',
  '4,4':'path','3,4':'path','2,4':'path','1,5':'path',
  // ЭТАПЫ
  '5,1':'s1','5,4':'s2','1,4':'s3','1,6':'s4',
  // ДЕРЕВЬЯ
  '0,0':'tree','1,0':'tree','2,0':'tree','3,0':'tree',
  '4,0':'tree','5,0':'tree','6,0':'tree',
  '0,1':'tree','6,1':'tree','0,3':'tree',
  '6,2':'tree','6,3':'tree','0,4':'tree','6,4':'tree',
  '0,5':'tree','6,5':'tree','0,6':'tree','6,6':'tree',
  // ВОДА
  '3,3':'water','4,3':'water',
  // ЦВЕТЫ
  '1,1':'flower','2,1':'flower','3,1':'flower',
  '1,3':'flower','2,3':'flower',
  '2,5':'flower','3,5':'flower','4,5':'flower','5,5':'flower',
  '2,6':'flower','3,6':'flower','4,6':'flower','5,6':'flower',
};

/* Цвет платформы этапа по состоянию */
function stageCol(key) {
  const i = { s1:0, s2:1, s3:2, s4:3 }[key];
  if (G.stagesDone[i])  return {top:'#7CC85A',lft:'#4A9030',rgt:'#5CAA40',brd:'#2D7A20'};
  if (isNextStage(i))   return {top:'#FFD166',lft:'#C0A030',rgt:'#D8B040',brd:'#8B7000'};
  return                       {top:'#C0C0C0',lft:'#888',   rgt:'#A0A0A0',brd:'#666'};
}
function isNextStage(i) {
  for (let j = 0; j < i; j++) if (!G.stagesDone[j]) return false;
  return !G.stagesDone[i];
}

/* ─── Рисование тайлов ─── */
function drawDiamond(ctx, x, y, fill, stroke) {
  const hw = TILE_W / 2, hh = TILE_H / 2;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + hw, y + hh);
  ctx.lineTo(x, y + TILE_H); ctx.lineTo(x - hw, y + hh);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.7; ctx.stroke(); }
}

function drawPlatform(ctx, x, y, col) {
  const hw = TILE_W / 2, hh = TILE_H / 2, bH = 18;
  // Левая грань
  ctx.beginPath();
  ctx.moveTo(x - hw, y + hh - bH); ctx.lineTo(x, y + TILE_H - bH);
  ctx.lineTo(x, y + TILE_H);       ctx.lineTo(x - hw, y + hh);
  ctx.closePath(); ctx.fillStyle = col.lft; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();
  // Правая грань
  ctx.beginPath();
  ctx.moveTo(x + hw, y + hh - bH); ctx.lineTo(x, y + TILE_H - bH);
  ctx.lineTo(x, y + TILE_H);       ctx.lineTo(x + hw, y + hh);
  ctx.closePath(); ctx.fillStyle = col.rgt; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();
  // Верхняя грань
  ctx.beginPath();
  ctx.moveTo(x, y - bH);          ctx.lineTo(x + hw, y + hh - bH);
  ctx.lineTo(x, y + TILE_H - bH); ctx.lineTo(x - hw, y + hh - bH);
  ctx.closePath(); ctx.fillStyle = col.top; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.8; ctx.stroke();
}

function drawTree(ctx, x, y) {
  const base = y + TILE_H - 4, trH = 14;
  // Ствол — левая грань
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(x - 5, base - trH); ctx.lineTo(x, base - trH + 3);
  ctx.lineTo(x, base + 2);       ctx.lineTo(x - 5, base);
  ctx.closePath(); ctx.fill();
  // Ствол — правая грань
  ctx.fillStyle = '#4E342E';
  ctx.beginPath();
  ctx.moveTo(x + 5, base - trH); ctx.lineTo(x, base - trH + 3);
  ctx.lineTo(x, base + 2);       ctx.lineTo(x + 5, base);
  ctx.closePath(); ctx.fill();
  // Крона — внешняя
  const lY = base - trH;
  ctx.fillStyle = '#3A6B28';
  ctx.beginPath();
  ctx.moveTo(x, lY - 24); ctx.lineTo(x + 18, lY - 3);
  ctx.lineTo(x, lY + 6);  ctx.lineTo(x - 18, lY - 3);
  ctx.closePath(); ctx.fill();
  // Крона — внутренняя (светлее)
  ctx.fillStyle = '#4E8C35';
  ctx.beginPath();
  ctx.moveTo(x, lY - 16); ctx.lineTo(x + 12, lY);
  ctx.lineTo(x, lY + 5);  ctx.lineTo(x - 12, lY);
  ctx.closePath(); ctx.fill();
}

function drawFlowerDots(ctx, x, y) {
  [[-14,14,'#FF8FAB'], [-4,18,'#FFD166'], [10,12,'#FF8FAB'], [16,20,'#A3B856']]
    .forEach(([dx, dy, c]) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2); ctx.fill();
    });
}

function drawWater(ctx, x, y) {
  drawDiamond(ctx, x, y, '#4A9BB8', '#3A8BA8');
  ctx.fillStyle = 'rgba(180,230,255,.45)';
  ctx.beginPath(); ctx.ellipse(x - 10, y + TILE_H / 2 - 4, 8, 3, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 8,  y + TILE_H / 2 + 2, 6, 2,  0.2, 0, Math.PI * 2); ctx.fill();
}

/* ─── Главная отрисовка поля ─── */
function drawBoard() {
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Фон
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, '#E8F4FD'); bg.addColorStop(1, '#D8EDA8');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Алгоритм художника: рисуем по диагоналям (col+row по возрастанию)
  for (let sum = 0; sum < 13; sum++) {
    for (let c = 0; c < 7; c++) {
      const r = sum - c;
      if (r < 0 || r > 6) continue;
      const key  = `${c},${r}`;
      const type = TILE_MAP[key] || 'grass';
      const { x, y } = isoXY(c, r);

      // Базовый тайл
      if      (type === 'path')          drawDiamond(ctx, x, y, '#C8A84B', '#A89030');
      else if (type === 'water')         drawWater(ctx, x, y);
      else if (type === 'flower')      { drawDiamond(ctx, x, y, '#8AAA42', '#7A9A32'); drawFlowerDots(ctx, x, y); }
      else if (type.startsWith('s'))     drawDiamond(ctx, x, y, '#C8A84B', '#A89030');
      else                               drawDiamond(ctx, x, y, '#7A9A3A', '#6A8A2A');

      // Объёмные элементы
      if (type === 'tree') {
        drawTree(ctx, x, y);
      } else if (type.startsWith('s')) {
        const col = stageCol(type);
        drawPlatform(ctx, x, y, col);
        // Иконка этапа
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const icons = { s1:'⭐', s2:'🍽', s3:'❓', s4:'🏆' };
        ctx.fillText(icons[type], x, y + TILE_H / 2 - 20);
      }
    }
  }
}

/* ══════════════════════════════════════════
   НАВИГАЦИЯ ПО ЭТАПАМ
   ══════════════════════════════════════════ */
function goToStage(n) {
  // Проверяем, что предыдущие пройдены
  for (let i = 0; i < n - 1; i++) {
    if (!G.stagesDone[i]) { flashBtn(n); return; }
  }
  if (G.stagesDone[n - 1]) return; // уже пройден

  if      (n === 1) openS1();
  else if (n === 2) openS2();
  else if (n === 3) openS3();
  else              triggerWin();
}

function flashBtn(n) {
  const btn = document.getElementById(`sbtn-${n}`);
  btn.style.background = '#FF8FAB';
  setTimeout(() => (btn.style.background = ''), 400);
}

function updateButtons() {
  [1, 2, 3, 4].forEach(n => {
    const i   = n - 1;
    const btn = document.getElementById(`sbtn-${n}`);
    btn.className =
      'stage-btn ' +
      (G.stagesDone[i] ? 's-done' : isNextStage(i) ? 's-active' : 's-locked');
  });
  document.getElementById('stages-done').textContent =
    G.stagesDone.filter(Boolean).length;
  drawBoard();
}

/* ══════════════════════════════════════════
   ЭТАП 1: ЗАГАДКА
   ══════════════════════════════════════════ */
function openS1() {
  document.getElementById('phase-riddle').classList.remove('hidden');
  document.getElementById('phase-catch').classList.add('hidden');
  const inp = document.getElementById('riddle-input');
  inp.value = ''; inp.disabled = false; inp.classList.remove('shake');
  const fb = document.getElementById('riddle-fb');
  fb.textContent = ''; fb.className = 'riddle-fb';
  document.getElementById('overlay-s1').classList.remove('hidden');
}

function checkRiddle() {
  const val = document.getElementById('riddle-input').value.trim().toLowerCase();
  const inp = document.getElementById('riddle-input');
  const fb  = document.getElementById('riddle-fb');

  if (val.includes('картин')) {
    fb.textContent = 'Верно! 🎉 Теперь лови бабочек!';
    fb.className   = 'riddle-fb ok';
    inp.disabled   = true;
    setTimeout(startCatchGame, 900);
  } else {
    fb.textContent = 'Не угадала... попробуй ещё! 🤔';
    fb.className   = 'riddle-fb bad';
    inp.classList.remove('shake');
    void inp.offsetWidth; // reflow
    inp.classList.add('shake');
  }
}

/* ══════════════════════════════════════════
   ЭТАП 1: МИНИ-ИГРА «БАБОЧКИ»
   ══════════════════════════════════════════ */
function startCatchGame() {
  G.butterfliesCaught = 0;
  document.getElementById('caught-n').textContent = '0';
  document.getElementById('total-n').textContent  = G.TOTAL_BUTTERFLIES;
  document.getElementById('catch-win').classList.add('hidden');
  document.getElementById('phase-riddle').classList.add('hidden');
  document.getElementById('phase-catch').classList.remove('hidden');

  // Показываем выбранную напарницу в поле
  const fd = document.getElementById('field-daught');
  setSprite(fd, 'daughter.png', G.daughter, 'field');

  // Убираем старые летающие объекты
  const field = document.getElementById('catch-field');
  [...field.querySelectorAll('.fly-obj')].forEach(el => el.remove());

  setTimeout(() => {
    const fW = field.clientWidth  || 340;
    const fH = field.clientHeight || 210;

    // 8 бабочек (цель)
    for (let i = 0; i < G.TOTAL_BUTTERFLIES; i++) {
      spawnObj(field, fW, fH, '🦋', true);
    }
    // 6 ложных объектов (не трогать)
    ['🌸', '⭐', '🍃', '🌼', '🐝', '☁️'].forEach(em =>
      spawnObj(field, fW, fH, em, false)
    );
  }, 80);
}

function spawnObj(field, fW, fH, emoji, isBfly) {
  const el = document.createElement('div');
  el.className  = 'fly-obj' + (isBfly ? ' butterfly' : '');
  el.textContent = emoji;
  // Позиция — не перекрываем зону напарницы справа-снизу
  el.style.left = (5  + Math.random() * (fW - 75)) + 'px';
  el.style.top  = (5  + Math.random() * (fH - 55)) + 'px';
  el.style.setProperty('--dur', (2.2 + Math.random() * 2.8).toFixed(1) + 's');
  el.style.setProperty('--dly', (-Math.random() * 3).toFixed(1) + 's');

  el.addEventListener('click', () => isBfly ? catchButterfly(el) : wrongClick(el));
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    isBfly ? catchButterfly(el) : wrongClick(el);
  }, { passive: false });

  field.appendChild(el);
}

function catchButterfly(el) {
  if (el.classList.contains('caught')) return;
  el.classList.add('caught');
  G.butterfliesCaught++;
  document.getElementById('caught-n').textContent = G.butterfliesCaught;
  setTimeout(() => el.remove(), 360);
  if (G.butterfliesCaught >= G.TOTAL_BUTTERFLIES) {
    setTimeout(() =>
      document.getElementById('catch-win').classList.remove('hidden'), 450);
  }
}

function wrongClick(el) {
  // Объект остаётся, просто мигает
  el.classList.remove('wrong-flash');
  void el.offsetWidth;
  el.classList.add('wrong-flash');
  setTimeout(() => el.classList.remove('wrong-flash'), 430);
}

function completeS1() {
  G.stagesDone[0] = true;
  document.getElementById('overlay-s1').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 2: РЕСТОРАН
   ══════════════════════════════════════════ */
function openS2() {
  document.getElementById('rest-row').style.opacity      = '1';
  document.getElementById('rest-row').style.pointerEvents = '';
  document.getElementById('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  document.getElementById('overlay-s2').classList.remove('hidden');
}

function pickRest(card, name) {
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  card.classList.add('chosen');
  document.getElementById('rest-row').style.opacity      = '0.5';
  document.getElementById('rest-row').style.pointerEvents = 'none';
  document.getElementById('chosen-name').textContent = name;
  document.getElementById('rest-chosen').classList.remove('hidden');
}

function completeS2() {
  G.stagesDone[1] = true;
  document.getElementById('overlay-s2').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 3: ЗАГЛУШКА
   ══════════════════════════════════════════ */
function openS3() {
  document.getElementById('overlay-s3').classList.remove('hidden');
}
function completeS3() {
  G.stagesDone[2] = true;
  document.getElementById('overlay-s3').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ФИНИШ
   ══════════════════════════════════════════ */
function triggerWin() {
  G.stagesDone[3] = true;
  updateButtons();
  setSprite(document.getElementById('win-wife'),   'wife.png',     G.wife,     'win');
  setSprite(document.getElementById('win-daught'), 'daughter.png', G.daughter, 'win');
  document.getElementById('overlay-win').classList.remove('hidden');
}

/* ══════════════════════════════════════════
   СБРОС ИГРЫ
   ══════════════════════════════════════════ */
function resetGame() {
  G.wife = null; G.daughter = null;
  G.stagesDone = [false, false, false, false];
  G.butterfliesCaught = 0;

  ['overlay-win', 'overlay-s1', 'overlay-s2', 'overlay-s3'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('picked'));
  document.getElementById('btn-wife-next').disabled = true;
  document.getElementById('btn-start').disabled     = true;
  show('screen-wife');
}

/* ─── УТИЛИТЫ ─── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ══════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ══════════════════════════════════════════ */
function init() {
  makeStars();
  initSelectCards();
}

window.addEventListener('DOMContentLoaded', init);
