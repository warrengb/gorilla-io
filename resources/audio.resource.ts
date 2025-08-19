import { Resource, AssetService } from '../services/asset.service';

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export abstract class AudioResource extends Resource {

  private static _context: AudioContext;
  private static _gain: GainNode;
  audio!: AudioBuffer;

  get format(): XMLHttpRequestResponseType { return "arraybuffer"; }

  static get context() { return this._context; }
  static get gain() { return this._gain.gain.value; }
  static set gain(value: number) {
    this._gain.gain.value = value;
  }

  assemble(response: any): void {
    let that = this;
    AudioResource.context.decodeAudioData(response,
      function (buffer) {
        that.audio = buffer;
      },
      function (e) {
        that._error = "Error: " + e.cause + " " + e.message
      }
    );
  }

  private _duration = 0;
  get duration(): number { return this._duration; }

  create(): AudioBufferSourceNode {
    AudioResource.context.resume();
    let source = AudioResource.context.createBufferSource();
    source.buffer = this.audio;
    source.connect(AudioResource.context.destination);
    source.connect(AudioResource._gain);
    AudioResource._gain.connect(AudioResource.context.destination);
    this._duration = this.audio.duration * 1000;
    return source;
  }

  constructor(name: string, folder: string[]) {
    super(name, folder);
    if (!AudioResource._context) {
      AudioResource._context = new (window.AudioContext || window.webkitAudioContext)();
      AudioResource._gain = AudioResource._context.createGain();
    }
  }
}

export class SoundResource extends AudioResource {
  get type() { return "wav"; }
  get ready() { return this.loaded; }
  constructor(name: string, folder: string[]) {
    super(name, folder);
  }
}

export class TrackResource extends AudioResource {
  get type() { return "mp3"; }
  get ready() { return this.loaded; }
  constructor(name: string, folder: string[]) {
    super(name, folder);
  }
}
