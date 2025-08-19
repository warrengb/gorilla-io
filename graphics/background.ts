import { Point, Math2D, Rectangle } from '../graphics/math2D';
import { Graphic } from '../vision/graphic';
import { Display } from '../vision/display';
import { ImageResource } from '../resources/image.resource';
import { Resource } from '../services/asset.service';

export class Background extends Graphic {
  imageResource: ImageResource;

  private source!: Point[];
  private tiles!: Background.Tile[];

  static borderColor = "";

  private imageX = 0;
  private imageY = 0;
  private _width = 0;
  get width() { return this._width; }
  private _height = 0;
  get height() { return this._height; }

  private halfWidth = 0;
  private halfHeight = 0;

  private _tileRows = 0;
  private _tileCols = 0;
  private _tileCount = 0;
  get tileRows() { return this._tileRows; }
  get tileCols() { return this._tileCols; }
  get tileCount() { return this._tileCount; }

  private horizontal = 0;
  private vertical = 0;

  private slide = new Point();
  private scroll = new Point();

  private scrollCap(value: number, max: number): number {
    if (value < -max)
      value = -max;
    else
      if (value > max)
        value = max;
    return value;
  }

  get scrollX() { return this.scroll.x; }
  set scrollX(value: number) {
    this.scroll.x = this.scrollCap(value, this.tileWidth);
  }

  _scrollY = 0;
  get scrollY() { return this.scroll.y; }
  set scrollY(value: number) {
    this.scroll.y = this.scrollCap(value, this.tileHeight);
  }

  get screenX() { return this.slide.x; }
  get screenY() { return this.slide.y; }

  private setScoller(): void {
    this.slide.add(this.scroll);

    if (this.slide.x) {
      if (this.slide.x < -this.tileWidth) {
        this.slide.x += this.tileWidth;
        if (++this.horizontal == this.tileCols) {
          this.horizontal = 0;
        }
      }
      else {
        if (this.slide.x >= this.tileWidth) {
          this.slide.x -= this.tileWidth;
          if (--this.horizontal < 0) {
            this.horizontal = this.tileCols - 1;
          }
        }
      }
    }

    if (this.slide.y) {
      if (this.slide.y < -this.tileHeight) {
        this.slide.y += this.tileHeight;
        if (++this.vertical == this.tileRows) {
          this.vertical = 0;
        }
      }
      else {
        if (this.slide.y >= this.tileHeight) {
          this.slide.y -= this.tileHeight;
          if (--this.vertical < 0) {
            this.vertical = this.tileRows - 1;
          }
        }
      }
    }
  }

  private drawHorizontal(display: Display, row: number[], yy: number, begin: number, end: number, xx: number): number {
    let context = display.context;
    for (let x = begin; x < end; x++, xx += this.tileWidth) {
      let index = row[x];
      if (index == undefined)
        continue;

      let source = this.source[index];
      context.drawImage(this.imageResource.image,
        this.imageX + source.x, this.imageY + source.y,
        this.tileWidth, this.tileHeight,
        (this.x - this.halfWidth + xx + this.slide.x) * display.resolution,
        this.y - this.halfHeight + yy + this.slide.y,
        this.tileWidth * display.resolution, this.tileHeight * display.resolution);

      this.slide.x;
    }
    return xx;
  }

  private drawVertical(display: Display, begin: number, end: number): void {
    let context = display.context;
    for (let y = begin, yy = begin * this.tileHeight; y < end; y++, yy += this.tileHeight) {
      let row = this.layout[y];
      if (!row)
        continue;

      let xx = this.drawHorizontal(display, row, yy, this.horizontal, this.tileCols, 0);
      if (this.horizontal)
        this.drawHorizontal(display, row, yy, 0, this.horizontal, xx);
    }
  }

  zoneHit(x: number, y: number, hit: Background.Hit): boolean {
    if (!this.tiles)
      return false;

    for (let i = this.tiles.length - 1; i >= 0; i--) {
      let tile = this.tiles[i];
      let width = tile.zone.width ? tile.zone.width : this.tileWidth;
      let height = tile.zone.height ? tile.zone.height : this.tileHeight;
      let halfWidth = tile.zone.width / 2;
      let halfHeight = tile.zone.height / 2;
      for (let j = 0; j < tile.points.length; j++) {
        let point = tile.points[j];
        let xx = this.screenX + tile.zone.x - halfWidth + point.x;
        let yy = this.screenY + tile.zone.y - halfHeight + point.y;

        if (x > xx && x < xx + width && y > yy && y < yy + height) {
          if (hit) {
            hit.tile = tile;
            hit.north = y - yy;
            hit.east = x - xx;
            hit.south = yy + height - y;
            hit.west = xx + width - x;
          }
          return true;
        }
      }
    }
    return false;
  }

  drawZones(display: Display): void {
    if (!this.tiles)
      return;

    let context = display.context;
    context.beginPath();
    context.fillStyle = Background.borderColor;
    context.strokeStyle = Background.borderColor;
    context.lineWidth = .5;

    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      let halfWidth = tile.zone.width / 2;
      let halfHeight = tile.zone.height / 2;
      for (let j = 0; j < tile.points.length; j++) {
        let point = tile.points[j];
        let x = this.screenX + tile.zone.x - halfWidth + point.x;
        let y = this.screenY + tile.zone.y - halfHeight + point.y;

        context.rect(x, y, tile.zone.width, tile.zone.height);
        context.rect(x + halfWidth - 2, y + halfHeight - 2, 4, 4);
        context.stroke();
        context.fillText(
          `${Math.floor(x)}:${Math.floor(y)} ` + tile.zone.info,
          x + halfWidth + 4, y + halfHeight + 2);
      }
    }
  }

  draw(display: Display): void {
    if (!this.imageResource.image)
      return;

    if (!this.source) {
      this.init();
    }

    let context = display.context;
    let alpha = context.globalAlpha;
    context.globalAlpha = this.alpha;

    this.drawVertical(display, this.vertical, this.tileRows);
    this.drawVertical(display, 0, this.vertical);

    context.globalAlpha = alpha;

    this.setScoller();
  }

  get info(): string {
    return `${this.name} ${Math.floor(this.x)}:${Math.floor(this.y)} ` +
      `${this.tileCols}:${this.tileWidth} X ${this.tileRows}:${this.tileHeight} ` +
      `scroll ${this.scrollX}:${this.scrollY} screen ${Math.floor(this.screenX)}:${Math.floor(this.screenY)} ` +
      `zones ${this.zones ? this.zones.length : 0}`;
  }

  private prepareSource(): void {
    this.source = [];
    let rows = this.imageResource.image.height / this.tileHeight;
    let cols = this.imageResource.image.width / this.tileWidth;
    for (let y = 0, yy = 0; y < rows; y++, yy += this.tileHeight) {
      for (let x = 0, xx = 0; x < cols; x++, xx += this.tileWidth) {
        this.source.push(new Point(xx, yy));
      }
    }
  }

  private prepareZones(): void {
    if (!this.zones)
      return;

    let zoneX = Math.floor(this.tileCols / 2) * -this.tileWidth;
    let zoneY = Math.floor(this.tileRows / 2) * -this.tileHeight;
    this.tiles = [];
    for (let j = 0; j < this.zones.length; j++) {
      let zone = this.zones[j];
      let points: Point[] = [];

      for (let row = 0, i = 0, y = 0, zy = zoneY; row < this.tileRows; row++, zy += this.tileHeight, y += this.tileHeight) {
        for (let col = 0, x = 0, zx = zoneX; col < this.tileCols; col++, zx += this.tileWidth, x += this.tileWidth, i++) {
          let tile = this.layout[row][col];
          if (tile == zone.tile) {
            points.push(new Point(zx, zy));
          }
        }
        this.tiles.push(new Background.Tile(this, zone, points));
      }
    }
  }

  private init(): void {
    this.prepareSource();

    this._tileRows = this.layout.length;
    for (let row of this.layout)
      if (row && row.length > this._tileCols)
        this._tileCols = row.length;

    this._height = this._tileRows * this.tileHeight;
    this._width = this._tileCols * this.tileWidth;

    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;

    this.prepareZones();
  }

  override get ready(): boolean { return this.imageResource.ready; }

  static create(source: Background.Source, x: number, y: number, width: number, height: number, atX = 0, atY = 0): Background {
    let background = new Background(source.name, source.folder, width, height, []);
    background.imageX = x;
    background.imageY = y;
    background.x = atX;
    background.y = atY;

    return background;
  }

  constructor(public readonly name: string, public readonly folder: string[],
    public readonly tileWidth: number, public readonly tileHeight: number,
    public readonly zones: Background.Zone[],
    public readonly layout: number[][] = [[0, 0, 0, 0]],
    x = 0, y = 0) {
    super(x, y);
    this.layout = layout;
    this.imageResource = Resource.get(ImageResource, name, folder);
  }
}

export namespace Background {
  export class Zone {
    constructor(
      public readonly name: string,
      public readonly type: number,
      public readonly tile: number,
      public readonly x = 0, public readonly y = 0,
      public readonly width = 0, public readonly height = 0
    ) { }

    get info(): string {
      return `${this.name}:${this.type} [${this.tile}] ${this.x}:${this.y} ${this.width}:${this.height}`;
    }
  }

  export class Tile {
    constructor(
      public readonly background: Background,
      public readonly zone: Background.Zone,
      public readonly points: Point[],
    ) { }
  }

  export class Hit {
    tile!: Tile;
    north = 0;
    east = 0;
    south = 0;
    west = 0;
  }

  export class Map extends Graphic {
    constructor(public readonly backgrounds: Background[]) {
      super(0, 0);
    }

    drawBorder(display: Display): void {
      if (!Background.borderColor || Background.borderColor.length == 0)
        return;

      let context = display.context;
      context.fillStyle = Background.borderColor;

      for (let i = 0; i < this.backgrounds.length; i++) {
        let background = this.backgrounds[i];
        if (background.zones) {
          background.drawZones(display);
        }
      }

      let x = -display.canvas.width / 2;
      let y = -display.canvas.height / 2;
      for (let i = 0; i < this.backgrounds.length; i++, y += 12) {
        let background = this.backgrounds[i];
        context.fillText(background.info, x, y + 12);
      }
    }

    hit(x: number, y: number, hit: Background.Hit | undefined = undefined): boolean {
      for (let i = this.backgrounds.length - 1; i >= 0; i--) {
        let background = this.backgrounds[i];
        if (hit && background.zoneHit(x, y, hit))
          return true;
      }
      return false;
    }

    draw(display: Display): void {
      for (let i = 0; i < this.backgrounds.length; i++) {
        this.backgrounds[i].render(display);
      }

      this.drawBorder(display);
    }

    override get ready(): boolean {
      for (let i = 0; i < this.backgrounds.length; i++)
        if (!this.backgrounds[i].ready)
          return false;
      return true;
    }
  }

  export class Source {
    imageResource: ImageResource;
    constructor(public readonly name: string, public readonly folder: string[]) {
      this.imageResource = Resource.get(ImageResource, name, folder);
    }
  }
}
