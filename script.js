/* ═══════════════════════════════════════════
   PIXEL PRINCESS — script.js
   ═══════════════════════════════════════════ */

/* ─── СОСТОЯНИЕ ─── */
const G = {
  wife: null, daughter: null,
  /* 0=десерты, 1=вопрос(парки), 2=развилка(бабочки), 3=кафе, 4=финал */
  stagesDone: [false, false, false, false, false],
  chosenPark: null,
  forksRevealed: false,
  butterfliesCaught: 0,
  TOTAL_BUTTERFLIES: 8,
  selectedDesserts: new Set(),
  selectedPieceId: null,
  matchedCount: 0,
};

/* ─── ФАЙЛЫ ─── */
const WIFE_SRC   = { 1:'wife-повседневная.png', 2:'wife-путешественница.png', 3:'wife-элегантная.png' };
const WIFE_NAMES = { 1:'Повседневная', 2:'Путешественница', 3:'Элегантная' };
const DAUGHT_SRC = { 1:'daughter-солнышко.png', 2:'daughter-непоседа.png', 3:'daughter-уютная.png' };

/* ─── ПАРКИ ─── */
const PARK_NAMES  = { left:'Парк победы', right:'Александровский парк' };
const PARK_LABEL  = { left:'Победы',      right:'Александр.' };

/* ─── ДЕСЕРТЫ (пазл) ─── */
const CAKES = [
  { id:1, emoji:'🍰', name:'Чизкейк\nНью-Йорк',     shortName:'Чизкейк',      bg:'#FFF9E7', pieceColor:'#FFD54F' },
  { id:2, emoji:'🎂', name:'Торт\nСникерс',           shortName:'Сникерс',      bg:'#EFEBE9', pieceColor:'#8D6E63' },
  { id:3, emoji:'🍮', name:'Торт Красный\nбархат',    shortName:'Красный бархат',bg:'#FFEBEE', pieceColor:'#EF5350' },
  { id:4, emoji:'🧁', name:'Капкейки\nс апельсином',  shortName:'Капкейки',     bg:'#FFF3E0', pieceColor:'#FF7043' },
];

/* ─── ПОЗИЦИИ ПЕРСОНАЖЕЙ НА ПОЛЕ ─── */
const CHAR_POS = {
  start:  { left:'50%',   top:'4.2%'  },
  s1:     { left:'68.9%', top:'24.6%' },
  fork_l: { left:'27.8%', top:'43.8%' },
  fork_r: { left:'78.3%', top:'43.8%' },
  s3:     { left:'52.8%', top:'63.5%' },
  s4:     { left:'43.1%', top:'82.3%' },
};

/* ═══════════════════════════════════════════
   ПОЛЕ — ТАЙЛЫ И РИСОВАНИЕ
   ═══════════════════════════════════════════ */
const TILE_W = 64, TILE_H = 32;

const TILES = [
  { cx:180, cy:22,  type:'start'  },
  { cx:210, cy:56,  type:'path'   },
  { cx:240, cy:92,  type:'path'   },
  { cx:248, cy:128, type:'s1'     },
  { cx:268, cy:163, type:'path'   },
  { cx:210, cy:165, type:'path'   },
  { cx:160, cy:196, type:'path'   },
  { cx:100, cy:228, type:'fork_l' },
  { cx:282, cy:228, type:'fork_r' },
  { cx:238, cy:278, type:'path'   },
  { cx:140, cy:280, type:'path'   },
  { cx:190, cy:330, type:'s3'     },
  { cx:175, cy:380, type:'path'   },
  { cx:155, cy:428, type:'s4'     },
];

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

function platCol(type) {
  const sd = G.stagesDone;
  const done   = c => ({ top:'#7CC85A', lft:'#4A9030', rgt:'#5CAA40', brd:'#2D7A20' });
  const active = c => ({ top:'#FFD166', lft:'#C0A030', rgt:'#D8B040', brd:'#8B7000' });
  const locked = c => ({ top:'#C8C8C8', lft:'#888',    rgt:'#A8A8A8', brd:'#666'    });
  const blue   = c => ({ top:'#B8E8FF', lft:'#4A9BB8', rgt:'#6AB8D4', brd:'#2A7A98' });

  if (type === 'start') return sd[0] ? done() : active();
  if (type === 's1')    return sd[1] ? done() : sd[0] ? active() : locked();
  if (type === 'fork_l' || type === 'fork_r') {
    if (!G.forksRevealed) return locked();
    const side = type === 'fork_l' ? 'left' : 'right';
    return G.chosenPark === side ? done() : blue();
  }
  if (type === 's3') return sd[3] ? done() : sd[2] ? active() : locked();
  if (type === 's4') return sd[4] ? done() : sd[3] ? active() : locked();
  return locked();
}

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
    ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=col.brd; ctx.lineWidth=0.7; ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx,cy-bH); ctx.lineTo(cx+hw,cy+hh-bH);
  ctx.lineTo(cx,cy+TILE_H-bH); ctx.lineTo(cx-hw,cy+hh-bH);
  ctx.closePath(); ctx.fillStyle=col.top; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.7; ctx.stroke();
}

function drawTree(ctx, cx, cy) {
  const base=cy+TILE_H-2, trH=12;
  [['#5D4037',-4],['#4E342E',4]].forEach(([c,dx])=>{
    ctx.fillStyle=c; ctx.beginPath();
    ctx.moveTo(cx+dx,base-trH); ctx.lineTo(cx,base-trH+3);
    ctx.lineTo(cx,base+1); ctx.lineTo(cx+dx,base);
    ctx.closePath(); ctx.fill();
  });
  const ly=base-trH;
  [['#3A6B28',20,7],['#4E8C35',13,5]].forEach(([c,r,h])=>{
    ctx.fillStyle=c; ctx.beginPath();
    ctx.moveTo(cx,ly-r*1.4); ctx.lineTo(cx+r,ly-2);
    ctx.lineTo(cx,ly+h); ctx.lineTo(cx-r,ly-2);
    ctx.closePath(); ctx.fill();
  });
}

function drawWater(ctx,cx,cy){
  drawDiamond(ctx,cx,cy,'#4A9BB8','#3A8BA8');
  ctx.fillStyle='rgba(180,230,255,.5)';
  ctx.beginPath(); ctx.ellipse(cx-8,cy+TILE_H/2-3,7,2.5,-.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx+6,cy+TILE_H/2+2,5,2,.2,0,Math.PI*2); ctx.fill();
}

function drawFlower(ctx,cx,cy){
  drawDiamond(ctx,cx,cy,'#8AAA42','#7A9A32');
  [[-10,10,'#FF8FAB'],[-2,14,'#FFD166'],[8,9,'#FF8FAB'],[12,15,'#A3B856']].forEach(([dx,dy,c])=>{
    ctx.fillStyle=c; ctx.beginPath();
    ctx.arc(cx+dx,cy+TILE_H/2+dy/2,2,0,Math.PI*2); ctx.fill();
  });
}

function drawPathLines(ctx) {
  const hh = TILE_H/2;
  ctx.save();
  ctx.strokeStyle='#C8A84B'; ctx.lineWidth=9;
  ctx.lineCap='round'; ctx.lineJoin='round'; ctx.setLineDash([14,8]);
  const poly = pts => {
    ctx.beginPath();
    pts.forEach(([cx,cy],i)=> i===0 ? ctx.moveTo(cx,cy+hh) : ctx.lineTo(cx,cy+hh));
    ctx.stroke();
  };
  poly([[180,22],[210,56],[240,92],[248,128]]);
  poly([[248,128],[210,165],[160,196],[100,228]]);
  poly([[248,128],[268,163],[282,228]]);
  if (G.forksRevealed) {
    poly([[100,228],[140,280],[190,330]]);
    poly([[282,228],[238,278],[190,330]]);
  }
  if (G.stagesDone[2]) poly([[190,330],[175,380],[155,428]]);
  ctx.setLineDash([]); ctx.restore();
}

function drawBoard() {
  const canvas = el('board-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const bg = ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#C8E6C9'); bg.addColorStop(.5,'#A5D6A7'); bg.addColorStop(1,'#81C784');
  ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle='rgba(255,255,255,.07)';
  for(let x=0;x<canvas.width;x+=20) for(let y=0;y<canvas.height;y+=20) ctx.fillRect(x,y,1,1);

  DECO.forEach(d=>{
    if(d.t==='tree')  { drawDiamond(ctx,d.cx,d.cy,'#6A8A2A','#5A7A1A'); drawTree(ctx,d.cx,d.cy); }
    else if(d.t==='water')  drawWater(ctx,d.cx,d.cy);
    else if(d.t==='flower') drawFlower(ctx,d.cx,d.cy);
  });

  drawPathLines(ctx);

  TILES.forEach(t=>{
    const { cx, cy, type } = t;
    const isLocked =
      (!G.stagesDone[0] && type!=='start') ||
      (!G.forksRevealed && (type==='fork_l'||type==='fork_r')) ||
      (!G.stagesDone[2] && (type==='s3'||(cy>=278&&type==='path'))) ||
      (!G.stagesDone[3] && (type==='s4'||(cy>=380&&type==='path')));

    ctx.globalAlpha = isLocked ? 0.32 : 1;

    if (type==='start') {
      drawDiamond(ctx,cx,cy,'#B8EEE9','#3CC9C0');
      drawPlatform(ctx,cx,cy,platCol('start'));
      ctx.font='13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(G.stagesDone[0]?'✓':'🍰', cx, cy+TILE_H/2-14);
    } else if (type==='path') {
      drawDiamond(ctx,cx,cy,'#C8A84B','#A89030');
    } else {
      drawDiamond(ctx,cx,cy,'#C8A84B','#A89030');
      drawPlatform(ctx,cx,cy,platCol(type));
      ctx.font='13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      const icons = {
        s1: G.stagesDone[1]?'✓':'⭐',
        fork_l: G.forksRevealed?'🌳':'❓',
        fork_r: G.forksRevealed?'🌳':'❓',
        s3: G.stagesDone[3]?'✓':'🍽',
        s4: G.stagesDone[4]?'✓':'🏆',
      };
      ctx.fillText(icons[type]||'?', cx, cy+TILE_H/2-14);
    }
    ctx.globalAlpha=1;
  });
}

/* ── Синхронизация overlay с canvas ── */
function syncOverlay() {
  const canvas  = el('board-canvas');
  const overlay = el('board-overlay');
  if (!canvas||!overlay) return;
  const r = canvas.getBoundingClientRect();
  overlay.style.width  = r.width  + 'px';
  overlay.style.height = r.height + 'px';
}

/* ── Кнопки этапов ── */
function updateButtons() {
  const sd = G.stagesDone, fr = G.forksRevealed;

  el('sbtn-0').className = 'stage-btn ' + (sd[0]?'s-done':'s-active');
  el('sbtn-1').className = 'stage-btn ' + (!sd[0]?'s-locked': sd[1]?'s-done':'s-active');

  ['l','r'].forEach((side,i)=>{
    const key  = side==='l'?'left':'right';
    const btn  = el(`fork-${side}`);
    const ico  = el(`fork-${side}-ico`);
    const txt  = el(`fork-${side}-txt`);
    if (!fr) {
      btn.className='stage-btn fork-btn s-locked';
      ico.textContent='❓'; txt.textContent='Парк';
    } else if (sd[2]) {
      btn.className='stage-btn fork-btn s-done';
      ico.textContent='🌳'; txt.textContent=PARK_LABEL[key];
    } else {
      btn.className='stage-btn fork-btn f-revealed';
      ico.textContent='🌳'; txt.textContent=PARK_LABEL[key];
    }
  });

  el('sbtn-3').className = 'stage-btn ' + (!sd[2]?'s-locked': sd[3]?'s-done':'s-active');
  el('sbtn-4').className = 'stage-btn ' + (!sd[3]?'s-locked': sd[4]?'s-done':'s-active');

  el('stages-done').textContent = sd.slice(1).filter(Boolean).length;
  drawBoard();
}

function goToStage(n) {
  const sd = G.stagesDone;
  if (n===0 && !sd[0])              { openS0(); return; }
  if (n===1 && sd[0] && !sd[1])     { openS1(); return; }
  if (n===3 && sd[2] && !sd[3])     { openS3(); return; }
  if (n===4 && sd[3] && !sd[4])     { openS4(); return; }
  flashStage(n);
}

function flashStage(n) {
  const ids = { 0:'sbtn-0', 1:'sbtn-1', 3:'sbtn-3', 4:'sbtn-4' };
  const btn = el(ids[n]); if (!btn) return;
  const was = btn.style.background;
  btn.style.background='#FF8FAB';
  setTimeout(()=>btn.style.background=was, 400);
}

/* ── Персонажи на поле ── */
function moveChars(stage) {
  const pos = CHAR_POS[stage]||CHAR_POS.start;
  const ch  = el('board-chars');
  ch.style.left = pos.left;
  ch.style.top  = pos.top;
}

/* ── Звёзды ── */
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

/* ═══════════════════════════════════════════
   ВЫБОР ПЕРСОНАЖЕЙ
   ═══════════════════════════════════════════ */
function selectWife(id) {
  G.wife = id;
  document.querySelectorAll('#screen-wife .char-card').forEach(c=>c.classList.remove('picked'));
  document.querySelector(`#screen-wife .char-card[data-id="${id}"]`).classList.add('picked');
  el('btn-wife-next').disabled = false;
}
function goToDaughter() { if (G.wife) show('screen-daughter'); }
function backToWife()   { show('screen-wife'); }

function selectDaughter(id) {
  G.daughter = id;
  document.querySelectorAll('.d-card').forEach(c=>c.classList.remove('picked'));
  document.querySelector(`.d-card[data-id="${id}"]`).classList.add('picked');
  el('btn-start').disabled = false;
}

/* ═══════════════════════════════════════════
   СТАРТ → ПРИВЕТСТВИЕ
   ═══════════════════════════════════════════ */
function startGame() {
  if (!G.wife || !G.daughter) return;

  const wSrc = WIFE_SRC[G.wife];
  const dSrc = DAUGHT_SRC[G.daughter];

  /* Устанавливаем все изображения сразу */
  ['hdr-wife','bc-wife','cp-wife','win-wife','anniv-wife','wc-wife']
    .forEach(id => { const e=el(id); if(e) e.src=wSrc; });
  ['hdr-daught','bc-daught','cp-daught','win-daught','anniv-daught','wc-daught','fork-daught']
    .forEach(id => { const e=el(id); if(e) e.src=dSrc; });

  el('hdr-name').textContent = WIFE_NAMES[G.wife];

  /* Показываем приветствие */
  el('overlay-welcome').classList.remove('hidden');
}

function closeWelcome() {
  el('overlay-welcome').classList.add('hidden');

  /* Сброс состояния */
  G.stagesDone    = [false,false,false,false,false];
  G.chosenPark    = null;
  G.forksRevealed = false;
  G.selectedDesserts.clear();
  G.butterfliesCaught = 0;

  /* Показываем панель персонажей */
  const panel = el('char-panel');
  panel.classList.remove('hidden'); panel.classList.add('visible');

  show('screen-board');
  requestAnimationFrame(()=>{
    drawBoard(); syncOverlay(); moveChars('start'); updateButtons();
    /* Сразу открываем этап 0 */
    setTimeout(openS0, 400);
  });
}

/* ═══════════════════════════════════════════
   ЭТАП 0 — ДЕСЕРТЫ + ПАЗЛ
   ═══════════════════════════════════════════ */
function openS0() {
  G.selectedDesserts.clear();
  document.querySelectorAll('.dessert-card').forEach(c=>{
    c.classList.remove('chosen');
    c.style.pointerEvents='';
  });
  el('btn-s0-next').disabled = true;
  el('s0-select').classList.remove('hidden');
  el('s0-match').classList.add('hidden');
  el('overlay-s0').classList.remove('hidden');
}

function toggleDessert(card) {
  const id = parseInt(card.dataset.d);
  if (G.selectedDesserts.has(id)) {
    G.selectedDesserts.delete(id);
    card.classList.remove('chosen');
  } else {
    G.selectedDesserts.add(id);
    card.classList.add('chosen');
  }
  el('btn-s0-next').disabled = G.selectedDesserts.size < 4;
}

function showMatchPhase() {
  el('s0-select').classList.add('hidden');
  el('s0-match').classList.remove('hidden');
  buildMatchGame();
}

function buildMatchGame() {
  G.selectedPieceId = null;
  G.matchedCount    = 0;
  el('match-win').classList.add('hidden');

  const shuffled = [...CAKES].sort(()=>Math.random()-.5);
  const layout = el('match-layout');
  layout.innerHTML = '<div class="cakes-col" id="cakes-col"></div><div class="pieces-col" id="pieces-col"></div>';

  CAKES.forEach(c=>{
    const row = document.createElement('div');
    row.className = 'cake-slot-row';
    row.dataset.cake = c.id;
    row.onclick = ()=>tryMatch(c.id);
    row.innerHTML=`
      <div class="cake-display" id="cdisp-${c.id}" style="background:${c.bg}">
        <span class="cake-big-ico">${c.emoji}</span>
        <div class="piece-hole" id="hole-${c.id}"></div>
      </div>
      <div class="cake-lbl">${c.shortName}</div>`;
    el('cakes-col').appendChild(row);
  });

  shuffled.forEach(c=>{
    const p = document.createElement('div');
    p.className = 'piece-chip';
    p.id = `piece-${c.id}`;
    p.dataset.piece = c.id;
    p.style.background = c.pieceColor;
    p.innerHTML = `<span class="piece-chip-ico">${c.emoji}</span>`;
    p.onclick = ()=>selectPiece(c.id, p);
    el('pieces-col').appendChild(p);
  });
}

function selectPiece(id, pieceEl) {
  if (pieceEl.classList.contains('matched')) return;
  if (G.selectedPieceId === id) {
    G.selectedPieceId = null;
    pieceEl.classList.remove('selected');
  } else {
    G.selectedPieceId = id;
    document.querySelectorAll('.piece-chip').forEach(p=>p.classList.remove('selected'));
    pieceEl.classList.add('selected');
  }
}

function tryMatch(cakeId) {
  if (!G.selectedPieceId) {
    /* Мигнуть слотом — выбери сначала кусочек */
    const hole = el(`hole-${cakeId}`);
    if (hole) { hole.style.borderColor='#FF8FAB'; setTimeout(()=>hole.style.borderColor='',500); }
    return;
  }
  const pieceEl = el(`piece-${G.selectedPieceId}`);
  if (!pieceEl) return;

  if (G.selectedPieceId === cakeId) {
    /* Правильно! */
    const cake  = CAKES.find(c=>c.id===cakeId);
    const hole  = el(`hole-${cakeId}`);
    const disp  = el(`cdisp-${cakeId}`);
    hole.innerHTML = cake.emoji;
    hole.classList.add('filled');
    disp.classList.add('cake-ok');
    pieceEl.classList.add('matched');
    pieceEl.classList.remove('selected');
    G.selectedPieceId = null;
    G.matchedCount++;
    if (G.matchedCount >= 4) setTimeout(()=>el('match-win').classList.remove('hidden'), 500);
  } else {
    /* Неверно — потрясти */
    const row = el(`cakes-col`).querySelector(`[data-cake="${cakeId}"]`);
    if (row) { row.classList.add('shake-err'); setTimeout(()=>row.classList.remove('shake-err'),400); }
    pieceEl.classList.add('shake-err'); setTimeout(()=>pieceEl.classList.remove('shake-err'),400);
  }
}

function completeS0() {
  G.stagesDone[0] = true;
  el('overlay-s0').classList.add('hidden');
  updateButtons();
}

/* ═══════════════════════════════════════════
   ЭТАП 1 — ВОПРОС (ДВА ПАРКА)
   ═══════════════════════════════════════════ */
function openS1() {
  el('park-1').value=''; el('park-2').value='';
  el('park-1').disabled=el('park-2').disabled=false;
  el('park-1').classList.remove('shake'); el('park-2').classList.remove('shake');
  el('parks-fb').textContent=''; el('parks-fb').className='riddle-fb';
  el('overlay-s1').classList.remove('hidden');
}

function checkParks() {
  const v1 = el('park-1').value.trim().toLowerCase();
  const v2 = el('park-2').value.trim().toLowerCase();
  const fb  = el('parks-fb');
  const isPobedy = s => s.includes('победы')||s.includes('победа')||s.includes('победе');
  const isAlex   = s => s.includes('александр');
  const ok = (isPobedy(v1)&&isAlex(v2)) || (isAlex(v1)&&isPobedy(v2));
  if (ok) {
    fb.textContent='Верно! 🎉 Выбери парк на карте!';
    fb.className='riddle-fb ok';
    el('park-1').disabled=el('park-2').disabled=true;
    setTimeout(()=>{
      el('overlay-s1').classList.add('hidden');
      G.stagesDone[1]=true; G.forksRevealed=true;
      moveChars('s1'); updateButtons();
    },1200);
  } else {
    fb.textContent='Не совсем верно... попробуй! 🤔';
    fb.className='riddle-fb bad';
    [el('park-1'),el('park-2')].forEach(inp=>{
      inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
    });
  }
}

/* ═══════════════════════════════════════════
   ЭТАП 2 — РАЗВИЛКА (ВЫБОР ПАРКА + БАБОЧКИ)
   ═══════════════════════════════════════════ */
function clickFork(side) {
  if (!G.forksRevealed || G.stagesDone[2]) return;
  G.chosenPark = side;
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
  [...field.querySelectorAll('.fly-obj')].forEach(e=>e.remove());
  setTimeout(()=>{
    const fW=field.clientWidth||320, fH=field.clientHeight||290;
    for(let i=0;i<G.TOTAL_BUTTERFLIES;i++) spawnObj(field,fW,fH,'🦋',true);
    ['🌸','⭐','🍃','🌼','🐝','☁️'].forEach(em=>spawnObj(field,fW,fH,em,false));
  },80);
}

function spawnObj(field,fW,fH,emoji,isBfly) {
  const e       = document.createElement('div');
  e.className   = 'fly-obj'+(isBfly?' butterfly':'');
  e.textContent = emoji;
  e.style.left  = (5+Math.random()*(fW-80))+'px';
  e.style.top   = (5+Math.random()*(fH-65))+'px';
  e.style.setProperty('--dur',(2.2+Math.random()*2.8).toFixed(1)+'s');
  e.style.setProperty('--dly',(-Math.random()*3).toFixed(1)+'s');
  const h = ()=> isBfly ? catchBfly(e) : wrongClick(e);
  e.addEventListener('click',h);
  e.addEventListener('touchstart',ev=>{ev.preventDefault();h();},{passive:false});
  field.appendChild(e);
}

function catchBfly(node) {
  if (node.classList.contains('caught')) return;
  node.classList.add('caught');
  G.butterfliesCaught++;
  el('fork-caught').textContent = G.butterfliesCaught;
  setTimeout(()=>node.remove(),360);
  if (G.butterfliesCaught>=G.TOTAL_BUTTERFLIES)
    setTimeout(()=>el('fork-win').classList.remove('hidden'),450);
}

function wrongClick(node) {
  node.classList.remove('wrong-flash'); void node.offsetWidth;
  node.classList.add('wrong-flash');
  setTimeout(()=>node.classList.remove('wrong-flash'),430);
}

function showParkReady() {
  el('fork-game-phase').classList.add('hidden');
  el('fork-done-phase').classList.remove('hidden');
}

function completeFork() {
  G.stagesDone[2]=true;
  el('overlay-fork').classList.add('hidden');
  moveChars(G.chosenPark==='left'?'fork_l':'fork_r');
  updateButtons();
}

/* ═══════════════════════════════════════════
   ЭТАП 3 — КАФЕ
   ═══════════════════════════════════════════ */
function openS3() {
  el('rest-row').style.opacity='1'; el('rest-row').style.pointerEvents='';
  el('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c=>c.classList.remove('chosen'));
  el('overlay-s3').classList.remove('hidden');
}
function pickRest(card,name) {
  document.querySelectorAll('.rest-card').forEach(c=>c.classList.remove('chosen'));
  card.classList.add('chosen');
  el('rest-row').style.opacity='0.5'; el('rest-row').style.pointerEvents='none';
  el('chosen-name').textContent=name;
  el('rest-chosen').classList.remove('hidden');
}
function completeS3() {
  G.stagesDone[3]=true;
  el('overlay-s3').classList.add('hidden');
  moveChars('s3'); updateButtons();
}

/* ═══════════════════════════════════════════
   ЭТАП 4 — ПОЗДРАВЛЕНИЕ С ГОДОВЩИНОЙ
   ═══════════════════════════════════════════ */
function openS4() { el('overlay-s4').classList.remove('hidden'); }

function completeS4() {
  G.stagesDone[4]=true;
  el('overlay-s4').classList.add('hidden');
  moveChars('s4'); updateButtons();
  setTimeout(()=>el('overlay-win').classList.remove('hidden'),400);
}

/* ═══════════════════════════════════════════
   СБРОС
   ═══════════════════════════════════════════ */
function resetGame() {
  G.wife=null; G.daughter=null;
  G.stagesDone=[false,false,false,false,false];
  G.chosenPark=null; G.forksRevealed=false;
  G.butterfliesCaught=0; G.selectedDesserts.clear();

  ['overlay-win','overlay-s0','overlay-s1','overlay-s3','overlay-s4',
   'overlay-fork','overlay-welcome'].forEach(id=>el(id).classList.add('hidden'));

  const p=el('char-panel'); p.classList.remove('visible'); p.classList.add('hidden');
  document.querySelectorAll('.char-card').forEach(c=>c.classList.remove('picked'));
  el('btn-wife-next').disabled=el('btn-start').disabled=true;
  show('screen-wife');
}

/* ─── УТИЛИТЫ ─── */
const el = id => document.getElementById(id);
function show(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  el(id).classList.add('active');
}

/* ═══════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ═══════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded',()=>{
  makeStars();
  window.addEventListener('resize',()=>{
    if (el('screen-board').classList.contains('active'))
      requestAnimationFrame(syncOverlay);
  });
});
