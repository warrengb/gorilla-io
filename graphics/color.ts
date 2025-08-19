export class Color{
	public toString = (): string => {
		return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
	}

  private static _black = new Color(0, 0, 0); static get black() { return Color._black;}
  private static _white = new Color(255, 255, 255); static get white() { return Color._white; }
  private static _red = new Color(255, 0, 0); static get red() { return Color._red; }
  private static _green = new Color(0, 255, 0); static get green() { return Color._green; }
  private static _blue = new Color(0, 0, 255); static get blue() { return Color._blue; }

	//static black(): Color { return new Color(0, 0, 0); }
	//static white(): Color { return new Color(255, 255, 255); }
	//static red(): Color { return new Color(255, 0, 0); }
	//static green(): Color { return new Color(0, 255, 0); }
	//static blue(): Color { return new Color(0, 0, 255); }

	private _seek(from: number, to: number, speed: number): number {

		let dif = to - from;
		if (dif == 0)
			return to;
		if (Math.abs(dif) < 1)
			return to;
		return Math.round(from + dif / speed);
	}

	private _fix(value: number): number {
		if (value < 0)
			return 0;
		else if (value > 255)
			return 255;
		return Math.floor(value);
	}

	public fix(): void {
		this.r = this._fix(this.r);
		this.g = this._fix(this.g);
		this.b = this._fix(this.b);
	}

	public shade(percentage: number): Color{
		let r = this.r + percentage * this.r;
		let g = this.g + percentage * this.g;
		let b = this.b + percentage * this.b;
		return new Color(r, g, b, this.a);
	}

	public seek(to: Color, speed: number): Color {
		if (this === to)
			return this;
		
		let r = this._seek(this.r, to.r, speed);
		let g = this._seek(this.g, to.g, speed);
		let b = this._seek(this.b, to.b, speed);
		let a = this._seek(this.a, to.a, speed);
		return new Color(r,g,b,a);
	}

	constructor(public r: number, public g: number, public b: number, public a: number = 1) { this.fix(); }
}
