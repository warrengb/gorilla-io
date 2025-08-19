let Stage_ticks: Stage.Tick[] = [];

export interface Update { (): void; }

export interface Service {

  name: string;
  initiate(): void;
  prepare(): void;
  //terminate(): void;
  process(): void;
}

export class Stage {
  private static _time = 0;
  private static _prior = 0;
  private static _frame = 0;
  private static _delta = 0;
  private static _age = 0;
  private static _rate = 0;
  private static _tick = 0;

  private static step: number;

  static get time(): number { return Stage._time; }
  static get prior(): number { return Stage._prior; }
  static get frame(): number { return Stage._frame; }
  static get delta(): number { return Stage._delta; }
  static get rate(): number { return Stage._rate; }
  static get age(): number { return Stage._age; }
  static get tick(): number { return Stage._tick; }

  static get now(): number { return performance.now(); }
  static get start(): number { return performance.timeOrigin; }

  private static services: Service[] = [];

  private static framerate = ((): () => void => {
    let frame_accumulator = 0;
    let delta_accumulator = 0;
    let calculate: () => void = function (): void {
      frame_accumulator++;
      delta_accumulator += Stage.delta;
      if (delta_accumulator >= 1000) {
        Stage._rate = frame_accumulator;
        delta_accumulator = 0;
        frame_accumulator = 0;
      }
    }
    return calculate;
  })();

  private static timestamp(): void {
    let now = Stage.now;
    Stage._prior = Stage._time;
    Stage._time = now;
    Stage._delta = now - Stage._prior;
    Stage._frame++;
  }

  private static cycle(): void {
    Stage.step = requestAnimationFrame(Stage.cycle);
    Stage._tick++;
    Stage.timestamp();
    Stage.framerate();

    for (let t of Stage_ticks)
      if (t.update)
        t.update();

    for (let s of Stage.services)
      s.prepare();
    for (let s of Stage.services)
      s.process();
  }

  static terminate(): void {
    cancelAnimationFrame(Stage.step);
  }

  static initiate(services: Service[]): void {
    window.addEventListener('unload', _=> Stage.terminate);
    Stage.services = services;
    Stage.timestamp();
    Stage.framerate();

    console.log("Stage initiating...");
    let names: string[] = [];
    for (let s of Stage.services) {
      s.initiate();
      names.push(s.name);
    }
    console.log("Services initiatied: " + names.join(', ') + ".");

    Stage.step = requestAnimationFrame(Stage.cycle);
  }
}

export namespace Stage {
  export class Tick {
    destroy(): void {
      let index = Stage_ticks.findIndex(t => t == this);
      if (index > -1)
        Stage_ticks.splice(index, 1);
    }
    constructor(public update: Update | undefined = undefined) {
      Stage_ticks.push(this);
    }
  }
}
