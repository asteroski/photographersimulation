(function(){
PG.Camera = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  zoom: 1,
  smooth: PG.CAMERA_SMOOTH,
};

let offsetX = 0, offsetY = 0;

function init() {
  const canvas = PG.canvas;
  offsetX = canvas.width / 2;
  offsetY = canvas.height / 2;
  PG.Camera.x = PG.Player.x;
  PG.Camera.y = PG.Player.y;
  PG.Camera.targetX = PG.Player.x;
  PG.Camera.targetY = PG.Player.y;
}

function follow(target) {
  if (!target) return;
  PG.Camera.targetX = target.x;
  PG.Camera.targetY = target.y;
}

function update() {
  const cam = PG.Camera;
  cam.x += (cam.targetX - cam.x) * cam.smooth;
  cam.y += (cam.targetY - cam.y) * cam.smooth;
}

function applyTransform(context) {
  const cam = PG.Camera;
  context.save();
  context.translate(offsetX - cam.x, offsetY - cam.y);
}

function restoreTransform(context) {
  context.restore();
}

function worldToScreen(wx, wy) {
  return {
    x: wx - PG.Camera.x + offsetX,
    y: wy - PG.Camera.y + offsetY,
  };
}

function screenToWorld(sx, sy) {
  return {
    x: sx + PG.Camera.x - offsetX,
    y: sy + PG.Camera.y - offsetY,
  };
}

PG.Camera.init = init;
PG.Camera.follow = follow;
PG.Camera.update = update;
PG.Camera.apply = applyTransform;
PG.Camera.restore = restoreTransform;
PG.Camera.worldToScreen = worldToScreen;
PG.Camera.screenToWorld = screenToWorld;

})();
