import { Scene } from '../../services/scene.service';
import { Task } from '../../services/task.service';
import { Sprite } from '../../graphics/sprite';
import { Background } from '../../graphics/background';
import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Keyboard } from '../../services/keyboard.service';
import { Pointer } from '../../services/pointer.service';
import { XboxController, Controller } from '../../services/controller.service';
import { Road } from '../scene/road';

export class RacerScene extends Scene {
  hillsY = -30-270;
  skyY = -140-270;
  treesY = -15 - 270;
  background = new Background.Source("background", ["images", "racer"]);
  sprites = new Sprite.Source("sprites", ["images", "racer"]);
  hills = Background.create(this.background, 0, 0, 480, 180, 0, this.hillsY);
  sky = Background.create(this.background, 0, 180, 480, 180, 0, this.skyY);
  trees = Background.create(this.background, 0, 362, 480, 178, 0, this.treesY);
  display = Display.get("racer", 3);
  backgroundRender!: Render;
  render!: Render;
  foregroundRender!: Render;
  pointer = new Pointer(this.display);
  gamepad = new XboxController();

  carY = 120;

  private readonly carMap: [number, number][] = [[1085, 480], [995, 480], [995, 531], [1295, 1018], [1383, 961], [1385, 1018]];
  car: Sprite = Sprite.create(this.sprites, 0, 0, 80, 45, 40, this.carY, RacerScene.Car.STRAIGHT, this.carMap);
  
  road = new Road();

  getPad() :boolean{
    let haskey = false;
    if (this.gamepad.Up) haskey = this.road.keyFaster = true;
    if (this.gamepad.Down) haskey = this.road.keySlower = true;
    if (this.gamepad.Left) haskey = this.road.keyLeft = true;
    if (this.gamepad.Right) haskey = this.road.keyRight = true;
    return haskey;
  }

  getPointer() {
    let x = this.pointer.x;
    let y = this.pointer.y

    if (this.pointer.up) {
      this.road.speed = 0;
      this.road.keySlower = true;
      return;
    }

    if (x > 80 || x < -80 || y < 50 || y > 130 ) {
      return;
    }

    if (y < 100)
      this.road.keyFaster = true;
    else
      this.road.keySlower = true;
    if(x<-30)
      this.road.keyLeft = true;
    else if (x > 30)
      this.road.keyRight = true;
  }

  getInput(): void {
    this.road.keyLeft = false;
    this.road.keyRight = false;
    this.road.keyFaster = false;
    this.road.keySlower = false;

    let haskey = false;
    if (Keyboard.down) {
      if (Keyboard.char('A')) haskey =this.road.keyLeft = true;
      if (Keyboard.char('D')) haskey =this.road.keyRight = true;
      if (Keyboard.char('W')) haskey =this.road.keyFaster = true;
      if (Keyboard.char('S')) haskey =this.road.keySlower = true;
    }
    if (!haskey)
      if (!this.getPad())
        this.getPointer();
  }

  drawBackground(display: Display) {
    this.sky.y = this.skyY + this.road.skyOffsetV;
    this.hills.y = this.hillsY + this.road.hillOffsetV;
    this.trees.y = this.treesY + this.road.treeOffsetV;
    this.sky.x = this.sky.tileWidth * this.road.skyOffset;
    this.hills.x = this.hills.tileWidth * this.road.skyOffset;
    this.trees.x = this.sky.tileWidth * this.road.skyOffset;

    this.sky.render(display);
    this.hills.render(display);
    this.trees.render(display);
  }

  draw(display: Display) {
    this.road.render(display.context);
  }

  drawForeground(display: Display) {
    this.car.scale = 2;
    this.car.render(display);
  }

  bumpycount = 1;

  steer() {
    let index = (this.road.playerUpdown > 0) ? RacerScene.Car.UPHILL_STRAIGHT : RacerScene.Car.STRAIGHT;
    if (this.road.keyLeft) index = (this.road.playerUpdown > 0) ? RacerScene.Car.UPHILL_LEFT : RacerScene.Car.LEFT; else
    if (this.road.keyRight) index = (this.road.playerUpdown > 0) ? RacerScene.Car.UPHILL_RIGHT : RacerScene.Car.RIGHT;
    this.car.index = index;
    if (this.road.playerUpdown > 0 && !(this.bumpycount++%8))
      this.car.y = this.carY + this.road.playerBounce;
  }

  *run(): IterableIterator<number> {
    console.log("racer run");

    while (true) {
      this.getInput();
      this.road.update();
      this.steer();
      yield 0;
    }
  }

  *enter(): IterableIterator<number> {
    while (!this.background.imageResource.ready || !this.sprites.imageResource.ready)
      yield 0;

    this.backgroundRender = new Render(r => this.drawBackground(r), this.display);
    this.render = new Render(r => this.draw(r), this.display, undefined, false);
    this.foregroundRender = new Render(r => this.drawForeground(r), this.display);
    this.road.reset(this.sprites.imageResource.image);
    console.log("racer enter");
  }

  destroy(): void {
    if (this.backgroundRender) this.backgroundRender.remove();
    if (this.render) this.render.remove();
    if (this.foregroundRender) this.foregroundRender.remove();
    console.log("racer exit");
  }

  *exit(): IterableIterator<number> {
    this.destroy();
  }

  constructor(args: string[] = []) {
    super("racer", "level", args);
    this.initializeTasks(this.run(), this.enter(), this.exit());
  }
}

export namespace RacerScene {
  export enum Car {
    STRAIGHT = 0,
    LEFT = 1,
    RIGHT = 2,
    UPHILL_STRAIGHT = 3,
    UPHILL_LEFT = 4,
    UPHILL_RIGHT = 5
  }
}
