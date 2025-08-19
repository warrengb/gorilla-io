
import { TrackResource, SoundResource, AudioResource } from '../resources/audio.resource';
import { Resource } from '../services/asset.service';
import { Stage } from '../vision/stage';

export class Audio {
  private audioResource: AudioResource;
  private audio!: AudioBufferSourceNode;
  private time = 0;

  static get mute() { return AudioResource.gain == -1; }
  static set mute(on: boolean) { AudioResource.gain = on ? -1 : 1; }

  get ready() { return this.audioResource.ready; }
  get duration() { return this.end ? this.end - this.begin : this.audioResource.duration - this.begin; }

  static get available() {
    return !(typeof window.AudioContext == "undefined" && typeof window.webkitAudioContext == "undefined");
  }

  get playing() { //issue - this needs to be reworked to sync rate changes
    if (!this.time)
      return 0;

    let elapsed = Stage.now - this.time;
    if (elapsed >= this.duration)
      this.time = 0;

    return this.time;
  }

  private _paused = 0;
  get paused() { return this._paused; }

  private _play(start = 0): void {
    if (!this.ready) return;

    this.audio = this.audioResource.create();
    this.audio.loop = this.loop;
    if (this.loop) {
      this.audio.loopStart = this.begin / 1000;
      this.audio.loopEnd = this.end / 1000;
      this.audio.start(0, start / 1000);
    }
    else {
      this.audio.start(0, start / 1000 + this.begin / 1000, this.end ? this.end / 1000 : this.audioResource.duration);
    }

    this.time = Stage.now;
  }

  _stop() {
    if (this.time == 0)
      return;
    this.time = 0;
    if (this.audio)
      this.audio.stop();
  }

  play() {
    if (this.loop) {
      this._stop();
    }
    this._play();
  }

  pause() {
    if (this.playing) {
      this._paused = Stage.now - this.time;
      this.stop();
    }
  }

  resume() {
    if (this._paused) {
      this._play(this._paused);
    }
  }

  stop(): void {
    this._stop();
  }

  constructor(resourceType: typeof AudioResource, public readonly name: string, folder: string[], public readonly loop = false, public readonly begin = 0, public readonly end = 0) {
    this.audioResource = Resource.get(resourceType, name, folder)
  }
}

export class Sound extends Audio {
  constructor(name: string, folder: string[], loop = false, begin = 0, end = 0) {
    super(SoundResource, name, folder, loop, begin, end);
  }
}

export class Track extends Audio {
  constructor(name: string, folder: string[], loop = false, begin = 0, end = 0) {
    super(TrackResource, name, folder, loop, begin, end);
  }
}
