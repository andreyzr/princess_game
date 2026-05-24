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
   ПЕРСОНАЖИ — ЖЕНА
   Сетка 10×18 пикселей. Индексы цветов:
   0=прозр 1=волосы 2=топ 3=кожа 4=глаза
   5=рот   6=обувь  7=низ 8=пояс 9=слой2
   ══════════════════════════════════════════ */
const WIFE_CHARS = {

  /* ── ОБРАЗ 1: белая рубашка + джинсы ── */
  1: {
    name: 'Повседневная',
    desc: 'Уютная & лёгкая',
    pal:  [null,'#5C2D0A','#F0ECD8','#FDBCB4','#2D7A3A','#E17055',
               '#E8E0D0','#7A9AC0','#3D2B1F','#D8D4C0'],
    grid: [
      [0,0,1,1,1,1,1,0,0,0], //  0 crown
      [0,1,1,1,1,1,1,1,0,0], //  1 hair wide
      [1,1,3,3,3,3,3,1,0,0], //  2 face
      [1,0,3,4,3,4,3,0,1,0], //  3 eyes (green)
      [1,0,3,3,3,3,3,0,1,0], //  4 cheeks + long hair
      [1,1,3,5,3,3,3,1,0,0], //  5 smile
      [1,0,0,3,3,3,0,1,1,0], //  6 neck
      [1,2,2,2,2,2,2,1,1,0], //  7 shirt — hair still visible
      [1,2,2,2,2,2,2,2,1,0], //  8 shirt body
      [0,2,8,8,8,8,8,2,0,0], //  9 belt
      [0,0,7,7,7,7,7,7,0,0], // 10 wide-leg jeans
      [0,1,7,7,0,7,7,1,0,0], // 11 legs + hair ends
      [0,1,7,7,0,7,7,1,0,0], // 12 legs + hair
      [0,0,7,7,0,7,7,0,0,0], // 13 legs
      [0,0,7,7,0,7,7,0,0,0], // 14 legs
      [0,0,7,7,0,7,7,0,0,0], // 15 jeans cuff
      [0,0,6,6,0,6,6,0,0,0], // 16 sneakers
      [0,6,6,6,0,6,6,6,0,0], // 17 chunky sole
    ],
  },

  /* ── ОБРАЗ 2: зелёная куртка + карго ── */
  2: {
    name: 'Путешественница',
    desc: 'Готова к приключениям',
    pal:  [null,'#5C2D0A','#4A6741','#FDBCB4','#2D7A3A','#E17055',
               '#4A2C10','#6B4C35','#7A5020','#F0ECD8'],
    grid: [
      [0,0,1,1,1,0,0,0,1,1], //  0 hair + ponytail tip (right)
      [0,1,1,1,1,1,0,0,1,0], //  1 hair + ponytail
      [0,1,3,3,3,3,1,0,1,0], //  2 face + ponytail
      [0,0,3,4,3,4,3,0,0,0], //  3 eyes
      [0,0,3,3,3,3,3,0,0,0], //  4 cheeks
      [0,0,3,5,3,3,0,0,0,0], //  5 smile
      [0,0,0,3,3,3,0,0,0,0], //  6 neck
      [0,2,9,9,9,9,9,2,0,0], //  7 jacket open + white shirt
      [2,2,9,9,9,9,9,2,2,0], //  8 jacket body
      [0,2,9,8,8,8,9,2,0,0], //  9 belt visible
      [0,0,7,7,7,7,7,7,0,0], // 10 cargo pants
      [0,0,7,7,0,7,7,0,0,0], // 11 legs
      [0,0,7,7,0,7,7,0,0,0], // 12 cargo pocket row
      [0,0,7,7,0,7,7,0,0,0], // 13 legs
      [0,0,6,6,0,6,6,0,0,0], // 14 boot top
      [0,0,6,6,0,6,6,0,0,0], // 15 boots
      [0,0,6,6,0,6,6,0,0,0], // 16 boots
      [0,6,6,6,0,6,6,6,0,0], // 17 boot soles
    ],
  },

  /* ── ОБРАЗ 3: тренч + чёрный + пучок ── */
  3: {
    name: 'Элегантная',
    desc: 'Стильная & загадочная',
    pal:  [null,'#5C2D0A','#C4A882','#FDBCB4','#2D7A3A','#E17055',
               '#1A1A2A','#2D2D3D','#8B7050','#252535'],
    grid: [
      [0,0,0,1,1,1,0,0,0,0], //  0 bun compact
      [0,0,1,1,1,1,1,0,0,0], //  1 bun
      [0,1,1,3,3,3,1,1,0,0], //  2 hair sides + face
      [0,0,3,4,3,4,3,0,0,0], //  3 eyes (green)
      [0,0,3,3,3,3,3,0,0,0], //  4 cheeks
      [0,0,3,5,3,3,0,0,0,0], //  5 smile
      [0,0,0,3,3,3,0,0,0,0], //  6 neck
      [0,9,9,9,9,9,9,9,0,0], //  7 black turtleneck
      [2,2,2,2,2,2,2,2,2,0], //  8 trench coat (very wide)
      [0,2,8,8,8,8,8,2,0,0], //  9 trench belt
      [0,2,7,7,7,7,7,2,0,0], // 10 trench open + black pants
      [0,2,7,7,0,7,7,2,0,0], // 11 coat flap + legs
      [0,2,7,7,0,7,7,2,0,0], // 12 coat hem + legs
      [0,0,7,7,0,7,7,0,0,0], // 13 legs below coat
      [0,0,7,7,0,7,7,0,0,0], // 14 legs
      [0,0,6,6,0,6,6,0,0,0], // 15 ankle boots
      [0,0,6,6,0,6,6,0,0,0], // 16 boots
      [0,6,6,6,0,6,6,6,0,0], // 17 boot soles
    ],
  },
};

/* ══════════════════════════════════════════
   ПЕРСОНАЖИ — ДОЧЬ
   Сетка 9×14 (малышка: пухлые пропорции)
   Те же индексы цветов
   ══════════════════════════════════════════ */
const DAUGHT_CHARS = {

  /* ── ОБРАЗ 1: жёлтая куртка + фиолетовые штаны + хвостики ── */
  1: {
    name: 'Солнышко',
    desc: 'Озорная & весёлая',
    pal:  [null,'#C8860A','#F5C000','#FDBCB4','#4A90D9','#E17055',
               '#9B72CF','#7C5CC0','#8B5CF6','#5B4FBF'],
    grid: [
      [1,0,0,1,1,0,0,1,0], //  0 два хвостика
      [1,1,1,1,1,1,1,1,0], //  1 волосы
      [1,1,3,3,3,3,1,1,0], //  2 лицо (широкое)
      [0,0,3,4,3,4,3,0,0], //  3 голубые глаза
      [0,0,3,3,3,3,3,0,0], //  4 пухлые щёки
      [0,0,0,3,5,3,0,0,0], //  5 маленький рот
      [0,2,2,2,2,2,2,0,0], //  6 жёлтая куртка
      [2,2,9,9,9,9,9,2,0], //  7 куртка + фиолетовая футболка
      [0,2,2,9,9,9,2,0,0], //  8 куртка снизу
      [0,0,7,7,7,7,0,0,0], //  9 фиолетовые штаны
      [0,0,7,7,0,7,7,0,0], // 10 короткие ножки
      [0,0,7,7,0,7,7,0,0], // 11 ножки
      [0,0,6,6,0,6,6,0,0], // 12 кроссовки
      [0,6,6,6,0,6,6,6,0], // 13 подошва
    ],
  },

  /* ── ОБРАЗ 2: розовая толстовка + джинсовый комбез + розовые кеды ── */
  2: {
    name: 'Непоседа',
    desc: 'Активная & смелая',
    pal:  [null,'#C8860A','#6B8CB8','#FDBCB4','#4A90D9','#E17055',
               '#FF8FAB','#5A7CA8','#FF8FAB','#F472B6'],
    grid: [
      [0,0,1,1,1,0,0,0,0], //  0 хвостик вверх
      [0,1,1,1,1,1,0,0,0], //  1 волосы
      [0,1,3,3,3,3,1,0,0], //  2 лицо
      [0,0,3,4,3,4,3,0,0], //  3 голубые глаза
      [0,0,3,3,3,3,3,0,0], //  4 пухлые щёки
      [0,0,0,3,5,3,0,0,0], //  5 рот
      [0,9,9,9,9,9,9,0,0], //  6 розовая толстовка
      [9,9,2,2,2,2,9,9,0], //  7 лямки комбеза (2=деним) + рукава
      [0,9,2,2,2,2,9,0,0], //  8 грудь комбеза + толстовка
      [0,0,7,7,7,7,0,0,0], //  9 штаны деним
      [0,0,7,7,0,7,7,0,0], // 10 ножки
      [0,0,7,7,0,7,7,0,0], // 11 ножки
      [0,0,6,6,0,6,6,0,0], // 12 розовые кеды
      [0,6,6,6,0,6,6,6,0], // 13 подошва
    ],
  },

  /* ── ОБРАЗ 3: шапка + фиолетовый пуховик + бежевые штаны ── */
  3: {
    name: 'Уютная',
    desc: 'Добрая & мечтательная',
    pal:  [null,'#C8860A','#9B72CF','#FDBCB4','#4A90D9','#E17055',
               '#7A5030','#E8DFC0','#F8F4EC','#F0EAD8'],
    grid: [
      [0,0,8,8,8,8,0,0,0], //  0 помпон шапки (белый)
      [0,8,8,8,8,8,8,0,0], //  1 шапка
      [0,1,3,3,3,3,1,0,0], //  2 волосы/лицо под шапкой
      [0,0,3,4,3,4,3,0,0], //  3 голубые глаза
      [0,0,3,3,3,3,3,0,0], //  4 лицо
      [0,0,0,3,5,3,0,0,0], //  5 рот
      [0,2,2,2,2,2,2,0,0], //  6 фиолетовый пуховик
      [2,2,9,9,9,9,9,2,0], //  7 пуховик + бежевый свитер
      [0,2,2,9,9,9,2,0,0], //  8 пуховик снизу
      [0,0,7,7,7,7,0,0,0], //  9 бежевые штаны
      [0,0,7,7,0,7,7,0,0], // 10 ножки
      [0,0,7,7,0,7,7,0,0], // 11 ножки
      [0,0,6,6,0,6,6,0,0], // 12 коричневые ботинки
      [0,6,6,6,0,6,6,6,0], // 13 подошва
    ],
  },
};

/* ══════════════════════════════════════════
   РИСОВАНИЕ СПРАЙТОВ
   ══════════════════════════════════════════ */
function drawChar(canvas, charDef) {
  if (!charDef) return;
  const rows = charDef.grid.length;
  const cols = charDef.grid[0].length;
  const s    = Math.min(
    Math.floor(canvas.width  / cols),
    Math.floor(canvas.height / rows)
  );
  if (s < 1) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  charDef.grid.forEach((row, y) =>
    row.forEach((idx, x) => {
      if (charDef.pal[idx]) {
        ctx.fillStyle = charDef.pal[idx];
        ctx.fillRect(x * s, y * s, s, s);
      }
    })
  );
}

/* ─── ЗВЁЗДЫ ─── */
function makeStars() {
  const bg = document.getElementById('stars-bg');
  for (let i = 0; i < 24; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText =
      `left:${Math.random()*100}%;top:${Math.random()*100}%;` +
      `--d:${(2+Math.random()*3).toFixed(1)}s;--dl:${(-Math.random()*4).toFixed(1)}s`;
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

function goToDaughter() {
  if (!G.wife) return;
  show('screen-daughter');
}

function backToWife() {
  show('screen-wife');
}

/* ══════════════════════════════════════════
   ЭКРАН 2: ВЫБОР ДОЧЕРИ
   ══════════════════════════════════════════ */
function selectDaughter(id) {
  G.daughter = id;
  document.querySelectorAll('.d-card').forEach(c => c.classList.remove('picked'));
  document.querySelector(`.d-card[data-id="${id}"]`).classList.add('picked');
  document.getElementById('btn-start').disabled = false;
}

/* ══════════════════════════════════════════
   СТАРТ ИГРЫ
   ══════════════════════════════════════════ */
function startGame() {
  if (!G.wife || !G.daughter) return;

  // Шапка
  drawChar(document.getElementById('cv-header'), WIFE_CHARS[G.wife]);
  drawChar(document.getElementById('cv-hdr-d'),  DAUGHT_CHARS[G.daughter]);
  document.getElementById('hdr-name').textContent = WIFE_CHARS[G.wife].name;

  // Токен персонажа на поле
  drawChar(document.getElementById('cv-token'), WIFE_CHARS[G.wife]);

  // Строим изометрическое поле
  drawBoard();
  updateButtons();

  show('screen-board');
}

/* ══════════════════════════════════════════
   ИЗОМЕТРИЧЕСКОЕ ПОЛЕ
   ══════════════════════════════════════════ */
const TILE_W = 80, TILE_H = 40, OX = 310, OY = 20;

function isoXY(c, r) {
  return { x: OX + (c-r)*(TILE_W/2), y: OY + (c+r)*(TILE_H/2) };
}

const TILE_MAP = {
  '0,2':'path','1,2':'path','2,2':'path','3,2':'path','4,2':'path',
  '4,1':'path','5,2':'path','5,3':'path',
  '4,4':'path','3,4':'path','2,4':'path','1,5':'path',
  '5,1':'s1','5,4':'s2','1,4':'s3','1,6':'s4',
  '0,0':'tree','1,0':'tree','2,0':'tree','3,0':'tree','4,0':'tree','5,0':'tree','6,0':'tree',
  '0,1':'tree','6,1':'tree','0,3':'tree','6,2':'tree','6,3':'tree',
  '0,4':'tree','6,4':'tree','0,5':'tree','6,5':'tree','0,6':'tree','6,6':'tree',
  '3,3':'water','4,3':'water',
  '1,1':'flower','2,1':'flower','3,1':'flower',
  '1,3':'flower','2,3':'flower',
  '2,5':'flower','3,5':'flower','4,5':'flower','5,5':'flower',
  '2,6':'flower','3,6':'flower','4,6':'flower','5,6':'flower',
};

function stageColor(key) {
  const i = {s1:0,s2:1,s3:2,s4:3}[key];
  if (G.stagesDone[i])      return {top:'#7CC85A',lft:'#4A9030',rgt:'#5CAA40',brd:'#2D7A20'};
  if (isNext(i))            return {top:'#FFD166',lft:'#C0A030',rgt:'#D8B040',brd:'#8B7000'};
  return                          {top:'#C0C0C0',lft:'#888888',rgt:'#A0A0A0',brd:'#666666'};
}
function isNext(i) {
  for (let j=0;j<i;j++) if (!G.stagesDone[j]) return false;
  return !G.stagesDone[i];
}

function drawDiamond(ctx, x, y, fill, stroke) {
  const hw=TILE_W/2, hh=TILE_H/2;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x+hw, y+hh);
  ctx.lineTo(x, y+TILE_H); ctx.lineTo(x-hw, y+hh);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=0.7; ctx.stroke(); }
}

function drawPlatform(ctx, x, y, col) {
  const hw=TILE_W/2, hh=TILE_H/2, bH=18;
  // left face
  ctx.beginPath();
  ctx.moveTo(x-hw,y+hh-bH); ctx.lineTo(x,y+TILE_H-bH);
  ctx.lineTo(x,y+TILE_H);   ctx.lineTo(x-hw,y+hh);
  ctx.closePath(); ctx.fillStyle=col.lft; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();
  // right face
  ctx.beginPath();
  ctx.moveTo(x+hw,y+hh-bH); ctx.lineTo(x,y+TILE_H-bH);
  ctx.lineTo(x,y+TILE_H);   ctx.lineTo(x+hw,y+hh);
  ctx.closePath(); ctx.fillStyle=col.rgt; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();
  // top face
  ctx.beginPath();
  ctx.moveTo(x,y-bH);         ctx.lineTo(x+hw,y+hh-bH);
  ctx.lineTo(x,y+TILE_H-bH); ctx.lineTo(x-hw,y+hh-bH);
  ctx.closePath(); ctx.fillStyle=col.top; ctx.fill();
  ctx.strokeStyle=col.brd; ctx.lineWidth=0.8; ctx.stroke();
}

function drawTree(ctx, x, y) {
  const base=y+TILE_H-4, trH=14;
  ctx.fillStyle='#5D4037';
  ctx.beginPath(); ctx.moveTo(x-5,base-trH); ctx.lineTo(x,base-trH+3);
  ctx.lineTo(x,base+2); ctx.lineTo(x-5,base); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4E342E';
  ctx.beginPath(); ctx.moveTo(x+5,base-trH); ctx.lineTo(x,base-trH+3);
  ctx.lineTo(x,base+2); ctx.lineTo(x+5,base); ctx.closePath(); ctx.fill();
  const lY=base-trH;
  ctx.fillStyle='#3A6B28';
  ctx.beginPath(); ctx.moveTo(x,lY-24); ctx.lineTo(x+18,lY-3);
  ctx.lineTo(x,lY+6); ctx.lineTo(x-18,lY-3); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#4E8C35';
  ctx.beginPath(); ctx.moveTo(x,lY-16); ctx.lineTo(x+12,lY);
  ctx.lineTo(x,lY+5); ctx.lineTo(x-12,lY); ctx.closePath(); ctx.fill();
}

function drawFlowerDots(ctx, x, y) {
  [[-14,14,'#FF8FAB'],[-4,18,'#FFD166'],[10,12,'#FF8FAB'],[16,20,'#A3B856']].forEach(([dx,dy,c])=>{
    ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x+dx,y+dy,2.5,0,Math.PI*2); ctx.fill();
  });
}

function drawWater(ctx, x, y) {
  drawDiamond(ctx, x, y, '#4A9BB8', '#3A8BA8');
  ctx.fillStyle='rgba(180,230,255,.45)';
  ctx.beginPath(); ctx.ellipse(x-10,y+TILE_H/2-4,8,3,-0.3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+8, y+TILE_H/2+2,6,2, 0.2,0,Math.PI*2); ctx.fill();
}

function drawBoard() {
  const canvas=document.getElementById('board-canvas');
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const bg=ctx.createLinearGradient(0,0,0,canvas.height);
  bg.addColorStop(0,'#E8F4FD'); bg.addColorStop(1,'#D8EDA8');
  ctx.fillStyle=bg; ctx.fillRect(0,0,canvas.width,canvas.height);

  for (let sum=0; sum<14; sum++) {
    for (let c=0; c<7; c++) {
      const r=sum-c;
      if (r<0||r>6) continue;
      const key=`${c},${r}`;
      const type=TILE_MAP[key]||'grass';
      const {x,y}=isoXY(c,r);
      if      (type==='path')   drawDiamond(ctx,x,y,'#C8A84B','#A89030');
      else if (type==='water')  drawWater(ctx,x,y);
      else if (type==='flower') { drawDiamond(ctx,x,y,'#8AAA42','#7A9A32'); drawFlowerDots(ctx,x,y); }
      else if (type.startsWith('s')) drawDiamond(ctx,x,y,'#C8A84B','#A89030');
      else                      drawDiamond(ctx,x,y,'#7A9A3A','#6A8A2A');

      if (type==='tree')           drawTree(ctx,x,y);
      else if (type.startsWith('s')) {
        drawPlatform(ctx,x,y,stageColor(type));
        ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText({s1:'⭐',s2:'🍽',s3:'❓',s4:'🏆'}[type],x,y+TILE_H/2-19);
      }
    }
  }
}

/* ══════════════════════════════════════════
   НАВИГАЦИЯ ПО ЭТАПАМ
   ══════════════════════════════════════════ */
function goToStage(n) {
  for (let i=0;i<n-1;i++) { if (!G.stagesDone[i]) { flashBtn(n); return; } }
  if (G.stagesDone[n-1]) return;
  if (n===1) openS1();
  else if (n===2) openS2();
  else if (n===3) openS3();
  else            triggerWin();
}

function flashBtn(n) {
  const btn=document.getElementById(`sbtn-${n}`);
  btn.style.background='#FF8FAB';
  setTimeout(()=>btn.style.background='',400);
}

function updateButtons() {
  [1,2,3,4].forEach(n=>{
    const i=n-1;
    const btn=document.getElementById(`sbtn-${n}`);
    btn.className='stage-btn '+(G.stagesDone[i]?'s-done':isNext(i)?'s-active':'s-locked');
  });
  document.getElementById('stages-done').textContent=G.stagesDone.filter(Boolean).length;
  drawBoard();
}

/* ══════════════════════════════════════════
   ЭТАП 1: ЗАГАДКА + БАБОЧКИ
   ══════════════════════════════════════════ */
function openS1() {
  document.getElementById('phase-riddle').classList.remove('hidden');
  document.getElementById('phase-catch').classList.add('hidden');
  const inp=document.getElementById('riddle-input');
  inp.value=''; inp.disabled=false; inp.classList.remove('shake');
  document.getElementById('riddle-fb').textContent='';
  document.getElementById('riddle-fb').className='riddle-fb';
  document.getElementById('overlay-s1').classList.remove('hidden');
}

function checkRiddle() {
  const val=document.getElementById('riddle-input').value.trim().toLowerCase();
  const inp=document.getElementById('riddle-input');
  const fb=document.getElementById('riddle-fb');
  if (val.includes('картин')) {
    fb.textContent='Верно! 🎉 Теперь — ловим бабочек!';
    fb.className='riddle-fb ok';
    inp.disabled=true;
    setTimeout(startCatchGame,1000);
  } else {
    fb.textContent='Не угадала... попробуй ещё! 🤔';
    fb.className='riddle-fb bad';
    inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
  }
}

function startCatchGame() {
  G.butterfliesCaught=0;
  document.getElementById('caught-n').textContent='0';
  document.getElementById('total-n').textContent=G.TOTAL_BUTTERFLIES;
  document.getElementById('catch-win').classList.add('hidden');
  document.getElementById('phase-riddle').classList.add('hidden');
  document.getElementById('phase-catch').classList.remove('hidden');

  // Рисуем выбранную дочь-помощницу
  const dcv=document.getElementById('cv-daughter-game');
  drawChar(dcv, DAUGHT_CHARS[G.daughter]);

  const field=document.getElementById('catch-field');
  [...field.querySelectorAll('.fly-obj')].forEach(el=>el.remove());

  setTimeout(()=>{
    const fW=field.clientWidth||340, fH=field.clientHeight||200;
    for (let i=0;i<G.TOTAL_BUTTERFLIES;i++) spawnObj(field,fW,fH,'🦋',true);
    ['🌸','⭐','🍃','🌼','🐝','☁️'].forEach(em=>spawnObj(field,fW,fH,em,false));
  },80);
}

function spawnObj(field,fW,fH,emoji,isBfly) {
  const el=document.createElement('div');
  el.className='fly-obj'+(isBfly?' butterfly':'');
  el.textContent=emoji;
  el.style.left=(8+Math.random()*(fW-56))+'px';
  el.style.top =(8+Math.random()*(fH-52))+'px';
  el.style.setProperty('--dur',(2.2+Math.random()*2.8).toFixed(1)+'s');
  el.style.setProperty('--dly',(-Math.random()*3).toFixed(1)+'s');
  el.addEventListener('click',()=>isBfly?catchButterfly(el):wrongClick(el));
  el.addEventListener('touchstart',e=>{e.preventDefault();isBfly?catchButterfly(el):wrongClick(el);},{passive:false});
  field.appendChild(el);
}

function catchButterfly(el) {
  if (el.classList.contains('caught')) return;
  el.classList.add('caught');
  G.butterfliesCaught++;
  document.getElementById('caught-n').textContent=G.butterfliesCaught;
  setTimeout(()=>el.remove(),360);
  if (G.butterfliesCaught>=G.TOTAL_BUTTERFLIES)
    setTimeout(()=>document.getElementById('catch-win').classList.remove('hidden'),450);
}

function wrongClick(el) {
  el.classList.remove('wrong-flash'); void el.offsetWidth; el.classList.add('wrong-flash');
  setTimeout(()=>el.classList.remove('wrong-flash'),430);
}

function completeS1() {
  G.stagesDone[0]=true;
  document.getElementById('overlay-s1').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 2: РЕСТОРАН
   ══════════════════════════════════════════ */
function openS2() {
  document.getElementById('rest-row').style.opacity='1';
  document.getElementById('rest-row').style.pointerEvents='';
  document.getElementById('rest-chosen').classList.add('hidden');
  document.querySelectorAll('.rest-card').forEach(c=>c.classList.remove('chosen'));
  document.getElementById('overlay-s2').classList.remove('hidden');
}
function pickRest(card,name) {
  document.querySelectorAll('.rest-card').forEach(c=>c.classList.remove('chosen'));
  card.classList.add('chosen');
  document.getElementById('rest-row').style.opacity='0.5';
  document.getElementById('rest-row').style.pointerEvents='none';
  document.getElementById('chosen-name').textContent=name;
  document.getElementById('rest-chosen').classList.remove('hidden');
}
function completeS2() {
  G.stagesDone[1]=true;
  document.getElementById('overlay-s2').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ЭТАП 3: ЗАГЛУШКА
   ══════════════════════════════════════════ */
function openS3() { document.getElementById('overlay-s3').classList.remove('hidden'); }
function completeS3() {
  G.stagesDone[2]=true;
  document.getElementById('overlay-s3').classList.add('hidden');
  updateButtons();
}

/* ══════════════════════════════════════════
   ФИНИШ
   ══════════════════════════════════════════ */
function triggerWin() {
  G.stagesDone[3]=true; updateButtons();
  drawChar(document.getElementById('cv-win-w'), WIFE_CHARS[G.wife]);
  drawChar(document.getElementById('cv-win-d'), DAUGHT_CHARS[G.daughter]);
  document.getElementById('overlay-win').classList.remove('hidden');
}

/* ══════════════════════════════════════════
   СБРОС
   ══════════════════════════════════════════ */
function resetGame() {
  G.wife=null; G.daughter=null;
  G.stagesDone=[false,false,false,false];
  G.butterfliesCaught=0;
  ['overlay-win','overlay-s1','overlay-s2','overlay-s3'].forEach(id=>
    document.getElementById(id).classList.add('hidden'));
  document.querySelectorAll('.char-card').forEach(c=>c.classList.remove('picked'));
  document.getElementById('btn-wife-next').disabled=true;
  document.getElementById('btn-start').disabled=true;
  show('screen-wife');
}

/* ─── УТИЛИТЫ ─── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ══════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
   ══════════════════════════════════════════ */
function init() {
  makeStars();
  // Жена: превью
  [1,2,3].forEach(id=>drawChar(document.getElementById(`w-cv-${id}`),WIFE_CHARS[id]));
  // Дочь: превью
  [1,2,3].forEach(id=>drawChar(document.getElementById(`d-cv-${id}`),DAUGHT_CHARS[id]));
}

window.addEventListener('DOMContentLoaded', init);
