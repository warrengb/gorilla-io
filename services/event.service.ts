import { Service } from '../vision/stage';

let events: Object[] = [];
let pending: Object[] = [];
let serial = 0;

interface Listener<T extends Object> {
  (event: T): void;
}

class Ear {
  token: number;
  constructor(public listener: Listener<Object>) {
    this.token = ++serial;
  }
}

let listeners: Ear[][] = [];

export class Event {

  private static _ordinal = 0;

  static ordinal(prototype: any): number {
    if (prototype._Event_ordinal == undefined)
      prototype._Event_ordinal = Event._ordinal++;
    return prototype._Event_ordinal;
  }

  static listen(T:any, listener: any): number {
    let index = Event.ordinal(T.prototype);
    if (listeners[index] == null)
      listeners[index] = [];

    let ear = new Ear(listener);
    listeners[index].push(ear);

    return ear.token;
  }

  static cancel(T:any, token: number): void {
    let index = Event.ordinal(T.prototype);
    let ears: Ear[] = [];
    for (let i = 0; i < listeners[index].length; i++) {
      if (listeners[index][i].token != token)
        ears.push(listeners[index][i]);
    }
    listeners[index] = ears; 
  }

  static clear(T: any): void {
    let index = Event.ordinal(T.prototype);
    listeners[index] = [];  
  }

  static emit(event: Object) {
    pending.push(event);
  }

  private constructor() { }
}

export class EventService implements Service {
  get name() { return "Command"; }

  initiate(): void { }
  prepare(): void { }

  process(): void {

    if (pending.length > 0) {
      events = events.concat(pending);
      pending = [];
    }

    for (let event of events) {
      let compact = 0;
      let index = Event.ordinal(Object.getPrototypeOf(event))
      for (let ear of listeners[index]) {
        if (!ear )
          compact++;
        else
          ear.listener(event);
      }
      if (compact > 0) {
        if (compact == listeners[index].length) {
          listeners[index] = [];
        }
        else {
          let redo: Ear[] = [];
          for (let ear of listeners[index]) {
            if (ear != null)
              redo.push(ear);
          }
          listeners[index] = redo;
        }
      }
    }

    events = [];
  }
}
