import { Audio, Sound, Track } from '../../audio/sound';
import { Sprite } from '../../graphics/sprite';
import { Background } from '../../graphics/background';
import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Task } from '../../services/task.service';
import { Pointer } from '../../services/pointer.service';
import { Scene } from '../../services/scene.service';
import { Math2D } from '../../graphics/math2D';
import { Animation } from '../../graphics/animation';
import { Stage } from '../../vision/stage';

export class HorseScene extends Scene {
  reelX = 0;
  reelY = 55;
  rotate = 0;
  horse = new Background("horse", ["images", "horse"], 150, 100, [], [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]], 0, -80);
  display = Display.get("horse");
  render!: Render;
  tick!: Task;
  stageTick: Stage.Tick = new Stage.Tick(() => this.stage_tick());

  reel = new Sprite("reel", ["images", "horse"], 150, 150, this.reelX, this.reelY);
  pointer = new Pointer(this.display);
  projector = new Sound("projector", ["audio"], true);
  projector25 = new Sound("projector25", ["audio"], true);
  projector50 = new Sound("projector50", ["audio"], true);
  projector75 = new Sound("projector75", ["audio"], true);
  neigh = new Sound("neigh", ["audio"]);
  click = new Sound("click", ["audio"]);
  illusion = new Track("illusion", ["audio"]);
  horseAnim = new Animation("horse", ["images", "horse"], 150, 100, [15], [], 0, -80, 10, false);

  playing = false;

  stage_tick() :void {  
    if (!(Stage.tick % 100))
      console.log(Stage.tick);
  }

  mute(on: boolean) {
    Audio.mute = on;
    this.click.play();
    console.log("mute " + (on ? "on": "off" ));
  }

  projectorRate = 0;
  projectorSpeed = 0;

  reelPlay(speed: number) {
    if (speed == this.projectorSpeed)
      return;

    console.log("reel play at speed " + speed);

    this.reelStop();
    this.projectorSpeed = speed;
    switch (speed) {
      case 0: this.projector25.play(); break;
      case 1: this.projector50.play(); break;
      case 2: this.projector75.play(); break;
      case 3: this.projector.play(); break;
    }   
  }

  reelStop() {
    this.projector25.stop();
    this.projector50.stop();
    this.projector75.stop();
    this.projector.stop();
  }

  draw(display: Display) {
    this.horse.render(display);
    this.horseAnim.render(display);
    this.reel.render(display);
  }

  reelIdle() {
    this.reel.alpha = Math2D.seek(this.reel.alpha, 0.3, 0.03);
    this.reel.scale = Math2D.seek(this.reel.scale, 0.7, 0.03);
    this.rotate = Math2D.seek(this.rotate, 0, 0.03);
  }

  reelActivate() {
    this.reel.alpha = Math2D.seek(this.reel.alpha, 1.0, 0.02);
    this.reel.scale = Math2D.seek(this.reel.scale, 1.0, 0.02);
  }

  reelRotate() {
    if (!this.rotate) {
      if (this.pointer.y < this.reel.y) {
        this.rotate = (this.pointer.x < 0) ? .01 : -.01;
      } else {
        this.rotate = (this.pointer.x > 0) ? .01 : -.01;
      }
    } else {
      this.rotate = Math2D.seek(this.rotate, (this.rotate < 0) ? -.1 : .1, 0.005);
    }
  }

  reelSpin() {
    if (this.pointer.active) {
      if (this.reel.hit(this.pointer.x, this.pointer.y)) {
        this.reelActivate();
        if (this.pointer.move) {
          this.reelRotate();
        }
        else this.rotate = Math2D.seek(this.rotate, 0, 0.03);
        this.reel.rotate += this.rotate;
      }
      else {
        this.reelIdle();
      }
    }
    else {
      this.reelIdle();
    }
  }

  spin(): number {
    let speed = -this.rotate * 1500;
    speed = (speed < -60) ? -150 : (speed > 60) ? 150 : speed;
    this.horse.scrollX = Math2D.seek(this.horse.scrollX, speed, 0.01);
    this.projectorRate = Math2D.seek(this.projectorRate, Math2D.cap(Math.abs(speed * 0.01), 0.3, 1), 0.005);
    let index = this.projectorRate < .25 ? 0 : this.projectorRate < 0.5 ? 1 : this.projectorRate < 0.75 ? 2 : 3;
    this.reelPlay(index);
    return speed;
  }

  *surpise(): IterableIterator<number> {
    this.neigh.play();
    this.horse.alpha = 0.4;
    this.horseAnim.visible = true;
    this.horseAnim.direction = this.rotate > 0 ? Animation.Play.Forward : Animation.Play.Backward;

    yield 500;
    this.illusion.play();
    while (this.illusion.playing) {
      this.reel.rotate += this.rotate;
      yield 0;
    }

    this.neigh.play();

    this.horse.alpha = 1;
    this.horseAnim.visible = false;

    while (Math.abs(this.rotate)>0.005) {
      this.rotate = Math2D.seek(this.rotate, (this.rotate < 0) ? 0.01 : -0.01, 0.005);
      this.spin();
      yield 0;
    }
    yield 0;
  }

  *run(): IterableIterator<number> {
    console.log("horse run");

    while (true) {
      this.reelSpin();
      if (this.rotate) {
        if (!this.playing) {
          console.log("reel starts...");
          this.projector25.play();
          this.projectorRate = 0;
          this.projectorSpeed = 0;
          this.playing = true;
        }

        this.spin();

        if (Math.abs(this.horse.scrollX) > 149) {
          console.log("animation synchronized suprise!");
          yield* this.surpise();
        }
      }
      else {
        this.horse.scrollX = Math2D.seek(this.horse.scrollX, -.05, 0.5);
        if (this.playing && this.horse.scrollX <= -.05) {
          console.log("reel stops");
          this.playing = false;
          this.reelStop();
        }
      }
      yield 0;
    }
  }

  destroy() {
    if (this.render)
      this.render.remove();
    this.reelStop();

    this.stageTick.destroy();
  }

  *enter(): IterableIterator<number> {
    console.log("horse enter");
    while (
      !this.horse.ready ||
      !this.projector.ready ||
      !this.projector25.ready ||
      !this.projector50.ready ||
      !this.projector75.ready ||
      !this.illusion.ready ||
      !this.neigh.ready)
      yield 0;
    console.log("assets loaded and ready - rendering enabled");
    this.render = new Render(r => this.draw(r), this.display);
  }

  *exit(): IterableIterator<number> {
    this.destroy();
    console.log("horse exit");
  }

  constructor(args: string[] = []) {
    super("horse");
    this.initializeTasks(this.run(), this.enter(), this.exit());
  }

}
