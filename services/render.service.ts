import { Service } from '../vision/stage';
import { Display } from '../vision/display';

let renderrers: Render[] = [];

let displayFullscreenID = 0;

export interface Draw {
  (display: Display): void;
}

export interface Resize {
  (display: Display): void;
}

export class Render {
  private _display: Display;
  private static id = 1;
  private id = 0;
  get display(): Display { return this._display; }

  visible = true;

  private _z: number = 0;
  get z(): number { return this._z; }

  private insert(z: number): void {
    for (let i = 0; i < renderrers.length; i++) {
      if (z < renderrers[i].z) {
        renderrers.splice(i, 0, this);
        return;
      }
    }
    renderrers.push(this);
  }

  apply(display: Display, z: number = 0): void {
    this.remove();
    this.insert(z);
    this._display = display;
  }

  remove(): void {
    if (this.display == null)
      return;
    let index = renderrers.findIndex(d => d.id == this.id);
    if (-1 == index)
      return;
    renderrers.splice(index, 1);
    this._display == null;
  }

  constructor(public draw: Draw, display: Display, public resize: Resize | undefined = undefined, public readonly cartesian = true, z: number = 0) {
    this.id = Render.id++;
    this._z = z;
    this._display = display;
    if (display == null)
      return;
    this.insert(z);
  }
}

export class RenderService implements Service {
  get name() { return "Render"; }

  resize(display: Display): void {
    display.resize();
    for (let render of renderrers) {
      if (render.display.id == display.id)
        if (render.resize)
          render.resize(render.display);
    }
  }

  prepare(): void {
    for (let d of Display.displays) {
      d.swap();

      if (!displayFullscreenID) {
        if (d.fullscreen) {
          displayFullscreenID = d.id;
          this.resize(d);
        }
      }
      else if (displayFullscreenID == d.id && !d.fullscreen) {
        displayFullscreenID = 0;
        this.resize(d);
      }
    }
  }

  initiate(): void {
  }

  process(): void {
    for (let d of Display.displays) {
      d.update();
    }

    for (let render of renderrers) {
      if (render.visible) {
        if (render.cartesian) {
          render.display.context.translate(render.display.canvasHalfWidth, render.display.canvasHalfHeight);
          render.draw(render.display);
          render.display.context.translate(-render.display.canvasHalfWidth, -render.display.canvasHalfHeight);
        }
        else
          render.draw(render.display);
      }
    }
  }
}
