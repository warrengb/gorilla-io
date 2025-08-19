
import { Graphic } from '../vision/graphic';
import { Display } from '../vision/display';
import { ImageResource } from '../resources/image.resource';
import { Resource } from '../services/asset.service';
import { Rectangle } from '../graphics/math2D';

export class Sprite extends Graphic {
  imageResource: ImageResource;

  flipH = false;
  flipV = false;

  static borderColor = "";
  debug = "";

  private offX = 0;
  private offY = 0;
  private imageX = 0;
  private imageY = 0;
  private imageWidth = 0;
  private imageHeight = 0;
  private halfWidth = 0;
  private halfHeight = 0;

  private _width = 0;
  get width() { return this._width; }
  set width(value: number) {
    this._width = value;
    this.halfWidth = this._width / 2;
    this.offX = (this.frameWidth - value) / 2;
  }

  readonly clip: Rectangle = new Rectangle();

  private _height = 0;
  get height() { return this._height; }
  set height(value: number) {
    this._height = value;
    this.halfHeight = this._height / 2;
    this.offY = (this.frameHeight - value) / 2;
  }

  private _rows = 0;
  get rows() { return this._rows; }

  private _cols = 0;
  get cols() { return this._cols; }

  private _count = 0;
  get count() { return this._count; }

  private _init = -1;
  private _index = -1;
  get index() { return this._index; }

  set index(index: number) {
    if (this._index == index)
      return;

    if (this.map) {
      this._index = index;
      this.imageX = this.map[index][0];
      this.imageY = this.map[index][1];
    }
    else {
      this._index = index;
      this.imageX = this.frameWidth * (index % this.cols);
      this.imageY = this.frameHeight * Math.floor(index / this.cols);
    }
  }

  private _scale = 1.0;
  get scale() { return this._scale; }
  set scale(value: number) {
    this._scale = value;
    this.width = this.frameWidth * value;
    this.height = this.frameHeight * value;
  }

  private init(): void {
    this._width = this.frameWidth;
    this._height = this.frameHeight;
    this.halfWidth = this.frameWidth / 2;
    this.halfHeight = this.frameHeight / 2;

    this._rows = this.imageResource.image.height / this.frameHeight;
    this._cols = this.imageResource.image.width / this.frameWidth;
    this._count = this.rows * this.cols;

    if (this.index >= 0)
      this.index = this._init;
    this._init = -1;
  }

  hit(x: number, y: number): boolean {
    return (
      x >= this.x - this.halfWidth &&
      x <= this.x + this.halfWidth &&
      y >= this.y - this.halfHeight &&
      y <= this.y + this.halfHeight);
  }

  drawBorder(display: Display): void {
    if (!Sprite.borderColor || Sprite.borderColor.length == 0)
      return;

    let context = display.context;
    let x = (this.x - this.halfWidth + this.offX) * display.resolution;
    let y = (this.y - this.halfHeight + this.offY) * display.resolution;
    context.beginPath();
    context.strokeStyle = Sprite.borderColor;
    context.lineWidth = display.resolution;
    context.rect(x, y, this.width * display.resolution, this.height * display.resolution);
    context.stroke();
    context.fillStyle = Sprite.borderColor;
    if (display.resolution>1)
      context.font = "32px serif";
    context.fillText(
      `${Math.floor(this.x)}:${Math.floor(this.y)} ${Math.floor(this.width)}:${Math.floor(this.height)} ${this.debug}`,
      x, y - 2);
  }

  draw(display: Display): void {
    if (!this.imageResource.image)
      return;

    if (this._init > -1)
      this.init();

    this.drawBorder(display);

    let flip = this.flipH || this.flipV;
    if (flip) {
      let f = this.scale > 1.0 ? this.scale - 1 : this.scale;
      let x = this.flipH ? this.width - this.width * this.scale + this.imageWidth / 2.50 * Math.abs(this.scale - 1) : 0;
      let y = this.flipV ? this.width - this.height * this.scale + this.imageHeight / 2.50 * Math.abs(this.scale - 1) : 0;
      display.context.save();
      display.context.setTransform(
        this.flipH ? -1 : 1, 0,
        0, this.flipV ? -1 : 1,
        display.halfWidth + (this.flipV && !this.flipH ? 0 : this.x) + (this.flipH ? this.x : 0) + x,
        display.halfHeight + this.y + (this.flipV ? this.y : this.flipH ? -this.y : 0) + y
      );
    }

    display.context.drawImage(this.imageResource.image,
      this.imageX + this.clip.left,
      this.imageY + this.clip.top,
      this.imageWidth - this.clip.left - this.clip.right,
      this.imageHeight - this.clip.bottom - this.clip.top,
      (this.x - this.halfWidth + this.offX + this.clip.left) * display.resolution,
      (this.y - this.halfHeight + this.offY + this.clip.top) * display.resolution,
      (this.width - this.clip.left - this.clip.right) * display.resolution,
      (this.height - this.clip.bottom - this.clip.top) * display.resolution);

    if (flip) {
      display.context.restore();
    }
  }

  override get ready(): boolean { return this.imageResource.ready; }

  static create(source: Sprite.Source, x: number, y: number, width: number, height: number, atX: number = 0, atY = 0, index = 0, map: [number, number][] = []): Sprite {
    let sprite = new Sprite(source.name, source.folder, width, height, atX, atY, index, map);
    sprite.imageX = x;
    sprite.imageY = y;
    if (map)
      sprite.index = index;
    return sprite;
  }

  get json(): string {
    return `{x:${this.x},y:${this.x},width:${this.width},height:${this.height},index:${this.index},scale:${this.scale},clip:${JSON.stringify(this.clip)},flipH:${this.flipH},flipV:${this.flipV}}`;
  }
  set json(value: string) {
    let data = JSON.parse(value);
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.index = data.index;
    this.scale = data.scale;
    this.clip.copy(data.clip);
    this.flipH = data.flipH;
    this.flipV = data.flipV;
  }

  get data(): Sprite.Data {
    return new Sprite.Data(
      this.x,
      this.y,
      this.width,
      this.height,
      this.index,
      this.scale,
      this.clip,
      this.flipH,
      this.flipV);
  }

  set data(that: Sprite.Data) {
    this.x = that.x;
    this.y = that.y
    this.width = that.width;
    this.height = that.height;
    this.index = that.index;
    this.scale = that.scale;
    this.clip.copy(that.clip);
    this.flipH = that.flipH;
    this.flipV = that.flipV;
  }

  constructor(public readonly name: string, public readonly folder: string[], public readonly frameWidth: number, public readonly frameHeight: number, public override x: number = 0, public override y:number = 0, index = 0, public readonly map: [number, number][] = []) {
    super(x, y);
    this._init = index;
    this.imageWidth = frameWidth;
    this.imageHeight = frameHeight;
    this.imageResource = Resource.get(ImageResource, name, folder);
  }
}

export namespace Sprite {
  export class Source {
    imageResource: ImageResource;
    constructor(public readonly name: string, public readonly folder: string[]) {
      this.imageResource = Resource.get(ImageResource, name, folder);
    }
  }

  export class Data {
    constructor(
      public x: number,
      public y: number,
      public width: number,
      public height: number,
      public index: number,
      public scale: number,
      public clip: Rectangle,
      public flipH: boolean,
      public flipV: boolean) { this.clip = new Rectangle(clip.left, clip.top, clip.right, clip.bottom); }
  }
}
