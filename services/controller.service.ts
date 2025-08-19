import { Service } from '../vision/stage';
import { Display } from '../vision/display';


class GamepadState {
  id = '';
  axes = new Array<number>(4);
  buttons = new Array<number>(17);
  connected = false;

  copy(gamepad: Gamepad) {
    this.id = gamepad.id;
    this.connected = gamepad.connected;
    for (let i = 0; i < gamepad.axes.length && i < this.axes.length; i++) {
      this.axes[i] = gamepad.axes[i];
    }
    for (let i = 0; i < gamepad.buttons.length && i < this.buttons.length; i++) {
      this.buttons[i] = gamepad.buttons[i].value;
    }
  }

  constructor(public readonly index: number) {
    for (let a = 0; a < this.axes.length; a++) {
      this.axes[a] = 0;
    }
    for (let b = 0; b < this.buttons.length; b++) {
      this.buttons[b] = 0;
    }
  }
}

let gamepads: GamepadState[] = [new GamepadState(0), new GamepadState(1), new GamepadState(2), new GamepadState(3)];
let count = 0;

export class Controller {
  private gamepad;
  get id() { return this.gamepad.id; }
  get connected() { return this.gamepad.connected; }
  get axes(): ReadonlyArray<number> { return this.gamepad.axes; }
  get buttons(): ReadonlyArray<number> { return this.gamepad.buttons; }

  constructor(public readonly index: Controller.Index = Controller.Index.One) {
    this.gamepad = gamepads[index];
  }
}

export namespace Controller {
  export enum Index {
    One = 0,
    Two,
    Three,
    Four
  }
}

export class XboxController extends Controller {
  get A(): boolean { return !!this.buttons[0]; }
  get B(): boolean { return !!this.buttons[1]; }
  get X(): boolean { return !!this.buttons[2]; }
  get Y(): boolean { return !!this.buttons[3]; }
  get LeftBumper(): number { return this.buttons[4]; }
  get RightBumper(): number { return this.buttons[5]; }
  get LeftTrigger(): number { return this.buttons[6]; }
  get RightTrigger(): number { return this.buttons[7]; }
  get Select(): boolean { return !!this.buttons[8]; }
  get Start(): boolean { return !!this.buttons[9]; }
  get Up(): boolean { return !!this.buttons[12]; }
  get Down(): boolean { return !!this.buttons[13]; }
  get Left(): boolean { return !!this.buttons[14]; }
  get Right(): boolean { return !!this.buttons[15]; }
  get LeftStickX(): number { return this.axes[0]; }
  get LeftStickY(): number { return this.axes[1]; }
  get RightStickX(): number { return this.axes[2]; }
  get RightStickY(): number { return this.axes[3]; }

  constructor(index: Controller.Index = Controller.Index.One) {
    super(index);
  }
}

export class ControllerService implements Service {
  get name() { return "Controller"; }
  padmap = new Array<number>(16);

  initiate(): void { }
  prepare(): void { }

  process(): void {
    if (!navigator.getGamepads)
      return;

    let pads = navigator.getGamepads();
    if (!pads)
      return;

    for (let i = 0; i < pads.length; i++) {
      let pad = pads[i];
      if (pad) {
        let index = this.padmap[pad.index];
        if (index == undefined) {
          if (pad.mapping && pad.mapping == "standard") {
            index = this.padmap[pad.index] = count++;
          }
          else {
            index = this.padmap[pad.index] = -1;
          }
        }

        if (index >= 0) {
          gamepads[index].copy(pad);
        }
      }
    }
  }
}
