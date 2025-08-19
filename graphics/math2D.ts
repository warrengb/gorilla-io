export interface Point {
  x: number;
  y: number;
  add(point:Point): Point;
}

export class Point implements Point{
  x: number;
  y: number;

  constructor(x: number = 0.0, y: number = 0.0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  public add(point: Point): Point {
    this.x += point.x;
    this.y += point.y;
    return this;
  }

  public multiply(point: Point): Point {
    this.x *= point.x;
    this.y *= point.y;
    return this;
  }

  public divide(point: Point): Point {
    this.x /= point.x;
    this.y /= point.y;
    return this;
  }
}

export class Rectangle {
  constructor(public left: number = 0, public top: number = 0, public right: number = 0, public bottom: number = 0) { }

  clear() {
    this.left = 0;
    this.top = 0;
    this.right = 0;
    this.bottom = 0;
  }

  copy(other: Rectangle) {
    this.left = other.left;
    this.top = other.top;
    this.right = other.right;
    this.bottom = other.bottom;
  }
}

export class Size {
  width: number;
  height: number;

  constructor(width: number = 0.0, height: number = 0.0) {
    this.width = width;
    this.height = height;
  }

  public add(size: Size): Size {
    return new Size(this.width + size.width, this.height + size.height);
  }
}

export class Matrix2D {
  constructor(
    public a: number = 1,
    public b: number = 0,
    public c: number = 0,
    public d: number = 1,
    public e: number = 0,
    public f: number = 0) { }
}

export class Math2D {
  static cap(value: number, min: number, max: number): number {
    if (value < min) value = min; else
      if (value > max) value = max;
    return value;
  }

  static seek(from: number, to: number, speed: number): number {
    let dif = to - from;
    if (dif == 0)
      return to;
    if (Math.abs(dif) < .01)
      return to;
    return from + dif * speed;
  }

  //from https://codeincomplete.com/articles/javascript-racer/

  static timestamp(){ return new Date().getTime(); }
  static toInt(obj: string | null, def: number) { if (obj) { var x = parseInt(obj, 10); if (!isNaN(x)) return x; } return 0; }
  static toFloat(obj: string | null, def: number) { if (obj) { var x = parseFloat(obj); if (!isNaN(x)) return x; } return 0.0; }
  static limit(value: number, min: number, max: number) { return Math.max(min, Math.min(value, max)); }
  static randomInt(min: number, max: number) { return Math.round(Math2D.interpolate(min, max, Math.random())); }
  static randomChoice(options: string | any[]) { return options[Math2D.randomInt(0, options.length - 1)]; }
  static percentRemaining(n: number, total: number) { return (n % total) / total; }
  static accelerate(v: number, accel: number, dt: number) { return v + (accel * dt); }
  static interpolate(a: number, b: number, percent: number) { return a + (b - a) * percent }
  static easeIn(a: number, b: number, percent: number) { return a + (b - a) * Math.pow(percent, 2); }
  static easeOut(a: number, b: number, percent: number) { return a + (b - a) * (1 - Math.pow(1 - percent, 2)); }
  static easeInOut(a: number, b: number, percent: number) { return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5); }
  static exponentialFog(distance: number, density: number) { return 1 / (Math.pow(Math.E, (distance * distance * density))); }

  static increase(start: any, increment: any, max: number) { // with looping
    var result = start + increment;
    while (result >= max)
      result -= max;
    while (result < 0)
      result += max;
    return result;
  }

  static project(p: { camera: { x: number; y: number; z: number; }; world: { x: any; y: any; z: any; }; screen: { scale: number; x: number; y: number; w: number; }; }, cameraX: number, cameraY: number, cameraZ: number, cameraDepth: number, width: number, height: number, roadWidth: number) {
    p.camera.x = (p.world.x || 0) - cameraX;
    p.camera.y = (p.world.y || 0) - cameraY;
    p.camera.z = (p.world.z || 0) - cameraZ;
    p.screen.scale = cameraDepth / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round((p.screen.scale * roadWidth * width / 2));
  }

  static overlap(x1: number, w1: number, x2: number, w2: number, percent: any) {
    var half = (percent || 1) / 2;
    var min1 = x1 - (w1 * half);
    var max1 = x1 + (w1 * half);
    var min2 = x2 - (w2 * half);
    var max2 = x2 + (w2 * half);
    return !((max1 < min2) || (min1 > max2));
  }

  private constructor() { }
}

