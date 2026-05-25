/* ═══════════════════════════════════════════
   PIXEL PRINCESS ADVENTURE — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ─── */
const G = {
  wife:     null,   // 1 | 2 | 3
  daughter: null,   // 1 | 2 | 3
  stagesDone: [false, false, false, false],
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
};

/* ─── ФАЙЛЫ ПЕРСОНАЖЕЙ ─── */
const WIFE_SRC = {
  1: 'wife-повседневная.png',
  2: 'wife-путешественница.png',
  3: 'wife-элегантная.png',
};
const WIFE_NAMES = {
  1: 'Повседневная',
  2: 'Путешественница',
  3: 'Элегантная',
};
const DAUGHT_SRC = {
  1: 'daughter-солнышко.png',
  2: 'daughter-непоседа.png',
  3: 'daughter-уютная.png',
};

/* ══════════════════════════════════════════
   ПОЗИЦИИ ПЕРСОНАЖЕЙ НА ПОЛЕ
   (left%, top%) — ноги персонажей
   ══════════════════════════════════════════ */
const STAGE_POS = {
  start: { left: '37.1%', top: '28%'  },
  s1:    { left: '75.8%', top: '46%'  },
  s2:    { left: '56.5%', top: '63%'  },
  s3:    { left: '30.6%', top: '41%'  },
  s4:    { left: '17.7%', top: '52%'  },
};

function moveBoardChars(stage) {
  const pos   = STAGE_POS[stage] || STAGE_POS.start;
  const chars = document.getElementById('board-chars');
  chars.style.left = pos.left;
  chars.style.top  = pos.top;
}

/* ─── ЗВЁЗДЫ НА ФОНЕ ─── */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  if (!bg) return;
  for (let i = 0; i < 24; i++) {
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

  const wSrc = WIFE_SRC[G.wife];
  const dSrc = DAUGHT_SRC[G.daughter];

  /* Шапка */
  document.getElementById('hdr-wife').src   = wSrc;
  document.getElementById('hdr-daught').src = dSrc;
  document.getElementById('hdr-name').textContent = WIFE_NAMES[G.wife];

  /* Персонажи на поле */
  document.getElementById('bc-wife').src   = wSrc;
  document.getElementById('bc-daught').src = dSrc;
  moveBoardChars('start');   // начальная позиция (без анимации)

  /* Постоянная панель персонажей */
  document.getElementById('cp-wife').src   = wSrc;
  document.getElementById('cp-daught').src = dSrc;
  const panel = document.getElementById('char-panel');
  panel.classList.remove('hidden');
  panel.classList.add('visible');

  /* Напарница в поле бабочек */
  document.getElementById('field-daught').src = dSrc;

  /* Победный экран */
  document.getElementById('win-wife').src   = wSrc;
  document.getElementById('win-daught').src = dSrc;

  /* Строим изометрическое поле */
  G.stagesDone = [false, false, false, false];
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

const TILE_MAP = {
  '0,2':'path','1,2':'path','2,2':'path','3,2':'path','4,2':'path',
  '4,1':'path','5,2':'path','5,3':'path',
  '4,4':'path','3,4':'path','2,4':'path','1,5':'path',
  '5,1':'s1','5,4':'s2','1,4':'s3','1,6':'s4',
  '0,0':'tree','1,0':'tree','2,0':'tree','3,0':'tree',
  '4,0':'tree','5,0':'tree','6,0':'tree',
  '0,1':'tree','6,1':'tree','0,3':'tree',
  '6,2':'tree','6,3':'tree','0,4':'tree','6,4':'tree',
  '0,5':'tree','6,5':'tree','0,6':'tree','6,6':'tree',
  '3,3':'water','4,3':'water',
  '1,1':'flower','2,1':'flower','3,1':'flower',
  '1,3':'flower','2,3':'flower',
  '2,5':'flower','3,5':'flower','4,5':'flower','5,5':'flower',
  '2,6':'flower','3,6':'flower','4,6':'flower','5,6':'flower',
};

function stageCol(key) {
  const i = { s1:0, s2:1, s3:2, s4:3 }[key];
  if (G.stagesDone[i]) return {top:'#7CC85A',lft:'#4A9030',rgt:'#5CAA40',brd:'#2D7A20'};
  if (isNextStage(i))  return {top:'#FFD166',lft:'#C0A030',rgt:'#D8B040',brd:'#8B7000'};
  return                      {top:'#C0C0C0',lft:'#888',   rgt:'#A0A0A0',brd:'#666'};
}

function isNextStage(i) {
  for (let j = 0; j < i; j++) if (!G.stagesDone[j]) return false;
  return !G.stagesDone[i];
}

function drawDiamond(ctx, x, y, fill, stroke) {
  const hw = TILE_W / 2, hh = TILE_H / 2;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x+hw, y+hh);
  ctx.lineTo(x, y+TILE_H); ctx.lineTo(x-hw, y+hh);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.7; ctx.stroke(); }
}

function drawPlatform(ctx, x, y, col) {
  const hw = TILE_W/2, hh = TILE_H/2, bH = 18;
  ctx.beginPath();
  ctx.moveTo(x-hw,y+hh-bH); ctx.lineTo(x,y+TILE_H-bH);
  ctx.lineTo(x,y+TILE_H);   ctx.lineTo(x-hw,y+hh);
  ctx.closePath(); ctx.fillStyle=col.lft; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x+hw,y+hh-bH); ctx.lineTo(x,y+TILE_H-bH);
  ctx.lineTo(x,y+TILE_H);   ctx.lineTo(x+hw,y+hh);
  ctx.closePath(); ctx.fillStyle=col.rgt; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x,y-bH);          ctx.lineTo(x+hw,y+hh-bH);
  ctx.lineTo(x,y+TILE_H-bH);   ctx.lineTo(x-hw,y+hh-bH);
  ctx.closePath(); ctx.fillStyle=col.top; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();
}

function drawTree(ctx, x, y) {
  const base = y+TILE_H-4, trH = 14;
  ctx.fillStyle = '#5D4037';
  ctx.beginPath(); ctx.moveTo(x-5,base-trH); ctx.lineTo(x,base-trH+3);
  ctx.lineTo(x,base+2); ctx.lineTo(x-5,base); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E342E';
  ctx.beginPath(); ctx.moveTo(x+5,base-trH); ctx.lineTo(x,base-trH+3);
  ctx.lineTo(x,base+2); ctx.lineTo(x+5,base); ctx.closePath(); ctx.fill();
  const lY = base-trH;
  ctx.fillStyle = '#3A6B28';
  ctx.beginPath(); ctx.moveTo(x,lY-24); ctx.lineTo(x+18,lY-3);
  ctx.lineTo(x,lY+6); ctx.lineTo(x-18,lY-3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4E8C35';
  ctx.beginPath(); ctx.moveTo(x,lY-16); ctx.lineTo(x+12,lY);
  ctx.lineTo(x,lY+5); ctx.lineTo(x-12,lY); ctx.closePath(); ctx.fill();
}

function drawFlowerDots(ctx, x, y) {
  [[-14,14,'#FF8FAB'],[-4,18,'#FFD166'],[10,12,'#FF8FAB'],[16,20,'#A3B856']]
    .forEach(([dx,dy,c]) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(x+dx,y+dy,2.5,0,Math.PI*2); ctx.fill();
    });
}

function drawWater(ctx, x, y) {
  drawDiamond(ctx, x, y, '#4A9BB8', '#3A8BA8');
  ctx.fillStyle = 'rgba(180,230,255,.45)';
  ctx.beginPath(); ctx.ellipse(x-10,y+TILE_H/2-4,8,3,-0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+8, y+TILE_H/2+2,6,2, 0.2,0,Math.PI*2); ctx.fill();
}

function drawBoard() {
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bg = ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#E8F4FD'); bg.addColorStop(1,'#D8EDA8');
  ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  for (let sum = 0; sum < 13; sum++) {
    for (let c = 0; c < 7; c++) {
      const r = sum - c;
      if (r < 0 || r > 6) continue;
      const key  = `${c},${r}`;
      const type = TILE_MAP[key] || 'grass';
      const {x,y} = isoXY(c, r);

      if      (type === 'path')        drawDiamond(ctx,x,y,'#C8A84B','#A89030');
      else if (type === 'water')       drawWater(ctx,x,y);
      else if (type === 'flower')    { drawDiamond(ctx,x,y,'#8AAA42','#7A9A32'); drawFlowerDots(ctx,x,y); }
      else if (type.startsWith('s'))   drawDiamond(ctx,x,y,'#C8A84B','#A89030');
      else                             drawDiamond(ctx,x,y,'#7A9A3A','#6A8A2A');

      if (type === 'tree') {
        drawTree(ctx,x,y);
      } else if (type.startsWith('s')) {
        drawPlatform(ctx,x,y,stageCol(type));
        ctx.font='14px sans-serif';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText({s1:'⭐',s2:'🍽',s3:'❓',s4:'🏆'}[type], x, y+TILE_H/2-20);
      }
    }
  }
}

/* ══════════════════════════════════════════
   НАВИГАЦИЯ ПО ЭТАПАМ
   ══════════════════════════════════════════ */
function goToStage(n) {
  for (let i = 0; i < n-1; i++) {
    if (!G.stagesDone[i]) { flashBtn(n); return; }
  }
  if (G.stagesDone[n-1]) return;
  if      (n===1) openS1();
  else if (n===2) openS2();
  else if (n===3) openS3();
  else            triggerWin();
}

function flashBtn(n) {
  const btn = document.getElementById(`sbtn-${n}`);
  btn.style.background = '#FF8FAB';
  setTimeout(() => btn.style.background='', 400);
}

function updateButtons() {
  [1,2,3,4].forEach(n => {
    const i   = n-1;
    const btn = document.getElementById(`sbtn-${n}`);
    btn.className = 'stage-btn ' +
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

  const field = document.getElementById('catch-field');
  [...field.querySelectorAll('.fly-obj')].forEach(el => el.remove());

  setTimeout(() => {
    const fW = field.clientWidth  || 340;
    const fH = field.clientHeight || 210;
    for (let i = 0; i < G.TOTAL_BUTTERFLIES; i++) spawnObj(field,fW,fH,'🦋',true);
    ['🌸','⭐','🍃','🌼','🐝','☁️'].forEach(em => spawnObj(field,fW,fH,em,false));
  }, 80);
}

function spawnObj(field, fW, fH, emoji, isBfly) {
  const el       = document.createElement('div');
  el.className   = 'fly-obj' + (isBfly ? ' butterfly' : '');
  el.textContent = emoji;
  el.style.left  = (5 + Math.random() * (fW - 75)) + 'px';
  el.style.top   = (5 + Math.random() * (fH - 55)) + 'px';
  el.style.setProperty('--dur', (2.2+Math.random()*2.8).toFixed(1)+'s');
  el.style.setProperty('--dly', (-Math.random()*3).toFixed(1)+'s');
  el.addEventListener('click', () => isBfly ? catchButterfly(el) : wrongClick(el));
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    isBfly ? catchButterfly(el) : wrongClick(el);
  }, {passive:false});
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
  moveBoardChars('s2');
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
  G.wife     = null;
  G.daughter = null;
  G.stagesDone       = [false,false,false,false];
  G.butterfliesCaught = 0;

  ['overlay-win','overlay-s1','overlay-s2','overlay-s3']
    .forEach(id => document.getElementById(id).classList.add('hidden'));

  const panel = document.getElementById('char-panel');
  panel.classList.remove('visible');
  panel.classList.add('hidden');

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
});
