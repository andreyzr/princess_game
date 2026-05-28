/* ═══════════════════════════════════════════
   PIXEL PRINCESS — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ─── */
const G = {
  wife: null, daughter: null,
  /* 0=десерты, 1=вопрос, 2=парк, 3=кафе, 4=финал */
  stagesDone: [false, false, false, false, false],
  chosenPark: null,          /* 'left' | 'right' */
  forksRevealed: false,      /* парки видны после этапа 1 */
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ─── ФАЙЛЫ ─── */
const WIFE_SRC   = { 1:'wife-повседневная.png', 2:'wife-путешественница.png', 3:'wife-элегантная.png' };
const WIFE_NAMES = { 1:'Повседневная', 2:'Путешественница', 3:'Элегантная' };
const DAUGHT_SRC = { 1:'daughter-солнышко.png', 2:'daughter-непоседа.png', 3:'daughter-уютная.png' };

const PARK_NAMES = { left:'Александровский парк', right:'Парк Победы' };

/* ══════════════════════════════════════════
   ПОЛЕ — координаты (canvas 360×520, TILE_W=64, TILE_H=32)
   ══════════════════════════════════════════ */
const TILE_W = 64, TILE_H = 32;

/* Позиции персонажей (% от canvas) */
const CHAR_POS = {
  start:  { left:'50%',   top:'4.2%'  },
  s1:     { left:'68.9%', top:'24.6%' },
  fork_l: { left:'27.8%', top:'43.8%' },
  fork_r: { left:'78.3%', top:'43.8%' },
  s3:     { left:'52.8%', top:'63.5%' },
  s4:     { left:'43.1%', top:'82.3%' },
};

/* Все тайлы поля (рисуются сверху вниз) */
const TILES = [
  { cx:180, cy:22,  type:'start'  },
  { cx:210, cy:56,  type:'path'   },
  { cx:240, cy:92,  type:'path'   },
  { cx:248, cy:128, type:'s1'     },
  { cx:268, cy:163, type:'path'   },  // правая ветка от S1
  { cx:210, cy:165, type:'path'   },  // левая ветка от S1
  { cx:160, cy:196, type:'path'   },
  { cx:100, cy:228, type:'fork_l' },
  { cx:282, cy:228, type:'fork_r' },
  { cx:238, cy:278, type:'path'   },  // правая ветка к S3
  { cx:140, cy:280, type:'path'   },  // левая ветка к S3
  { cx:190, cy:330, type:'s3'     },
  { cx:175, cy:380, type:'path'   },
  { cx:155, cy:428, type:'s4'     },
];

/* Декорации */
const DECO = [
  { cx:44,  cy:36,  t:'tree'   }, { cx:310, cy:30,  t:'tree'   },
  { cx:335, cy:82,  t:'tree'   }, { cx:338, cy:155, t:'tree'   },
  { cx:40,  cy:162, t:'tree'   }, { cx:38,  cy:252, t:'tree'   },
  { cx:322, cy:258, t:'tree'   }, { cx:46,  cy:352, t:'tree'   },
  { cx:328, cy:348, t:'tree'   }, { cx:322, cy:440, t:'tree'   },
  { cx:42,  cy:442, t:'tree'   },
  { cx:176, cy:140, t:'water'  }, { cx:66,  cy:368, t:'water'  },
  { cx:285, cy:170, t:'flower' }, { cx:132, cy:144, t:'flower' },
  { cx:292, cy:362, t:'flower' }, { cx:148, cy:456, t:'flower' },
];

/* ── Цвета платформы ── */
function platCol(type) {
  if (type === 's1') {
    return G.stagesDone[0]
      ? { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' }
      : { top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' };
  }
  if (type === 'fork_l' || type === 'fork_r') {
    if (!G.forksRevealed) return { top:'#C8C8C8', lft:'#888', rgt:'#A8A8A8', brd:'#666' };
    const side = type === 'fork_l' ? 'left' : 'right';
    return G.chosenPark === side
      ? { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' }
      : { top:'#B8E8FF', lft:'#4A9BB8', rgt:'#6AB8D4', brd:'#2A7A98' };
  }
  if (type === 's3') {
    return G.stagesDone[2]
      ? { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' }
      : G.stagesDone[1]
        ? { top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' }
        : { top:'#C8C8C8', lft:'#888', rgt:'#A8A8A8', brd:'#666' };
  }
  if (type === 's4') {
    return G.stagesDone[3]
      ? { top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' }
      : G.stagesDone[2]
        ? { top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' }
        : { top:'#C8C8C8', lft:'#888', rgt:'#A8A8A8', brd:'#666' };
  }
  return { top:'#C8C8C8', lft:'#888', rgt:'#A8A8A8', brd:'#666' };
}

/* ══════════════════════════════════════════
   ОТРИСОВКА ПОЛЯ
   ══════════════════════════════════════════ */
function drawDiamond(ctx, cx, cy, fill, stroke) {
  const hw = TILE_W/2, hh = TILE_H/2;
  ctx.beginPath();
  ctx.moveTo(cx,cy); ctx.lineTo(cx+hw,cy+hh);
  ctx.lineTo(cx,cy+TILE_H); ctx.lineTo(cx-hw,cy+hh);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.8; ctx.stroke(); }
}

function drawPlatform(ctx, cx, cy, col) {
  const hw = TILE_W/2, hh = TILE_H/2, bH = 12;
  [[col.lft,[-hw,hh],[0,TILE_H-bH],[0,TILE_H],[-hw,hh-bH]],
   [col.rgt,[ hw,hh],[0,TILE_H-bH],[0,TILE_H],[ hw,hh-bH]]].forEach(([fill,...pts]) => {
    ctx.beginPath();
    pts.forEach(([dx,dy],i) => i===0 ? ctx.moveTo(cx+dx,cy+dy) : ctx.lineTo(cx+dx,cy+dy));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = col.brd; ctx.lineWidth = 0.7; ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx,cy-bH); ctx.lineTo(cx+hw,cy+hh-bH);
  ctx.lineTo(cx,cy+TILE_H-bH); ctx.lineTo(cx-hw,cy+hh-bH);
  ctx.closePath(); ctx.fillStyle = col.top; ctx.fill();
  ctx.strokeStyle = col.brd; ctx.lineWidth = 0.7; ctx.stroke();
}

function drawTree(ctx, cx, cy) {
  const base = cy+TILE_H-2, trH = 12;
  [['#5D4037',-4],['#4E342E',4]].forEach(([c,dx]) => {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(cx+dx,base-trH); ctx.lineTo(cx,base-trH+3);
    ctx.lineTo(cx,base+1); ctx.lineTo(cx+dx,base);
    ctx.closePath(); ctx.fill();
  });
  const ly = base-trH;
  [['#3A6B28',20,7],['#4E8C35',13,5]].forEach(([c,r,h]) => {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(cx,ly-r*1.4); ctx.lineTo(cx+r,ly-2); ctx.lineTo(cx,ly+h); ctx.lineTo(cx-r,ly-2);
    ctx.closePath(); ctx.fill();
  });
}

function drawWater(ctx, cx, cy) {
  drawDiamond(ctx, cx, cy, '#4A9BB8', '#3A8BA8');
  ctx.fillStyle = 'rgba(180,230,255,.5)';
  ctx.beginPath(); ctx.ellipse(cx-8,cy+TILE_H/2-3,7,2.5,-.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6,cy+TILE_H/2+2,5,2,.2,0,Math.PI*2); ctx.fill();
}

function drawFlower(ctx, cx, cy) {
  drawDiamond(ctx, cx, cy, '#8AAA42', '#7A9A32');
  [[-10,10,'#FF8FAB'],[-2,14,'#FFD166'],[8,9,'#FF8FAB'],[12,15,'#A3B856']].forEach(([dx,dy,c]) => {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.arc(cx+dx, cy+TILE_H/2+dy/2, 2, 0, Math.PI*2); ctx.fill();
  });
}

function drawPathLines(ctx) {
  const hh = TILE_H/2;
  ctx.save();
  ctx.strokeStyle = '#C8A84B'; ctx.lineWidth = 9;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([14,8]);
  const poly = (pts) => {
    ctx.beginPath();
    pts.forEach(([cx,cy],i) => i===0 ? ctx.moveTo(cx,cy+hh) : ctx.lineTo(cx,cy+hh));
    ctx.stroke();
  };
  poly([[180,22],[210,56],[240,92],[248,128]]);         // старт → S1
  poly([[248,128],[210,165],[160,196],[100,228]]);       // S1 → left fork
  poly([[248,128],[268,163],[282,228]]);                 // S1 → right fork
  // Ветки к S3 рисуем только если развилка открыта
  if (G.forksRevealed) {
    poly([[100,228],[140,280],[190,330]]);               // left → S3
    poly([[282,228],[238,278],[190,330]]);               // right → S3
  }
  if (G.stagesDone[1]) {
    poly([[190,330],[175,380],[155,428]]);               // S3 → S4
  }
  ctx.setLineDash([]); ctx.restore();
}

function drawBoard() {
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const bg = ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#C8E6C9'); bg.addColorStop(.5,'#A5D6A7'); bg.addColorStop(1,'#81C784');
  ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  // Текстура
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  for (let x=0; x<canvas.width; x+=20)
    for (let y=0; y<canvas.height; y+=20)
      ctx.fillRect(x,y,1,1);

  // Декорации (позади)
  DECO.forEach(d => {
    if      (d.t==='tree')   { drawDiamond(ctx,d.cx,d.cy,'#6A8A2A','#5A7A1A'); drawTree(ctx,d.cx,d.cy); }
    else if (d.t==='water')  drawWater(ctx,d.cx,d.cy);
    else if (d.t==='flower') drawFlower(ctx,d.cx,d.cy);
  });

  // Линии пути
  drawPathLines(ctx);

  // Тайлы
  TILES.forEach(t => {
    const { cx, cy, type } = t;
    const locked = !G.forksRevealed && (type==='fork_l'||type==='fork_r');
    const postForkLocked = !G.stagesDone[1] && (type==='s3'||type==='s4'||(cy>=278&&type==='path'));
    const s4Locked = !G.stagesDone[2] && type==='s4';

    ctx.globalAlpha = locked||postForkLocked||s4Locked ? 0.35 : 1;

    if (type==='start') {
      drawDiamond(ctx,cx,cy,'#B8EEE9','#3CC9C0');
      ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🏠', cx, cy+TILE_H/2);
    } else if (type==='path') {
      drawDiamond(ctx,cx,cy,'#C8A84B','#A89030');
    } else {
      drawDiamond(ctx,cx,cy,'#C8A84B','#A89030');
      drawPlatform(ctx,cx,cy,platCol(type));
      ctx.font='13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const icons = {
        s1: G.stagesDone[0]?'✓':'⭐',
        fork_l: G.forksRevealed?'🌳':'❓',
        fork_r: G.forksRevealed?'🌳':'❓',
        s3: G.stagesDone[2]?'✓':'🍽',
        s4: G.stagesDone[3]?'✓':'🏆',
      };
      ctx.fillText(icons[type]||'?', cx, cy+TILE_H/2-14);
    }
    ctx.globalAlpha = 1;
  });
}

/* ══════════════════════════════════════════
   OVERLAY ↔ CANVAS СИНХРОНИЗАЦИЯ
   ══════════════════════════════════════════ */
function syncOverlay() {
  const canvas  = document.getElementById('board-canvas');
  const overlay = document.getElementById('board-overlay');
  if (!canvas || !overlay) return;
  const r = canvas.getBoundingClientRect();
  overlay.style.width  = r.width  + 'px';
  overlay.style.height = r.height + 'px';
}

/* ══════════════════════════════════════════
   КНОПКИ ЭТАПОВ
   ══════════════════════════════════════════ */
function updateButtons() {
  const sd = G.stagesDone;
  const fr = G.forksRevealed;

  // Этап 0
  el('sbtn-0').className = 'stage-btn ' + (sd[0] ? 's-done' : 's-active');

  // Этап 1
  el('sbtn-1').className = 'stage-btn ' + (!sd[0] ? 's-locked' : sd[1] ? 's-done' : 's-active');

  // Развилка (парки)
  ['fork-l','fork-r'].forEach((id,i) => {
    const btn  = el(id);
    const side = i===0 ? 'left' : 'right';
    if (!fr) {
      btn.className = 'stage-btn fork-btn s-locked';
      el(`fork-${i===0?'l':'r'}-ico`).textContent = '❓';
      el(`fork-${i===0?'l':'r'}-txt`).textContent = 'Парк';
    } else if (sd[2]) {
      btn.className = 'stage-btn fork-btn s-done';
      el(`fork-${i===0?'l':'r'}-ico`).textContent = '🌳';
      el(`fork-${i===0?'l':'r'}-txt`).textContent = PARK_NAMES[side].split(' ')[0];
    } else {
      btn.className = 'stage-btn fork-btn f-revealed';
      el(`fork-${i===0?'l':'r'}-ico`).textContent = '🌳';
      el(`fork-${i===0?'l':'r'}-txt`).textContent = PARK_NAMES[side].split(' ')[0];
    }
  });

  // Этап 3 (кафе)
  el('sbtn-3').className = 'stage-btn ' + (!sd[2] ? 's-locked' : sd[3] ? 's-done' : 's-active');

  // Этап 4
  el('sbtn-4').className = 'stage-btn ' + (!sd[3] ? 's-locked' : sd[4] ? 's-done' : 's-active');

  el('stages-done').textContent = sd.filter(Boolean).length;
  drawBoard();
}

function goToStage(n) {
  if (n===0 && !G.stagesDone[0]) { openS0(); return; }
  if (n===1 && G.stagesDone[0] && !G.stagesDone[1]) { openS1(); return; }
  if (n===3 && G.stagesDone[2] && !G.stagesDone[3]) { openS3(); return; }
  if (n===4 && G.stagesDone[3] && !G.stagesDone[4]) { openS4(); return; }
  // Уже пройден или заблокирован — мигнуть
  const btn = el(`sbtn-${n}`);
  if (!btn) return;
  const was = btn.style.background;
  btn.style.background = '#FF8FAB';
  setTimeout(() => btn.style.background = was, 400);
}

/* ══════════════════════════════════════════
   ПЕРСОНАЖИ НА ПОЛЕ
   ══════════════════════════════════════════ */
function moveChars(stage) {
  const pos   = CHAR_POS[stage] || CHAR_POS.start;
  const chars = el('board-chars');
  chars.style.left = pos.left;
  chars.style.top  = pos.top;
}

/* ══════════════════════════════════════════
   ЗВЁЗДЫ
   ══════════════════════════════════════════ */
function makeStars() {
  const bg = el('stars-bg'); if (!bg) return;
  for (let i=0; i<22; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `--d:${(2+Math.random()*3).toFixed(1)}s;--dl:${(-Math.random()*4).toFixed(1)}s`;
    bg.appendChild(s);
  }
}

/* ══════════════════════════════════════════
   ВЫБОР ПЕРСОНАЖЕЙ
   ══════════════════════════════════════════ */
function selectWife(id) {
  G.wife = id;
  document.querySelectorAll('#screen-wife .char-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`#screen-wife .char-card[data-id="${id}"]`).classList.add('picked');
  el('btn-wife-next').disabled = false;
}
function goToDaughter() { if (G.wife) show('screen-daughter'); }
function backToWife()   { show('screen-wife'); }

function selectDaughter(id) {
  G.daughter = id;
  document.querySelectorAll('.d-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`.d-card[data-id="${id}"]`).classList.add('picked');
  el('btn-start').disabled = false;
}

/* ══════════════════════════════════════════
   СТАРТ
   ══════════════════════════════════════════ */
function startGame() {
  if (!G.wife || !G.daughter) return;

  const wSrc = WIFE_SRC[G.wife];
  const dSrc = DAUGHT_SRC[G.daughter];

  el('hdr-wife').src   = wSrc;
  el('hdr-daught').src = dSrc;
  el('hdr-name').textContent = WIFE_NAMES[G.wife];
  el('bc-wife').src    = wSrc;
  el('bc-daught').src  = dSrc;
  el('cp-wife').src    = wSrc;
  el('cp-daught').src  = dSrc;
  el('fork-daught').src   = dSrc;
  el('win-wife').src   = wSrc;
  el('win-daught').src = dSrc;

  const panel = el('char-panel');
  panel.classList.remove('hidden'); panel.classList.add('visible');

  G.stagesDone    = [false,false,false,false,false];
  G.chosenPark    = null;
  G.forksRevealed = false;

  el('wc-wife').src = wSrc;
  el('wc-daught').src = dSrc;
  el('anniv-wife').src = wSrc;
  el('anniv-daught').src = dSrc;

  show('screen-board');
  requestAnimationFrame(() => {
    drawBoard(); syncOverlay(); moveChars('start'); updateButtons();
    el('overlay-welcome').classList.remove('hidden');
  });
}


/* ══════════════════════════════════════════
   ЭТАП 0 — ДЕСЕРТЫ
   ══════════════════════════════════════════ */
let selectedDesserts = new Set();
let selectedPiece = null;
let matchedCakes = 0;

function closeWelcome() {
  el('overlay-welcome').classList.add('hidden');
}

function openS0() {
  selectedDesserts.clear();
  matchedCakes = 0;
  selectedPiece = null;

  document.querySelectorAll('.dessert-card').forEach(card => {
    card.classList.remove('selected');
  });

  el('btn-s0-next').disabled = true;
  el('s0-select').classList.remove('hidden');
  el('s0-match').classList.add('hidden');
  el('match-win').classList.add('hidden');
  el('overlay-s0').classList.remove('hidden');
}

function toggleDessert(card) {
  const id = card.dataset.d;

  if (selectedDesserts.has(id)) {
    selectedDesserts.delete(id);
    card.classList.remove('selected');
  } else {
    selectedDesserts.add(id);
    card.classList.add('selected');
  }

  el('btn-s0-next').disabled = selectedDesserts.size === 0;
}

function showMatchPhase() {
  el('s0-select').classList.add('hidden');
  el('s0-match').classList.remove('hidden');

  const cakes = [
    { id: 1, icon: '🍰', name: 'Чизкейк' },
    { id: 2, icon: '🎂', name: 'Сникерс' },
    { id: 3, icon: '🍮', name: 'Красный бархат' },
    { id: 4, icon: '🧁', name: 'Капкейки' },
  ];

  const shuffled = [...cakes].sort(() => Math.random() - 0.5);
  const layout = el('match-layout');

  layout.innerHTML = `
    <div class="match-left">
      ${cakes.map(c => `
        <div class="cake-slot" data-id="${c.id}" onclick="placePiece(${c.id})">
          <div class="cake-big">${c.icon}</div>
          <div class="cake-miss">◻</div>
        </div>
      `).join('')}
    </div>
    <div class="match-right">
      ${shuffled.map(c => `
        <div class="cake-piece" data-id="${c.id}" onclick="selectPiece(this, ${c.id})">
          ${c.icon}
        </div>
      `).join('')}
    </div>
  `;
}

function selectPiece(node, id) {
  document.querySelectorAll('.cake-piece').forEach(p => p.classList.remove('active'));
  node.classList.add('active');
  selectedPiece = id;
}

function placePiece(id) {
  if (!selectedPiece) return;

  const slot = document.querySelector(`.cake-slot[data-id="${id}"]`);

  if (selectedPiece === id) {
    slot.classList.add('done');
    slot.querySelector('.cake-miss').textContent = '✨';

    const piece = document.querySelector(`.cake-piece[data-id="${id}"]`);
    if (piece) piece.remove();

    matchedCakes++;
    selectedPiece = null;

    if (matchedCakes >= 4) {
      el('match-win').classList.remove('hidden');
    }
  } else {
    slot.classList.add('shake');
    setTimeout(() => slot.classList.remove('shake'), 400);
  }
}

function completeS0() {
  G.stagesDone[0] = true;
  el('overlay-s0').classList.add('hidden');
  moveChars('s1');
  updateButtons();
}


/* ══════════════════════════════════════════
   ЭТАП 1 — ДВА ПАРКА
   ══════════════════════════════════════════ */
function openS1() {
  el('park-1').value = ''; el('park-2').value = '';
  el('park-1').classList.remove('shake'); el('park-2').classList.remove('shake');
  el('parks-fb').textContent = ''; el('parks-fb').className = 'riddle-fb';
  el('overlay-s1').classList.remove('hidden');
}

function checkParks() {
  const v1 = el('park-1').value.trim().toLowerCase();
  const v2 = el('park-2').value.trim().toLowerCase();
  const fb = el('parks-fb');

  const isPobedy   = s => s.includes('победы') || s.includes('победа');
  const isAlex     = s => s.includes('александр');

  const ok = (isPobedy(v1) && isAlex(v2)) || (isAlex(v1) && isPobedy(v2));

  if (ok) {
    fb.textContent = 'Верно! 🎉 Теперь выбери парк на карте!';
    fb.className   = 'riddle-fb ok';
    el('park-1').disabled = el('park-2').disabled = true;
    setTimeout(() => {
      el('overlay-s1').classList.add('hidden');
      G.stagesDone[1]    = true;
      G.forksRevealed    = true;
      moveChars('s1');
      updateButtons();
    }, 1200);
  } else {
    fb.textContent = 'Не совсем верно... попробуй ещё! 🤔';
    fb.className   = 'riddle-fb bad';
    [el('park-1'),el('park-2')].forEach(inp => {
      inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
    });
  }
}

/* ══════════════════════════════════════════
   ЭТАП 2 — РАЗВИЛКА (парки + бабочки)
   ══════════════════════════════════════════ */
function clickFork(side) {
  if (!G.forksRevealed || G.stagesDone[1]) return;
  G.chosenPark = side;
  // Открываем оверлей с испытанием
  el('fork-game-phase').classList.remove('hidden');
  el('fork-done-phase').classList.add('hidden');
  el('fork-win').classList.add('hidden');
  el('overlay-fork').classList.remove('hidden');
  startForkGame();
}

function startForkGame() {
  G.butterfliesCaught = 0;
  el('fork-caught').textContent = '0';
  el('fork-total').textContent  = G.TOTAL_BUTTERFLIES;
  el('fork-win').classList.add('hidden');

  const field = el('fork-field');
  [...field.querySelectorAll('.fly-obj')].forEach(e => e.remove());

  setTimeout(() => {
    const fW = field.clientWidth  || 320;
    const fH = field.clientHeight || 200;
    for (let i=0; i<G.TOTAL_BUTTERFLIES; i++) spawnObj(field,fW,fH,'🦋',true,'fork');
    ['🌸','⭐','🍃','🌼','🐝','☁️'].forEach(em => spawnObj(field,fW,fH,em,false,'fork'));
  }, 80);
}

function spawnObj(field, fW, fH, emoji, isBfly, context) {
  const el2       = document.createElement('div');
  el2.className   = 'fly-obj' + (isBfly?' butterfly':'');
  el2.textContent = emoji;
  el2.style.left  = (5 + Math.random()*(fW-70)) + 'px';
  el2.style.top   = (5 + Math.random()*(fH-55)) + 'px';
  el2.style.setProperty('--dur', (2.2+Math.random()*2.8).toFixed(1)+'s');
  el2.style.setProperty('--dly', (-Math.random()*3).toFixed(1)+'s');
  const handler = () => isBfly ? catchBfly(el2, context) : wrongClick(el2);
  el2.addEventListener('click', handler);
  el2.addEventListener('touchstart', e => { e.preventDefault(); handler(); }, {passive:false});
  field.appendChild(el2);
}

function catchBfly(node, context) {
  if (node.classList.contains('caught')) return;
  node.classList.add('caught');
  G.butterfliesCaught++;

  const cntEl  = context==='fork' ? el('fork-caught') : null;
  const totalN = G.TOTAL_BUTTERFLIES;
  if (cntEl) cntEl.textContent = G.butterfliesCaught;

  setTimeout(() => node.remove(), 360);

  if (G.butterfliesCaught >= totalN) {
    setTimeout(() => {
      if (context==='fork') el('fork-win').classList.remove('hidden');
    }, 450);
  }
}

function wrongClick(node) {
  node.classList.remove('wrong-flash'); void node.offsetWidth; node.classList.add('wrong-flash');
  setTimeout(() => node.classList.remove('wrong-flash'), 430);
}

function showParkReady() {
  el('fork-game-phase').classList.add('hidden');
  el('fork-done-phase').classList.remove('hidden');
}

function completeFork() {
  G.stagesDone[4] = true;
  el('overlay-fork').classList.add('hidden');
  const charStage = G.chosenPark === 'left' ? 'fork_l' : 'fork_r';
  moveChars(charStage);
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 3 — КАФЕ
   ══════════════════════════════════════════ */
function openS3() {
  el('rest-row').style.opacity       = '1';
  el('rest-row').style.pointerEvents = '';
  el('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  el('overlay-s3').classList.remove('hidden');
}
function pickRest(card, name) {
  document.querySelectorAll('.rest-card').forEach(c => c.classList.remove('chosen'));
  card.classList.add('chosen');
  el('rest-row').style.opacity       = '0.5';
  el('rest-row').style.pointerEvents = 'none';
  el('chosen-name').textContent = name;
  el('rest-chosen').classList.remove('hidden');
}
function completeS3() {
  G.stagesDone[4] = true;
  el('overlay-s3').classList.add('hidden');
  moveChars('s3');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 4 — В РАЗРАБОТКЕ
   ══════════════════════════════════════════ */
function openS4() { el('overlay-s4').classList.remove('hidden'); }
function completeS4() {
  G.stagesDone[4] = true;
  el('overlay-s4').classList.add('hidden');
  moveChars('s4');
  updateButtons();
  setTimeout(() => el('overlay-win').classList.remove('hidden'), 600);
}

/* ══════════════════════════════════════════
   СБРОС
   ══════════════════════════════════════════ */
function resetGame() {
  G.wife = null; G.daughter = null;
  G.stagesDone = [false,false,false,false,false];
  G.chosenPark = null; G.forksRevealed = false;
  G.butterfliesCaught = 0;

  ['overlay-win','overlay-s1','overlay-s3','overlay-s4','overlay-fork']
    .forEach(id => el(id).classList.add('hidden'));

  const panel = el('char-panel');
  panel.classList.remove('visible'); panel.classList.add('hidden');

  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('picked'));
  el('btn-wife-next').disabled = el('btn-start').disabled = true;

  show('screen-wife');
}

/* ─── УТИЛИТЫ ─── */
const el   = id => document.getElementById(id);
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el(id).classList.add('active');
}

/* ══════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  makeStars();
  window.addEventListener('resize', () => {
    if (el('screen-board').classList.contains('active'))
      requestAnimationFrame(syncOverlay);
  });
});
