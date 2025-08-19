import { Service } from '../vision/stage';
import { Node } from '../vision/node';
import { Event } from '../services/event.service';

export namespace Fetch {
  export enum Command {
    Landed,
    Begin,
    End
  }

  export class Event {
    constructor(public readonly command: Command, public readonly downloading: Resource[] | undefined = undefined) { }
  }
}

export abstract class Resource {
//  protected source: string = null;

  protected _error!: string;
  get error() { return this._error; }

  private _length: number = 0;
  get length() { return this._length; }
  private _progress: number = 0;
  get progress() { return this._progress; }

  get url() { return AssetService.url(this.name, this.type, this.folder); }

  _loaded = false;
  get loaded() { return this._loaded; }

  abstract get ready(): boolean;
  abstract get type(): string;
  abstract get format(): XMLHttpRequestResponseType;
  abstract assemble(response: any): void;

  protected static pending: Resource[] = [];
  private static _fetching: Resource[] = [];
  private static landing: Resource[] = [];
  protected static root: Node<Resource> = new Node<Resource>("root");

  static get fetching(): Readonly<Resource[]> { return Resource._fetching; }

  public fetch() {
    let that = this;
    Resource._fetching.push(that);
    let request = new XMLHttpRequest();
    request.open("GET", that.url);
    request.responseType = that.format;

    request.onload = e => {
      if (request.status == 200) {
        that.assemble(request.response);
        Resource.landing.push(that);
      }
      else {
        that._error = request.responseText;
      }
    };

    request.onerror = e => {
      that._error = 'network failure';
    };

    request.onprogress = e => {
      if (e.lengthComputable) {
        that._length = e.total;
        that._progress = e.loaded / e.total * 100;
      }
    };

    request.send();
  }

  static get<T extends Resource>(T: any, name: string, folder: string[] = []): T {
    let path = [name, T.TYPE];
    if (folder)
      path = folder.concat(path);

    let node = Resource.root.node(path);

    if (node && !node.data) {
      let data = new T(name, folder);
      node.data = data;
      Resource.pending.push(data);
    }

    return <T><any>node.data;
  }

  static process() {
    if (Resource.pending.length) {
      let begin = Resource._fetching.length === 0;
      for (let r of Resource.pending)
        r.fetch();
      Resource.pending = [];
    }

    if (Resource.landing.length) {
      for (let r of Resource.landing)
        r._loaded = !r.error;

      let fetching: Resource[] = [];
      for (let r of Resource._fetching) {
        if (!r.ready) {
          fetching.push(r);
        }
      }
      Resource._fetching = fetching;  
      Resource.landing = [];
    }
  }

  protected constructor(public readonly name: string, public readonly folder: string[] = []) {
  }
}

export class AssetService implements Service {
  get name() { return "Asset"; }

  static url(name: string, type: string, folder: string[] = []): string {
    let path = "assets/";
    if (folder)
      path += folder.join('/') + '/';
    return path + name + '.' + type;
  }

  prepare(): void { }
  initiate(): void {}

  process(): void {
    Resource.process();
  }
}
