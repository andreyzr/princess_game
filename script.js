/* ═══════════════════════════════════════════
   PIXEL PRINCESS ADVENTURE — script.js
   Vertical mobile portrait layout
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ─── */
const G = {
  wife: null, daughter: null,
  stagesDone: [false, false, false, false],
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ─── ФАЙЛЫ ПЕРСОНАЖЕЙ ─── */
const WIFE_SRC   = { 1:'wife-повседневная.png', 2:'wife-путешественница.png', 3:'wife-элегантная.png' };
const WIFE_NAMES = { 1:'Повседневная', 2:'Путешественница', 3:'Элегантная' };
const DAUGHT_SRC = { 1:'daughter-солнышко.png', 2:'daughter-непоседа.png', 3:'daughter-уютная.png' };

/* ══════════════════════════════════════════
   ПОЛЕ — ВЕРТИКАЛЬНЫЙ ЗМЕИНЫЙ МАРШРУТ
   Canvas виртуальный: 360 × 520
   Тайлы: TILE_W=64, TILE_H=32
   ══════════════════════════════════════════ */
const TILE_W = 64, TILE_H = 32;

/* Все точки маршрута: cx/cy — вершина (top-vertex) ромба */
const PATH = [
  { cx:180, cy:22,  type:'start' },  //  0  СТАРТ
  { cx:222, cy:54,  type:'path'  },  //  1
  { cx:258, cy:88,  type:'path'  },  //  2
  { cx:248, cy:128, type:'s1'    },  //  3  ⭐ Этап 1
  { cx:210, cy:162, type:'path'  },  //  4
  { cx:164, cy:192, type:'path'  },  //  5
  { cx:118, cy:222, type:'path'  },  //  6
  { cx:102, cy:262, type:'s2'    },  //  7  🍽 Этап 2
  { cx:142, cy:296, type:'path'  },  //  8
  { cx:192, cy:328, type:'path'  },  //  9
  { cx:238, cy:360, type:'path'  },  // 10
  { cx:252, cy:400, type:'s3'    },  // 11  ❓ Этап 3
  { cx:210, cy:434, type:'path'  },  // 12
  { cx:158, cy:460, type:'path'  },  // 13
  { cx:108, cy:486, type:'s4'    },  // 14  🏆 Финиш
];

/* Позиции персонажей на поле (% от canvas 360×520) */
const CHAR_POS = {
  start: { left:'50%',    top:'4.2%'  },
  s1:    { left:'68.9%',  top:'24.6%' },
  s2:    { left:'28.3%',  top:'50.4%' },
  s3:    { left:'70%',    top:'76.9%' },
  s4:    { left:'30%',    top:'93.5%' },
};

/* Декоративные элементы */
const DECO = [
  { cx:44,  cy:38,  t:'tree'   },
  { cx:310, cy:32,  t:'tree'   },
  { cx:330, cy:80,  t:'tree'   },
  { cx:340, cy:148, t:'tree'   },
  { cx:50,  cy:172, t:'tree'   },
  { cx:318, cy:238, t:'tree'   },
  { cx:42,  cy:330, t:'tree'   },
  { cx:322, cy:342, t:'tree'   },
  { cx:56,  cy:434, t:'tree'   },
  { cx:316, cy:448, t:'tree'   },
  { cx:176, cy:138, t:'water'  },
  { cx:84,  cy:370, t:'water'  },
  { cx:288, cy:178, t:'flower' },
  { cx:128, cy:158, t:'flower' },
  { cx:290, cy:298, t:'flower' },
  { cx:152, cy:452, t:'flower' },
];

/* ── Цвета платформы этапа ── */
function stageColor(key) {
  const i = { s1:0, s2:1, s3:2, s4:3 }[key];
  if (G.stagesDone[i]) return { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' };
  if (isNext(i))       return { top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' };
  return                      { top:'#C8C8C8', lft:'#888888', rgt:'#A8A8A8', brd:'#666666' };
}
function isNext(i) {
  for (let j = 0; j < i; j++) if (!G.stagesDone[j]) return false;
  return !G.stagesDone[i];
}

/* ══════════════════════════════════════════
   ОТРИСОВКА ПОЛЯ
   ══════════════════════════════════════════ */
function drawDiamond(ctx, cx, cy, fill, stroke) {
  const hw = TILE_W/2, hh = TILE_H/2;
  ctx.beginPath();
  ctx.moveTo(cx,    cy);
  ctx.lineTo(cx+hw, cy+hh);
  ctx.lineTo(cx,    cy+TILE_H);
  ctx.lineTo(cx-hw, cy+hh);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.stroke(); }
}

function drawPlatform(ctx, cx, cy, col) {
  const hw = TILE_W/2, hh = TILE_H/2, bH = 12;
  // Левая грань
  ctx.beginPath();
  ctx.moveTo(cx-hw, cy+hh-bH); ctx.lineTo(cx, cy+TILE_H-bH);
  ctx.lineTo(cx,    cy+TILE_H); ctx.lineTo(cx-hw, cy+hh);
  ctx.closePath(); ctx.fillStyle = col.lft; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.7; ctx.stroke();
  // Правая грань
  ctx.beginPath();
  ctx.moveTo(cx+hw, cy+hh-bH); ctx.lineTo(cx, cy+TILE_H-bH);
  ctx.lineTo(cx,    cy+TILE_H); ctx.lineTo(cx+hw, cy+hh);
  ctx.closePath(); ctx.fillStyle = col.rgt; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.7; ctx.stroke();
  // Верхняя грань
  ctx.beginPath();
  ctx.moveTo(cx,    cy-bH);          ctx.lineTo(cx+hw, cy+hh-bH);
  ctx.lineTo(cx,    cy+TILE_H-bH);   ctx.lineTo(cx-hw, cy+hh-bH);
  ctx.closePath(); ctx.fillStyle = col.top; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.7; ctx.stroke();
}

function drawTree(ctx, cx, cy) {
  const base = cy + TILE_H - 2, trH = 12;
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(cx-4, base-trH); ctx.lineTo(cx, base-trH+3);
  ctx.lineTo(cx,   base+1);   ctx.lineTo(cx-4, base);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E342E';
  ctx.beginPath();
  ctx.moveTo(cx+4, base-trH); ctx.lineTo(cx, base-trH+3);
  ctx.lineTo(cx,   base+1);   ctx.lineTo(cx+4, base);
  ctx.closePath(); ctx.fill();
  const ly = base - trH;
  ctx.fillStyle = '#3A6B28';
  ctx.beginPath();
  ctx.moveTo(cx, ly-20); ctx.lineTo(cx+15, ly-2);
  ctx.lineTo(cx, ly+5);  ctx.lineTo(cx-15, ly-2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E8C35';
  ctx.beginPath();
  ctx.moveTo(cx, ly-13); ctx.lineTo(cx+10, ly+1);
  ctx.lineTo(cx, ly+5);  ctx.lineTo(cx-10, ly+1);
  ctx.closePath(); ctx.fill();
}

function drawWater(ctx, cx, cy) {
  drawDiamond(ctx, cx, cy, '#4A9BB8', '#3A8BA8');
  ctx.fillStyle = 'rgba(180,230,255,.5)';
  ctx.beginPath(); ctx.ellipse(cx-8, cy+TILE_H/2-3, 7, 2.5, -.3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6, cy+TILE_H/2+2, 5, 2,    .2, 0, Math.PI*2); ctx.fill();
}

function drawFlower(ctx, cx, cy) {
  drawDiamond(ctx, cx, cy, '#8AAA42', '#7A9A32');
  const dots = [[-10,10,'#FF8FAB'],[-2,14,'#FFD166'],[8,9,'#FF8FAB'],[12,15,'#A3B856']];
  dots.forEach(([dx,dy,c]) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(cx+dx, cy+TILE_H/2+dy/2, 2, 0, Math.PI*2); ctx.fill();
  });
}

/* Соединительный путь между тайлами */
function drawPathLine(ctx) {
  ctx.save();
  ctx.strokeStyle = '#C8A84B';
  ctx.lineWidth   = 9;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.setLineDash([14, 8]);
  ctx.beginPath();
  PATH.forEach((t, i) => {
    const mx = t.cx, my = t.cy + TILE_H / 2;
    i === 0 ? ctx.moveTo(mx, my) : ctx.lineTo(mx, my);
  });
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* Главная отрисовка */
function drawBoard() {
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Фон — зелёный градиент
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0,   '#C8E6C9');
  bg.addColorStop(.5,  '#A5D6A7');
  bg.addColorStop(1,   '#81C784');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Лёгкая текстура (точки)
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  for (let x = 0; x < canvas.width; x += 20)
    for (let y = 0; y < canvas.height; y += 20)
      ctx.fillRect(x, y, 1, 1);

  // Декорации (позади пути)
  DECO.forEach(d => {
    if      (d.t === 'tree')   { drawDiamond(ctx, d.cx, d.cy, '#6A8A2A', '#5A7A1A'); drawTree(ctx, d.cx, d.cy); }
    else if (d.t === 'water')  drawWater(ctx, d.cx, d.cy);
    else if (d.t === 'flower') drawFlower(ctx, d.cx, d.cy);
  });

  // Золотой путь
  drawPathLine(ctx);

  // Тайлы маршрута (сверху вниз — painter's algorithm)
  PATH.forEach(t => {
    if (t.type === 'start') {
      drawDiamond(ctx, t.cx, t.cy, '#B8EEE9', '#3CC9C0');
      ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🏠', t.cx, t.cy + TILE_H/2);
    } else if (t.type === 'path') {
      drawDiamond(ctx, t.cx, t.cy, '#C8A84B', '#A89030');
    } else {
      // Этап — сначала основание, потом платформа
      drawDiamond(ctx, t.cx, t.cy, '#C8A84B', '#A89030');
      const col = stageColor(t.type);
      drawPlatform(ctx, t.cx, t.cy, col);
      ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icons = { s1:'⭐', s2:'🍽', s3:'❓', s4:'🏆' };
      ctx.fillText(icons[t.type], t.cx, t.cy + TILE_H/2 - 14);
    }
  });
}

/* ══════════════════════════════════════════
   АДАПТАЦИЯ OVERLAY К РЕАЛЬНОМУ РАЗМЕРУ CANVAS
   ══════════════════════════════════════════ */
function syncOverlay() {
  const canvas  = document.getElementById('board-canvas');
  const overlay = document.getElementById('board-overlay');
  if (!canvas || !overlay) return;
  const rect = canvas.getBoundingClientRect();
  overlay.style.setProperty('--board-w', rect.width  + 'px');
  overlay.style.setProperty('--board-h', rect.height + 'px');
  // Сдвиг overlay совпадает с canvas (canvas центрирован в flex-контейнере)
  overlay.style.width  = rect.width  + 'px';
  overlay.style.height = rect.height + 'px';
}

/* ══════════════════════════════════════════
   ПЕРСОНАЖИ НА ПОЛЕ
   ══════════════════════════════════════════ */
function moveBoardChars(stage) {
  const pos   = CHAR_POS[stage] || CHAR_POS.start;
  const chars = document.getElementById('board-chars');
  chars.style.left = pos.left;
  chars.style.top  = pos.top;
}

/* ══════════════════════════════════════════
   ЗВЁЗДЫ
   ══════════════════════════════════════════ */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `--d:${(2+Math.random()*3).toFixed(1)}s;` +
      `--dl:${(-Math.random()*4).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* ══════════════════════════════════════════
   ЭКРАН 1: ВЫБОР ЖЕНЫ
   ══════════════════════════════════════════ */
function selectWife(id) {
  G.wife = id;
  document.querySelectorAll('#screen-wife .char-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`#screen-wife .char-card[data-id="${id}"]`).classList.add('picked');
  document.getElementById('btn-wife-next').disabled = false;
}
function goToDaughter() { if (G.wife) show('screen-daughter'); }
function backToWife()   { show('screen-wife'); }

/* ══════════════════════════════════════════
   ЭКРАН 2: ВЫБОР НАПАРНИЦЫ
   ══════════════════════════════════════════ */
function selectDaughter(id) {
  G.daughter = id;
  document.querySelectorAll('.d-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`.d-card[data-id="${id}"]`).classList.add('picked');
  document.getElementById('btn-start').disabled = false;
}

/* ══════════════════════════════════════════
   СТАРТ
   ══════════════════════════════════════════ */
function startGame() {
  if (!G.wife || !G.daughter) return;

  const wSrc = WIFE_SRC[G.wife];
  const dSrc = DAUGHT_SRC[G.daughter];

  // Шапка
  document.getElementById('hdr-wife').src   = wSrc;
  document.getElementById('hdr-daught').src = dSrc;
  document.getElementById('hdr-name').textContent = WIFE_NAMES[G.wife];

  // Персонажи на поле
  document.getElementById('bc-wife').src   = wSrc;
  document.getElementById('bc-daught').src = dSrc;

  // Постоянная панель
  document.getElementById('cp-wife').src   = wSrc;
  document.getElementById('cp-daught').src = dSrc;
  const panel = document.getElementById('char-panel');
  panel.classList.remove('hidden');
  panel.classList.add('visible');

  // Напарница в мини-игре
  document.getElementById('field-daught').src = dSrc;

  // Финиш
  document.getElementById('win-wife').src   = wSrc;
  document.getElementById('win-daught').src = dSrc;

  // Сброс прогресса
  G.stagesDone = [false, false, false, false];

  show('screen-board');

  // Рисуем поле после показа экрана (чтобы layout уже был)
  requestAnimationFrame(() => {
    drawBoard();
    syncOverlay();
    moveBoardChars('start');
    updateButtons();
  });
}

/* ══════════════════════════════════════════
   КНОПКИ ЭТАПОВ
   ══════════════════════════════════════════ */
function updateButtons() {
  [1,2,3,4].forEach(n => {
    const i   = n - 1;
    const btn = document.getElementById(`sbtn-${n}`);
    btn.className = 'stage-btn ' +
      (G.stagesDone[i] ? 's-done' : isNext(i) ? 's-active' : 's-locked');
  });
  document.getElementById('stages-done').textContent = G.stagesDone.filter(Boolean).length;
  drawBoard();
}

function goToStage(n) {
  for (let i = 0; i < n-1; i++) { if (!G.stagesDone[i]) { flashBtn(n); return; } }
  if (G.stagesDone[n-1]) return;
  if      (n===1) openS1();
  else if (n===2) openS2();
  else if (n===3) openS3();
  else            triggerWin();
}

function flashBtn(n) {
  const btn = document.getElementById(`sbtn-${n}`);
  const orig = btn.style.background;
  btn.style.background = '#FF8FAB';
  setTimeout(() => btn.style.background = orig, 400);
}

/* ══════════════════════════════════════════
   ЭТАП 1: ЗАГАДКА
   ══════════════════════════════════════════ */
function openS1() {
  document.getElementById('phase-riddle').classList.remove('hidden');
  document.getElementById('phase-catch').classList.add('hidden');
  const inp = document.getElementById('riddle-input');
  inp.value = ''; inp.disabled = false; inp.classList.remove('shake');
  const fb  = document.getElementById('riddle-fb');
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
    void inp.offsetWidth;
    inp.classList.add('shake');
  }
}

/* ── МИНИ-ИГРА: БАБОЧКИ ── */
function startCatchGame() {
  G.butterfliesCaught = 0;
  document.getElementById('caught-n').textContent = '0';
  document.getElementById('total-n').textContent  = G.TOTAL_BUTTERFLIES;
  document.getElementById('catch-win').classList.add('hidden');
  document.getElementById('phase-riddle').classList.add('hidden');
  document.getElementById('phase-catch').classList.remove('hidden');

  const field = document.getElementById('catch-field');
  [...field.querySelectorAll('.fly-obj')].forEach(el => el.remove());

  setTimeout(() => {
    const fW = field.clientWidth  || 320;
    const fH = field.clientHeight || 200;
    for (let i = 0; i < G.TOTAL_BUTTERFLIES; i++) spawnObj(field, fW, fH, '🦋', true);
    ['🌸','⭐','🍃','🌼','🐝','☁️'].forEach(em => spawnObj(field, fW, fH, em, false));
  }, 80);
}

function spawnObj(field, fW, fH, emoji, isBfly) {
  const el       = document.createElement('div');
  el.className   = 'fly-obj' + (isBfly ? ' butterfly' : '');
  el.textContent = emoji;
  el.style.left  = (5 + Math.random() * (fW - 70)) + 'px';
  el.style.top   = (5 + Math.random() * (fH - 55)) + 'px';
  el.style.setProperty('--dur', (2.2+Math.random()*2.8).toFixed(1)+'s');
  el.style.setProperty('--dly', (-Math.random()*3).toFixed(1)+'s');
  const handler = () => isBfly ? catchButterfly(el) : wrongClick(el);
  el.addEventListener('click', handler);
  el.addEventListener('touchstart', e => { e.preventDefault(); handler(); }, { passive:false });
  field.appendChild(el);
}

function catchButterfly(el) {
  if (el.classList.contains('caught')) return;
  el.classList.add('caught');
  G.butterfliesCaught++;
  document.getElementById('caught-n').textContent = G.butterfliesCaught;
  setTimeout(() => el.remove(), 360);
  if (G.butterfliesCaught >= G.TOTAL_BUTTERFLIES)
    setTimeout(() => document.getElementById('catch-win').classList.remove('hidden'), 450);
}

function wrongClick(el) {
  el.classList.remove('wrong-flash');
  void el.offsetWidth;
  el.classList.add('wrong-flash');
  setTimeout(() => el.classList.remove('wrong-flash'), 430);
}

function completeS1() {
  G.stagesDone[0] = true;
  document.getElementById('overlay-s1').classList.add('hidden');
  moveBoardChars('s1');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 2: РЕСТОРАН
   ══════════════════════════════════════════ */
function openS2() {
  document.getElementById('rest-row').style.opacity       = '1';
  document.getElementById('rest-row').style.pointerEvents = '';
  document.getElementById('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  document.getElementById('overlay-s2').classList.remove('hidden');
}
function pickRest(card, name) {
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  card.classList.add('chosen');
  document.getElementById('rest-row').style.opacity       = '0.5';
  document.getElementById('rest-row').style.pointerEvents = 'none';
  document.getElementById('chosen-name').textContent = name;
  document.getElementById('rest-chosen').classList.remove('hidden');
}
function completeS2() {
  G.stagesDone[1] = true;
  document.getElementById('overlay-s2').classList.add('hidden');
  moveBoardChars('s2');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 3: ЗАГЛУШКА
   ══════════════════════════════════════════ */
function openS3()   { document.getElementById('overlay-s3').classList.remove('hidden'); }
function completeS3() {
  G.stagesDone[2] = true;
  document.getElementById('overlay-s3').classList.add('hidden');
  moveBoardChars('s3');
  updateButtons();
}

/* ══════════════════════════════════════════
   ФИНИШ
   ══════════════════════════════════════════ */
function triggerWin() {
  G.stagesDone[3] = true;
  moveBoardChars('s4');
  updateButtons();
  document.getElementById('overlay-win').classList.remove('hidden');
}

/* ══════════════════════════════════════════
   СБРОС
   ══════════════════════════════════════════ */
function resetGame() {
  G.wife = null; G.daughter = null;
  G.stagesDone = [false,false,false,false];
  G.butterfliesCaught = 0;
  ['overlay-win','overlay-s1','overlay-s2','overlay-s3']
    .forEach(id => document.getElementById(id).classList.add('hidden'));
  const panel = document.getElementById('char-panel');
  panel.classList.remove('visible'); panel.classList.add('hidden');
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
window.addEventListener('DOMContentLoaded', () => {
  makeStars();

  // Добавляем предупреждение о повороте экрана
  const notice = document.createElement('div');
  notice.className = 'rotate-notice';
  notice.innerHTML = '<span>📱</span><p>Поверни телефон<br>вертикально!</p>';
  document.body.appendChild(notice);

  // Пересчёт overlay при изменении размера (например при скрытии клавиатуры)
  window.addEventListener('resize', () => {
    if (document.getElementById('screen-board').classList.contains('active')) {
      requestAnimationFrame(syncOverlay);
    }
  });
});
