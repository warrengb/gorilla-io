export class SliceSelectedEvent {
	constructor(
		public readonly name: string,
		public readonly index: number,
		public readonly color: string
	) {}
}

export namespace Navigate {
  export enum Command {
    Home,
    Reset,
    Next,
    Prior
  }

  export class Event {
    constructor(public readonly command: Command) { }
  }
}


