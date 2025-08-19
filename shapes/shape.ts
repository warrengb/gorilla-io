import { Color } from '../graphics/color';
import { Graphic } from '../vision/graphic';

export abstract class Shape extends Graphic {

  constructor(x: number, y: number, public color: Color = Color.black) {
    super();
    this.x = x;
    this.y = y;
  }
}
