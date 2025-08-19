import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Scene } from '../../services/scene.service';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Keyboard } from '../../services/keyboard.service';
import { Pointer } from '../../services/pointer.service';

export class CharacterScene extends Scene {
  display = Display.get("three");
  pointer = new Pointer(this.display);
  render!: Render;
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  geometry!: THREE.GeometryGroup;
  material!: THREE.Material;
  mesh!: THREE.Material;
  renderer!: THREE.WebGLRenderer;
  buffer!: HTMLCanvasElement;
  done = false;
  ready = false;

  clock = new THREE.Clock();
  model!: THREE.Object3D<THREE.Object3DEventMap> | THREE.AnimationObjectGroup;
  neck: any;
  waist: any;
  animations!: THREE.AnimationClip[];
  ambient!: THREE.AmbientLight ;

  mixer!: THREE.AnimationMixer;
  idleAnim!: THREE.AnimationAction;
  walkAnim!: THREE.AnimationAction;
  runAnim!: THREE.AnimationAction;
  slideAnim!: THREE.AnimationAction;
  hurtAnim!: THREE.AnimationAction;
  jumpAnim!: THREE.AnimationAction;
  nextAnim: THREE.AnimationAction | undefined = undefined;
  currentAnim!: THREE.AnimationAction;

  init() {
    this.camera = new THREE.PerspectiveCamera(75, 2, .1, 5);
    this.camera.position.z = 2;
    this.buffer = <HTMLCanvasElement>document.createElement('canvas');
    this.buffer.width = 480 * 2;
    this.buffer.height = 270 * 2;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.buffer, alpha: true, antialias: true });

    this.camera = new THREE.PerspectiveCamera(75, 2, .1, 5);
    this.camera.position.z = 2;

    this.scene = new THREE.Scene();
    this.scene.background = null;//new THREE.Color(0xf1f1f1);

    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    this.ambient = new THREE.AmbientLight(0xf0f0f0);
    this.scene.add(this.ambient);
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // const loadManager = new THREE.LoadingManager();

    var loader = new GLTFLoader();

    const GLB = "assets/3d/models/mouse.glb";
    //const GLB = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
    loader.load(GLB, g => {
      this.model = g.scene;
      this.scene.add(this.model);
      this.model.scale.set(1, 1, 1);
      //this.model.position.y = -11;
      this.model.position.x = -1;
      this.model.traverse((o: any) => {
        if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
        }
        // Reference the neck and waist bones
        if (o.isBone && o.name === 'mixamorigNeck') {
          this.neck = o;
        }
        if (o.isBone && o.name === 'mixamorigSpine') {
          this.waist = o;
        }
      });
      this.mixer = new THREE.AnimationMixer(this.model);
      this.animations = g.animations;
      this.idleAnim = this.getAnim('idle');
      this.walkAnim = this.getAnim('walk');
      this.runAnim = this.getAnim('run');
      this.slideAnim = this.getAnim('slide');
      this.hurtAnim = this.getAnim('hurt');
      this.jumpAnim = this.getAnim('jump');
      this.idleAnim.play();

      this.render = new Render(r => this.draw(), this.display);
      this.ready = true;
    });
  }

  getAnim(name: string): THREE.AnimationAction {
    const clip = THREE.AnimationClip.findByName(this.animations, name);
    if (clip) {
      clip.tracks.splice(3, 3);
      clip.tracks.splice(9, 3);
      return this.mixer.clipAction(clip);
    }
    console.warn(`Animation '${name}' not found`);
    return this.mixer.clipAction(new THREE.AnimationClip(name, -1, []));  
  }

  draw() {
    const delta = this.clock.getDelta();
    this.mixer.update(delta);
    // const time = Stage.time * 0.0005;
    this.renderer.render(this.scene, this.camera);
    this.display.context.drawImage(this.buffer, -this.display.halfWidth, -this.display.halfHeight);
  }

  moveJoint(x: number, y: number, joint:any, degreeLimit: number) {
    let degrees = this.getMouseDegrees(x, y, degreeLimit);
    joint.rotation.y = degrees.x * (Math.PI / 180);
    joint.rotation.x = degrees.y * (Math.PI / 180);
    //console.log("joint.rotation.x " + joint.rotation.x);
  }

  getMouseDegrees(x: number, y: number, degreeLimit: number) {
    x += 512;
    y += 512;
    let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)
    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = xdiff / (w.x / 2) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = degreeLimit * xPercentage / 100 * -1;
    }

    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = xdiff / (w.x / 2) * 100;
      dx = degreeLimit * xPercentage / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = ydiff / (w.y / 2) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = degreeLimit * 0.5 * yPercentage / 100 * -1;
    }
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = ydiff / (w.y / 2) * 100;
      dy = degreeLimit * yPercentage / 100;
    }
    return { x: dx, y: dy };
  }

  *run(): IterableIterator<number> {
    console.log("three run");

    while (true) {
      if (this.pointer.move) {
        this.moveJoint(this.pointer.x, this.pointer.y, this.neck, 50);
        this.moveJoint(this.pointer.x, this.pointer.y, this.waist, 50);
      }
      if (!this.nextAnim) {
        if (Keyboard.down) {
          console.debug("key down");
          if (Keyboard.char('1')) this.nextAnim = this.walkAnim; else
            if (Keyboard.char('2')) this.nextAnim = this.runAnim; else
              if (Keyboard.char('3')) this.nextAnim = this.slideAnim; else
                if (Keyboard.char('4')) this.nextAnim = this.hurtAnim; else
                  if (Keyboard.char('5')) this.nextAnim = this.jumpAnim;
        }
        if (this.nextAnim) {
          this.nextAnim.setLoop(THREE.LoopOnce, 0);
          this.nextAnim.reset();
          this.nextAnim.play();
          this.idleAnim.crossFadeTo(this.nextAnim, .25, true);
          const toSpeed = .25;
          const fromSpeed = .25;
          yield this.nextAnim.getClip().duration * 1000 - (toSpeed + fromSpeed) * 1000;
          this.idleAnim.enabled = true;
          this.nextAnim.crossFadeTo(this.idleAnim, toSpeed, true);
          this.currentAnim = this.nextAnim;
          this.nextAnim = undefined;
        }
      }
      yield 50;
    }
  }

  destroy() {
    this.done = true;
    if (this.render)
      this.render.remove();
  }

  *enter(): IterableIterator<number> {
    console.log("3D enter");
    this.init();
    while (!this.ready)
      yield 200;
  }

  *exit(): IterableIterator<number> {
    this.destroy();
    console.log("three exit");
  }

  constructor() {
    super("three");
    this.initializeTasks(this.run(), this.enter(), this.exit());
  }
}
