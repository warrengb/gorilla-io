import { Task } from '../../services/task.service';
import { Animation } from '../../graphics/animation';
import { Background } from '../../graphics/background';
import { Display } from '../../vision/display';
import { Keyboard } from '../../services/keyboard.service';
import { XboxController, Controller } from '../../services/controller.service';
//import * as firebase from 'firebase';

export class ScenePlayer {

  private readonly strips = [10, 8, 10, 10, 10, 8, 10, 10];
  private readonly velocity: [number, number][][] = [
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    [[.6, -.3], [.6, -.8], [.6, -1], [1, -1], [1, -1], [1, 1], [1, 1], [.6, 1], [.6, .8], [.6, .3]],
    [[.6, 0], [.6, 0], [.8, 0], [.6, 0], [.6, 0], [.8, 0], [.6, 0], [.6, 0]],
    [[.10, 0], [.9, 0], [.8, 0], [.7, 0], [.6, 0], [.5, 0], [.4, 0], [.3, 0], [.2, 0], [.1, 0]],
    [[.2, 0], [.2, -.05], [.5, -.05], [.2, .05], [.2, .05], [.3, 0], [.6, 0], [.3, 0], [.2, -.05], [.2, .05]]
  ];

  animation: Animation;
  task = Task.run(this.main());
  backHit: Background.Hit = new Background.Hit();
  hitFrom = ScenePlayer.Hit.None;
  //writeInput: firebase.database.Reference;
  //: firebase.database.Reference;
  gamepad: XboxController;
  data = new ScenePlayer.Data();
  remote = false;

  STOP_TOP = 20;
  STOP_BOTTOM = 100;
  STOP_SEA = 70;

  private _selected = false;
  get selected() { return this._selected; }
  set selected(value: boolean) { this._selected = value; }

  dropped = false;
 
  get x() { return this.animation.x; }
  set x(value: number) { this.animation.x = value; }
  get y() { return this.animation.y; }
  set y(value: number) { this.animation.y = value; }
  get visible() { return this.animation.visible; }
  set visible(value: boolean) { this.animation.visible = value; }

  hit(x: number, y: number): boolean { return this.animation.hit(x, y); }

  moveX = 0;

  _multiplayer = ScenePlayer.Multiplayer.None;
  get multiplayer() { return this._multiplayer; }
  set multiplayer(value: ScenePlayer.Multiplayer) { this._multiplayer = value; }

  draw(display: Display) {
    this.animation.move(this.moveX);
    this.moveX = 0;

    if (this.animation.strip != ScenePlayer.Animation.Jump)
      this.animation.scale = 1.0 + (this.animation.y - 80) * .005;

    if (this.animation.y < this.STOP_TOP)
      this.animation.y = this.STOP_TOP;
    if (this.animation.y > this.STOP_SEA)
      this.animation.clip.bottom = 0;
    if (this.animation.y > this.STOP_BOTTOM)
      this.animation.y = this.STOP_BOTTOM;

    if (this.animation.strip != ScenePlayer.Animation.Jump){
      if (this.map && this.map.hit(this.x, this.y, this.backHit)) {
        switch (this.backHit.tile.zone.type) {
          case 1:
            if (this.backHit.south > 30)
              this.animation.clip.bottom = Math.max(0, this.backHit.south - 30);
            break;
        }
      }
      else this.animation.clip.bottom = 0;
    }

    //if (this.writeData) {
    //  this.writeData.set(this.data.set(this.data.x, this.data.y));
    //} 

    this.animation.render(display);
  }

  move = ScenePlayer.Move.None;
  lastmove = ScenePlayer.Move.None;

  getK0Move(): ScenePlayer.Move {
    let move = ScenePlayer.Move.None;
    if (Keyboard.down) {     
      if (Keyboard.char('Q')) move = ScenePlayer.Move.Stop; else
      if (Keyboard.char('E')) move = ScenePlayer.Move.Jump; else
      if (Keyboard.char('A')) move = ScenePlayer.Move.West; else
      if (Keyboard.char('D')) move = ScenePlayer.Move.East; else
      if (Keyboard.char('W')) move = ScenePlayer.Move.North; else
      if (Keyboard.char('S')) move = ScenePlayer.Move.South;
    }
    return move;
  }

  getK1Move(): ScenePlayer.Move {
  let move = ScenePlayer.Move.None;
    if (Keyboard.down) {
    //if (Keyboard.char('1')) this.hitFrom = ScenePlayer.Hit.Left; else
    if (Keyboard.char('U')) move = ScenePlayer.Move.Stop; else
    if (Keyboard.char('O')) move = ScenePlayer.Move.Jump; else
    if (Keyboard.char('J')) move = ScenePlayer.Move.West; else
    if (Keyboard.char('L')) move = ScenePlayer.Move.East; else
    if (Keyboard.char('I')) move = ScenePlayer.Move.North; else
    if (Keyboard.char('K')) move = ScenePlayer.Move.South;
  }
  return move;
  }

  getPad(): ScenePlayer.Move{
    let move = ScenePlayer.Move.None;
    if (this.gamepad.Up) move = ScenePlayer.Move.North; else
    if (this.gamepad.Down) move = ScenePlayer.Move.South; else
    if (this.gamepad.Left) move = ScenePlayer.Move.West; else
    if (this.gamepad.Right) move = ScenePlayer.Move.East; else
    if (this.gamepad.LeftBumper || this.gamepad.RightBumper) move = ScenePlayer.Move.Stop;
    if (this.gamepad.LeftTrigger || this.gamepad.LeftTrigger) move = ScenePlayer.Move.Jump;
    return move;
  }

  getKMove(): ScenePlayer.Move {
    if (this.multiplayer) {
      let move = this.getK0Move();
      if (move == ScenePlayer.Move.None)
        return this.getK1Move();
      return move;
    }
    return !this.index ? this.getK0Move() : this.getK1Move();
  }

  getMove() {
    if (this.disabled)
      return this.move = ScenePlayer.Move.None;

    //if (this.remote)
    //  return this.move;

    let move = this.getK0Move();
    //if (move == ScenePlayer.Move.None) {
    //  move = this.getPad();
    //}

    if (move != ScenePlayer.Move.None)
      this.move = move;

    //if (this.writeInput)
    //  this.writeInput.set(this.move);

    return this.move;
  }

  get disabled() { return this.multiplayer == ScenePlayer.Multiplayer.Disabled; }

  goNorth() { if (this.disabled) return; console.log("north"); this.move = ScenePlayer.Move.North; }
  goEast() { if (this.disabled) return; console.log("east"); this.move = ScenePlayer.Move.East; }
  goSouth() { if (this.disabled) return; console.log("south"); this.move = ScenePlayer.Move.South; }
  goWest() { if (this.disabled) return; console.log("west"); this.move = ScenePlayer.Move.West; }
  goJump() { if (this.disabled) return; console.log("jump"); this.move = ScenePlayer.Move.Jump; }
  goStop() { if (this.disabled) return; console.log("stop"); this.move = ScenePlayer.Move.Stop; }

  action(y: number): boolean {
      if (y > this.y)
        this.goStop();
      else
        this.goJump();
      return true;
  }

  navigate(x: number, y: number) {
    let xx = x - this.x;
    let yy = y - this.y;
    let ylarger = Math.abs(xx) < Math.abs(yy);
    if (x > this.x && y > this.y) {
      if (ylarger)
        this.goSouth();
      else
        this.goEast();
    }//NE
    else
      if (x > this.x && y < this.y) {
        if (ylarger)
          this.goNorth();
        else
          this.goEast();
      }//SE
    else
      if (x < this.x && y > this.y) {
        if (ylarger)
          this.goSouth();
        else
          this.goWest();
      }//NW
    else {
      if (ylarger)
        this.goNorth();
      else
        this.goWest();
    }//SW
  }

  accelerate(max: number = 1.25): boolean {
    if (this.animation.speed == max)
      return false;
    this.animation.speed += .005;
    if (this.animation.speed > max)
      this.animation.speed = max;
    return true;
  }

  decelerate(min:number=.75): boolean {
    if (this.animation.speed == min)
      return false;
    this.animation.speed -= .005;
    if (this.animation.speed < min)
      this.animation.speed = min;
    return true;
  }

  *jump(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Jump) return;
      if (this.hasHit()) return;
      if (this.animation.apex) {
        this.animation.play(ScenePlayer.Animation.Idle);
        return false;
      }
      yield 0;
    }
  }

  *slide(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Slide) return;
      if (this.hasHit()) return;
      this.decelerate();
      if (this.animation.apex) {
        this.animation.play(ScenePlayer.Animation.Idle);
        this.move = ScenePlayer.Move.None;
        return false;
      }
      yield 0;
    }
  }

  *hurt(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Hurt) return;
      this.decelerate();
      this.animation.x += this.hitFrom;
      if (this.animation.apex) {
        this.animation.play(ScenePlayer.Animation.Idle);
        this.move = ScenePlayer.Move.None;
        this.hitFrom = ScenePlayer.Hit.None;
        return false;
      }
      yield 0;
    }
  }

  running(direction: Animation.Play = this.animation.direction): boolean {
    if (this.animation.direction != direction) {
      this.animation.play(ScenePlayer.Animation.Slide);
      return false;
    }
    else {
      this.accelerate();
    }
    return true;
  }

  *run(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Run) return;
      if (this.hasHit()) return;
      switch (this.getMove()) {
        case ScenePlayer.Move.Stop: this.move = ScenePlayer.Move.None; this.animation.play(ScenePlayer.Animation.Idle); return;
        case ScenePlayer.Move.North: this.animation.y -= .15; if (!this.running()) return; break;
        case ScenePlayer.Move.South: this.animation.y+=.15; if (!this.running()) return; break;
        case ScenePlayer.Move.East: if (!this.running(Animation.Play.Forward)) return; break;
        case ScenePlayer.Move.West: if (!this.running(Animation.Play.Backward)) return; break;
        case ScenePlayer.Move.None:
          if (!this.decelerate() && this.animation.apex) {
            this.animation.play(ScenePlayer.Animation.Walk);
            return;
          }
          break;
        case ScenePlayer.Move.Jump:
          this.animation.force = 2 * this.animation.scale;
          this.animation.play(ScenePlayer.Animation.Jump);
          yield* this.jump();
          this.move = ScenePlayer.Move.None;
          this.animation.force = 1;
          this.animation.play(ScenePlayer.Animation.Run);
          break;
      }
      yield 0;
    }
  }

  get forward() { return this.animation.direction == Animation.Play.Forward; }

  walking(direction: Animation.Play = this.animation.direction): boolean {
    if (this.animation.direction == direction) {
      this.animation.reverse = false;
      if (!this.accelerate(1.5) && this.animation.apex) {
        this.animation.play(ScenePlayer.Animation.Run, this.animation.mode, .75);
        return false;
      }
    }
    else {
      this.animation.reverse = true;
      if (!this.decelerate() && this.animation.apex) {
        this.animation.play(ScenePlayer.Animation.Idle, this.animation.mode, 1.25);
        return false;
      }
    }
    return true;
  }

  *walk(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Walk) return;
      if (this.hasHit()) return 0;
      switch (this.getMove()) {
        case ScenePlayer.Move.Stop: this.move = ScenePlayer.Move.None; this.animation.play(ScenePlayer.Animation.Idle); return;
        case ScenePlayer.Move.North: this.animation.y-=.08; if (!this.walking()) return; break;
        case ScenePlayer.Move.South: this.animation.y+=.08; if (!this.walking()) return; break;
        case ScenePlayer.Move.East: if (!this.walking(Animation.Play.Forward)) return; break;
        case ScenePlayer.Move.West: if (!this.walking(Animation.Play.Backward)) return; break;
        case ScenePlayer.Move.None:
          if (!this.decelerate() && this.animation.apex) {
            this.animation.play(ScenePlayer.Animation.Idle);
            yield 0; 
          }
          break;
        case ScenePlayer.Move.Jump:
          this.animation.play(ScenePlayer.Animation.Jump);
          this.animation.force = 1 * this.animation.scale;
          yield* this.jump();
          this.move = ScenePlayer.Move.None;
          this.animation.force = 1;
          this.animation.play(ScenePlayer.Animation.Walk);
          break;
      }
      yield 0;
    }
  }

  hasHit(): boolean {
    if (this.hitFrom != ScenePlayer.Hit.None) {
      this.animation.play(ScenePlayer.Animation.Hurt);
      return true;
    }
    return false;
  }

  *idle(): IterableIterator<number> {
    while (true) {
      if (this.animation.strip != ScenePlayer.Animation.Idle) return;
      if (this.hasHit())
        yield 0;     
      let move = this.getMove();
      if (move == ScenePlayer.Move.Stop)
        move = ScenePlayer.Move.None;
        if (move != ScenePlayer.Move.None) {
        let direction = Animation.Play.Forward;
        let mode = Animation.Mode.Loop;
        switch (move) {
          case ScenePlayer.Move.North: this.animation.y -=-1; break;
          case ScenePlayer.Move.South: this.animation.y +=1; break;
          case ScenePlayer.Move.East: break;
          case ScenePlayer.Move.West:
            mode |= Animation.Mode.FlipH;
            direction = Animation.Play.Backward;
            break;
          case ScenePlayer.Move.Jump:
            this.animation.play(ScenePlayer.Animation.Jump);
            this.animation.force = .5 * this.animation.scale;
            yield* this.jump();
            this.move = ScenePlayer.Move.None;
            this.animation.force = 1;
            this.animation.play(ScenePlayer.Animation.Idle);
            break;
        }
        this.animation.play(ScenePlayer.Animation.Walk, mode, .75, direction);
          yield 0;
      }
      else {
        if (this.animation.speed > 1.0) this.decelerate(); else
          if (this.animation.speed < 1.0) this.accelerate();
      }
      yield 0;
    }
  }

  reset() {
    if (this.index == 0) {
      this.animation.play(ScenePlayer.Animation.Idle);
    }
    else {
      this.animation.play(ScenePlayer.Animation.Idle, this.animation.mode | Animation.Mode.FlipH);
    }

    this.selected = true;
    this.visible = true;
    this.y = 80;
    this.y = 80;
    this.x = this.index==0?-30:30;
    this.remote = false;
    //this.writeInput = null;
    //this.writeData = null;
    this.multiplayer = ScenePlayer.Multiplayer.Disabled;
  }

  *main(): IterableIterator<number> {
    while (!this.ready) {
      yield 0;
    }

    if (this.index == 0)
      this.animation.play(ScenePlayer.Animation.Idle);
    else
      this.animation.play(ScenePlayer.Animation.Idle, this.animation.mode | Animation.Mode.FlipH);

    while (true) {
      switch (this.animation.strip) {
        case ScenePlayer.Animation.Idle:
          yield* this.idle();
          break;
        case ScenePlayer.Animation.Walk:
          yield* this.walk();
          break;
        case ScenePlayer.Animation.Run:
          yield* this.run();
          break;
        case ScenePlayer.Animation.Slide:
          yield* this.slide();
          break;
        case ScenePlayer.Animation.Jump:
          yield* this.jump();
          break;
        case ScenePlayer.Animation.Hurt:
          yield* this.hurt();
          break;
      }
      yield 0;
    }
  }

  get ready() { return this.animation.ready; }

  destroy() {
    if(this.task)
      this.task.cancel();
  }

  constructor(character: string, private readonly map: Background.Map, readonly index = 0) {
    this.gamepad = new XboxController(character == "cat" ? Controller.Index.One : Controller.Index.Two);
    this.animation = new Animation(character, ["images", "sprites"], 80, 70, this.strips, this.velocity, 0, 80);
  }
}

export namespace ScenePlayer {
  export enum Animation {
    Dead=0,
    Fall=1,
    Hurt=2,
    Idle=3,
    Jump=4,
    Run=5,
    Slide=6,
    Walk=7
  }

  export enum Move {
    None,
    North,
    East,
    South,
    West,
    Jump,
    Stop
  }

  export enum Hit {
    None,
    Left=-.3,
    Right=.3
  }

  export enum Multiplayer {
    None,
    Host,
    Disabled,
    Play,
    Fan
  }

  export class Data {
    set(x: number, y: number): Data { return this; }
    constructor(public x: number=0, public y: number=0) { }
  }
}
