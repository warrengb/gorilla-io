import { Render } from '../../services/render.service';
import { Display } from '../../vision/display';
import { Scene } from '../../services/scene.service';
import * as THREE from 'three';
//import * as CANNON from 'cannon-es';
//import * as CSM from 'three-csm';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Keyboard } from '../../services/keyboard.service';
import { Pointer } from '../../services/pointer.service';
import { Stage } from '../../vision/stage';

//import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
//import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
//import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
//import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

import * as Utils from '../three/world/utils';
import { Sky } from '../three/world/sky';
import { Camera } from '../three/world/camera';

import { Mouse } from '../../services/pointer.service';

export class ThreeScene extends Scene {
  display = Display.get("three");
  pointer = new Pointer(this.display);
  mouse = new Mouse(this.display);
  render!: Render;

  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  renderer!: THREE.WebGLRenderer;
  cube!: THREE.Mesh;
  ready = false;
  buffer!: HTMLCanvasElement;

  //renderPass!: RenderPass;
  //fxaaPass!: ShaderPass;
  //composer!: EffectComposer;

  //public physicsWorld: CANNON.World;
  //public parallelPairs: any[];
  //public physicsFrameRate: number;
  //public physicsFrameTime: number;
  //public physicsMaxPrediction: number;

  sky!: Sky;
  cam!: Camera;


  init() {
    this.camera = new THREE.PerspectiveCamera(80, 1, 0.1, 1010,);
    this.camera.position.z = 2;
    //this.cam = new Camera(this.camera);

    this.buffer = <HTMLCanvasElement>document.createElement('canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.buffer, alpha: true, antialias: true });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = null;

    //this.renderPass = new RenderPass(this.scene, this.camera);
    //this.fxaaPass = new ShaderPass(FXAAShader);
    let pixelRatio = this.renderer.getPixelRatio();
    //this.fxaaPass.material['uniforms'].resolution.value.x = 1 / (this.display.width * pixelRatio);
    //this.fxaaPass.material['uniforms'].resolution.value.y = 1 / (this.display.height * pixelRatio);

    //this.composer = new EffectComposer(this.renderer);
    //this.composer.addPass(this.renderPass);
    //this.composer.addPass(this.fxaaPass);

    //this.physicsWorld = new CANNON.World();
    //this.physicsWorld.gravity.set(0, -9.81, 0);
    //this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
    ////this.physicsWorld.solver.iterations = 10;
    ////this.physicsWorld.profile.solve = 10;
    //this.physicsWorld.allowSleep = true;
    //this.parallelPairs = [];
    //this.physicsFrameRate = 60;
    //this.physicsFrameTime = 1 / this.physicsFrameRate;
    //this.physicsMaxPrediction = this.physicsFrameRate;


    //this.sky = new Sky(this.scene, this.camera);

    this.resize();

    const light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
    const geometry = new THREE.BoxGeometry(.5, .5, .5);
    const loadManager = new THREE.LoadingManager();
    const txtLoader = new THREE.TextureLoader(loadManager);
    const glbLoader = new GLTFLoader(loadManager);

    const threeD = txtLoader.load('assets/images/three/3d.png');
    const texture = txtLoader.load('assets/images/three/gorilla.png');
    glbLoader.load('assets/3d/models/boxman.glb',
      g => {
        this.scene.add(g.scene);
      }
    );

    //glbLoader.load('assets/3d/models/world.glb',
    //  g => {
    //    this.ready = true;
    //    g.scene.position.y -= 30;
    //    this.scene.add(g.scene);

    //    g.scene.traverse(child => {

    //      if (child.hasOwnProperty('userData')) {
    //        if (child.type === 'Mesh') {
    //          //console.log(child.name);
    //          let mesh = child as THREE.Mesh;

    //          Utils.setupMeshProperties(mesh);
    //          //    this.sky.csm.setupMaterial(mesh.material);
    //        }
    //      }
    //    });
    //  });

    const mat = new THREE.MeshPhongMaterial({ color: 0x44aa88, map: texture, transparent: false, opacity: 1 });
    const mat3 = new THREE.MeshPhongMaterial({ color: 0x44aa88, map: threeD, transparent: false, opacity: 1 });
    const materials = [mat3, mat, mat, mat, mat3, mat];
    loadManager.onLoad = () => {
      this.cube = new THREE.Mesh(geometry, materials);
      this.scene.add(this.cube);
      this.render = new Render(d => this.draw(), this.display, r => this.resize(), false);
    };
  }

  resize() {
    this.renderer.setSize(this.display.width, this.display.height)
    this.buffer.width = this.display.width;
    this.buffer.height = this.display.height;

    let pixelRatio = this.renderer.getPixelRatio();
    //this.fxaaPass.material['uniforms'].resolution.value.x = 1 / (this.display.width * pixelRatio);
    //this.fxaaPass.material['uniforms'].resolution.value.y = 1 / (this.display.height * pixelRatio);
    //this.composer.setSize(this.display.width * pixelRatio, this.display.height * pixelRatio);
  }

  draw() {
    let time = Stage.time * 0.0005;
    this.cube.rotation.x = time;
    this.cube.rotation.y = time;
    //this.renderer.render(this.scene, this.camera);
    //this.composer.render();
    this.display.context.drawImage(this.buffer, 0, 0);
  }

  *run(): IterableIterator<number> {
    console.log("three run");

    while (true) {
      if (Keyboard.down) {
        if (Keyboard.char('Z')) {
          this.display.fullscreen = true;
        }
        else
          if (Keyboard.char('X')) {
            this.display.fullscreen = false;
          }

        //this.cam.steer(
        //  Keyboard.char('Q'), Keyboard.char('D'), Keyboard.char('E'), Keyboard.char('A'),
        //  Keyboard.char('W'), Keyboard.char('S'), Keyboard.key(Keyboard.Shift)
        //);
      }



      //if (this.mouse.pressed && this.mouse.move) {
      //  this.cam.move(this.mouse.deltaX, this.mouse.deltaY);
      //}

      //this.cam.update();
      yield 100;
    }
  }

  destroy() {
    if (this.render)
      this.render.remove();
  }

  *enter(): IterableIterator<number> {
    console.log("3D enter");
    this.init();
    while (!this.ready && !this.render)
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
