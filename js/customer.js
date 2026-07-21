(function(){
PG.Customers = [];

let coupleIdCounter = 0;

const MALE_TEMPLATES = [
  { gender:'male',   skin:'#e8c8a0', hair:'#2a2a3a', clothes:'#4a6a6a', pants:'#2a3a3a' },
  { gender:'male',   skin:'#d8b890', hair:'#6a5a3a', clothes:'#5a4a3a', pants:'#3a3a2a' },
  { gender:'male',   skin:'#d8b890', hair:'#4a4a4a', clothes:'#6a4a4a', pants:'#2a2a3a' },
  { gender:'male',   skin:'#e0c0a0', hair:'#3a3a2a', clothes:'#3a4a6a', pants:'#2a3a4a' },
];

const FEMALE_TEMPLATES = [
  { gender:'female', skin:'#f0d0b0', hair:'#5a2a1a', clothes:'#8a4a6a', pants:'#3a2a3a' },
  { gender:'female', skin:'#e8c8a0', hair:'#3a2a4a', clothes:'#4a6a8a', pants:'#2a3a4a' },
  { gender:'female', skin:'#f0d0b0', hair:'#6a4a1a', clothes:'#6a8a4a', pants:'#3a4a2a' },
  { gender:'female', skin:'#e8c8a0', hair:'#4a1a1a', clothes:'#8a6a4a', pants:'#3a2a1a' },
];

function makeCustomer(name, template, service, coupleId, xOff) {
  const level = PG.economy ? PG.economy.level : 1;
  const basePatience = 60;
  const patienceVal = Math.max(15, basePatience - (level - 1) * 10);
  return {
    name: name,
    x: PG.ENTRANCE.x + (xOff || 0),
    y: PG.SHOP_Y2 + 40,
    targetX: PG.CUSTOMER_WAIT_POS.x + (xOff || 0),
    targetY: PG.CUSTOMER_WAIT_POS.y,
    phase: 'entering',
    walkPhase: 0,
    walking: true,
    dir: 1,
    gender: template.gender,
    skin: template.skin,
    hair: template.hair,
    clothes: template.clothes,
    pants: template.pants,
    service: service,
    patience: patienceVal,
    maxPatience: patienceVal,
    happy: false,
    angry: false,
    spawnTime: Date.now(),
    coupleId: coupleId || null,
  };
}

function spawnCustomer() {
  if (PG.Customers.length >= 5) return;

  const service = PG.SERVICES[Math.floor(Math.random() * PG.SERVICES.length)];

  if (service.id === 'dugun') {
    // Spawn wedding couple: male + female
    const coupleId = ++coupleIdCounter;
    const maleT = MALE_TEMPLATES[Math.floor(Math.random() * MALE_TEMPLATES.length)];
    const femaleT = FEMALE_TEMPLATES[Math.floor(Math.random() * FEMALE_TEMPLATES.length)];
    const maleName = PG.MALE_NAMES[Math.floor(Math.random() * PG.MALE_NAMES.length)];
    const femaleName = PG.FEMALE_NAMES[Math.floor(Math.random() * PG.FEMALE_NAMES.length)];

    const male = makeCustomer(maleName, maleT, service, coupleId, -20);
    const female = makeCustomer(femaleName, femaleT, service, coupleId, 20);
    PG.Customers.push(male, female);
    return male;
  }

  const allTemplates = [...MALE_TEMPLATES, ...FEMALE_TEMPLATES];
  const template = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  const isMale = MALE_TEMPLATES.includes(template);
  const namePool = isMale ? PG.MALE_NAMES : PG.FEMALE_NAMES;
  const name = namePool[Math.floor(Math.random() * namePool.length)];

  const customer = makeCustomer(name, template, service, null, 0);
  PG.Customers.push(customer);
  return customer;
}

function update(dt) {
  const customers = PG.Customers;
  const now = Date.now();

  for (let i = customers.length - 1; i >= 0; i--) {
    const c = customers[i];
    const dtFactor = dt * 0.06;

    switch (c.phase) {
      case 'entering':
        c.y -= 1.5 * dtFactor;
        c.walking = true;
        c.walkPhase += dt * 0.007;
        if (c.y <= PG.SHOP_Y1 + 60) {
          c.y = PG.SHOP_Y1 + 60;
          c.phase = 'walkingToWait';
        }
        break;

      case 'walkingToWait':
        const dx = c.targetX - c.x;
        const dy = c.targetY - c.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 3) {
          c.x = c.targetX;
          c.y = c.targetY;
          c.phase = 'waiting';
          c.walking = false;
        } else {
          const spd = 1.8 * dtFactor;
          c.x += (dx / dist) * spd;
          c.y += (dy / dist) * spd;
          c.dir = dx > 0 ? 1 : -1;
          c.walking = true;
          c.walkPhase += dt * 0.007;
        }
        break;

      case 'waiting':
        c.walking = false;
        c.walkPhase += dt * 0.003;
        c.patience = Math.max(0, c.patience - dt / 1000);
        if (c.patience <= 0) {
          c.angry = true;
          c.phase = 'leaving';
          c.targetY = PG.SHOP_Y2 + 50;
        }
        break;

      case 'talking':
        c.walking = false;
        break;

      case 'follow':
        if (PG.Player) {
          const fdx = PG.Player.x - c.x;
          const fdy = PG.Player.y - c.y;
          const fdist = Math.hypot(fdx, fdy);
          if (fdist > 55) {
            const fspd = PG.MOVE_SPEED * 0.9 * dtFactor;
            c.x += (fdx / fdist) * fspd;
            c.y += (fdy / fdist) * fspd;
            c.dir = fdx > 0 ? 1 : -1;
            c.walking = true;
            c.walkPhase += dt * 0.007;
          } else {
            c.walking = false;
          }
        }
        break;

      case 'goWaitSeat': {
        const sx = PG.SOFA.x1 + 100, sy = PG.SOFA.y1 + 100;
        const sdx = sx - c.x, sdy = sy - c.y;
        const sdist = Math.hypot(sdx, sdy);
        if (sdist < 5) {
          c.x = sx; c.y = sy;
          c.phase = 'waitingSeated';
          c.walking = false;
        } else {
          const spd = 2 * dtFactor;
          c.x += (sdx / sdist) * spd;
          c.y += (sdy / sdist) * spd;
          c.dir = sdx > 0 ? 1 : -1;
          c.walking = true;
          c.walkPhase += dt * 0.007;
        }
        break;
      }

      case 'waitingSeated':
        c.walking = false;
        c.walkPhase += dt * 0.003;
        c.patience = Math.max(0, c.patience - dt / 1000);
        if (c.patience <= 0) {
          c.angry = true;
          c.phase = 'leaving';
          c.targetY = PG.SHOP_Y2 + 50;
        }
        break;

      case 'posing':
        c.walking = false;
        c.walkPhase += dt * 0.002;
        break;

      case 'goToCounter': {
        const tx = PG.DELIVER_POS.x, ty = PG.DELIVER_POS.y;
        const tdx = tx - c.x, tdy = ty - c.y;
        const tdist = Math.hypot(tdx, tdy);
        if (tdist < 5) {
          c.x = tx; c.y = ty;
          c.phase = 'waitingAtCounter';
          c.walking = false;
        } else {
          const spd = 2 * dtFactor;
          c.x += (tdx / tdist) * spd;
          c.y += (tdy / tdist) * spd;
          c.dir = tdx > 0 ? 1 : -1;
          c.walking = true;
          c.walkPhase += dt * 0.007;
        }
        break;
      }

      case 'waitingAtCounter':
        c.walking = false;
        break;

      case 'leaving':
        c.y += 2 * dtFactor;
        c.walking = true;
        c.walkPhase += dt * 0.007;
        if (c.y > PG.SHOP_Y2 + 50) {
          customers.splice(i, 1);
        }
        break;
    }
  }
}

function getClosestWaiting(px, py) {
  let closest = null;
  let minDist = PG.INTERACT_DIST;
  for (const c of PG.Customers) {
    if (c.phase === 'waiting' || c.phase === 'waitingAtCounter') {
      const d = Math.hypot(c.x - px, c.y - py);
      if (d < minDist) {
        minDist = d;
        closest = c;
      }
    }
  }
  return closest;
}

function getCouple(customer) {
  if (!customer || !customer.coupleId) return null;
  for (const c of PG.Customers) {
    if (c !== customer && c.coupleId === customer.coupleId) return c;
  }
  return null;
}

PG.Customers.spawn = spawnCustomer;
PG.Customers.update = update;
PG.Customers.getClosest = getClosestWaiting;
PG.Customers.getCouple = getCouple;

})();
