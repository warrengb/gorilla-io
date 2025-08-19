import * as THREE from 'three';
import { Stage } from '../../../vision/stage';

export class Camera {

  radius = 3;
  target = new THREE.Vector3();
  sensitivity = new THREE.Vector2(1, 1 * 0.8);
  targetRadius = 1;
  public theta = 0;
  public phi = 0;

  public movementSpeed = 0.06;
  public upVelocity = 0;
  public forwardVelocity = 0;
  public rightVelocity = 0;

  clock = new THREE.Clock();

  constructor(public readonly camera: THREE.Camera) {
    //this.camera.matrixWorld[8] = 0;
    //this.camera.matrixWorld[9] = 0;
    //this.camera.matrixWorld[10] = 0;
  }

  steer(up: boolean, right: boolean, down: boolean, left: boolean, forward: boolean, back: boolean, fast = false) {

    //let delta = this.clock.getDelta();
    let delta = Stage.delta;
    let speed = this.movementSpeed * delta * (fast ? 600 : 60);
    //let speed = .001;

    //let m = this.camera.matrixWorld;

    //const v_up = new THREE.Vector3(m[4], m[5], m[6]);
    //const v_right = new THREE.Vector3(m[0], m[1], m[2]);
    //const v_forward = new THREE.Vector3(-m[8], -m[9], -m[10]);

    //this.upVelocity = THREE.MathUtils.lerp(this.upVelocity, +up - +down, 0.3);
    //this.forwardVelocity = THREE.MathUtils.lerp(this.forwardVelocity, +forward - +back, 0.3);
    //this.rightVelocity = THREE.MathUtils.lerp(this.rightVelocity, +right - +left, 0.3);

    //let u = v_up.multiplyScalar(speed * this.upVelocity);
    //let r = v_right.multiplyScalar(speed * this.rightVelocity);
    //let f = v_forward.multiplyScalar(speed * this.forwardVelocity);
    //this.target.add(u);
    //this.target.add(r);
    //this.target.add(f);

    this.target.x += right ? 1 : left ? -1 : 0;
    this.target.y += down ? 1 : up ? -1 : 0;
    this.target.z += back ? 1 :forward  ? -1 : 0;

    //this.target.x += this.forwardVelocity;
    //this.target.y += this.forwardVelocity;
    //this.target.z += this.forwardVelocity;

    let a = 0;
  }

  update() {
    this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, 0.1);
    this.camera.position.x = this.target.x + this.radius * Math.sin(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
    this.camera.position.y = this.target.y + this.radius * Math.sin(this.phi * Math.PI / 180);
    this.camera.position.z = this.target.z + this.radius * Math.cos(this.theta * Math.PI / 180) * Math.cos(this.phi * Math.PI / 180);
    this.camera.updateMatrix();
    this.camera.lookAt(this.target);
  }

  move(deltaX: number, deltaY: number): void {
    this.theta -= deltaX * (this.sensitivity.x / 2);
    this.theta %= 360;
    this.phi += deltaY * (this.sensitivity.y / 2);
    this.phi = Math.min(85, Math.max(-85, this.phi));
  }
}
