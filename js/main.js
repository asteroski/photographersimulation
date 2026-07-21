(function(){
PG.keys = {};
PG.lastTime = 0;
PG.frameCount = 0;

function init() {
  const canvas = PG.Renderer.setup();
  PG.Camera.init();

  document.addEventListener('keydown', (e) => {
    PG.keys[e.key] = true;
    if (e.code) PG.keys[e.code] = true;
    PG.lastKey = e.key;
    PG.lastCode = e.code;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (PG.Interaction) PG.Interaction.handleEnter();
    }
    if (e.key === 'b' && PG.Interaction) {
      PG.Interaction.backdropColor = (PG.Interaction.backdropColor + 1) % 4;
    }
  });

  document.addEventListener('keyup', (e) => {
    PG.keys[e.key] = false;
    if (e.code) PG.keys[e.code] = false;
  });

  // Click-to-move on canvas
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = PG.CANVAS_W / rect.width;
    const scaleY = PG.CANVAS_H / rect.height;
    const worldX = (e.clientX - rect.left) * scaleX;
    const worldY = (e.clientY - rect.top) * scaleY;
    // Offset by camera
    const camX = PG.Camera ? PG.Camera.x || 0 : 0;
    const camY = PG.Camera ? PG.Camera.y || 0 : 0;
    if (PG.Player) {
      PG.Player.moveTo(worldX + camX - PG.CANVAS_W/2, worldY + camY - PG.CANVAS_H/2);
    }
  });

  function resize() {
    const wrapper = document.getElementById('game-wrapper');
    const ratio = PG.CANVAS_W / PG.CANVAS_H;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) { w = h * ratio; }
    else { h = w / ratio; }
    wrapper.style.width = w + 'px';
    wrapper.style.height = h + 'px';
  }

  window.addEventListener('resize', resize);
  resize();

  setTimeout(() => {
    PG.Customers.spawn();
  }, 2500);

  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  try {
    PG.frameCount++;
    const dt = PG.lastTime ? timestamp - PG.lastTime : 16;
    PG.lastTime = timestamp;
    const dtClamped = Math.min(dt, 33);

    if (PG.Player) PG.Player.update(dtClamped);
    if (PG.Customers) PG.Customers.update(dtClamped);
    if (PG.Camera) {
      PG.Camera.follow(PG.Player);
      PG.Camera.update();
    }
    if (PG.Interaction) PG.Interaction.update(dtClamped);
    if (PG.UI) PG.UI.updateStats();

    const ctx = PG.ctx;
    ctx.clearRect(0, 0, PG.CANVAS_W, PG.CANVAS_H);

    PG.Camera.apply(ctx);
    if (PG.Renderer) {
      PG.Renderer.render(PG.Interaction ? PG.Interaction.particles : null);
      if (PG.Customers) {
        PG.Customers.forEach(c => PG.Renderer.drawCharacter(c.x, c.y, c, false));
      }
      const p = PG.Player;
      PG.Renderer.drawCharacter(p.x, p.y, { name:'Fotoğrafçı', dir:p.dir, walking:p.walking, walkPhase:p.walkPhase }, true);
    }
    PG.Camera.restore(ctx);

    let hint = document.getElementById('controls-hint');
    if (!hint) {
      hint = document.createElement('div');
      hint.id = 'controls-hint';
      document.getElementById('ui-layer').appendChild(hint);
    }
    hint.textContent = '⬆⬇⬅➡ Hareket | ENTER Etkileşim | B Arka Plan';

    // Debug
    const pressed = Object.keys(PG.keys).filter(k => PG.keys[k]).join(' ');
    const st = PG.Interaction ? PG.Interaction.state : '?';
    const target = PG.Interaction ? PG.Interaction.target : null;
    const tInfo = target ? `hedef:${Math.round(target.x)},${Math.round(target.y)}` : '';
    debugEl.textContent = `kare: ${PG.frameCount} | durum: ${st}\nkonum: ${Math.round(PG.Player.x)},${Math.round(PG.Player.y)} ${tInfo}\ntuş: ${PG.lastKey||'-'} (${PG.lastCode||'-'}) aktif: ${pressed || '-'}`;

  } catch (err) {
    console.error('gameLoop error:', err);
    debugEl.textContent = 'HATA: ' + err.message;
  }

  requestAnimationFrame(gameLoop);
}

// Debug display
let debugEl = document.createElement('div');
debugEl.id = 'debug';
debugEl.style.cssText = 'position:absolute;bottom:120px;left:10px;color:#fff;font-size:12px;font-family:monospace;z-index:30;pointer-events:none;white-space:pre;background:rgba(0,0,0,0.7);padding:6px 10px;border-radius:6px;max-width:500px;';
document.getElementById('ui-layer').appendChild(debugEl);

window.addEventListener('DOMContentLoaded', init);
})();
