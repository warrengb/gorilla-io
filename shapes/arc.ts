import { Shape } from './shape';
import { Display } from '../vision/display';
import { Color } from '../graphics/color';

export class Arc extends Shape {

	border = false;

	draw(display: Display): void {
		let context = display.context;
		context.fillStyle = this.color.toString();
		context.beginPath();
		context.moveTo(this.x, this.y);
		context.arc(this.x, this.y, this.radius, this.start, this.end, false);
		context.fill();

		if (this.border) {
			context.strokeStyle = 'rgba(0,0,0,.2)';
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(this.x, this.y);
			context.arc(this.x, this.y, this.radius, this.start, this.end, false);
			context.lineTo(this.x, this.y);
			context.stroke();
			context.closePath();
		}
	}

	hit(x: number, y: number): boolean {
		let radius: number = Math.sqrt(x * x + y * y);
		if (radius < 0 || radius > this.radius)
			return false;

		let angle: number = Math.atan2(y, x);
		if (angle < -Math.PI / 2 && angle > -Math.PI)
			angle += 2 * Math.PI;

		if (angle > this.start && angle < this.end)
			return true;
		return false;
	}

	constructor(x:number, y:number, color:Color,
				public start: number,
				public end: number,
				public radius: number) {
		super(x,y,color);
	}
}
