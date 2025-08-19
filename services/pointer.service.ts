
import { Display } from '../vision/display';
import { Stage, Service } from '../vision/stage';

export class Target {
  private input: Input;
  get id(): number { return this.input.id; }
  get x(): number { return this.input.state.x; }
  get y(): number { return this.input.state.y; }
  get deltaX(): number { return this.input.state.x - this.input.lastX; }
  get deltaY(): number { return this.input.state.y - this.input.lastY; }
  get move(): boolean { return this.input.state.move; }
  get down(): boolean { return this.input.state.down; }
  get up(): boolean { return this.input.state.up; }
  get pressed(): number { return this.input.state.pressed; }
  get cancel(): boolean { return this.input.state.cancel; }
  get active(): boolean { return this.input.state.active; }

  constructor(input: Input) {
    this.input = input;
  }
}

export class Mouse extends Target {
  constructor(display: Display) {
    super(DisplayInput.get(display).mouse);
  }
}

export class Pointer extends Target {
  constructor(display: Display) {
    super(DisplayInput.get(display).pointer);
  }
}

export class Touch {
  private input: TouchInput;

  get active(): boolean { return this.input.start.length > 0 || this.input.end.length > 0 || this.input.extant.length > 0; }
  get start(): ReadonlyArray<Target> { return this.input.start as ReadonlyArray<Target>; }
  get end(): ReadonlyArray<Target> { return this.input.end as ReadonlyArray<Target>; }
  get extant(): ReadonlyArray<Target> { return this.input.extant as ReadonlyArray<Target>; }

  constructor(display: Display) {
    this.input = DisplayInput.get(display).touch;
  }
}

class State {
  x = 0;
  y = 0;
  down = false;
  up = false;
  move = false;
  cancel = false;
  pressed = 0;
  active = false;

  copy(other: State): void {
    this.x = other.x;
    this.y = other.y;
    this.down = other.down;
    this.up = other.up;
    this.move = other.move;
    this.cancel = other.cancel;
    this.pressed = other.pressed;
    this.active = other.active;
  }
}

class Input {
  lastX = 0;
  lastY = 0;
  state = new State();
  next = new State();

  down(x: number, y: number): void {
    this.next.down = true;
    this.move(x, y);
    this.next.pressed = Stage.time;
  }

  up(): void {
    this.next.up = true;
    this.next.pressed = 0;
  }

  move(x: number, y: number): void {
    this.next.move = true;
    this.next.x = x;
    this.next.y = y;
  }

  cancel(): void {
    this.next.cancel = true;
    this.next.pressed = 0;
  }

  enter(): void {
    this.next.active = true;
  }

  leave(): void {
    this.next.active = false;
  }

  process() {
    this.lastX = this.state.x;
    this.lastY = this.state.y;
    this.state.copy(this.next);
    this.next.move = false;
    this.next.down = false;
    this.next.up = false;
    this.next.cancel = false;
  }

  constructor(public readonly id = 0) {
  }
}

class TouchInput {
  inputs = new Array<Input>(10);
  targets = new Array<Target>(10);

  start: Target[] = [];
  extant: Target[] = [];
  end: Target[] = [];

  update = new Array<boolean>(10);
  dirty = false;

  down(id: number, x: number, y: number): void {
    let input = this.inputs[id];
    input.down(x, y);
    this.update[id] = true;
    this.dirty = true;
  }

  up(id: number, x: number, y: number): void {
    let input = this.inputs[id];
    input.up();
    input.move(x, y);
    this.update[id] = true;
    this.dirty = true;
  }

  move(id: number, x: number, y: number): void {
    let input = this.inputs[id];
    input.move(x, y);
    this.update[id] = true;
    this.dirty = true;
  }

  cancel(id: number): void {
    let input = this.inputs[id];
    input.cancel();
    this.update[id] = true;
    this.dirty = true;
  }

  process() {
    this.start = [];
    this.end = [];

    if (!this.dirty) {
      return;
    }
    this.dirty = false;

    for (let i = 0; i < this.update.length; i++) {
      if (this.update[i]) {
        this.update[i] = false;
        let input = this.inputs[i];
        input.process();
        if (input.state.cancel || input.state.up) {
          this.end.push(this.targets[i]);
          for (let j = 0; j < this.extant.length; j++) {
            if (this.extant[j].id == input.id) {
              this.extant.splice(j, 1);
              break;
            }
          }
        }
        else
          if (input.state.down) {
            this.start.push(this.targets[i]);
            this.extant.push(this.targets[i]);
          }
      }
    }
  }

  constructor() {
    for (let i = 0; i < this.inputs.length; i++) {
      this.inputs[i] = new Input(i);
      this.targets[i] = new Target(this.inputs[i]);
    }
  }
}

//console.log("pointerdown " + event.pointerType + " " + event.pointerId + " " + event.pointerType + " " + event.x + ":" + event.y);

class DisplayInput {
  static list: DisplayInput[] = [];
  pointer = new Input();
  mouse = new Input();
  touch = new TouchInput();

  setX(x: number): number {
    return x - this.display.x - this.display.halfWidth;
  }

  setY(y: number): number {
    return y - this.display.y - this.display.halfHeight;
  }

  setId(id: number): number {
    return id % 10;
  }

  static get(display: Display): DisplayInput {
    for (let i = 0; i < DisplayInput.list.length; i++) {
      let displayInput = DisplayInput.list[i];
      if (displayInput.display.name == display.name) {
        if (displayInput.display.id != display.id) {
          DisplayInput.list.splice(i, 1);
          break;
        }
        return displayInput;
      }
    }
    let displayInput = new DisplayInput(display);
    DisplayInput.list.push(displayInput);
    return displayInput;
  }

  down(event: PointerEvent): void {
    this.pointer.down(this.setX(event.x), this.setY(event.y));
    switch (event.pointerType) {
      case 'mouse':
        this.mouse.down(this.setX(event.x), this.setY(event.y));
        break;

      case 'touch':
        this.touch.down(this.setId(event.pointerId), this.setX(event.x), this.setY(event.y));
    }
  }

  up(event: PointerEvent): void {

    this.pointer.up();

    switch (event.pointerType) {
      case 'mouse':
        this.mouse.up();
        break;

      case 'touch':
        this.touch.up(this.setId(event.pointerId), this.setX(event.x), this.setY(event.y));
        break;
    }
  }

  move(event: PointerEvent): void {

    this.pointer.move(this.setX(event.x), this.setY(event.y));

    switch (event.pointerType) {
      case 'mouse':
        this.mouse.move(this.setX(event.x), this.setY(event.y));
        break;

      case 'touch':
        this.touch.move(this.setId(event.pointerId), this.setX(event.x), this.setY(event.y));
        break
    }
  }

  cancel(event: PointerEvent): void {

    this.pointer.cancel();

    switch (event.pointerType) {
      case 'mouse':
        this.mouse.cancel();
        break;

      case 'touch':
        this.touch.cancel(this.setId(event.pointerId));
        break;
    }
  }

  enter(event: PointerEvent): void {

    this.pointer.enter();

    switch (event.pointerType) {
      case 'mouse':
        this.mouse.enter();
        break;
    }
  }

  leave(event: PointerEvent): void {

    this.pointer.leave();

    switch (event.pointerType) {
      case 'mouse':
        this.mouse.leave();
        break;
    }
  }

  process(): void {
    this.pointer.process();
    this.mouse.process();
    this.touch.process();
  }

  iterTouch(list: TouchList, action: (t:any) => void): void {
    for (let i = 0; i < list.length; i++) {
      let t = list.item(i);
      action(t);
    }
  }

  private constructor(public readonly display: Display) {

    display.canvas.addEventListener('click', (e) => { e.preventDefault(); });

    if (typeof window.onpointerdown !== 'undefined') {
      display.canvas.onpointerdown = (e) => { e.preventDefault(); this.down(e); };
      display.canvas.onpointerup = (e) => { e.preventDefault(); this.up(e); };
      display.canvas.onpointermove = (e) => { e.preventDefault(); this.move(e); };
      display.canvas.onpointercancel = (e) => { e.preventDefault(); this.cancel(e); };
      display.canvas.onpointerenter = (e) => { e.preventDefault(); this.enter(e); };
      display.canvas.onpointerleave = (e) => { e.preventDefault(); this.leave(e); };
    }
    else {
      display.canvas.onmousedown = (e) => { e.preventDefault(); this.pointer.down(this.setX(e.x), this.setY(e.y)); this.mouse.down(this.setX(e.x), this.setY(e.y)); };
      display.canvas.onmouseup = (e) => { e.preventDefault(); this.pointer.up(); this.mouse.up(); };
      display.canvas.onmousemove = (e) => {
        e.preventDefault();
        this.pointer.move(this.setX(e.x), this.setY(e.y));
        this.mouse.move(this.setX(e.x), this.setY(e.y));
      };
      display.canvas.onmouseenter = (e) => { e.preventDefault(); this.pointer.enter(); this.mouse.enter(); };
      display.canvas.onmouseleave = (e) => { e.preventDefault(); this.pointer.leave(); this.mouse.leave(); };

      display.canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        this.iterTouch(e.changedTouches, (t) => {
          this.pointer.down(this.setX(t.clientX), this.setY(t.clientY));
          this.touch.down(this.setId(t.identifier), this.setX(t.clientX), this.setY(t.clientY));
        });
        return false;
      }, false);

      display.canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        this.iterTouch(e.changedTouches, (t) => {
          this.pointer.move(this.setX(t.clientX), this.setY(t.clientY));
          this.touch.move(this.setId(t.identifier), this.setX(t.clientX), this.setY(t.clientY));
        });
        return false;
      }, false);

      display.canvas.addEventListener("touchcancel", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        this.pointer.cancel();
        this.iterTouch(e.changedTouches, (t) => this.touch.cancel(this.setId(t.identifier)));
        return false;
      }, false);

      display.canvas.addEventListener("selectstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
      }, false);

      display.canvas.addEventListener("selectchange", (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
      }, false);
    }
  }
}

export class PointerService implements Service {
  get name() { return "Pointer"; }

  prepare(): void { }
  initiate(): void { }

  process(): void {
    for (let displayInput of DisplayInput.list) {
      displayInput.process();
    }
  }
}
