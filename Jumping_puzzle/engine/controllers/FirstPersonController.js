import { quat, vec3, mat4 } from 'glm';
import { Transform } from '../core/Transform.js';

export class FirstPersonController {
  constructor(
    node,
    domElement,
    {
      pitch = 0,
      yaw = 0,
      velocity = [0, 0, 0],
      acceleration = 150,
      maxSpeed = 7,
      decay = 0.99999,
      pointerSensitivity = 0.002,
      gravity = -9.81,
      jumpSpeed = 5,
    } = {}
  ) {
    this.node = node;
    this.domElement = domElement;
    this.keys = {};

    // Basic camera angles
    this.pitch = pitch;
    this.yaw = yaw;

    // Horizontal movement
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.decay = decay;
    this.pointerSensitivity = pointerSensitivity;

    // Jumping and gravity
    this.gravity = gravity;
    this.jumpSpeed = jumpSpeed;
    this.verticalVelocity = 0;
    this.isOnGround = true;

    this.initHandlers();
  }

  initHandlers() {
    this.pointermoveHandler = this.pointermoveHandler.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.keyupHandler = this.keyupHandler.bind(this);

    const element = this.domElement;
    const doc = element.ownerDocument;

    // Keyboard events
    doc.addEventListener('keydown', this.keydownHandler);
    doc.addEventListener('keyup', this.keyupHandler);

    // Pointer lock
    element.addEventListener('click', () => element.requestPointerLock());
    doc.addEventListener('pointerlockchange', () => {
      if (doc.pointerLockElement === element) {
        doc.addEventListener('pointermove', this.pointermoveHandler);
      } else {
        doc.removeEventListener('pointermove', this.pointermoveHandler);
      }
    });
  }

  update(t, dt) {
    // Calculate forward/right unit vectors (on XZ plane)
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    const forward = [-sin, 0, -cos];
    const right = [cos, 0, -sin];

    // Build acceleration vector from keyboard input
    const acc = vec3.create();
    if (this.keys['KeyW']) vec3.add(acc, acc, forward);
    if (this.keys['KeyS']) vec3.sub(acc, acc, forward);
    if (this.keys['KeyD']) vec3.add(acc, acc, right);
    if (this.keys['KeyA']) vec3.sub(acc, acc, right);

    // Apply horizontal acceleration
    vec3.scaleAndAdd(this.velocity, this.velocity, acc, dt * this.acceleration);

    // If no input, apply decay to slow down
    if (!this.keys['KeyW'] && !this.keys['KeyS'] && !this.keys['KeyD'] && !this.keys['KeyA']) {
      const decayFactor = Math.exp(dt * Math.log(1 - this.decay));
      vec3.scale(this.velocity, this.velocity, decayFactor);
    }

    // Limit horizontal speed
    const speed = vec3.length(this.velocity);
    if (speed > this.maxSpeed) {
      vec3.scale(this.velocity, this.velocity, this.maxSpeed / speed);
    }

    // Gravity for jumping/falling
    if (!this.isOnGround) {
      this.verticalVelocity += this.gravity * dt;
    }

    // Get transform component to move/rotate our camera or object
    const transform = this.node.getComponentOfType(Transform);
    if (transform) {
      // Horizontal movement
      vec3.scaleAndAdd(transform.translation, transform.translation, this.velocity, dt);

      // Vertical movement
      transform.translation[1] += this.verticalVelocity * dt;

    // Instead of transform.translation[1] <= 0, do:
    const cameraFloorY = 8.974434852600098;

    if (transform.translation[1] <= cameraFloorY) {
    transform.translation[1] = cameraFloorY;
    this.verticalVelocity = 0;
    this.isOnGround = true;
    }


      // Update rotation from pitch/yaw
      const rotation = quat.create();
      quat.rotateY(rotation, rotation, this.yaw);
      quat.rotateX(rotation, rotation, this.pitch);
      transform.rotation = rotation;
    }
  }

  pointermoveHandler(e) {
    // Mouse look
    this.pitch -= e.movementY * this.pointerSensitivity;
    this.yaw -= e.movementX * this.pointerSensitivity;

    // Clamp pitch between -90° and +90°
    const halfpi = Math.PI / 2;
    this.pitch = Math.max(-halfpi, Math.min(halfpi, this.pitch));

    // Keep yaw within 0..2π
    const twopi = 2 * Math.PI;
    this.yaw = ((this.yaw % twopi) + twopi) % twopi;
  }

  keydownHandler(e) {
    this.keys[e.code] = true;
    // Jump if Space is pressed and we're on ground
    if (e.code === 'Space' && this.isOnGround) {
      this.verticalVelocity = this.jumpSpeed;
      this.isOnGround = false;
    }
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }
}
