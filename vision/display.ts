
export class Display {
  private _name: string;
  private _canvas: HTMLCanvasElement;
  private _buffer: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;
  private _canvas_context: CanvasRenderingContext2D;
  private _rect!: DOMRect;
  private _halfWidth!: number;
  private _halfHeight!: number;
  private _canvasHalfWidth!: number;
  private _canvasHalfHeight!: number;
  private _width!: number;
  private _height!: number;

  private static id_generator = 0;
  private _id = 0;
  get id() { return this._id; }

  get cursor() { return this.canvas.style.cursor; }
  set cursor(name: string) { this.canvas.style.cursor = name; }

  private static _displays: Display[] = [];
  static get displays(): Display[] { return Display._displays; }

  static find(name: string): Display | undefined {
    name = name.toLowerCase();
    if (Display._displays.length)
      for (let display of Display._displays) {
        if (name == display.name)
          return display;
      }
    return undefined;
  }

  static destroy(name: string) {
    let display = Display.find(name);
    if (display)
      display.remove();
  }

  remove(): void {
    for (let i = 0; i < Display._displays.length; i++) {
      if (Display._displays[i].name == this.name) {
        Display._displays.splice(i, 1);
        break;
      }
    }
  }

  static available(name: string) {
    let canvas = <HTMLCanvasElement>document.getElementById(name.toLowerCase());
    return canvas != null;
  }

  static get(name: string, resolution = 0): Display {
    let display = Display.find(name);
    if (!display) {
      return new Display(name, (resolution > 0) ? resolution : 1);
    }
    if (resolution > 0)
      display.resolution = resolution;
    return display;
  }

  get name(): string { return this._name; }
  get canvas(): HTMLCanvasElement { return this._canvas; }
  get buffer(): HTMLCanvasElement { return this._buffer; }
  get context(): CanvasRenderingContext2D { return this._context; }

  _resolution = 1;
  get resolution() { return this._resolution; }
  set resolution(value: number) {
    this._resolution = value;
    this.resize();
  }

  private captureFullscreen(ev:Event): void {
    this._fullscreen = !!document.fullscreenElement;
    if (!this.fullscreen) {
      document.onfullscreenchange = null;
    }
  }

  _fullscreen = false;
  get fullscreen() { return this._fullscreen; }
  set fullscreen(value: boolean) {
    if (value == this._fullscreen)
      return;

    if (value) {
      document.onfullscreenchange = this.captureFullscreen.bind(this); 
      this.canvas.requestFullscreen();
    }
    else {
      document.exitFullscreen();
    }
  }

  get x() { return this._rect.left; }
  get y() { return this._rect.top; }
  get halfWidth() { return this._halfWidth; }
  get halfHeight() { return this._halfHeight; }
  get canvasHalfWidth() { return this._canvasHalfWidth; }
  get canvasHalfHeight() { return this._canvasHalfHeight; }
  get left() { return this._rect.left; }
  get top() { return this._rect.top; }
  get right() { return this._rect.right; }
  get bottom() { return this._rect.bottom; }
  get width() { return this._width; }
  get height() { return this._height; }

  border: boolean = false;

  update() {
    this._rect = this.canvas.getBoundingClientRect();
    this.context.clearRect(-this.canvasHalfWidth, -this.canvasHalfHeight, this.canvas.width + this.canvasHalfWidth, this.canvas.height + this.canvasHalfHeight);
  }

  swap() {
    this._canvas_context.clearRect(-this.canvasHalfWidth, -this.canvasHalfHeight, this.canvas.width + this.canvasHalfWidth, this.canvas.height + this.canvasHalfHeight);
    this._canvas_context.drawImage(this._buffer, 0, 0);
  }

  resize() {
    this._canvas.width = this.canvas.clientWidth * this._resolution;
    this._canvas.height = this.canvas.clientHeight * this._resolution;
    this._canvasHalfWidth = this._canvas.width / 2;
    this._canvasHalfHeight = this._canvas.height / 2;
    this._buffer.width = this._canvas.width;
    this._buffer.height = this._canvas.height;
    this._width = this._canvas.width;
    this._height = this._canvas.height;
    this._halfWidth = this.width / 2;
    this._halfHeight = this.height / 2;
    this._rect = this.canvas.getBoundingClientRect();
  }

  private constructor(name: string, resolution = 1) {
    this._id = ++Display.id_generator;
    this._name = name.toLowerCase();
    this._canvas = <HTMLCanvasElement>document.getElementById(this._name);
    this._buffer = <HTMLCanvasElement>document.createElement('canvas');
    this._context = <CanvasRenderingContext2D>this.buffer.getContext("2d");
    this._canvas_context = <CanvasRenderingContext2D>this.canvas.getContext("2d");
    Display._displays.push(this);
    this._resolution = resolution;
    this.resize();
  }
}
