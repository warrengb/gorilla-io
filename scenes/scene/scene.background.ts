import { Background } from '../../graphics/background';

export class SceneBackground {
  sky = new Background("sky", ["images", "beach"], 480, 270, []);
  cloud = new Background("cloud", ["images", "beach"], 480, 270, []);
  seaMap = [new Background.Zone("sea", 1, 0, 0, 30, 0, 80)];
  sea = new Background("sea", ["images", "beach"], 480, 270, []);
  land = new Background("land", ["images", "beach"], 480, 270, this.seaMap);
  decor = new Background("decor", ["images", "beach"], 480, 270, []);
  islandMap = [new Background.Zone("island", 2, 0, -124, 18, 180, 20)];
  island = new Background("island", ["images", "beach"], 480, 270, this.islandMap);
  boat = new Background("boat", ["images", "beach"], 480, 270, []);
  map: Background.Map = new Background.Map([this.sky, this.cloud, this.sea, this.land, this.decor, this.island, this.boat]);

  direction = 0;
  readonly BOUNDS = 120;

  get ready() { return this.map.ready;}

  move() {
    switch (this.direction) {
      case 0:
        this.sea.scrollX = 1;
        this.island.scrollX = 0;
        this.boat.scrollX = .2;
        this.land.scrollX = 0;
        this.decor.scrollX = 0;
        break;
      case 1:
        this.sea.scrollX = 2;
        this.island.scrollX = .6;
        this.boat.scrollX = 1;
        this.land.scrollX = 1;
        this.decor.scrollX = 1;
        break;
      case -1:
        this.sea.scrollX = 0;
        this.island.scrollX = -.6;
        this.boat.scrollX = -.2;
        this.land.scrollX = -1;
        this.decor.scrollX = -1;
        break;
    }
  }

  constructor() {
    this.sky.scrollX = .05;
    this.cloud.scrollX = .08;
  }
}
