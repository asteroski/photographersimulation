(function(){
PG.Renderer = {};

function setupCanvas() {
  const canvas = document.getElementById('game-canvas');
  canvas.width = PG.CANVAS_W;
  canvas.height = PG.CANVAS_H;
  PG.canvas = canvas;
  PG.ctx = canvas.getContext('2d');
  return canvas;
}

const ctx = () => PG.ctx;
let tick = 0;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// === FLOORS ===
function drawStudioFloor() {
  const c = ctx();
  const grad = c.createLinearGradient(0, PG.STUDIO_Y1, 0, PG.STUDIO_Y2);
  grad.addColorStop(0, '#d8d8dc');
  grad.addColorStop(1, '#c8c8d0');
  c.fillStyle = grad;
  c.fillRect(0, PG.STUDIO_Y1, PG.CANVAS_W, PG.STUDIO_Y2 - PG.STUDIO_Y1);
  // subtle floor lines
  c.strokeStyle = 'rgba(0,0,0,0.03)';
  c.lineWidth = 1;
  for (let y = PG.STUDIO_Y1 + 40; y < PG.STUDIO_Y2; y += 40) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(PG.CANVAS_W, y); c.stroke();
  }
}

function drawShopFloor() {
  const c = ctx();
  const grad = c.createLinearGradient(0, PG.SHOP_Y1, 0, PG.SHOP_Y2);
  grad.addColorStop(0, '#d4a56a');
  grad.addColorStop(0.5, '#c89a5e');
  grad.addColorStop(1, '#b88848');
  c.fillStyle = grad;
  c.fillRect(0, PG.SHOP_Y1, PG.CANVAS_W, PG.SHOP_Y2 - PG.SHOP_Y1);
  // wood plank lines
  c.strokeStyle = 'rgba(0,0,0,0.04)';
  c.lineWidth = 1;
  for (let y = PG.SHOP_Y1 + 30; y < PG.SHOP_Y2; y += 30) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(PG.CANVAS_W, y); c.stroke();
  }
  for (let x = 0; x < PG.CANVAS_W; x += 120) {
    c.beginPath(); c.moveTo(x, PG.SHOP_Y1); c.lineTo(x, PG.SHOP_Y2);
    c.strokeStyle = 'rgba(0,0,0,0.02)'; c.stroke();
  }
}

// === WALL & DOOR ===
function drawWall() {
  const c = ctx();
  c.fillStyle = '#d0c8b8';
  c.fillRect(0, PG.WALL_Y1, PG.CANVAS_W, PG.WALL_Y2 - PG.WALL_Y1);
  c.fillStyle = '#c0b8a8';
  c.fillRect(0, PG.WALL_Y1, PG.CANVAS_W, 2);
  c.fillRect(0, PG.WALL_Y2 - 2, PG.CANVAS_W, 2);
}

function drawDoor() {
  const c = ctx();
  const dx = PG.DOOR_CENTER.x;
  const dw = 16, dh = PG.WALL_Y2 - PG.WALL_Y1;
  // door frame
  c.fillStyle = '#8b7355';
  c.fillRect(dx - dw/2 - 3, PG.WALL_Y1 - 1, dw + 6, dh + 2);
  // wooden door
  const doorOpen = PG.Interaction ? PG.Interaction.doorOpen : false;
  const doorOff = doorOpen ? -dw - 2 : 0;
  const doorGrad = c.createLinearGradient(dx - dw/2 + doorOff, 0, dx + dw/2 + doorOff, 0);
  doorGrad.addColorStop(0, '#8b6914'); doorGrad.addColorStop(0.5, '#a07828'); doorGrad.addColorStop(1, '#8b6914');
  c.fillStyle = doorGrad;
  c.fillRect(dx - dw/2 + doorOff, PG.WALL_Y1, dw, dh);
  if (!doorOpen) {
    c.fillStyle = '#c9a84c';
    c.fillRect(dx - 3, PG.WALL_Y1 + dh/2 - 3, 5, 6);
  }
}

// === STUDIO ITEMS ===
function drawStudioItems() {
  const c = ctx();

  // Gray paper backdrop on top wall
  c.fillStyle = '#b0b0b8';
  c.fillRect(60, PG.BACKDROP_Y.y1, PG.CANVAS_W - 120, PG.BACKDROP_Y.y2 - PG.BACKDROP_Y.y1);
  c.fillStyle = '#a0a0a8';
  c.fillRect(60, PG.BACKDROP_Y.y1, PG.CANVAS_W - 120, 2);

  // Softbox left
  const sl = PG.SOFTBOX_LEFT;
  c.fillStyle = '#3a3a4a';
  c.fillRect(sl.x - 2, sl.y + 20, 4, sl.standY2 - sl.y - 20);
  // softbox head
  c.fillStyle = '#4a4a5a';
  c.fillRect(sl.x - 25, sl.y, 50, 28);
  c.fillStyle = '#f0f0f4';
  c.fillRect(sl.x - 20, sl.y + 3, 40, 22);
  // glow
  const glow = Math.sin(tick * 0.03) * 0.12 + 0.25;
  const g = c.createRadialGradient(sl.x, sl.y + 12, 5, sl.x, sl.y + 12, 100);
  g.addColorStop(0, `rgba(255,250,240,${glow})`);
  g.addColorStop(0.4, `rgba(255,240,220,${glow*0.3})`);
  g.addColorStop(1, 'rgba(255,240,220,0)');
  c.fillStyle = g;
  c.fillRect(sl.x - 100, sl.y - 20, 200, 200);
  // base
  c.fillStyle = '#3a3a4a';
  c.fillRect(sl.x - 15, sl.standY2 - 8, 30, 8);

  // Softbox right
  const sr = PG.SOFTBOX_RIGHT;
  c.fillStyle = '#3a3a4a';
  c.fillRect(sr.x - 2, sr.y + 20, 4, sr.standY2 - sr.y - 20);
  c.fillStyle = '#4a4a5a';
  c.fillRect(sr.x - 25, sr.y, 50, 28);
  c.fillStyle = '#f0f0f4';
  c.fillRect(sr.x - 20, sr.y + 3, 40, 22);
  const g2 = c.createRadialGradient(sr.x, sr.y + 12, 5, sr.x, sr.y + 12, 100);
  g2.addColorStop(0, `rgba(255,250,240,${glow})`);
  g2.addColorStop(0.4, `rgba(255,240,220,${glow*0.3})`);
  g2.addColorStop(1, 'rgba(255,240,220,0)');
  c.fillStyle = g2;
  c.fillRect(sr.x - 100, sr.y - 20, 200, 200);
  c.fillStyle = '#3a3a4a';
  c.fillRect(sr.x - 15, sr.standY2 - 8, 30, 8);

  // Black armchair centered
  const ar = PG.ARMCHAIR;
  c.fillStyle = 'rgba(0,0,0,0.08)';
  c.beginPath(); c.ellipse(ar.x, ar.y + 40, 35, 10, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1a1a1e';
  roundRect(c, ar.x - 30, ar.y - 8, 60, 45, 6);
  c.fill();
  c.fillStyle = '#2a2a2e';
  roundRect(c, ar.x - 24, ar.y - 4, 48, 38, 4);
  c.fill();
  c.fillStyle = '#1a1a1e';
  c.fillRect(ar.x - 28, ar.y - 16, 56, 10);
  c.fillStyle = '#3a3a3e';
  c.fillRect(ar.x - 22, ar.y - 14, 44, 6);
}

// === SHOP ITEMS ===
function drawSofa() {
  const c = ctx();
  const s = PG.SOFA;
  c.fillStyle = 'rgba(0,0,0,0.06)';
  c.fillRect(s.x1 + 4, s.y2, s.x2 - s.x1, 10);
  // Sofa body
  const grad = c.createLinearGradient(s.x1, s.y1, s.x1, s.y2);
  grad.addColorStop(0, '#1a1a1e');
  grad.addColorStop(0.15, '#2a2a2e');
  grad.addColorStop(1, '#1a1a1e');
  c.fillStyle = grad;
  roundRect(c, s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1, 6);
  c.fill();
  // seat cushions
  for (let i = 0; i < 3; i++) {
    const cx = s.x1 + 15 + i * 80;
    c.fillStyle = '#25252a';
    c.fillRect(cx, s.y1 + 12, 65, s.y2 - s.y1 - 24);
    c.fillStyle = '#303038';
    c.fillRect(cx + 3, s.y1 + 14, 59, s.y2 - s.y1 - 28);
  }
  // armrests
  c.fillStyle = '#151518';
  c.fillRect(s.x1, s.y1 + 6, 12, s.y2 - s.y1 - 14);
  c.fillRect(s.x2 - 12, s.y1 + 6, 12, s.y2 - s.y1 - 14);
}

function drawFrameStand() {
  const c = ctx();
  const fs = PG.FRAME_STAND_POS;
  // stand shadow
  c.fillStyle = 'rgba(0,0,0,0.08)';
  c.fillRect(fs.x - 40, fs.y + 60, 80, 8);
  // wooden stand
  c.fillStyle = '#6b4a2a';
  c.fillRect(fs.x - 35, fs.y, 70, 55);
  c.fillStyle = '#7a5a3a';
  c.fillRect(fs.x - 30, fs.y + 3, 60, 49);
  // framed photos on stand
  const colors = ['#e8d4b8','#d4c8a8','#c4b898'];
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#5a4a3a';
    c.fillRect(fs.x - 22 + i * 18, fs.y + 6, 14, 18);
    c.fillStyle = colors[i];
    c.fillRect(fs.x - 19 + i * 18, fs.y + 8, 8, 14);
  }
  // vertical display section
  c.fillStyle = '#5a3a2a';
  c.fillRect(fs.x - 25, fs.y - 25, 50, 30);
  c.fillStyle = '#7a5a3a';
  c.fillRect(fs.x - 21, fs.y - 22, 42, 24);
  // photos on top
  const tcolors = ['#a08868','#b8a088','#c8b098'];
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#6b4a2a';
    c.fillRect(fs.x - 18 + i * 15, fs.y - 18, 11, 15);
    c.fillStyle = tcolors[i];
    c.fillRect(fs.x - 16 + i * 15, fs.y - 16, 7, 11);
  }
}

function drawCounter() {
  const c = ctx();
  const co = PG.COUNTER;
  // counter shadow
  c.fillStyle = 'rgba(0,0,0,0.06)';
  c.fillRect(co.x1 + 4, co.y2, co.x2 - co.x1, 8);
  // counter body
  const grad = c.createLinearGradient(co.x1, co.y1, co.x1, co.y2);
  grad.addColorStop(0, '#dadadd');
  grad.addColorStop(0.5, '#c8c8cc');
  grad.addColorStop(1, '#b8b8bc');
  c.fillStyle = grad;
  roundRect(c, co.x1, co.y1, co.x2 - co.x1, co.y2 - co.y1, 4);
  c.fill();
  // counter top edge
  c.fillStyle = '#e8e8ec';
  c.fillRect(co.x1, co.y1, co.x2 - co.x1, 4);
  // counter front panel
  c.fillStyle = '#b0b0b4';
  c.fillRect(co.x1 + 8, co.y1 + 20, co.x2 - co.x1 - 16, co.y2 - co.y1 - 28);
  c.strokeStyle = 'rgba(0,0,0,0.04)';
  c.lineWidth = 1;
  c.strokeRect(co.x1 + 8, co.y1 + 20, co.x2 - co.x1 - 16, co.y2 - co.y1 - 28);
}

function drawComputerOnCounter() {
  const c = ctx();
  const co = PG.COUNTER;
  // Computer equipment on the counter facing right (toward wall)
  const cx = co.x2 - 110, cy = co.y1 + 18;

  // monitor stand
  c.fillStyle = '#3a3a3e';
  c.fillRect(cx + 20, cy + 16, 8, 22);
  // monitor base
  c.fillStyle = '#3a3a3e';
  c.fillRect(cx + 10, cy + 36, 28, 4);
  // monitor screen (facing right)
  c.fillStyle = '#1a1a2e';
  c.fillRect(cx + 28, cy - 2, 22, 30);
  const scrGrad = c.createLinearGradient(cx + 28, cy, cx + 50, cy);
  scrGrad.addColorStop(0, '#2a5080');
  scrGrad.addColorStop(1, '#0a2040');
  c.fillStyle = scrGrad;
  c.fillRect(cx + 30, cy, 18, 26);
  // monitor light
  const mg = c.createRadialGradient(cx + 40, cy + 13, 3, cx + 40, cy + 13, 30);
  mg.addColorStop(0, 'rgba(78,204,163,0.06)');
  mg.addColorStop(1, 'rgba(78,204,163,0)');
  c.fillStyle = mg;
  c.fillRect(cx + 10, cy - 10, 60, 50);

  // keyboard
  c.fillStyle = '#2a2a2e';
  c.fillRect(cx + 30, cy + 16, 28, 8);
  c.fillStyle = '#1a1a1e';
  for (let i = 0; i < 8; i++) c.fillRect(cx + 32 + i * 3, cy + 17, 2, 6);

  // mouse
  c.fillStyle = '#2a2a2e';
  c.beginPath(); c.arc(cx + 24, cy + 20, 4, 0, Math.PI * 2); c.fill();

  // DSLR camera
  c.fillStyle = '#1a1a1e';
  c.fillRect(cx - 12, cy + 2, 20, 14);
  c.fillStyle = '#3a3a3e';
  c.fillRect(cx - 6, cy - 2, 8, 6);
  c.fillStyle = '#4a4a5a';
  c.beginPath(); c.arc(cx - 2, cy + 8, 5, 0, Math.PI * 2); c.fill();

  // Cash register
  c.fillStyle = '#4a4a5a';
  c.fillRect(cx + 52, cy - 2, 18, 26);
  c.fillStyle = '#4ecca3';
  c.fillRect(cx + 54, cy, 14, 10);
  c.fillStyle = '#2a2a3a';
  c.fillRect(cx + 54, cy + 16, 14, 6);
}

function drawOfficeChair() {
  const c = ctx();
  const co = PG.COUNTER;
  const chx = co.x2 + 24, chy = co.y1 + 30;
  // chair shadow
  c.fillStyle = 'rgba(0,0,0,0.06)';
  c.beginPath(); c.ellipse(chx, chy + 30, 20, 6, 0, 0, Math.PI * 2); c.fill();
  // chair base
  c.fillStyle = '#3a3a3e';
  c.fillRect(chx - 10, chy + 18, 20, 10);
  // wheel base
  c.fillStyle = '#2a2a2e';
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    c.fillRect(chx + Math.cos(a) * 14 - 2, chy + 26 + Math.sin(a) * 14 - 2, 4, 4);
  }
  // seat
  c.fillStyle = '#1a1a1e';
  roundRect(c, chx - 16, chy - 6, 32, 24, 4);
  c.fill();
  // backrest
  c.fillStyle = '#1a1a1e';
  roundRect(c, chx - 14, chy - 22, 28, 18, 4);
  c.fill();
}

function drawWallDecor() {
  const c = ctx();
  // Title sign on wall
  c.fillStyle = 'rgba(20,28,52,0.85)';
  roundRect(c, PG.CANVAS_W/2 - 130, PG.WALL_Y1 - 28, 260, 24, 8);
  c.fill();
  c.strokeStyle = 'rgba(255,215,0,0.3)';
  c.lineWidth = 1;
  roundRect(c, PG.CANVAS_W/2 - 130, PG.WALL_Y1 - 28, 260, 24, 8);
  c.stroke();
  c.fillStyle = '#f0d060';
  c.font = 'bold 12px Segoe UI';
  c.textAlign = 'center';
  c.fillText('📷 FOTOĞRAFÇILIK STÜDYOSU', PG.CANVAS_W/2, PG.WALL_Y1 - 11);
}

function drawEntrance() {
  const c = ctx();
  const ex = PG.ENTRANCE.x;
  const ey = PG.ENTRANCE.y;
  c.fillStyle = 'rgba(0,0,0,0.15)';
  c.fillRect(ex - 30, ey - 10, 60, 8);
  c.fillStyle = 'rgba(255,255,255,0.04)';
  c.fillRect(ex - 28, ey - 8, 56, 4);
}

// === SPEECH BUBBLE ===
function drawSpeechBubble(x, y, text, icon) {
  const c = ctx();
  const label = icon + ' ' + text;
  c.font = 'bold 12px Segoe UI';
  const tw = c.measureText(label).width;
  const bw = Math.max(tw + 24, 60), bh = 30;
  const bx = x - bw/2, by = y - 62 - bh;
  c.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(c, bx, by, bw, bh, 8); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.1)';
  c.lineWidth = 1;
  roundRect(c, bx, by, bw, bh, 8); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.92)';
  c.beginPath(); c.moveTo(x-5, by+bh); c.lineTo(x, by+bh+8); c.lineTo(x+5, by+bh); c.closePath(); c.fill();
  c.fillStyle = '#1a1a2e'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(label, x, by+bh/2); c.textBaseline = 'alphabetic';
}

// === CHARACTER DRAWING ===
function drawCharacter(x, y, char, isPhotographer) {
  const c = ctx();
  if (!char) return;
  const dir = char.dir || 1;
  const bodyColor = isPhotographer ? '#2c3e6b' : (char.clothes || '#5a5a6a');
  const skinColor = isPhotographer ? '#e8c8a0' : (char.skin || '#e8c8a0');
  const hairColor = isPhotographer ? '#2a2a3a' : (char.hair || '#4a3a2a');
  const pantsColor = isPhotographer ? '#1a2a3a' : (char.pants || '#2a3a3a');
  const walkPhase = char.walkPhase || 0;
  const isWalking = char.walking || false;
  const isAngry = char.angry || false;

  // Shadow
  c.fillStyle = 'rgba(0,0,0,0.15)';
  c.beginPath(); c.ellipse(x, y+30, 14, 5, 0, 0, Math.PI*2); c.fill();

  const legSwing = isWalking ? Math.sin(walkPhase) * 8 : 0;
  c.fillStyle = pantsColor;
  c.fillRect(x-8+legSwing*0.5, y+14, 7, 14);
  c.fillRect(x+1-legSwing*0.5, y+14, 7, 14);
  c.fillStyle = '#2a2a2a';
  c.fillRect(x-9+legSwing*0.5, y+27, 9, 4);
  c.fillRect(x-legSwing*0.5, y+27, 9, 4);

  c.fillStyle = bodyColor;
  c.beginPath();
  c.moveTo(x-14, y+14); c.lineTo(x-12, y-4); c.lineTo(x+12, y-4); c.lineTo(x+14, y+14);
  c.closePath(); c.fill();

  c.fillStyle = skinColor;
  c.fillRect(x-4, y-6, 8, 4);

  const armSwing = isWalking ? Math.sin(walkPhase)*6 : Math.sin(tick*0.02)*1;
  c.fillStyle = skinColor;
  c.save(); c.translate(x-12, y-2);
  c.rotate((isWalking?Math.sin(walkPhase)*0.3:Math.sin(tick*0.02)*0.05)*dir);
  c.fillRect(-3,0,6,16); c.restore();
  c.save(); c.translate(x+12, y-2);
  c.rotate((isWalking?-Math.sin(walkPhase)*0.3:-Math.sin(tick*0.02)*0.05)*dir);
  c.fillRect(-3,0,6,16); c.restore();

  if (isPhotographer) {
    c.fillStyle = '#4a4a4a'; c.fillRect(x-3, y-2, 6, 8);
    c.fillStyle = '#3a3a3a'; c.fillRect(x-5, y+2, 10, 12);
    c.fillStyle = '#5a5a5a'; c.fillRect(x-3, y+4, 6, 8);
  }

  c.fillStyle = skinColor;
  c.beginPath(); c.arc(x, y-16, 13, 0, Math.PI*2); c.fill();

  c.fillStyle = hairColor;
  if (isPhotographer) {
    c.beginPath(); c.arc(x, y-20, 13, Math.PI, 0); c.fill();
    c.fillRect(x-13, y-20, 26, 6);
    c.fillRect(x-14, y-18, 4, 14); c.fillRect(x+10, y-18, 4, 14);
    c.fillStyle = '#3a3a3a'; c.fillRect(x-8, y-8, 16, 6);
    c.beginPath(); c.ellipse(x, y-6, 8, 5, 0, 0, Math.PI*2); c.fill();
    c.fillRect(x-8, y-12, 16, 3); c.fillRect(x-10, y-11, 20, 2);
  } else {
    c.beginPath(); c.arc(x, y-19, 13, Math.PI, 0); c.fill();
    c.fillRect(x-13, y-19, 26, 4);
    if (char.gender === 'female') {
      c.fillRect(x-13, y-16, 4, 8); c.fillRect(x+9, y-16, 4, 8);
    }
  }

  c.fillStyle = '#2a2a3a';
  if (isAngry) {
    c.fillRect(x-7, y-19, 5, 2); c.fillRect(x+2, y-18, 5, 2);
    c.fillRect(x-6, y-16, 3, 3); c.fillRect(x+3, y-16, 3, 3);
  } else {
    c.fillRect(x-5, y-17, 3, 3); c.fillRect(x+2, y-17, 3, 3);
  }

  if (char.happy) {
    c.strokeStyle = '#c0392b'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y-10, 4, 0.1, Math.PI-0.1); c.stroke();
  } else if (isAngry) {
    c.strokeStyle = '#c0392b'; c.lineWidth = 1.5;
    c.beginPath(); c.arc(x, y-10, 3, Math.PI+0.2, -0.2); c.stroke();
  } else {
    c.strokeStyle = '#c0392b'; c.lineWidth = 1;
    c.beginPath(); c.arc(x, y-10, 3, 0.2, Math.PI-0.2); c.stroke();
  }

  if (char.name) {
    c.fillStyle = 'rgba(0,0,0,0.4)';
    const tw = c.measureText(char.name).width;
    c.fillRect(x-tw/2-5, y-42, tw+10, 16);
    c.fillStyle = '#fff';
    c.font = 'bold 10px Segoe UI';
    c.textAlign = 'center';
    c.fillText(char.name, x, y-30);
  }
}

// === INTERACTION OVERLAYS ===
function drawInteractionZones() {
  const c = ctx();
  if (!PG.Interaction) return;
  const inter = PG.Interaction;

  // Target indicator
  if (inter.target) {
    const t = inter.target;
    const pulse = Math.sin(tick * 0.06) * 0.3 + 0.7;
    if (PG.Player) {
      const dx = t.x - PG.Player.x, dy = t.y - PG.Player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 40) {
        c.fillStyle = `rgba(78,204,163,${pulse * 0.35})`;
        const steps = Math.floor(dist / 15);
        for (let i = 1; i < steps; i++) {
          const p = i / steps;
          c.beginPath();
          c.arc(PG.Player.x + dx*p, PG.Player.y + dy*p, 2.5, 0, Math.PI*2);
          c.fill();
        }
      }
    }
    const radius = 20 + pulse * 8;
    c.strokeStyle = `rgba(78,204,163,${pulse * 0.35})`;
    c.lineWidth = 2; c.setLineDash([4, 6]);
    c.beginPath(); c.arc(t.x, t.y, radius + 10, 0, Math.PI*2); c.stroke();
    c.setLineDash([]);
    c.fillStyle = `rgba(78,204,163,${pulse * 0.2})`;
    c.beginPath(); c.arc(t.x, t.y, radius, 0, Math.PI*2); c.fill();
    c.strokeStyle = `rgba(78,204,163,${pulse * 0.7})`;
    c.lineWidth = 2;
    c.beginPath(); c.arc(t.x, t.y, radius, 0, Math.PI*2); c.stroke();
    c.fillStyle = '#4ecca3';
    c.beginPath(); c.arc(t.x, t.y, 5, 0, Math.PI*2); c.fill();
    c.fillStyle = `rgba(78,204,163,${pulse})`;
    const ay = t.y - radius - 22 + Math.sin(tick*0.08)*5;
    c.beginPath(); c.moveTo(t.x, t.y-radius-8);
    c.lineTo(t.x-8, ay); c.lineTo(t.x+8, ay); c.closePath(); c.fill();
    c.fillStyle = `rgba(78,204,163,${pulse})`;
    c.font = 'bold 12px Segoe UI'; c.textAlign = 'center';
    c.fillText(t.label, t.x, ay - 6);
    if (PG.Player && Math.hypot(PG.Player.x-t.x, PG.Player.y-t.y) < PG.TARGET_REACH_DIST) {
      c.fillStyle = '#4ecca3';
      c.font = 'bold 13px Segoe UI'; c.textAlign = 'center';
      c.fillText('▶ ENTER', t.x, t.y + radius + 24);
    }
  }

  // Speech bubbles
  if (PG.Customers && PG.Player) {
    PG.Customers.forEach(cust => {
      const d = Math.hypot(cust.x - PG.Player.x, cust.y - PG.Player.y);
      if ((cust.phase === 'waiting' || cust.phase === 'talking') && cust.service && d < 200) {
        const txt = cust.service.id === 'satis' ? 'Alışveriş yapmak istiyorum' : cust.service.name;
        const pulse = Math.sin(tick * 0.08) * 0.3 + 0.7;
        c.globalAlpha = 0.6 + pulse * 0.4;
        drawSpeechBubble(cust.x, cust.y, txt, cust.service.icon || '❓');
        c.globalAlpha = 1;
      }
    });
  }

  // "!" indicator for waiting customers
  if (PG.Customers) {
    PG.Customers.forEach(cust => {
      if (cust.phase === 'waiting') {
        const pulse = Math.sin(tick * 0.08) * 0.3 + 0.7;
        c.fillStyle = `rgba(255,220,50,${pulse})`;
        c.font = 'bold 22px Segoe UI'; c.textAlign = 'center';
        c.fillText('!', cust.x, cust.y - 45);
        c.fillStyle = `rgba(255,220,50,${pulse * 0.12})`;
        c.beginPath(); c.arc(cust.x, cust.y-5, 30, 0, Math.PI*2); c.fill();
      }
    });
  }
}

// === PARTICLES ===
function drawParticles(particles) {
  if (!particles) return;
  const c = ctx();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    c.globalAlpha = p.life;
    c.fillStyle = p.color;
    c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI*2); c.fill();
    p.x += p.vx; p.y += p.vy; p.vy += 0.05;
    p.life -= 0.015;
  }
  c.globalAlpha = 1;
}

// === MAIN RENDER ===
function render(particles) {
  tick++;
  const c = ctx();
  c.clearRect(0, 0, PG.CANVAS_W, PG.CANVAS_H);

  drawStudioFloor();
  drawShopFloor();
  drawWall();
  drawDoor();
  drawStudioItems();
  drawSofa();
  drawFrameStand();
  drawCounter();
  drawComputerOnCounter();
  drawOfficeChair();
  drawWallDecor();
  drawEntrance();
  drawInteractionZones();
  if (particles) drawParticles(particles);
}

PG.Renderer.setup = setupCanvas;
PG.Renderer.render = render;
PG.Renderer.drawCharacter = drawCharacter;
PG.Renderer.drawSpeechBubble = drawSpeechBubble;
PG.Renderer.tick = () => tick;

})();
