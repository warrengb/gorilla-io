//ts port from https://codeincomplete.com/articles/javascript-racer/

class Vector {
  constructor(public x = 0, public y = 0, public z = 0, public w = 0, public h = 0, public scale = 1) { }
}

class Sprite {
  constructor(
    public source: Vector,
    public offset = 0,
    public w=0
  ) { }
}

class Track {
  constructor(
    public world = new Vector(),
    public camera = new Vector(),
    public screen = new Vector()) { }
}

class COLORS {
  static SKY = '#72D7EE';
  static TREE = '#005108';
  static FOG = '#005108';
  static LIGHT = new COLORS('#6B6B6B', '#10AA10', '#555555', '#CCCCCC');
  static DARK = new COLORS('#696969', '#009A00', '#BBBBBB');
  static START = new COLORS('white', 'white', 'white');
  static FINISH = new COLORS('black', 'black', 'black');

  constructor(
    public road = "",
    public grass = "",
    public rumble = "",
    public lane = "") { }
}

var ROAD = {
  LENGTH: { NONE: 0, SHORT: 25, MEDIUM: 50, LONG: 100 },
  HILL: { NONE: 0, LOW: 20, MEDIUM: 40, HIGH: 60 },
  CURVE: { NONE: 0, EASY: 2, MEDIUM: 4, HARD: 6 }
};

var BACKGROUND = {
  HILLS: { x: 5, y: 5, w: 1280, h: 480 },
  SKY: { x: 5, y: 495, w: 1280, h: 480 },
  TREES: { x: 5, y: 985, w: 1280, h: 480 }
};

var SPRITES = {
  PALM_TREE: { x: 5, y: 5, w: 215, h: 540 },
  BILLBOARD08: { x: 230, y: 5, w: 385, h: 265 },
  TREE1: { x: 625, y: 5, w: 360, h: 360 },
  DEAD_TREE1: { x: 5, y: 555, w: 135, h: 332 },
  BILLBOARD09: { x: 150, y: 555, w: 328, h: 282 },
  BOULDER3: { x: 230, y: 280, w: 320, h: 220 },
  COLUMN: { x: 995, y: 5, w: 200, h: 315 },
  BILLBOARD01: { x: 625, y: 375, w: 300, h: 170 },
  BILLBOARD06: { x: 488, y: 555, w: 298, h: 190 },
  BILLBOARD05: { x: 5, y: 897, w: 298, h: 190 },
  BILLBOARD07: { x: 313, y: 897, w: 298, h: 190 },
  BOULDER2: { x: 621, y: 897, w: 298, h: 140 },
  TREE2: { x: 1205, y: 5, w: 282, h: 295 },
  BILLBOARD04: { x: 1205, y: 310, w: 268, h: 170 },
  DEAD_TREE2: { x: 1205, y: 490, w: 150, h: 260 },
  BOULDER1: { x: 1205, y: 760, w: 168, h: 248 },
  BUSH1: { x: 5, y: 1097, w: 240, h: 155 },
  CACTUS: { x: 929, y: 897, w: 235, h: 118 },
  BUSH2: { x: 255, y: 1097, w: 232, h: 152 },
  BILLBOARD03: { x: 5, y: 1262, w: 230, h: 220 },
  BILLBOARD02: { x: 245, y: 1262, w: 215, h: 220 },
  STUMP: { x: 995, y: 330, w: 195, h: 140 },
  SEMI: { x: 1365, y: 490, w: 122, h: 144 },
  TRUCK: { x: 1365, y: 644, w: 100, h: 78 },
  CAR03: { x: 1383, y: 760, w: 88, h: 55 },
  CAR02: { x: 1383, y: 825, w: 80, h: 59 },
  CAR04: { x: 1383, y: 894, w: 80, h: 57 },
  CAR01: { x: 1205, y: 1018, w: 80, h: 56 },
  PLAYER_UPHILL_LEFT: { x: 1383, y: 961, w: 80, h: 45 },
  PLAYER_UPHILL_STRAIGHT: { x: 1295, y: 1018, w: 80, h: 45 },
  PLAYER_UPHILL_RIGHT: { x: 1385, y: 1018, w: 80, h: 45 },
  PLAYER_LEFT: { x: 995, y: 480, w: 80, h: 41 },
  PLAYER_STRAIGHT: { x: 1085, y: 480, w: 80, h: 41 },
  PLAYER_RIGHT: { x: 995, y: 531, w: 80, h: 41 },
};

class Car {
  constructor(
    public offset = 0,
    public z = 0,
    public percent = 0,
    public speed = 0,
    public sprite: Sprite) { }
}

class Segment {
  sprites: Sprite[] = [];
  cars: Car[] = [];
  constructor(
    public index = 0,
    public p1 = new Track(),
    public p2 = new Track(),
    public curve = 0,
    public color = new COLORS(),
    public fog = 0,
    public looped = false,
    public clip = 0
  ) { }
}

class Util {
  static timestamp() { return new Date().getTime(); }
  static toInt(obj: string, def: number): number { if (obj) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return 0; }
  static toFloat(obj: string): number { if (obj) { var x = parseFloat(obj); if (!isNaN(x)) return x; } return 0.0; }
  static limit(value: number, min: number, max: number) { return Math.max(min, Math.min(value, max)); }
  static randomInt(min: number, max: number) { return Math.round(Util.interpolate(min, max, Math.random())); }
  static randomChoice(options: any): number { return options[Util.randomInt(0, options.length - 1)]; }
  static percentRemaining(n: number, total: number): number { return (n % total) / total; }
  static accelerate(v: number, accel: number, dt: number): number { return v + (accel * dt); }
  static interpolate(a: number, b: number, percent: number): number { return a + (b - a) * percent }
  static easeIn(a: number, b: number, percent: number): number { return a + (b - a) * Math.pow(percent, 2); }
  static easeOut(a: number, b: number, percent: number): number { return a + (b - a) * (1 - Math.pow(1 - percent, 2)); }
  static easeInOut(a: number, b: number, percent: number): number { return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5); }
  static exponentialFog(distance: number, density: number): number { return 1 / (Math.pow(Math.E, (distance * distance * density))); }

  static increase(start: number, increment: number, max: number) { // with looping

    let result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  }

  static project(p: Track, cameraX: number, cameraY: number, cameraZ: number, cameraDepth: number, width: number, height: number, roadWidth: number) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
  }

  static overlap(x1: number, w1: number, x2: number, w2: number, percent: number) {
    let  half = (percent || 1) / 2;
    let  min1 = x1 - (w1 * half);
    let  max1 = x1 + (w1 * half);
    let  min2 = x2 - (w2 * half);
    let  max2 = x2 + (w2 * half);
    return !((max1 < min2) || (min1 > max2));
  }
}

class Render {

  static background(ctx: any, background: any, width: number, height: number, layer: any, rotation: number, offset: number) {
    rotation = rotation || 0;
    offset = offset || 0;

    let  imageW = layer.w / 2;
    let  imageH = layer.h;

    let  sourceX = layer.x + Math.floor(layer.w * rotation);
    let  sourceY = layer.y
    let  sourceW = Math.min(imageW, layer.x + layer.w - sourceX);
    let  sourceH = imageH;

    let  destX = 0;
    let  destY = offset;
    let  destW = Math.floor(width * (sourceW / imageW));
    let  destH = height;

    if (background) {
      ctx.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
      if (sourceW < imageW)
        ctx.drawImage(background, layer.x, sourceY, imageW - sourceW, sourceH, destW - 1, destY, width - destW, destH);
    }
 }

  static sprite(ctx: any, width: number, height: number, resolution: number, roadWidth: number, sprites: any, sprite: any, scale: number, destX: number, destY: number, offsetX: number, offsetY: number, clipY: number, sscale: number) {

    //  scale for projection AND relative to roadWidth (for tweakUI)
    let  destW = (sprite.w * scale * width / 2) * (sscale * roadWidth);
    let destH = (sprite.h * scale * width / 2) * (sscale * roadWidth);

    destX = destX + (destW * (offsetX || 0));
    destY = destY + (destH * (offsetY || 0));

    let clipH = clipY ? Math.max(0, destY + destH - clipY) : 0;
    if (clipH < destH)
      ctx.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h - (sprite.h * clipH / destH), destX, destY, destW, destH - clipH);

  }

  static fog(ctx: any, x: number, y: number, width: number, height: number, fog: number) {
    if (fog < 1) {
      ctx.globalAlpha = (1 - fog)
      ctx.fillStyle = COLORS.FOG;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
  }

  static rumbleWidth(projectedRoadWidth: number, lanes: number) { return projectedRoadWidth / Math.max(6, 2 * lanes); }
  static laneMarkerWidth(projectedRoadWidth: number, lanes: number) { return projectedRoadWidth / Math.max(32, 8 * lanes); }

  static polygon(ctx:any, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  static segment(ctx: any, width: number, lanes: number, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, fog: number, color:any) {
    let r1 = Render.rumbleWidth(w1, lanes),
      r2 = Render.rumbleWidth(w2, lanes),
      l1 = Render.laneMarkerWidth(w1, lanes),
      l2 = Render.laneMarkerWidth(w2, lanes),
      lanew1, lanew2, lanex1, lanex2, lane;

    ctx.fillStyle = color.grass;
    ctx.fillRect(0, y2, width, y1 - y2);

    Render.polygon(ctx, x1 - w1 - r1, y1, x1 - w1, y1, x2 - w2, y2, x2 - w2 - r2, y2, color.rumble);
    Render.polygon(ctx, x1 + w1 + r1, y1, x1 + w1, y1, x2 + w2, y2, x2 + w2 + r2, y2, color.rumble);
    Render.polygon(ctx, x1 - w1, y1, x1 + w1, y1, x2 + w2, y2, x2 - w2, y2, color.road);

    if (color.lane) {
      lanew1 = w1 * 2 / lanes;
      lanew2 = w2 * 2 / lanes;
      lanex1 = x1 - w1 + lanew1;
      lanex2 = x2 - w2 + lanew2;
      for (let lane = 1; lane < lanes; lanex1 += lanew1, lanex2 += lanew2, lane++)
        Render.polygon(ctx, lanex1 - l1 / 2, y1, lanex1 + l1 / 2, y1, lanex2 + l2 / 2, y2, lanex2 - l2 / 2, y2, color.lane);
    }
    Render.fog(ctx, 0, y1, width, y2 - y1, fog);
  }

  static player(ctx: any, width: any, height: any, resolution: number, roadWidth: any, sprites: any, speedPercent: number, scale: any, destX: any, destY: number, steer: number, updown: number, sscale: any) {
    let bounce = (1.5 * Math.random() * speedPercent * resolution) * Util.randomChoice([-1, 1]);
    let sprite;
    if (steer < 0)
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_LEFT : SPRITES.PLAYER_LEFT;
    else if (steer > 0)
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_RIGHT : SPRITES.PLAYER_RIGHT;
    else
      sprite = (updown > 0) ? SPRITES.PLAYER_UPHILL_STRAIGHT : SPRITES.PLAYER_STRAIGHT;

    Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY + bounce, -0.5, -1,0, sscale);
  }
}

export class Road {
  fps = 60;                      // how many 'update' frames per second
  step = 1 / this.fps;                   // how long is each frame (in seconds)
  width = 480 * 3;                    // logical canvas width
  height = 270 * 3;                     // logical canvas height
  centrifugal = 0.3;                     // centrifugal force multiplier when going around curves
  //offRoadDecel = 0.99;                    // speed multiplier when off road (e.g. you lose 2% speed each update frame)
  skySpeed = 0.001;                   // background sky layer scroll speed when going around curve (or up hill)
  hillSpeed = 0.002;                   // background hill layer scroll speed when going around curve (or up hill)
  treeSpeed = 0.003;                   // background tree layer scroll speed when going around curve (or up hill)
  skyOffset = 0;                       // current sky scroll offset
  hillOffset = 0;                       // current hill scroll offset
  treeOffset = 0;
  skyOffsetV = 0;                       // current sky scroll offset
  hillOffsetV = 0;                       // current hill scroll offset
  treeOffsetV = 0;
  segments: Segment[] = [];                      // array of road segments
  cars: Car[] = [];                 
  background: HTMLImageElement | undefined = undefined;                    // our background image (loaded below)
  sprites: HTMLImageElement | undefined = undefined;                    // our spritesheet (loaded below)
  resolution = this.height / 480;                   // scaling factor to provide resolution independence (computed)
  roadWidth = 2000;                    // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
  segmentLength = 200;                     // length of a single segment
  rumbleLength = 3;                       // number of segments per red/white rumble strip
  trackLength = 0;                    // z length of entire track (computed)
  lanes = 3;                       // number of lanes
  fieldOfView = 100;                     // angle (degrees) for field of view
  cameraHeight = 1000;                    // z height of camera
  cameraDepth = .8;                    // z distance camera is from screen (computed)
  drawDistance = 300;                     // number of segments to draw
  playerX = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
  playerZ = 0;                    // player relative z distance from camera (computed)export 
  fogDensity = 5;                       // exponential fog density
  position = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
  speed = 0;                       // current speed
  maxSpeed = this.segmentLength / this.step;      // top speed (ensure we can't move more than 1 segment in a single frame to make collision detection easier)
  accel = this.maxSpeed / 5;             // acceleration rate - tuned until it 'felt' right
  breaking = -this.maxSpeed;               // deceleration rate when braking
  decel = -this.maxSpeed / 5;             // 'natural' deceleration rate when neither accelerating, nor braking
  offRoadDecel = -this.maxSpeed / 2;             // off road deceleration is somewhere in between
  offRoadLimit = this.maxSpeed / 4;             // limit when off road deceleration no longer applies (e.g. you can always go at least this speed even when off road)
  totalCars = 200;                     // total number of cars on the road

  last = Util.timestamp();
  gdt = 0;

  playerBounce = 0;
  playerUpdown = 0;

  keyLeft = false;
  keyRight = false;
  keyFaster = false;
  keySlower = false;

  SPRITES_SCALE = 0.3 * (1 / SPRITES.PLAYER_STRAIGHT.w) // the reference sprite width should be 1/3rd the (half-)roadWidth
  SPRITES_BILLBOARDS = [SPRITES.BILLBOARD01, SPRITES.BILLBOARD02, SPRITES.BILLBOARD03, SPRITES.BILLBOARD04, SPRITES.BILLBOARD05, SPRITES.BILLBOARD06, SPRITES.BILLBOARD07, SPRITES.BILLBOARD08, SPRITES.BILLBOARD09];
  SPRITES_PLANTS = [SPRITES.TREE1, SPRITES.TREE2, SPRITES.DEAD_TREE1, SPRITES.DEAD_TREE2, SPRITES.PALM_TREE, SPRITES.BUSH1, SPRITES.BUSH2, SPRITES.CACTUS, SPRITES.STUMP, SPRITES.BOULDER1, SPRITES.BOULDER2, SPRITES.BOULDER3];
  SPRITES_CARS = [SPRITES.CAR01, SPRITES.CAR02, SPRITES.CAR03, SPRITES.CAR04, SPRITES.SEMI, SPRITES.TRUCK];


  update() {
    //let now = Util.timestamp();
    //let dt = Math.min(1, (now - this.last) / 1000); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
    //this.gdt = this.gdt + dt;
    //while (this.gdt > this.step) {
    //  this.gdt = this.gdt - this.step;
    //  this.updateData(this.step);
    //}
    //this.last = now;
    this.updateData(this.step);
  }

  updateData(dt: number) {
    let playerSegment = this.findSegment(this.position + this.playerZ);
    var playerW = SPRITES.PLAYER_STRAIGHT.w * this.SPRITES_SCALE;
    let speedPercent = this.speed / this.maxSpeed;
    let dx = dt * 2 * speedPercent; // at top speed, should be able to cross from left to right (-1 to +1) in 1 second
    let startPosition = this.position;

    this.updateCars(dt, playerSegment, playerW);

    this.position = Util.increase(this.position, dt * this.speed, this.trackLength);

    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * speedPercent, 1);
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * speedPercent, 1);
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * speedPercent, 1);

    if (this.keyLeft)
      this.playerX = this.playerX - dx;
    else if (this.keyRight)
      this.playerX = this.playerX + dx;

    this.playerX = this.playerX - (dx * speedPercent * playerSegment.curve * this.centrifugal);

    if (this.keyFaster)
      this.speed = Util.accelerate(this.speed, this.accel, dt);
    else if (this.keySlower)
      this.speed = Util.accelerate(this.speed, this.breaking, dt);
    else
      this.speed = Util.accelerate(this.speed, this.decel, dt);

    if ((this.playerX < -1) || (this.playerX > 1)) {

      if (this.speed > this.offRoadLimit)
        this.speed = Util.accelerate(this.speed, this.offRoadDecel, dt);

      for (let n = 0; n < playerSegment.sprites.length; n++) {
        let sprite = playerSegment.sprites[n];
        let spriteW = sprite.source.w * this.SPRITES_SCALE;
        if (Util.overlap(this.playerX, playerW, sprite.offset + spriteW / 2 * (sprite.offset > 0 ? 1 : -1), spriteW,0)) {
          this.speed = this.maxSpeed / 5;
          this.position = Util.increase(playerSegment.p1.world.z, -this.playerZ, this.trackLength); // stop in front of sprite (at front of segment)
          break;
        }
      }
    }

    for (let n = 0; n < playerSegment.cars.length; n++) {
      let car = playerSegment.cars[n];
      let carW = car.sprite.w * this.SPRITES_SCALE;
      if (this.speed > car.speed) {
        if (Util.overlap(this.playerX, playerW, car.offset, carW, 0.8)) {
          this.speed = car.speed * (car.speed / this.speed);
          this.position = Util.increase(car.z, -this.playerZ, this.trackLength);
          break;
        }
      }
    }

    this.playerX = Util.limit(this.playerX, -3, 3);     // dont ever let it go too far out of bounds
    this.speed = Util.limit(this.speed, 0, this.maxSpeed); // or exceed maxSpeed

    this.skyOffset = Util.increase(this.skyOffset, this.skySpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);
    this.hillOffset = Util.increase(this.hillOffset, this.hillSpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);
    this.treeOffset = Util.increase(this.treeOffset, this.treeSpeed * playerSegment.curve * (this.position - startPosition) / this.segmentLength, 1);

    //if (position > playerZ) {
    //  if (currentLapTime && (startPosition < playerZ)) {
    //    lastLapTime = currentLapTime;
    //    currentLapTime = 0;
    //    if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
    //      Dom.storage.fast_lap_time = lastLapTime;
    //      updateHud('fast_lap_time', formatTime(lastLapTime));
    //      Dom.addClassName('fast_lap_time', 'fastest');
    //      Dom.addClassName('last_lap_time', 'fastest');
    //    }
    //    else {
    //      Dom.removeClassName('fast_lap_time', 'fastest');
    //      Dom.removeClassName('last_lap_time', 'fastest');
    //    }
    //    updateHud('last_lap_time', formatTime(lastLapTime));
    //    Dom.show('last_lap_time');
    //  }
    //  else {
    //    this.currentLapTime += dt;
    //  }
    //}
  }

  //=========================================================================
  // BUILD ROAD GEOMETRY
  //=========================================================================

  lastY() { return (this.segments.length == 0) ? 0 : this.segments[this.segments.length - 1].p2.world.y; }

  findSegment(z: number) {
    return this.segments[Math.floor(z / this.segmentLength) % this.segments.length];
  }

  addSegment(curve: number | undefined, y: number | undefined) {
    let n = this.segments.length;
    let p1 = new Track(new Vector(0, this.lastY(), n * this.segmentLength));
    let p2 = new Track(new Vector(0, y, (n + 1) * this.segmentLength));
    let color = Math.floor(n / this.rumbleLength) % 2 ? COLORS.DARK : COLORS.LIGHT;
    let segment = new Segment(n, p1, p2, curve, color);
    this.segments.push(segment);
  }

  addRoad(enter: number, hold: number, leave: number, curve: number, y: number) {
    var startY = this.lastY();
    var endY = startY + (Util.toInt(y.toString(), 0) * this.segmentLength);
    var n, total = enter + hold + leave;
    for (n = 0; n < enter; n++)
      this.addSegment(Util.easeIn(0, curve, n / enter), Util.easeInOut(startY, endY, n / total));
    for (n = 0; n < hold; n++)
      this.addSegment(curve, Util.easeInOut(startY, endY, (enter + n) / total));
    for (n = 0; n < leave; n++)
      this.addSegment(Util.easeInOut(curve, 0, n / leave), Util.easeInOut(startY, endY, (enter + hold + n) / total));
  }

  addStraight(num = ROAD.LENGTH.MEDIUM) {
    this.addRoad(num, num, num, 0, 0);
  }

  addCurve(num = ROAD.LENGTH.MEDIUM, curve = ROAD.CURVE.MEDIUM, height = ROAD.HILL.NONE) {
    this.addRoad(num, num, num, curve, height);
  }

  addSCurves() {
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.NONE);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.CURVE.EASY, -ROAD.HILL.LOW);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.EASY, ROAD.HILL.MEDIUM);
    this.addRoad(ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, ROAD.LENGTH.MEDIUM, -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
  }

  addHill(num = ROAD.LENGTH.MEDIUM, height = ROAD.HILL.MEDIUM) {
    this.addRoad(num, num, num, 0, height);
  }


  addLowRollingHills(num = ROAD.LENGTH.SHORT, height = ROAD.HILL.LOW) {
    this.addRoad(num, num, num, 0, height / 2);
    this.addRoad(num, num, num, 0, -height);
    this.addRoad(num, num, num, 0, height);
    this.addRoad(num, num, num, 0, 0);
    this.addRoad(num, num, num, 0, height / 2);
    this.addRoad(num, num, num, 0, 0);
  }
  addDownhillToEnd(num = 200) {
    this.addRoad(num, num, num, -ROAD.CURVE.EASY, -this.lastY() / this.segmentLength);
  }

  addBumps() {
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -2);
    this.addRoad(10, 10, 10, 0, -5);
    this.addRoad(10, 10, 10, 0, 8);
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -7);
    this.addRoad(10, 10, 10, 0, 5);
    this.addRoad(10, 10, 10, 0, -2);
  }

 addSprite(n: number, sprite: any, offset: number | undefined) {
  this.segments[n].sprites.push(new Sprite(sprite, offset ));
}

  resetSprites() {
    this.addSprite(20, SPRITES.BILLBOARD07, -1);
    this.addSprite(40, SPRITES.BILLBOARD06, -1);
    this.addSprite(60, SPRITES.BILLBOARD08, -1);
    this.addSprite(80, SPRITES.BILLBOARD09, -1);
    this.addSprite(100, SPRITES.BILLBOARD01, -1);
    this.addSprite(120, SPRITES.BILLBOARD02, -1);
    this.addSprite(140, SPRITES.BILLBOARD03, -1);
    this.addSprite(160, SPRITES.BILLBOARD04, -1);
    this.addSprite(180, SPRITES.BILLBOARD05, -1);

    this.addSprite(240, SPRITES.BILLBOARD07, -1.2);
    this.addSprite(240, SPRITES.BILLBOARD06, 1.2);
    this.addSprite(this.segments.length - 25, SPRITES.BILLBOARD07, -1.2);
    this.addSprite(this.segments.length - 25, SPRITES.BILLBOARD06, 1.2);

    for (let n = 10; n < 200; n += 4 + Math.floor(n / 100)) {
      this.addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random() * 0.5);
      this.addSprite(n, SPRITES.PALM_TREE, 1 + Math.random() * 2);
    }

    for (let n = 250; n < 1000; n += 5) {
      this.addSprite(n, SPRITES.COLUMN, 1.1);
      this.addSprite(n + Util.randomInt(0, 5), SPRITES.TREE1, -1 - (Math.random() * 2));
      this.addSprite(n + Util.randomInt(0, 5), SPRITES.TREE2, -1 - (Math.random() * 2));
    }

    for (let n = 200; n < this.segments.length; n += 3) {
      this.addSprite(n, Util.randomChoice(this.SPRITES_PLANTS), Util.randomChoice([1, -1]) * (2 + Math.random() * 5));
    }

    var side, sprite, offset;
    for (let n = 1000; n < (this.segments.length - 50); n += 100) {
      side = Util.randomChoice([1, -1]);
      this.addSprite(n + Util.randomInt(0, 50), Util.randomChoice(this.SPRITES_BILLBOARDS), -side);
      for (let i = 0; i < 20; i++) {
        sprite = Util.randomChoice(this.SPRITES_PLANTS);
        offset = side * (1.5 + Math.random());
        this.addSprite(n + Util.randomInt(0, 50), sprite, offset);
      }
    }
  }

  updateCarOffset(car: any, carSegment: any, playerSegment: any, playerW: number) {

    let dir = 0;
    let otherCar: Car | undefined = undefined;
    let lookahead = 20;
    let carW = car.sprite.w * this.SPRITES_SCALE;

    // optimization, dont bother steering around other cars when 'out of sight' of the player
    if ((carSegment.index - playerSegment.index) > this.drawDistance)
      return 0;

    for (let i = 1; i < lookahead; i++) {
      let segment = this.segments[(carSegment.index + i) % this.segments.length];

      if ((segment === playerSegment) && (car.speed > this.speed) && (Util.overlap(this.playerX, playerW, car.offset, carW, 1.2))) {
        if (this.playerX > 0.5)
          dir = -1;
        else if (this.playerX < -0.5)
          dir = 1;
        else
          dir = (car.offset > this.playerX) ? 1 : -1;
        return dir * 1 / i * (car.speed - this.speed) / this.maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
      }

      for (let j = 0; j < segment.cars.length; j++) {
        otherCar = segment.cars[j];
        let otherCarW = otherCar.sprite.w * this.SPRITES_SCALE;
        if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
          if (otherCar.offset > 0.5)
            dir = -1;
          else if (otherCar.offset < -0.5)
            dir = 1;
          else
            dir = (car.offset > otherCar.offset) ? 1 : -1;
          return dir * 1 / i * (car.speed - otherCar.speed) / this.maxSpeed;
        }
      }
    }
    return 0; // no offset needed
  }

   updateCars(dt: number, playerSegment: Segment, playerW: number) {
  for (let n = 0; n < this.cars.length; n++) {
    let car = this.cars[n];
    let oldSegment = this.findSegment(car.z);
    car.offset = car.offset + this.updateCarOffset(car, oldSegment, playerSegment, playerW);
    car.z = Util.increase(car.z, dt * car.speed, this.trackLength);
    car.percent = Util.percentRemaining(car.z, this.segmentLength); // useful for interpolation during rendering phase
    let newSegment = this.findSegment(car.z);
    if (oldSegment != newSegment) {
      let index = oldSegment.cars.indexOf(car);
      oldSegment.cars.splice(index, 1);
      newSegment.cars.push(car);
    }
  }
}

  resetCars() {
    this.cars = [];
    for (let n = 0; n < this.totalCars; n++) {
      let offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
      let z = Math.floor(Math.random() * this.segments.length) * this.segmentLength;
      let s:any = Util.randomChoice(this.SPRITES_CARS);
      let sprite = new Sprite(new Vector(s.x, s.y, 0, s.w, s.h));
      let speed = this.maxSpeed / 4 + Math.random() * this.maxSpeed / (s == SPRITES.SEMI ? 4 : 2);
      let car = new Car(offset, z, 0, speed, sprite);
      let segment = this.findSegment(car.z);
      segment.cars.push(car);
      this.cars.push(car);
    }
  }

  reset(sprites: HTMLImageElement) {
    this.sprites = sprites;
    this.segments = [];

    this.addStraight(ROAD.LENGTH.SHORT);
    this.addLowRollingHills();
    this.addSCurves();
    this.addCurve(ROAD.LENGTH.MEDIUM, ROAD.CURVE.MEDIUM, ROAD.HILL.LOW);
    this.addBumps();
    this.addLowRollingHills();
    this.addCurve(ROAD.LENGTH.LONG * 2, ROAD.CURVE.MEDIUM, ROAD.HILL.MEDIUM);
    this.addStraight();
    this.addHill(ROAD.LENGTH.MEDIUM, ROAD.HILL.HIGH);
    this.addSCurves();
    this.addCurve(ROAD.LENGTH.LONG, -ROAD.CURVE.MEDIUM, ROAD.HILL.NONE);
    this.addHill(ROAD.LENGTH.LONG, ROAD.HILL.HIGH);
    this.addCurve(ROAD.LENGTH.LONG, ROAD.CURVE.MEDIUM, -ROAD.HILL.LOW);
    this.addBumps();
    this.addHill(ROAD.LENGTH.LONG, -ROAD.HILL.MEDIUM);
    this.addStraight();
    this.addSCurves();
    this.addDownhillToEnd();

    this.resetSprites();
    this.resetCars();

    this.segments[this.findSegment(this.playerZ).index + 2].color = COLORS.START;
    this.segments[this.findSegment(this.playerZ).index + 3].color = COLORS.START;
    for (var n = 0; n < this.rumbleLength; n++)
      this.segments[this.segments.length - 1 - n].color = COLORS.FINISH;

    this.trackLength = this.segments.length * this.segmentLength;
  }

  render(ctx: CanvasRenderingContext2D) {
    let baseSegment = this.findSegment(this.position);
    let basePercent = Util.percentRemaining(this.position, this.segmentLength);
    let playerSegment = this.findSegment(this.position + this.playerZ);
    let playerPercent = Util.percentRemaining(this.position + this.playerZ, this.segmentLength);
    let playerY = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
    let maxy = this.height;

    let x = 0;
    let dx = - (baseSegment.curve * basePercent);

    this.skyOffsetV = this.resolution * this.skySpeed * playerY;
    this.hillOffsetV = this.resolution * this.hillSpeed * playerY;
    this.treeOffsetV = this.resolution * this.treeSpeed * playerY;

    Render.background(ctx, this.background, this.width, this.height, BACKGROUND.SKY, this.skyOffset, this.resolution * this.skySpeed * playerY);
    Render.background(ctx, this.background, this.width, this.height, BACKGROUND.HILLS, this.hillOffset, this.resolution * this.hillSpeed * playerY);
    Render.background(ctx, this.background, this.width, this.height, BACKGROUND.TREES, this.treeOffset, this.resolution * this.treeSpeed * playerY);

    for (let n = 0; n < this.drawDistance; n++) {
      let segment = this.segments[(baseSegment.index + n) % this.segments.length];
      segment.looped = segment.index < baseSegment.index;
      segment.fog = Util.exponentialFog(n / this.drawDistance, this.fogDensity);
      segment.clip = maxy;

      Util.project(segment.p1, (this.playerX * this.roadWidth) - x, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);
      Util.project(segment.p2, (this.playerX * this.roadWidth) - x - dx, playerY + this.cameraHeight, this.position - (segment.looped ? this.trackLength : 0), this.cameraDepth, this.width, this.height, this.roadWidth);

      x = x + dx;
      dx = dx + segment.curve;

      if ((segment.p1.camera.z <= this.cameraDepth) || // behind us
        (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
        (segment.p2.screen.y >= maxy))                  // clip by (already rendered) segment
        continue;

      Render.segment(ctx, this.width, this.lanes,
        segment.p1.screen.x,
        segment.p1.screen.y,
        segment.p1.screen.w,
        segment.p2.screen.x,
        segment.p2.screen.y,
        segment.p2.screen.w,
        segment.fog,
        segment.color);

      maxy = segment.p2.screen.y;
    }

    for (let n = (this.drawDistance - 1); n > 0; n--) {
      let segment = this.segments[(baseSegment.index + n) % this.segments.length];

      for (let i = 0; i < segment.cars.length; i++) {
        let car = segment.cars[i];
        let spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
        let spriteX = Util.interpolate(segment.p1.screen.x, segment.p2.screen.x, car.percent) + (spriteScale * car.offset * this.roadWidth * this.width / 2);
        let spriteY = Util.interpolate(segment.p1.screen.y, segment.p2.screen.y, car.percent);
        Render.sprite(ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, car.sprite.source, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip, this.SPRITES_SCALE);
      }

      for (let i = 0; i < segment.sprites.length; i++) {
        let sprite = segment.sprites[i];
        let spriteScale = segment.p1.screen.scale;
        let spriteX = segment.p1.screen.x + (spriteScale * sprite.offset * this.roadWidth * this.width / 2);
        let spriteY = segment.p1.screen.y;
        Render.sprite(ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip, this.SPRITES_SCALE);
      }

      if (segment == playerSegment) {
        this.playerBounce = (1.5 * Math.random() * (this.speed / this.maxSpeed) * this.resolution) * Util.randomChoice([-1, 1]);
        this.playerUpdown = playerSegment.p2.world.y - playerSegment.p1.world.y;

        Render.player(ctx, this.width, this.height, this.resolution, this.roadWidth, this.sprites, this.speed / this.maxSpeed,
          this.cameraDepth / this.playerZ,
          this.width / 2,
          (this.height / 2) - (this.cameraDepth / this.playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * this.height / 2),
          this.speed * (this.keyLeft ? -1 : this.keyRight ? 1 : 0),
          playerSegment.p2.world.y - playerSegment.p1.world.y, this.SPRITES_SCALE);
      }
    }
  }
}
