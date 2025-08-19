import { Task } from '../../services/task.service';
import { Pointer } from '../../services/pointer.service';
import { Render } from '../../services/render.service';
import { Slice } from './slice';
import { Arc } from '../../shapes/arc';
import { Display } from '../../vision/display';
import { SliceSelectedEvent, Navigate } from '../events';
import { Color } from '../../graphics/color';
import { Event } from "../../services/event.service";

export class Pie {
  centerX: number;
  centerY: number;
  radius: number;
  total: number;
  hover: number = -1;

  display: Display;
  pointer: Pointer;
  render: Render;

  slice: Slice | undefined = undefined;
  sliceSelect: Slice | undefined = undefined;
  slices: Array<Slice> = new Array<Slice>();
  arc: Arc;
  playing!: Task;
  inputTask: Task | undefined = undefined;;
  homeCommand: number = -1;
  splashINC = .01;

  public focus(index: number): void {
    if (this.slice != null)
      this.slice.focus = false;
    this.slice = this.slices[index];
    this.slice.focus = true;
  }

  hit(x: number, y: number): Slice | undefined {
    for (let slice of this.slices) {
      if (slice.hit(x - this.centerX, y - this.centerY)) {
        this.hover = slice.index;
        return slice;
      }
    }
    this.hover = -1;
    return undefined;
  }

  change(name: string) {
    let slice = this.find(name);
    this.select(slice);
  }

  select(slice: Slice | undefined = undefined): void {
    if (this.sliceSelect) {
      this.sliceSelect.selected = false;
      this.sliceSelect = undefined;
    }

    if (!slice) {
      Event.emit(new SliceSelectedEvent("Home", 0, ""));
      this.hover = -1;
    }
    else {
      Event.emit(new SliceSelectedEvent(slice.name, slice.index, slice.color.toString()));
      slice.selected = true;
      this.sliceSelect = slice;
    }
  }

  click(): void {
    if (this.hover == -1)
      return;

    if (this.slices[this.hover].hit(this.pointer.x - this.centerX, this.pointer.y - this.centerY)) {
      if (this.sliceSelect != this.slices[this.hover]) {
        this.select(this.slices[this.hover]);
      }
      else {
        this.select();
      }
    }
  }

  public reset() {
    if (this.inputTask) {
      this.inputTask.cancel();
    }
    this.inputTask = undefined;
    for (let s of this.slices)
      s.reset();
    if (this.playing) {
      this.playing.cancel();
    }
    this.playing.cancel();
    this.playing = Task.run(this.run());
    this.slice = undefined;
    this.sliceSelect = undefined;

    Event.emit(new SliceSelectedEvent("None", -1, ""));
  }

  public fastSplash() {
    this.splashINC = .11;
  }

  draw(display: Display) {
    for (let s of this.slices)
      s.render(display);
    this.arc.render(display);
  }

  *splash(): IterableIterator<number> {
    const SPEED = 16;
    this.splashINC = .01;

    for (let slice of this.slices) {
      slice.visible = false;
    }

    for (let i = 0; i < this.slices.length; i++) {
      let slice = this.slices[i];
      slice.visible = false;
      this.arc.color = slice.color;
      this.arc.start = slice.start;
      for (let a = slice.start + this.splashINC; a <= slice.end; a += this.splashINC) {
        this.arc.end = a;
        yield SPEED;
      }
      slice.visible = true;
    }
    this.arc.visible = false;

    Event.emit(new SliceSelectedEvent("Home", -1, ""));
  }

  *input(): IterableIterator<number> {
    while (this.playing) {
      if (this.pointer.move) {
        this.hit(this.pointer.x, this.pointer.y);
      }
      if (this.pointer.up) {
        this.click();
      }
      yield 0;
    }
  }

  *play(): IterableIterator<number> {
    const INCREMENT = .01;
    const SPEED = 16;
    const START = -Math.PI / 2;
    let angle = START;

    for (let s of this.slices)
      s.visible = true;

    this.focus(0);
    this.arc.visible = true;
    this.arc.color = new Color(255, 255, 255, .5);

    this.inputTask = Task.run(this.input());

    while (true) {
      for (let s of this.slices)
        s.hover(s.index == this.hover);

      if (this.slice) {
        this.arc.x = this.slice.x + this.slice.hoverX;
        this.arc.y = this.slice.y + this.slice.hoverY;

        this.arc.start = angle;
        this.arc.end = (angle += INCREMENT);

        if (angle > this.slice.end) {
          let index = this.slice.index == this.slices.length - 1 ? 0 : this.slice.index + 1;
          this.focus(index);
          if (index == 0)
            angle = START;
        }
      }

      yield SPEED;
    }
  }

  *run(): IterableIterator<number> {
    yield* this.splash();
    yield* this.play();
  }

  find(name: string): Slice | undefined {
    if (!name)
      return undefined;
    name = name.toLowerCase();
    for (let slice of this.slices) {
      if (name == slice.name.toLocaleLowerCase())
        return slice;
    }
    return undefined;
  }

  navObserver(event: Navigate.Event): void {
    if (this.sliceSelect) {
      this.sliceSelect.selected = false;
      this.sliceSelect = undefined;
    }
    console.log("event " + Navigate.Command[event.command]);
  }

  destroy() {
    this.display.remove();
    this.render.remove();
    this.playing.cancel();
  }


  constructor(config: [string, number, Color][], select: string) {
    this.display = Display.get("pie");
    this.pointer = new Pointer(this.display);
    this.render = new Render(r => this.draw(r), this.display);

    for (let [name, weight, color] of config) {
      this.slices.push(new Slice(name, weight, color));
    }

    this.radius = 180;
    this.centerX = 0;
    this.centerY = 0;
    this.total = 0;

    for (let s of this.slices)
      this.total += s.weight;

    var index: number = 0;
    var start: number = -Math.PI / 2;
    for (let slice of this.slices) {
      let angle = Math.PI * 2 * (slice.weight / this.total);
      slice.initialize(this.centerX, this.centerY, this.radius, angle, start, index++);
      start += angle;
    }

    this.arc = new Arc(this.centerX, this.centerY, new Color(255, 255, 255, .5), 0, 0, this.radius);

    let slice = this.find(select);
    if (slice) {
      this.playing = Task.run(this.play());
      this.select(slice);
    }
    else if (select == "home") {
      this.playing = Task.run(this.play());
    }
    else {
      this.playing = Task.run(this.run());
    }

    Event.listen(Navigate.Event, (e:any) => this.navObserver(e));
  }
}

