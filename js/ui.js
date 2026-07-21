(function(){
PG.UI = {};

function updateStats() {
  if (PG.economy) {
    document.getElementById('money-display').textContent = PG.economy.money;
    document.getElementById('day-display').textContent = PG.economy.day;
    document.getElementById('cust-display').textContent = PG.Customers ? PG.Customers.length : 0;
    document.getElementById('lvl-display').textContent = PG.economy.level;
    const totalMin = 540 + (PG.economy.day - 1) * 480 + Math.floor((Date.now() % 480000) / 1000 / 60);
    const hours = Math.floor(totalMin / 60) % 24;
    const mins = totalMin % 60;
    document.getElementById('time-display').textContent =
      String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
  }
}

function setTaskText(text) {
  document.getElementById('task-text').textContent = text;
}

function setProgress(pct) {
  document.getElementById('task-progress-fill').style.width = Math.min(100, Math.max(0, pct)) + '%';
}

function showCustomerInfo(customer) {
  const panel = document.getElementById('customer-info');
  if (!customer) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  document.getElementById('ci-name').textContent = '🚶 ' + customer.name;
  document.getElementById('ci-service').textContent = (customer.service ? customer.service.icon : '❓') + ' ' + (customer.service ? customer.service.name : 'Bilinmiyor');

  const patiencePct = customer.patience !== undefined ? (customer.patience / customer.maxPatience) * 100 : 100;
  const fill = document.getElementById('ci-patience-fill');
  if (fill) fill.style.width = Math.max(0, patiencePct) + '%';
  if (fill) fill.style.background = patiencePct > 50
    ? 'linear-gradient(90deg, #4ecca3, #3db8a0)'
    : patiencePct > 25
    ? 'linear-gradient(90deg, #f0d060, #e0b040)'
    : 'linear-gradient(90deg, #e94560, #c73550)';

  const pColor = patiencePct > 50 ? '#4ecca3' : (patiencePct > 25 ? '#f0d060' : '#e94560');
  document.getElementById('ci-patience-text').innerHTML = '⏱ Sabır: <span style="color:' + pColor + '">' + Math.ceil(customer.patience || 0) + 's</span>';

  const fee = customer.service && customer.service.id === 'satis' ? 'Fiyata göre' : (customer.service ? customer.service.price + ' ₺' : '0 ₺');
  document.getElementById('ci-fee').textContent = '💰 ' + fee;
}

function showServicePanel(callback, customer) {
  const overlay = document.getElementById('panel-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('service-panel').style.display = 'block';
  document.getElementById('sell-panel').classList.add('hidden');
  const report = document.getElementById('day-report');
  if (report) report.classList.add('hidden');

  const title = document.querySelector('#service-panel h3');
  if (customer) {
    title.textContent = `${customer.name} istiyor: ${customer.service.icon} ${customer.service.name}`;
  } else {
    title.textContent = 'Hizmet Seçin';
  }

  const list = document.getElementById('service-list');
  list.innerHTML = '';
  PG.SERVICES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'svc-btn' + (customer && s.id === customer.service.id ? ' svc-highlight' : '');
    const priceStr = s.id === 'satis' ? 'Fiyata göre' : s.price + ' ₺';
    b.innerHTML = `${s.icon} ${s.name} <span class="price">${priceStr}</span>`;
    b.onclick = () => {
      overlay.classList.add('hidden');
      if (callback) callback(s);
    };
    list.appendChild(b);
  });
}

function showSellPanel(callback) {
  const overlay = document.getElementById('panel-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('service-panel').style.display = 'none';
  document.getElementById('sell-panel').classList.remove('hidden');
  const report = document.getElementById('day-report');
  if (report) report.classList.add('hidden');

  const list = document.getElementById('sell-list');
  list.innerHTML = '';
  PG.SELL_ITEMS.forEach(item => {
    const b = document.createElement('button');
    b.className = 'svc-btn';
    b.innerHTML = `${item.name} <span class="price">${item.price} ₺</span>`;
    b.onclick = () => {
      overlay.classList.add('hidden');
      if (callback) callback(item);
    };
    list.appendChild(b);
  });
}

function showDayReport(stats) {
  const overlay = document.getElementById('panel-overlay');
  overlay.classList.remove('hidden');
  document.getElementById('service-panel').style.display = 'none';
  document.getElementById('sell-panel').classList.add('hidden');
  const report = document.getElementById('day-report');
  report.classList.remove('hidden');

  const content = document.getElementById('report-content');
  content.innerHTML = `
    <div class="line"><span>Toplam Müşteri</span><span class="val">${stats.customers}</span></div>
    <div class="line"><span>Memnun Ayrılan</span><span class="val" style="color:#4ecca3">${stats.happy}</span></div>
    <div class="line"><span>Giden Müşteri</span><span class="val" style="color:#e94560">${stats.left}</span></div>
    <div class="line"><span>Toplam Kazanç</span><span class="val" style="color:#4ecca3">${stats.earned} ₺</span></div>
    <div class="line"><span>Seviye</span><span class="val">${stats.level}</span></div>
    <div class="line"><span>Bakiye</span><span class="val" style="color:#f0d060">${PG.economy ? PG.economy.money : 0} ₺</span></div>
  `;

  document.getElementById('report-btn').onclick = () => {
    overlay.classList.add('hidden');
    report.classList.add('hidden');
    if (PG.Interaction) PG.Interaction.startNewDay();
  };
}

function showDialog(speaker, text, duration) {
  const box = document.getElementById('dialog-box');
  if (!box) return;
  box.querySelector('.speaker').textContent = speaker;
  box.querySelector('.text').textContent = text;
  box.classList.remove('hidden');
  if (duration) {
    setTimeout(() => box.classList.add('hidden'), duration);
  }
}

function hideDialog() {
  const box = document.getElementById('dialog-box');
  if (box) box.classList.add('hidden');
}

function notify(text) {
  const el = document.getElementById('notif');
  if (!el) return;
  el.textContent = text;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2200);
}

PG.UI.updateStats = updateStats;
PG.UI.setTaskText = setTaskText;
PG.UI.setProgress = setProgress;
PG.UI.showCustomerInfo = showCustomerInfo;
PG.UI.showServicePanel = showServicePanel;
PG.UI.showSellPanel = showSellPanel;
PG.UI.showDayReport = showDayReport;
PG.UI.showDialog = showDialog;
PG.UI.hideDialog = hideDialog;
PG.UI.notify = notify;

})();
