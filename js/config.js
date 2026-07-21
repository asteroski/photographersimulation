const PG = {};

PG.CANVAS_W = 1600;
PG.CANVAS_H = 900;

PG.SERVICES = [
  { id:'vesikalik', name:'Vesikalık Fotoğraf', icon:'🛂', price:100, time:3000, needsStudio:true },
  { id:'portre',    name:'Portre Fotoğrafı',    icon:'🖼️', price:150, time:3500, needsStudio:true },
  { id:'dugun',     name:'Düğün Fotoğrafı',     icon:'💒', price:500, time:5000, needsStudio:true },
  { id:'poz',       name:'Profesyonel Poz',      icon:'📸', price:200, time:3000, needsStudio:true },
  { id:'satis',     name:'Ürün Satışı',         icon:'🛒', price:0,   time:2000, needsStudio:false },
  { id:'film',      name:'Film Yıkama/Kaset',   icon:'🎞️', price:250, time:4000, needsStudio:false },
];

PG.SELL_ITEMS = [
  { name:'Albüm',           price:150 },
  { name:'Çerçeve',         price:80  },
  { name:'Fotoğraf Kağıdı', price:40  },
  { name:'Fotoğraf Makinesi', price:3500 },
];

PG.CUSTOMER_NAMES = [
  'Ali','Ayşe','Mehmet','Fatma','Zeynep','Mustafa','Elif','Hasan','Emine',
  'İbrahim','Hatice','Ömer','Merve','Burak','Selin','Arda','Cansu','Kerem','Derya'
];
PG.MALE_NAMES = ['Ali','Mehmet','Mustafa','Hasan','İbrahim','Ömer','Burak','Arda','Kerem'];
PG.FEMALE_NAMES = ['Ayşe','Fatma','Zeynep','Elif','Emine','Hatice','Merve','Selin','Cansu','Derya'];

PG.START_MONEY = 500;
PG.CUST_TIMEOUT = 30000;
PG.MOVE_SPEED = 4.5;
PG.CAMERA_SMOOTH = 0.06;
PG.INTERACT_DIST = 70;
PG.TARGET_REACH_DIST = 70;
PG.DOOR_Y = 400;
PG.DELIVER_POS = { x: 1350, y: 570 };

// === NEW LAYOUT: two rooms divided by a wall ===

// Studio (top room) — light gray floor
PG.STUDIO_Y1 = 30;
PG.STUDIO_Y2 = 380;
PG.STUDIO_CENTER = { x: 800, y: 200 };

// Dividing wall with wooden door at center
PG.WALL_Y1 = 380;
PG.WALL_Y2 = 410;
PG.DOOR_CENTER = { x: 800, y: 395 };

// Shop/reception (bottom room) — warm oak floor
PG.SHOP_Y1 = 410;
PG.SHOP_Y2 = 870;

// Studio elements
PG.BACKDROP_Y = { y1: PG.STUDIO_Y1 + 10, y2: PG.STUDIO_Y1 + 40 };
PG.SOFTBOX_LEFT  = { x: 220, y: PG.STUDIO_Y1 + 40, standY2: PG.STUDIO_Y1 + 200 };
PG.SOFTBOX_RIGHT = { x: 1380, y: PG.STUDIO_Y1 + 40, standY2: PG.STUDIO_Y1 + 200 };
PG.ARMCHAIR = { x: 800, y: 220 };

// Shop elements — left side
PG.SOFA = { x1: 30, x2: 280, y1: 450, y2: 540 };
PG.FRAME_STAND_POS = { x: 120, y: 780 };

// Shop elements — right side
PG.COUNTER = { x1: 1250, x2: 1500, y1: 450, y2: 540 };
PG.COMPUTER_POS = { x: 1520, y: 500 };

// Customer wait area (in front of sofa)
PG.CUSTOMER_WAIT_POS = { x: 350, y: 500 };

// Entrance at bottom center
PG.ENTRANCE = { x: 800, y: 870 };
