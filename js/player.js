(function(){
PG.Player = {
  x: 800,
  y: 820,
  dir: 1,
  walkPhase: 0,
  walking: false,
  speed: PG.MOVE_SPEED,
  targetX: null,
  targetY: null,
  moving: false,
  onArrive: null,
};

function update(dt) {
  const p = PG.Player;
  const keys = PG.keys || {};

  let dx = 0, dy = 0;

  if (keys['ArrowLeft'] || keys['a']) dx = -1;
  if (keys['ArrowRight'] || keys['d']) dx = 1;
  if (keys['ArrowUp'] || keys['w']) dy = -1;
  if (keys['ArrowDown'] || keys['s']) dy = 1;

  if (dx !== 0 || dy !== 0) {
    p.moving = false;
    p.targetX = null;
    p.targetY = null;
    p.onArrive = null;
  }

  if (!dx && !dy && p.moving && p.targetX !== null) {
    const tdx = p.targetX - p.x;
    const tdy = p.targetY - p.y;
    const dist = Math.hypot(tdx, tdy);
    if (dist < 3) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.moving = false;
      p.walking = false;
      if (p.onArrive) { const cb = p.onArrive; p.onArrive = null; cb(); }
    } else {
      const norm = p.speed / Math.max(dist, 1);
      p.x += tdx * norm * dt * 0.06;
      p.y += tdy * norm * dt * 0.06;
      p.dir = tdx > 0.5 ? 1 : (tdx < -0.5 ? -1 : p.dir);
      p.walking = true;
      p.walkPhase += dt * 0.008;
    }
    return;
  }

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    const norm = p.speed / len;
    const nx = p.x + dx * norm * dt * 0.06;
    const ny = p.y + dy * norm * dt * 0.06;

    if (!isBlocked(nx, p.y)) p.x = nx;
    if (!isBlocked(p.x, ny)) p.y = ny;

    p.x = Math.max(20, Math.min(PG.CANVAS_W - 20, p.x));
    p.y = Math.max(20, Math.min(PG.CANVAS_H - 20, p.y));

    p.dir = dx > 0 ? 1 : (dx < 0 ? -1 : p.dir);
    p.walking = true;
    p.walkPhase += dt * 0.008;
  } else {
    p.walking = false;
  }
}

function isBlocked(x, y) {
  if (x < 20 || x > PG.CANVAS_W - 20 || y < 15 || y > PG.CANVAS_H - 15) return true;

  if (y > PG.WALL_Y1 && y < PG.WALL_Y2) {
    if (x > PG.DOOR_CENTER.x - 12 && x < PG.DOOR_CENTER.x + 12) return false;
    return true;
  }

  if (x > PG.SOFA.x1 - 5 && x < PG.SOFA.x2 + 5 && y > PG.SOFA.y1 - 5 && y < PG.SOFA.y2 + 5) return true;
  if (x > PG.COUNTER.x1 - 5 && x < PG.COUNTER.x2 + 5 && y > PG.COUNTER.y1 - 5 && y < PG.COUNTER.y2 + 5) return true;

  const fs = PG.FRAME_STAND_POS;
  if (x > fs.x - 40 && x < fs.x + 40 && y > fs.y - 30 && y < fs.y + 65) return true;

  if (y > PG.BACKDROP_Y.y1 && y < PG.BACKDROP_Y.y2) return true;

  const sl = PG.SOFTBOX_LEFT;
  if (x > sl.x - 28 && x < sl.x + 28 && y > sl.y && y < sl.standY2) return true;

  const sr = PG.SOFTBOX_RIGHT;
  if (x > sr.x - 28 && x < sr.x + 28 && y > sr.y && y < sr.standY2) return true;

  const ar = PG.ARMCHAIR;
  if (x > ar.x - 35 && x < ar.x + 35 && y > ar.y - 20 && y < ar.y + 50) return true;

  return false;
}

function moveTo(tx, ty, cb) {
  PG.Player.targetX = tx;
  PG.Player.targetY = ty;
  PG.Player.moving = true;
  PG.Player.onArrive = cb;
}

function stop() {
  PG.Player.targetX = null;
  PG.Player.targetY = null;
  PG.Player.moving = false;
  PG.Player.walking = false;
  PG.Player.onArrive = null;
}

PG.Player.update = update;
PG.Player.moveTo = moveTo;
PG.Player.stop = stop;

})();
