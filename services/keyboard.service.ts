import { Service } from '../vision/stage';

let count: number = 0;
let keys: boolean[] = new Array<boolean>(256);

export class Keyboard  {
  static readonly Backspace = 8;
  static readonly Tab = 9;
  static readonly Enter = 13;
  static readonly Shift = 16;
  static readonly Ctrl = 17;
  static readonly Alt = 18;
  static readonly Pause = 19;
  static readonly Capslock = 20;
  static readonly Escape = 27;
  static readonly PageUp = 33;
  static readonly PageDown = 34;
  static readonly End = 35;
  static readonly Home = 36;
  static readonly Left = 37;
  static readonly Up = 38;
  static readonly Right = 39;
  static readonly Down = 40;
  static readonly Insert = 45;
  static readonly Delete = 46;
  static readonly Numpad0 = 96;
  static readonly Numpad1 = 97;
  static readonly Numpad2 = 98;
  static readonly Numpad3 = 99;
  static readonly Numpad4 = 100;
  static readonly Numpad5 = 101;
  static readonly Numpad6 = 102;
  static readonly Numpad7 = 103;
  static readonly Numpad8 = 104;
  static readonly Numpad9 = 105;
  static readonly Multiply = 106;
  static readonly Add = 107;
  static readonly Subtract = 109;
  static readonly DecimalPoint = 110;
  static readonly Divide = 111;
  static readonly F1 = 112;
  static readonly F2 = 113;
  static readonly F3 = 114;
  static readonly F4 = 115;
  static readonly F5 = 116;
  static readonly F6 = 117;
  static readonly F7 = 118;
  static readonly F8 = 119;
  static readonly F9 = 120;
  static readonly F10 = 121;
  static readonly F11 = 122;
  static readonly F12 = 123;
  static readonly NumLock = 144;
  static readonly ScrollLock = 145;

  static key(value: number): boolean {
    return keys[value];
  }

  static char(key: string): boolean {
    let value = key.charCodeAt(0);
    return keys[value];
  }

  static get down(): boolean {
    return count != 0;
  }

  private constructor() { }
}

export class KeyboardService implements Service {
  get name() { return "Keyboard"; }

  private static translate(key: number): number{
    return (key >= 97 && key <= 122) ? key-32 : key;
  }

  private down(event: KeyboardEvent) {
    if (event.repeat)
      return;
    let key = KeyboardService.translate(event.keyCode);
    if (keys[key])
      return;
    count++;
    keys[key] = true;
  }

  private up(event: KeyboardEvent) {
    let key = KeyboardService.translate(event.keyCode);
    keys[key] = false;   
    count--;
  }

	initiate(): void {
    document.onkeydown = this.down;
    document.onkeyup = this.up;

    for (let i = 0; i < keys.length; i++)
      keys[i] = false;
  }

  prepare(): void { }
  process(): void { }
}
