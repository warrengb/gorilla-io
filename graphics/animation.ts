import { Sprite } from '../graphics/sprite';
import { Display } from '../vision/display';
import { Stage } from '../vision/stage';

export class Animation extends Sprite {

  strip = 0;
  frame = 0;
  mode: number = Animation.Mode.Loop;
  loop = true;
  direction = Animation.Play.Forward;
  time = 0;
  reverse = false;
  force = 1;

  get sprite(): Sprite { return this as Sprite; }

  private interval = 100;
  private _speed = 1.0;
  get speed() { return this._speed; }
  set speed(value: number) {
    this._speed = value;
    let i = 1000 / this.fps;
    this.interval = i + (i - i * this._speed);
  }

  private _cycle = 0;
  get cycle(): number { return this._cycle; }

  get length(): number { return this.strips[this.strip]; }
  get apex(): boolean { return (this.direction == Animation.Play.Backward) ? this.frame == 0 : this.frame == this.length - 1; }

  private _moveX = 0;
  private _moveY = 0;
  get moveX(): number { return this._moveX; }
  get moveY(): number { return this._moveY; }
  move(x = 0, y = 0) {
    this.x += this._moveX + x;
    this.y += this._moveY + y;
  }

  play(strip: number, mode = this.mode, speed = this.speed, direction = this.direction): void {
    this.mode = mode;
    this.strip = strip;
    this.time = 0;
    this.direction = direction;
    this.loop = (Animation.Mode.Loop & mode as number) != 0;
    this.flipH = (Animation.Mode.FlipH & mode as number) != 0;
    this.flipV = (Animation.Mode.FlipV & mode as number) != 0;
    this.reverse = (Animation.Mode.Reverse & mode as number) != 0;
    this.visible = true;
    this._cycle = 0;
    this.speed = speed;
  }

  private next(): void {
    this.index = this.strip * this.cols + this.frame;
    this.time = Stage.now;
    if (this.velocity) {
      let t = this.velocity[this.strip][this.frame];
      this._moveX = this.direction * t[0] * this.speed * this.force * this.scale;
      this._moveY = this.direction * t[1] * this.speed * this.force * this.scale;
      if (this.reverse) {
        this._moveX = -this._moveX;
        this._moveY = -this._moveY;
      }
    }
  }

  private step(display: Display) {
    let begin = 0, end = this.length - 1, inc = 1;
    if (this.direction == Animation.Play.Backward) {
      begin = this.length - 1;
      end = 0;
      inc = -1;
    }

    if (!this.time) {
      this.frame = begin;
      this.next();
    }
    else {
      let span = Stage.now - this.time;
      if (span > this.interval) {
        if (this.frame == end)
          return false;

        this.frame += inc;
        this.next();
      }
    }

    return true;
  }

  override draw(display: Display): void {
    //if (this.direction && !this.step(display)) {
    //  if (this.loop) {
    //    this.time = 0;
    //    this._cycle++;
    //  }
    //  else this.direction = Animation.Play.Stop;
    //}
    super.draw(display);
  }

  constructor(public override readonly name: string, public override folder: string[], public override readonly frameWidth: number, public override readonly frameHeight: number,
    public readonly strips: number[],
    public readonly velocity: [number, number][][],
    x = 0, y = 0, public readonly fps = 10, visible = true) {
    super(name, folder, frameWidth, frameHeight, x, y);
    this.speed = 1.0;
    this.visible = visible;
  }
}

export namespace Animation {
  export enum Mode {
    Once = 0,
    Loop = 1,
    Reverse = 2,
    FlipH = 4,
    FlipV = 8
  }
  export enum Play {
    Stop = 0,
    Forward = 1,
    Backward = -1
  }
}
