import { Scene } from '../../services/scene.service';
import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Keyboard } from '../../services/keyboard.service';
import { Pointer } from '../../services/pointer.service';
import { ScenePlayer } from './scene.player';
import { WoodsScene } from './woods.scene';
import { SceneBackground } from './scene.background';

export class BeachScene extends Scene {
  background = new SceneBackground();
  player = new ScenePlayer("cat", this.background.map);
  display = Display.get("scene", 1);
  render!: Render;
  pointer = new Pointer(this.display);

  draw(display: Display) {
    this.background.map.draw(display);
    this.player.draw(display);
  }

  scroll(direction: number) {
    this.background.direction = direction;
    this.player.moveX = direction;
  }

  *run(): IterableIterator<number> {
    console.log("Beach run...");

    while (true) {
      this.background.direction = 0;

      if (this.player.x > this.background.BOUNDS) this.scroll(-1);else
        if (this.player.x < -this.background.BOUNDS) this.scroll(1);
          
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
        if (this.background.map.hit(this.pointer.x, this.pointer.y))
          console.debug(`pressed ${Math.floor(this.pointer.x)}:${Math.floor(this.pointer.y)}`);
      }

      if (this.player.x > 240 || this.player.x < -240) {
        console.log("portal to woods scene.");
        Scene.activate(WoodsScene);
      }

      this.background.move();
      yield 0;
    }
  }

  *enter(): IterableIterator<number> {
    console.log("Beach enter...");
    while (!this.background.ready || !this.player.ready)
      yield 0;
    this.render = new Render(r => this.draw(r), this.display);
  }

  destroy() :void {
    this.render.remove();
    this.player.destroy();
  }

  *exit(): IterableIterator<number> {
    this.destroy();
    console.log("beach exit");
  }

  constructor(args: string[]) {
    super("beach", "level", args);
    this.initializeTasks(this.run(), this.enter(), this.exit());
  }
}



