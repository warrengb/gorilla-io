import { Service } from '../vision/stage';
import { Stage } from '../vision/stage';

class Queue {
  static queue: Queue[] = [];

  static add(scene: Scene, command: Queue.Command, prior: Scene | undefined = undefined): void {
    for (let q of Queue.queue) {
      if (scene.name == q.scene.name) {
        console.warn("Scene '${scene.name}' is already in queue.");
        return;
      }
    }
    Queue.queue.push(new Queue(scene, command, prior));
  }

  static clear(): void {
    Queue.queue = [];
  }

  private constructor(public readonly scene: Scene, public readonly command: Queue.Command, public readonly prior: Scene | undefined = undefined) { }
}

namespace Queue {

  export enum Command {
    Activate,
    Pending,
    Reset,
    Shutdown
  }
}

class Task {
  age: number = 0;
  wait: number = 0;
  running = false;
  iterator!: IterableIterator<number>

  run(iterator: IterableIterator<number>): void {
    this.iterator = iterator;
    this.running = true;
    this.age = 0;
    this.wait = 0;
  }

  update(): boolean {
    if (!this.running)
      return false;

    if (this.wait === undefined)
      this.wait = 0;

    if (this.wait > 0) {
      this.wait -= Stage.delta;
    }

    if (this.wait <= 0) {
      let result = this.iterator.next();
      if (result.done)
        this.running = false;
      else
        this.wait = (result.value === null) ? 0 : result.value;
    }

    return true;
  }
}

export abstract class Scene {

  private static scenes: Scene[] = [];
  private task: Task = new Task();
  private *defaultIterator(): IterableIterator<number> { }
  private _run: IterableIterator<number>;
  private _enter: IterableIterator<number>;
  private _exit: IterableIterator<number>;

  _state!: Scene.State;
  get state() { return this._state; }

  static find(name: string): Scene | undefined{
    for (let scene of Scene.scenes) {
      if (name == scene.name)
        return scene;
      if (scene.next && name == scene.next.name)
        return scene.next;
    }
    return undefined;
  }

  static get<T extends Scene>(name: string): T { return <T>Scene.find(name); }

  static current(level: string): Scene | undefined{
    if (!level)
      return undefined;
    if (level)
      level = level.toLowerCase();
    for (let scene of Scene.scenes)
      if (level == scene.level)
        return scene;
    return undefined;
  }

  static destroy() {
    Queue.clear();
    Scene.scenes = [];
  }

  abstract destroy(): void;

  static activate<T extends Scene>(T:any, args: string[] = []): T | undefined {
    let pending = new T(args);
    let found = Scene.find(pending.name);
    if (found && Scene.State.Running != Scene.State.Running) {
        console.warn("Can't activate Scene " + found.name + " while in " + Scene.State[found.state] + " state.");
      return undefined;
    }
 
    let current = Scene.current(pending.level);
    if (current) {
      if (Scene.State.Running == current.state) {
        Queue.add(pending, Queue.Command.Pending, current);
      }
      else {
        console.warn("Can't activate Scene " + pending.name + " at Level " + pending.level + " while current " + current.name + " in " + Scene.State[current.state] + " state.");
        return undefined;
      }
    }
    else {
      Queue.add(pending, Queue.Command.Activate, current);
    }

    return pending;
  }

  static process(): void {
    for (let queue of Queue.queue) {
      switch (queue.command) {
        case Queue.Command.Activate:
          if (queue.prior)
             queue.scene._prior = queue.prior;
          queue.scene._state = Scene.State.Entering;
          queue.scene.task.run(queue.scene._enter);
          Scene.scenes.push(queue.scene);
          break;

        case Queue.Command.Pending:  
          queue.scene._state = Scene.State.Pending;
          if (queue.prior) {
            queue.scene._prior = queue.prior;
            queue.prior._next = queue.scene;
            queue.prior._state = Scene.State.Exiting;
            queue.prior.task.run(queue.prior._exit);
          }
            
          Scene.scenes.push(queue.scene);
          break;

        case Queue.Command.Shutdown:
          queue.scene._state = Scene.State.Exiting;
          queue.scene.task.run(queue.scene._exit);
          break;
      }
    }
    Queue.clear();

    let cleanup = false;
    for (let i = 0; i < Scene.scenes.length; i++) {
      let scene = Scene.scenes[i];
      switch (scene.state) {
        case Scene.State.Entering:
          if (!scene.task.update()) {
            scene._state = Scene.State.Running;
            scene.task.run(scene._run);
          }
          break;

        case Scene.State.Running:
          scene.task.update();
          break;

        case Scene.State.Exiting:
          if (!scene.task.update()) {
            scene._state = Scene.State.Closed
            cleanup = true;
            if (scene.next) {
              scene.next._prior = scene;
              scene.next._state = Scene.State.Entering;
              Scene.scenes[i] = scene.next;
              scene.next.task.run(scene.next._enter);
            }
          }
          break;
      }
    }

    if (cleanup) {
      Scene.scenes = Scene.scenes.filter(s => s.state != Scene.State.Closed);
    }
  }

  private _next!: Scene;
  private _prior!: Scene;
  get next(): Scene { return this._next; }
  get prior(): Scene { return this._prior; }

  protected initializeTasks(
    run: IterableIterator<number>,
    enter: IterableIterator<number>,
    exit: IterableIterator<number>) {
    if (run) this._run = run;
    if (enter) this._enter = enter;
    if (exit) this._exit = exit;
  }

  constructor(public readonly name: string, public readonly level: string = "", public readonly args: string[] = []) {
    this.name = name.toLowerCase();
    this.level = !level ? this.name : level.toLowerCase();
    this._run = this.defaultIterator();
    this._enter = this.defaultIterator();
    this._exit = this.defaultIterator();
  }
}

export namespace Scene {
  export enum State {
    Closed = 0,
    Pending,
    Entering,
    Exiting,
    Running
  }
}

export class SceneService implements Service {
  get name() { return "Scene"; }

  prepare(): void { }
  initiate(): void { }

  process(): void {
    Scene.process();
  }
}
