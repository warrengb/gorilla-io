
let handles = new Array<Handle>();
let available = new Array<Handle>();
let serial = 0;

export class Handle {

	get valid(): boolean {
		if (this.id == 0 || !this.object)
			return false;
		return this.id == handles[this.index].id;
	}

	get value(): Object | undefined {
    return this.valid ? this.object : undefined;
	}

	destroy(): void {

		if (this.id != 0) {
			this.id = 0;
			available.push(this);
		}
	}

	static create(object: Object): Handle {

		let handle = available.pop();

		if (!handle) {
			handle = new Handle(++serial, object, handles.length);
			handles.push(handle);
		}
		else {
			handle.id = ++serial;
			handle.object = object;
		}

		return handle;
	}

	private constructor(private id: number,  private object:Object, private readonly index: number) {
	}
}
