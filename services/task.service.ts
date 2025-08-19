import { Stage, Service } from '../vision/stage';

let pending: Task[] = [];

export class Task {
  private _id: number;
  _age: number = 0;
  _tick: number = 0;
  private _valid = true;

  private static generator = 0;

  get id(): number { return this._id; }
  get age(): number { return this._age; }
  get tick(): number { return this._tick; }
  get running(): boolean { return this._valid; }
  cancel(): void { this._valid = false; }

  static run(iterator: IterableIterator<number>, wait: number = 0): Task {
    return new Task(iterator, wait);
  }

  constructor(public readonly iterator: IterableIterator<number>, public wait: number) {
    this._id = ++Task.generator;
    pending.push(this);
  }
}

export class TaskService implements Service {
  get name() { return "Task"; }
  private tasks: Task[] = [];

  prepare(): void { }
  initiate(): void { }

  process(): void {
    let compact = false;

    if (pending.length > 0) {
      this.tasks = this.tasks.concat(pending);
      pending = [];
    }

    for (let i = 0; i < this.tasks.length; i++) {
      let task = this.tasks[i];

      if (task == null)
        continue;

      if (task.wait === undefined)
        task.wait = 0;

      task._age += Stage.delta;

      if (task.wait > 0) {
        task.wait -= Stage.delta;
        if (task.wait > 0)
          continue;
      }

      if (!task.running) {
        compact = true;
        this.tasks[i].cancel();
        continue;
      }

      let result = task.iterator.next();

      if (result.done) {
        compact = true;
        this.tasks[i].cancel();
      }

      task.wait = (result.value === null) ? 0 : result.value;
      task._tick++;
    }

    if (compact) {
      let compacted_tasks = new Array<Task>();

      for (let t of this.tasks) {
        if (t != null) {
          compacted_tasks.push(t);
        }

        this.tasks = compacted_tasks;
      }
    }
  }
}
