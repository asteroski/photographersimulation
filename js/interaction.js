(function(){
PG.Interaction = {
  state: 'idle',
  selectedCustomer: null,
  currentService: null,
  selectedSellItem: null,
  target: null,
  doorOpen: false,
  backdropColor: 0,
  workTimer: 0,
  workDuration: 0,
  particles: [],
};

let state = PG.Interaction;

function forEachInCouple(customer, fn) {
  if (!customer) return;
  fn(customer);
  if (customer.coupleId) {
    const partner = PG.Customers.getCouple(customer);
    if (partner) fn(partner);
  }
}

function update(dt) {
  switch (state.state) {
    case 'idle':
      PG.UI.setTaskText('👋 Müşteriye yaklaşarak hizmete başla');
      if (PG.Customers && PG.Player) {
        PG.UI.showCustomerInfo(PG.Customers.getClosest(PG.Player.x, PG.Player.y));
      } else {
        PG.UI.showCustomerInfo(null);
      }
      break;

    case 'choosing':
      break;

    case 'escortToStudio':
      PG.UI.setTaskText('🚶 Müşteriyi stüdyoya götür');
      state.doorOpen = true;
      if (PG.Player && PG.Player.y < PG.WALL_Y1 - 20) arriveStudio();
      break;

    case 'escortToShelf':
      PG.UI.setTaskText('🚶 Müşteriyi ürün standına götür');
      if (PG.Player && state.target) {
        const d = Math.hypot(PG.Player.x - state.target.x, PG.Player.y - state.target.y);
        if (d < PG.TARGET_REACH_DIST) arriveAtShelf();
      }
      break;

    case 'arrivedStudio':
      PG.UI.setTaskText('📸 ENTER tuşuna basarak çekimi başlat');
      break;

    case 'photoSession':
      PG.UI.setTaskText('📸 Fotoğraf çekiliyor...');
      if (state.workTimer > 0) {
        state.workTimer -= dt;
        PG.UI.setProgress(1 - state.workTimer / state.workDuration);
      } else {
        onPhotoDone();
      }
      break;

    case 'goComputer':
      PG.UI.setTaskText('💻 Bilgisayara git ve ENTER ile başla');
      break;

    case 'editing':
      PG.UI.setTaskText('💻 Fotoğraflar düzenleniyor...');
      if (state.workTimer > 0) {
        state.workTimer -= dt;
        PG.UI.setProgress(1 - state.workTimer / state.workDuration);
      } else {
        onEditingDone();
      }
      break;

    case 'working':
      PG.UI.setTaskText('⚙️ İşlem yapılıyor...');
      if (state.workTimer > 0) {
        state.workTimer -= dt;
        PG.UI.setProgress(1 - state.workTimer / state.workDuration);
      } else {
        onWorkDoneGeneric();
      }
      break;
  }

  if (state.state !== 'idle' && state.selectedCustomer) {
    PG.UI.showCustomerInfo(state.selectedCustomer);
  }
}

function onServiceChosen(service) {
  state.currentService = service;
  if (state.selectedCustomer) state.selectedCustomer.service = service;

  if (service.id === 'satis') {
    state.state = 'escortToShelf';
    state.target = { x: PG.FRAME_STAND_POS.x, y: PG.FRAME_STAND_POS.y, label: 'ÜRÜN STANDI' };
    forEachInCouple(state.selectedCustomer, c => c.phase = 'follow');
    PG.UI.showDialog('📷 Fotoğrafçı', `${service.icon} ${service.name} - Müşteriyi ürün standına götür.`);
    return;
  }

  if (!service.needsStudio) {
    state.target = { x: PG.COMPUTER_POS.x, y: PG.COMPUTER_POS.y };
    state.state = 'goComputer';
    forEachInCouple(state.selectedCustomer, c => c.phase = 'follow');
    PG.UI.showDialog('📷 Fotoğrafçı', `${service.icon} ${service.name} - Bilgisayara gidip ENTER ile başla.`);
    return;
  }

  state.state = 'escortToStudio';
  state.target = { x: PG.DOOR_CENTER.x, y: PG.DOOR_CENTER.y - 50, label: 'STÜDYO' };
  forEachInCouple(state.selectedCustomer, c => c.phase = 'follow');
  PG.UI.showDialog('📷 Fotoğrafçı', `${service.icon} ${service.name} - Müşteriyi stüdyoya götür.`);
}

function arriveStudio() {
  if (state.state !== 'escortToStudio') return;
  state.state = 'arrivedStudio';
  state.target = null;
  forEachInCouple(state.selectedCustomer, (c) => {
    c.phase = 'posing';
    c.happy = true;
    c.x = PG.STUDIO_CENTER.x + (c === state.selectedCustomer ? -25 : 25);
    c.y = PG.BACKDROP_Y.y2 + 30;
  });
  PG.UI.showDialog('📷 Fotoğrafçı', 'Stüdyodayız! ENTER ile çekimi başlatın.');
}

function arriveAtShelf() {
  if (state.state !== 'escortToShelf') return;
  state.state = 'choosing';
  state.target = null;
  PG.UI.showSellPanel((item) => {
    state.selectedSellItem = item;
    state.state = 'working';
    state.workTimer = state.currentService.time;
    state.workDuration = state.currentService.time;
  });
}

function handleEnter() {
  const player = PG.Player;

  if (!player) return;

  // --- IDLE: can interact with counter / computer / delivery ---
  if (state.state === 'idle') {
    // 1) Computer: edit nearest seated customer needing edit
    const atComputer = PG.COMPUTER_POS && Math.hypot(player.x - PG.COMPUTER_POS.x, player.y - PG.COMPUTER_POS.y) < PG.TARGET_REACH_DIST;
    if (atComputer && PG.Customers) {
      let editCust = null;
      for (const c of PG.Customers) {
        if (c.phase === 'waitingSeated' && c.needsEdit) {
          if (!editCust || Math.hypot(player.x - c.x, player.y - c.y) < Math.hypot(player.x - editCust.x, player.y - editCust.y)) {
            editCust = c;
          }
        }
      }
      if (editCust) {
        state.state = 'editing';
        state.selectedCustomer = editCust;
        state.currentService = editCust.service;
        editCust.needsEdit = false;
        state.workTimer = editCust.service.time + (editCust.service.id === 'dugun' ? 10000 : 0);
        state.workDuration = state.workTimer;
        state.target = null;
        PG.UI.showDialog('💻 Bilgisayar', `${editCust.name} fotoğrafları düzenleniyor...`);
        return;
      }
    }

    // 2) Delivery: customer ready at counter or frame stand
    if (PG.Customers) {
      let deliverCust = null;
      for (const c of PG.Customers) {
        if (c.readyForDelivery && (c.phase === 'waitingAtCounter' || c.phase === 'waitingAtStand')) {
          if (Math.hypot(player.x - c.x, player.y - c.y) < PG.INTERACT_DIST) {
            deliverCust = c;
            break;
          }
        }
      }
      if (deliverCust) {
        const finalPrice = deliverCust.deliveryPrice || 0;
        if (PG.economy) {
          PG.economy.money += finalPrice;
          PG.economy.totalEarned += finalPrice;
          PG.economy.customersServed++;
        }
        flashEffect();
        if (PG.economy && PG.economy.nextLevel()) {
          PG.UI.notify(`⭐ Seviye ${PG.economy.level}'e yükseldin!`);
        }
        PG.UI.hideDialog();
        PG.UI.showDialog('💰 Teslim', `Ödeme alındı: ${finalPrice} ₺`, 2500);
        PG.UI.notify(`+${finalPrice} ₺ kazanıldı!`);
        setTimeout(() => {
          forEachInCouple(deliverCust, c => { c.phase = 'leaving'; c.happy = true; });
          state.state = 'idle';
          PG.UI.updateStats();
          // Bring next sofa customer to counter
          if (PG.Customers) {
            setTimeout(() => {
              for (const c of PG.Customers) {
                if (c.phase === 'waiting') {
                  c.phase = 'goToCounter';
                  break;
                }
              }
              const level = PG.economy ? PG.economy.level : 1;
              const delay = Math.max(800, 2500 - (level - 1) * 200);
              const gap = Math.max(600, 1500 - (level - 1) * 100);
              const n = Math.random() < (0.05 + level * 0.03) ? 2 : 1;
              for (let i = 0; i < n; i++) setTimeout(() => PG.Customers.spawn(), i * gap + delay);
            }, 2000 + Math.random() * 3000);
          }
        }, 2800);
        return;
      }
    }

    // 3) New service: customer at counter
    if (PG.Customers) {
      const cust = PG.Customers.getClosest(player.x, player.y);
      if (cust) {
        state.selectedCustomer = cust;
        cust.phase = 'talking';
        if (cust.coupleId) {
          const p = PG.Customers.getCouple(cust);
          if (p) p.phase = 'talking';
        }
        state.state = 'choosing';
        PG.UI.showServicePanel(onServiceChosen, cust);
        PG.UI.showDialog('🚶 ' + (cust.coupleId ? 'Çift' : cust.name), cust.service.icon + ' ' + cust.service.name + ' istiyorum.');
      }
    }
    return;
  }

  // --- Non-idle state handling ---
  switch (state.state) {
    case 'escortToStudio':
      if (PG.Player && PG.Player.y < PG.WALL_Y1) arriveStudio();
      break;

    case 'arrivedStudio':
      state.state = 'photoSession';
      state.workTimer = state.currentService.time;
      state.workDuration = state.currentService.time;
      state.doorOpen = false;
      flashEffect();
      forEachInCouple(state.selectedCustomer, c => c.happy = true);
      PG.UI.showDialog('📷 Fotoğrafçı', '📸 Çekim yapılıyor...');
      break;

    case 'goComputer':
      if (state.target && Math.hypot(player.x - state.target.x, player.y - state.target.y) < PG.TARGET_REACH_DIST) {
        state.state = 'editing';
        state.target = null;
        state.workTimer = state.currentService.time + (state.currentService.id === 'dugun' ? 10000 : 0);
        state.workDuration = state.workTimer;
        PG.UI.showDialog('💻 Bilgisayar', 'Fotoğraflar düzenleniyor...');
        forEachInCouple(state.selectedCustomer, c => { if (c.phase === 'waitingSeated') c.happy = true; });
      }
      break;

    case 'escortToShelf':
      if (state.target && Math.hypot(player.x - state.target.x, player.y - state.target.y) < PG.TARGET_REACH_DIST) {
        arriveAtShelf();
      }
      break;
  }
}

function flashEffect() {
  const flash = document.getElementById('flash');
  if (flash) { flash.style.opacity = '0.9'; setTimeout(() => { flash.style.opacity = '0'; }, 180); }
  for (let i = 0; i < 20; i++) {
    state.particles.push({
      x: PG.Player.x, y: PG.Player.y - 10,
      vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 4 - 1,
      size: Math.random() * 4 + 2, color: Math.random() > 0.5 ? '#4ecca3' : '#f0d060', life: 1,
    });
  }
}

function onPhotoDone() {
  state.state = 'idle';
  state.target = null;
  forEachInCouple(state.selectedCustomer, c => {
    c.phase = 'goWaitSeat';
    c.needsEdit = true;
    c.happy = true;
  });
  PG.UI.showDialog('📷 Fotoğrafçı', 'Harika! Bilgisayara gidip düzenlemek için ENTER.');
  state.selectedCustomer = null;
  state.currentService = null;
}

function onEditingDone() {
  const cust = state.selectedCustomer;
  const service = state.currentService;
  const isSales = service && service.id === 'satis';
  const basePrice = isSales && state.selectedSellItem ? state.selectedSellItem.price : (service ? service.price : 0);
  const finalPrice = cust && cust.coupleId ? basePrice * 2 : basePrice;

  forEachInCouple(cust, c => {
    c.phase = isSales ? 'waitingAtStand' : 'goToCounter';
    c.readyForDelivery = true;
    c.deliveryPrice = finalPrice;
    c.happy = true;
  });

  state.state = 'idle';
  state.target = null;
  state.selectedCustomer = null;
  state.currentService = null;
  state.selectedSellItem = null;

  PG.UI.showDialog('📷 Fotoğrafçı', isSales ? 'Ürün hazır! Standdan ENTER ile teslim et.' : 'Fotoğraflar hazır! Tezgahtan ENTER ile teslim et.');
}

function onWorkDoneGeneric() {
  const cust = state.selectedCustomer;
  const isSales = state.currentService && state.currentService.id === 'satis';
  const basePrice = state.selectedSellItem ? state.selectedSellItem.price : (state.currentService ? state.currentService.price : 0);
  const finalPrice = cust && cust.coupleId ? basePrice * 2 : basePrice;

  forEachInCouple(cust, c => {
    if (isSales) {
      c.phase = 'waitingAtStand';
    } else {
      c.phase = 'goToCounter';
    }
    c.readyForDelivery = true;
    c.deliveryPrice = finalPrice;
    c.happy = true;
  });

  state.state = 'idle';
  state.target = null;
  state.selectedCustomer = null;
  state.currentService = null;
  state.selectedSellItem = null;

  PG.UI.showDialog('📷 Fotoğrafçı', isSales ? 'Ürün hazır! Standdan ENTER ile teslim et.' : 'İşlem tamam! Tezgahtan ENTER ile teslim et.');
}

function startNewDay() {
  state.state = 'idle';
  state.particles = [];
  state.target = null;
  state.selectedCustomer = null;
  state.currentService = null;
  if (PG.economy) {
    PG.economy.day++;
    PG.economy.dayCustomers = 0;
    PG.economy.dayEarned = 0;
  }
  PG.UI.setTaskText('📅 Yeni gün başladı! Müşteri bekleniyor...');
  const level = PG.economy ? PG.economy.level : 1;
  const firstDelay = Math.max(1500, 3500 - (level - 1) * 200);
  setTimeout(() => PG.Customers.spawn(), firstDelay);
}

PG.Interaction.update = update;
PG.Interaction.handleEnter = handleEnter;
PG.Interaction.startNewDay = startNewDay;

})();
