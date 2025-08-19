import { Scene } from '../../services/scene.service';
import { Background } from '../../graphics/background';
import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Keyboard } from '../../services/keyboard.service';
import { Pointer } from '../../services/pointer.service';
import { ScenePlayer } from './scene.player';
import { BeachScene } from './beach.scene';

export class WoodsScene extends Scene {

  sky = new Background("backdrop", ["images", "woods"], 480, 270, []);
  cloud = new Background("clouds", ["images", "woods"], 480, 270, []);
  falls = new Background("falls", ["images", "woods"], 480, 270, []);
  trees = new Background("trees", ["images", "woods"], 480, 270, []);
  grass = new Background("grass", ["images", "woods"], 480, 270, []);
  mountains = new Background("mountains", ["images", "woods"], 480, 270, []);//, this.seaMap);
  rim = new Background("rim", ["images", "woods"], 480, 270, []);

  map: Background.Map = new Background.Map([this.sky, this.cloud, this.mountains, this.falls, this.trees, this.grass]);

  player = new ScenePlayer("cat", this.map);
  display = Display.get("scene", 1);
  render!: Render;
  pointer = new Pointer(this.display);

  readonly BOUNDS = 120;

  direction = 0;
  scrolling = 0;

  draw(display: Display) {
    this.map.draw(display);
    this.player.draw(display);
  }

  scroll(direction: number) {
    this.direction = direction;
    this.player.moveX = direction;
  }

  *run(): IterableIterator<number> {
    console.log("Woods run...");

    while (true) {
      this.direction = 0;

      if (this.player.x > this.BOUNDS) this.scroll(-1); else
        if (this.player.x < -this.BOUNDS) this.scroll(1);

      if (this.pointer.up) {
        if (this.player.hit(this.pointer.x, this.pointer.y))
          this.player.action(this.pointer.y);
        else
          this.player.navigate(this.pointer.x, this.pointer.y);
      }

      if (Keyboard.down) {
        if (Keyboard.key('Z'.charCodeAt(0))) {
          this.scroll(-1);
        }
        else
          if (Keyboard.key('X'.charCodeAt(0))) {
            this.scroll(1);
          }
      }

      if (this.pointer.pressed) {
        if (this.map.hit(this.pointer.x, this.pointer.y))
          console.debug(`pressed ${Math.floor(this.pointer.x)}:${Math.floor(this.pointer.y)}`);
      }

      if (this.player.x > 240 || this.player.x < -240) {
        console.log("portal to beach scene.");
        Scene.activate(BeachScene);
      }

      switch (this.direction) {
        case 0:
          this.mountains.scrollX = 0;
          this.falls.scrollX = 0;
          this.trees.scrollX = 0;
          this.grass.scrollX = 0;
          break;
        case 1:
          this.mountains.scrollX = .2;
          this.falls.scrollX = .4;
          this.trees.scrollX = .6;
          this.grass.scrollX = 1;
          break;
        case -1:
          this.mountains.scrollX = -.2;
          this.falls.scrollX = -.4;
          this.trees.scrollX = -.6;
          this.grass.scrollX = -1;
          break;
      }
      yield 50;
    }
  }

  *enter(): IterableIterator<number> {
    console.log("Woods enter...");
    while (!this.map.ready || !this.player.ready)
      yield 50;

    this.player.STOP_SEA = 0;
    this.player.STOP_TOP = 60;

    this.sky.scrollX = .05;
    this.cloud.scrollX = .08;
    this.render = new Render(r => this.draw(r), this.display);
  }

  destroy(): void {
    this.render.remove();
    this.player.destroy();
  }

  *exit(): IterableIterator<number> {
    this.destroy();
    console.log("beach exit");
  }

  constructor(args: string[] = []) {
    super("woods", "level", args);
    this.initializeTasks(this.run(), this.enter(), this.exit());
  }
}



