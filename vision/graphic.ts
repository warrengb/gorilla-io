import { Display } from '../vision/display';

export abstract class Graphic {
  children: Graphic[] = [];

  abstract draw(display: Display): void;

  get ready(): boolean { return true; }

  public render(display: Display): void {
    if (!this.ready || !this.visible)
      return;

    if (display.context)
      display.context.globalAlpha = this.alpha;

    if (this.rotate) {
      display?.context?.save();
      display?.context?.translate(this.x, this.y);
      display?.context?.rotate(this.rotate);
      display?.context?.translate(-this.x, -this.y);
    }

    this.draw(display);
    if (this.children)
      for (let g of this.children)
        g.render(display);

    if (this.rotate)
      display?.context?.restore();
  }

  constructor(public x = 0, public y = 0, public visible = true, public alpha = 1.0, public rotate = 0.0) { }
}
