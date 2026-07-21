(function(){
PG.economy = {
  money: PG.START_MONEY,
  day: 1,
  level: 1,
  totalEarned: 0,
  customersServed: 0,
  customersLeft: 0,
  dayCustomers: 0,
  dayEarned: 0,
};

function nextLevel() {
  const ec = PG.economy;
  if (ec.customersServed >= ec.level * 10) {
    ec.level++;
    return true;
  }
  return false;
}

function endDay() {
  const ec = PG.economy;
  const stats = {
    customers: ec.customersServed,
    happy: ec.customersServed,
    left: ec.customersLeft,
    earned: ec.totalEarned,
    level: ec.level,
  };
  PG.UI.showDayReport(stats);
}

function getPrice(service) {
  const ec = PG.economy;
  const base = service.price || 0;
  const multiplier = 1 + (ec.level - 1) * 0.1;
  return Math.floor(base * multiplier);
}

PG.economy.nextLevel = nextLevel;
PG.economy.endDay = endDay;
PG.economy.getPrice = getPrice;

})();
