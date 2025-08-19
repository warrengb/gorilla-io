
import { Scene } from '../../services/scene.service';
import { Background } from '../../graphics/background';
import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { ScenePlayer } from '../scene/scene.player';
import { Pointer } from '../../services/pointer.service'
import { SceneBackground } from '../scene/scene.background';
import { Keyboard } from '../../services/keyboard.service';
//import * as firebase from 'firebase';

export class DeviceScene extends Scene {
  background = new SceneBackground();
  display: Display;
  render!: Render;
  pointer: Pointer;
  cat = new ScenePlayer("cat", this.background.map, 0);
  dog = new ScenePlayer("dog", this.background.map, 1);

  mode = ScenePlayer.Multiplayer.None;
 
  draw(display: Display) {
    this.background.map.draw(display);
    if (this.dog.y > this.cat.y) {
      this.cat.draw(display);
      this.dog.draw(display);
    } else {
      this.dog.draw(display);
      this.cat.draw(display);
    }
  }

  get pet() { return this.cat.selected ? this.cat : this.dog.selected ? this.dog : null; }

  get multiplayer() { return this.cat.multiplayer != ScenePlayer.Multiplayer.None; }

  selectPet(index: number) {
    if (this.dog.selected && this.cat.selected)
      return;
    this.dog.selected = index ? true : false;
    this.cat.selected = index ? false : true;
    this.pet?.goStop();
    console.log(`select ${index?"dog":"cat"}`);
  }

  petPoint() {
    if (this.pointer.up) {
      if (!this.cat.remote && this.cat.hit(this.pointer.x, this.pointer.y)) {
        if (!this.cat.selected)
          this.selectPet(0);
        else
          this.cat.action(this.pointer.y);
      }
      else if (!this.dog.remote && this.dog.hit(this.pointer.x, this.pointer.y)) {
        if (!this.dog.selected)
          this.selectPet(1);
        else
          this.dog.action(this.pointer.y);
      }
      else {
        if (this.pet?.multiplayer == ScenePlayer.Multiplayer.None) {
          this.pet.navigate(this.pointer.x, this.pointer.y);
        }
        else {
          if (!this.cat.remote)
            this.cat.navigate(this.pointer.x, this.pointer.y);
          if (!this.dog.remote)
            this.dog.navigate(this.pointer.x, this.pointer.y);
        }
      } 
    }
  }

  keepInBounds(pet: ScenePlayer) {
    if (pet.x > 240) {
      pet.x = -240;
      pet.move = ScenePlayer.Move.None;
    } else
    if (pet.x < -240) {
      pet.x = 240;
      pet.move = ScenePlayer.Move.None;
    }
  }

  collision(): boolean {
    let y = Math.abs(this.cat.y - this.dog.y);
    if (y > 7)
      return false;
    let x = Math.abs(this.cat.x - this.dog.x);
    let w = this.cat.animation.width / 4 + this.dog.animation.width / 4;
    if (x < w)     
      return true;
    return false;
  }

  sliding(pet: ScenePlayer): boolean {
    return pet.animation.strip == ScenePlayer.Animation.Slide;
  }

  scroll(direction: number) {
    this.background.direction = direction;
    this.cat.moveX = direction;
    this.dog.moveX = direction;
  }

  *run(): IterableIterator<number> {
    console.log(this.name + " run");
    while (!this.cat.ready && !this.dog.ready)
      yield 50;

    while (true) {
      this.background.direction = 0;
      if (Keyboard.down) {
        if (Keyboard.key('Z'.charCodeAt(0))) {
          this.scroll(-1);
        }
        else
          if (Keyboard.key('X'.charCodeAt(0))) {
            this.scroll(1);
          }
      }

      this.petPoint();
      //this.keepInBounds(this.cat);
      if (this.cat.x > this.background.BOUNDS) this.scroll(-1); else
        if (this.cat.x < -this.background.BOUNDS) this.scroll(1);
      this.keepInBounds(this.dog);
      if (this.collision()) {
        console.log("collision");
        if (this.cat.x > this.dog.x) {
          if (!this.sliding(this.cat))
            this.cat.hitFrom = ScenePlayer.Hit.Right;
          if (!this.sliding(this.dog))
            this.dog.hitFrom = ScenePlayer.Hit.Left;
        } else {
          if (!this.sliding(this.cat))
            this.cat.hitFrom = ScenePlayer.Hit.Left;
          if (!this.sliding(this.dog))
            this.dog.hitFrom = ScenePlayer.Hit.Right;        
        }
        yield 100;
        while (this.collision()) {
          if (this.cat.x > this.dog.x) {
            this.cat.x++;
            this.dog.x--;
          } else {
            this.cat.x--;
            this.dog.x++;
          }
          yield 100;
        }
      }
      this.background.move();
      yield 50;
    }
  }

  *enter(): IterableIterator<number> {
    while (!this.cat.ready || !this.background.ready)
      yield 50;
    this.render = new Render(r => this.draw(r), this.display);
    console.log(this.name + " enter");
  }

  *exit(): IterableIterator<number> {
    this.destroy();
    console.log(this.name + " exit");
  }

  destroy() {
    Display.destroy(this.name);
    if (this.render)
      this.render.remove();
    Scene.destroy();
  }

  reset() {
    this.cat.reset();
    this.dog.reset();
  }

  constructor(args: string[]) {
    super(!args ? "device" : args[0]);
    this.display = Display.get(this.name);
    this.pointer = new Pointer(this.display);
    this.cat.selected = true;
    this.cat.x = -30;
    this.dog.x = 30;
    if (this.name == "message") {
      this.reset();
    }

    this.initializeTasks(this.run(), this.enter(), this.exit());
  }
}
