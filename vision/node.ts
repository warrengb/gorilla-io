export interface Create<T> {
  (): T;
}

export class Node<T> {
  private _name: string;
  private _index: number = -1;
  private _parent: Node<T> | undefined = undefined;
  private _children: Node<T>[] = [];
  private _depth: number = 0;
  
  constructor(name: string, public data: T | undefined = undefined) {
    this._name = name;
    this.data = data;
  }
  
  get name(): string { return this._name; } 
  get index(): number { return this._index; }
  get parent(): Node<T> | undefined { return this._parent; }
  get children(): Node<T>[] { return this._children; }
  get depth(): number { return this._depth; }
   
  get root(): Node<T> {
    let p = this._parent;
    let n: Node<T> = this;
    while (p) { 
      n = p;
      p = p._parent;
    }
    return n;
  }
  
  path(): string[] {
    let result: Array<string> = new Array<string>();
    let parent: Node<T> | undefined = this.parent;
    while (parent) {
      result.push(parent.name);
      parent = parent.parent;
    }
    return result.length ? result : [];
  }
   
  get first(): Node<T> | undefined { return !this._children ? undefined : this._children[0]; }
  get last(): Node<T> | undefined { return !this._children ? undefined : this._children[this._children.length - 1]; }
  get next(): Node<T> | undefined { return this._index === -1 || !this._parent?._children ? undefined : this._index === this._parent?._children?.length - 1 ? undefined : this._parent._children[this._index + 1]; }
  get prior(): Node<T> | undefined { return this._index < 1 ? undefined : this._parent?._children[this._index - 1]; }

  get(name: string): Node<T> | undefined {
    if (this._children) {
      for (let n of this._children) {
        if (n.name === name)
          return n; 
      }
    }
    return undefined;
  } 

  find(path: string[]): Node<T> | undefined {
    if (!path || !path.length)
      return this;

    let n: Node<T> | undefined = this;
    for (let s of path) {
      n = n.get(s);
      if (!n)
        return undefined;
    }

    return n;
  }

  node(path: string[], create: Create<T> | undefined = undefined): Node<T> {
    let n: Node<T> = this;

    if(path)
    for (let s of path) {
      let got = n.get(s);
      n = got ? got : n.add(s);
    }

    if (!n.data && create) {
      n.data = create();
    }

    return n;
  }

  add(name: string, data: T | undefined = undefined): Node<T> {
    return this.link(new Node<T>(name, data));
  }

  insert(name: string, data: T | undefined = undefined, before: Node<T> | undefined = undefined) {
    let node = this.add(name, data);
    return (before == null) ? node : this.move(before.index);
  }

  move(to: number): Node<T> {
    if (this._index < 0 ||
      this._index == to ||
      (!this._parent?.children || to > this._parent.children.length - 1)
    ) return this;

    this._children.splice(this._index, 1);

    if (to < this._index) {
      this._children.splice(to, 0, this);
    }
    else {
      this._children.splice(to - 1, 0, this);
    }

    for (let i = 0; i < this._children.length; i++) {
      this._children[i]._index = i;
    }

    return this;
  }

  link(node: Node<T>): Node<T> {
    if (!this._children)
      this._children = new Array<Node<T>>(node);
    else
      this._children.push(node);
    node._parent = this;
    node._index = this._children.length - 1;
    node._depth = this._parent ? this._parent._depth + 1 : 0;
    return node;
  }

  unlink(): Node<T> | undefined {
    if (!this._parent)
      return undefined;

    this._parent?._children?.splice(this._index, 1);
    this._index = -1;

    if (this._parent?._children?.length == 1) {
      if(this._parent?._children)
        this._parent._children = [];
    }

    this._parent = undefined;
    return this;
  }

  ascend(callback: <T> (type: T, depth: number, index: number) => boolean): boolean {
    if (!callback(this.data, this.depth, this.index))
      return false;
    if (this._children) {
      for (let n of this._children) {
        if (!n.ascend(callback))
          return false;
      }
    }
    return true;
  }

  descend(callback: <T> (type: T, depth: number, index: number) => boolean): boolean {
    if (this._children)
      this.last?.descend(callback);
    if (!callback(this.data, this.depth, this.index))
      return false;
    if (this.prior)
      this.prior?.descend(callback);
    return true;
  }
}
