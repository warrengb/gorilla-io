import { Arc } from '../../shapes/arc';
import { Text } from '../../shapes/text';
import { Display } from '../../vision/display';
import { Task } from '../../services/task.service';
import { Color } from '../../graphics/color';
import { Graphic } from '../../vision/graphic';

export class SliceConfig {
    name!: string;
    weight!: string;
    color!: string;
}

export class Slice extends Graphic {
    angle = 0;
    start = 0;
    get end(): number { return this.start + this.angle };
    cursor = 0;
    active = false;
    index = 0;
    centerX = 0;
    centerY = 0;
    hoverX = 0;
    hoverY = 0;
    offX = 0;
    offY = 0;
    radius = 0;
    focus = false;
    selected = false;

    arc!: Arc;
    text!: Text;

    override visible = false;

    static selectedColor = new Color(240, 240, 240);

    public reset(): void {
        this.selected = false;
        this.active = false;
        this.focus = false;
        this.hoverX = 0;
        this.hoverY = 0;
    }

    public initialize(x: number, y: number, radius: number, angle: number, start: number, index: number): void {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.angle = angle;
        this.start = start;
        this.index = index++;

        var center: number = this.start + (this.end - this.start) / 2;
        this.centerX = x + radius * .6 * Math.cos(center);
        this.centerY = y + radius * .6 * Math.sin(center);
        this.offX = radius * .1 * Math.cos(center);
        this.offY = radius * .1 * Math.sin(center);

        this.arc = new Arc(this.x, this.y, this.color, this.start, this.end, this.radius);
        this.text = new Text(this.centerX, this.centerY, this.color, this.name, '16px arial', false);
    }

    seek(from: number, to: number, speed: number): number {
    	let dif = to - from;
    	if (dif == 0)
    		return to;
    	if (Math.abs(dif) < .01)
    		return to;
    	return from + dif / speed;
    }

    public hover(out: boolean): void {
        if (out || this.selected) {
            this.hoverX = this.seek(this.hoverX, this.offX, 16);
            this.hoverY = this.seek(this.hoverY, this.offY, 16);
        }
        else {
            this.hoverX = this.seek(this.hoverX, 0, 8);;
            this.hoverY = this.seek(this.hoverY, 0, 8);
        }
    }

    draw(display: Display) {
        this.arc.render(display);
        this.text.render(display);
    }

    public hit(x: number, y: number): boolean {
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

    *task(): IterableIterator<number> {
        while (true) {
            this.arc.x = this.x + this.hoverX;
            this.arc.y = this.y + this.hoverY;
            this.arc.start = this.start;
            this.arc.end = this.end;

            this.arc.border = this.selected;
            this.text.x = this.centerX + this.hoverX;
            this.text.y = this.centerY + this.hoverY;
            this.text.indent = !this.focus;

            if (this.selected) {
                this.arc.color = this.arc.color.seek(Slice.selectedColor, 16);
            }
            else {
                this.arc.color = this.arc.color.seek(this.color, 16);
            }

            this.text.color = this.color;
            yield 16;
        }
    }

    constructor(public name: string, public weight: number, public color: Color) {
        super();
        Task.run(this.task());
    }
}
