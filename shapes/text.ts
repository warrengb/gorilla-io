import { Shape } from './shape';
import { Display } from '../vision/display';
import { Color } from '../graphics/color';

export class Text extends Shape {

	private _width = 0;
	private _height = 0;
	private _text = "";

	get width() { return this._width; }	
	get height() { return this._height; }	

	get text() { return this._text; }
	set text(value: string) { this._text = (value == null) ? "" : value; }

	draw(display: Display): void {
		this._width = display.context.measureText(this.text).width;
		this._height = display.context.measureText("W").width;
		let x = this.x - this._width / 2;
		let y = this.y + this._height / 2;
		let context = display.context;
		context.font = this.font;

		if (this.indent) {
			context.fillStyle = this.color.toString();
			context.fillText(this.text, x + 1, y + 1);
			context.fillStyle = 'rgba(0,0,0,.3)';
			context.fillText(this.text, x, y);
		}
		else {
			context.fillStyle = this.color.toString();
			context.fillText(this.text, x, y);
			context.fillStyle = 'rgba(0,0,0,.5)';
			context.fillText(this.text, x + 1, y + 1);
		}
	}

	constructor(x: number, y: number, color: Color,
		text: string,
		public font: string,
		public indent: boolean) {	
		super(x, y, color);
		this.text = text;
	}
}
