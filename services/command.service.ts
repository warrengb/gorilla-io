import { Service } from '../vision/stage';

class Cmd{
	constructor(
		public readonly ordinal: number,
		public readonly command: string,
		public readonly argument: Object) {
	}
}

let commands: Cmd[] = [];
let pending: Cmd[] = [];
let serial = 0;
interface Lookup {
  [key: string]: number;
}

let lookup: Lookup = {};

interface Controller<T extends Object> {
	(command: string, argument:T): void;
}

class Eye {
	token: number;
	constructor(public controller: Controller<Object>) {
		this.token = ++serial;
	}
}

let observers: Eye[][] = [];

export class Command {

	private static _ordinal = 1;
	
	static ordinal(command: string): number {
    let ordindal = lookup[command];
		if (!ordindal)
			lookup[command] = ordindal = Command._ordinal++;
		return ordindal;
	}

	static control(command: string, controller: Controller<Object>): number {
		let index = Command.ordinal(command);
		if (!observers[index])
			observers[index] = [];

		let eye = new Eye(controller);
		observers[index].push(eye);

		return eye.token;
	}

  static cancel(command: string, token: number): void {
    let index = Command.ordinal(command);
    let eyes: Eye[] = [];
    if (index) {
      for (let i = 0; i < observers[index].length; i++) {
        if (observers[index][i].token != token)
          eyes.push(observers[index][i]);
      }
      observers[index] = eyes;
    }
  }

	static clear(command: string): void {
    let index = Command.ordinal(command);
    if(index)
      observers[index] = [];
	}

	static fire(command: string, argument: Object) {
    let index = Command.ordinal(command);
    if (index)
		  pending.push(new Cmd(index, command, argument));
	}
}

export class CommandService implements Service {
  get name() { return "Command"; }

  initiate(): void { }
  prepare(): void { }

	process(): void {
		if (pending.length > 0) {
			commands = commands.concat(pending);
			pending = [];
		}

		for (let cmd of commands) {
			let compact = 0;
			let index = cmd.ordinal;
			for (let eye of observers[index]) {
				if (!eye)
					compact++;
        else
          if (eye.controller)
					    eye.controller(cmd.command, cmd.argument);
			}
			if (compact > 0) {
				if (compact == observers[index].length) {
					observers[index] = [];
				}
				else {
					let redo: Eye[] = [];
					for (let eye of observers[index]) {
						if (eye != null)
							redo.push(eye);
					}
					observers[index] = redo;
				}
			}
		}

		commands = [];
	}
}
