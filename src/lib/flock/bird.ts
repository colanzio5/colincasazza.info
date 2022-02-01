import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Material,
  Triangle,
  Vector2,
  Vector3,
} from "three";
import { randomFromRange } from "../util/random";
import { Flock, IFlockConfig } from "./flock";
import { generateUUID } from "three/src/math/MathUtils";

export class BirdConfig {
  id: string = generateUUID();
  // bird constants
  probability: number;
  neighborDistance: number;
  desiredSeparation: number;
  separationMultiplier: number;
  alignmentMultiplier: number;
  cohesionMultiplier: number;
  maxSpeed: number;
  maxForce: number;
  birdSize: number;
  color: Color;

  constructor(props: {
    probability: number;
    neighborDistance: number;
    desiredSeparation: number;
    separationMultiplier: number;
    alignmentMultiplier: number;
    cohesionMultiplier: number;
    maxSpeed: number;
    maxForce: number;
    birdSize: number;
    color: Color;
  }) {
    this.probability = props.probability;
    this.neighborDistance = props.neighborDistance;
    this.desiredSeparation = props.desiredSeparation;
    this.separationMultiplier = props.separationMultiplier;
    this.alignmentMultiplier = props.alignmentMultiplier;
    this.cohesionMultiplier = props.cohesionMultiplier;
    this.maxSpeed = props.maxSpeed;
    this.maxForce = props.maxForce;
    this.birdSize = props.birdSize;
    this.color = props.color;
  }
}

export class Bird {
  // static state
  birdConfig: BirdConfig;
  // dynamic state
  height: number;
  width: number;
  acceleration: Vector2;
  velocity: Vector2;
  position: Vector2;
  // rendering state
  geometry!: BufferGeometry;
  material!: LineBasicMaterial;
  line!: Line;

  get maxSpeed(): number {
    return this.birdConfig.maxSpeed;
  }

  get maxVelocity(): number {
    return this.birdConfig.maxSpeed;
  }

  constructor(
    flock: Flock,
    birdConfig?: BirdConfig,
    options?: { position?: Vector2; acceleration?: Vector2; velocity?: Vector2 }
  ) {
    this.height = flock.height;
    this.width = flock.width;
    this.birdConfig = birdConfig
      ? birdConfig
      : flock.flockConfig.birdConfigs.selectRandom();
    this.position = options?.position
      ? options.position
      : new Vector2(
          randomFromRange(-flock.width, flock.width),
          randomFromRange(-flock.height, flock.height)
        );
    this.velocity = options?.velocity
      ? options.velocity
      : new Vector2(
          randomFromRange(-this.birdConfig.maxSpeed, this.birdConfig.maxSpeed),
          randomFromRange(-this.birdConfig.maxSpeed, this.birdConfig.maxSpeed)
        );
    this.acceleration = options?.acceleration
      ? options.acceleration
      : new Vector2();
    this.applyConfig();
  }

  applyConfig() {
    // create the three stuff needed to render
    this.geometry = new BufferGeometry();
    const vertices = new Float32Array(
      this.getVertices().flatMap((e) => e.toArray().concat(0))
    );
    this.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
    this.material = new LineBasicMaterial({ color: this.birdConfig.color });
    this.line = new Line(this.geometry, this.material);
    this.geometry.center();
  }

  dispose() {
    this.geometry.dispose();
    this.geometry.dispose();
    this.material.dispose();
  }

  getVertices(): Vector2[] {
    // equaliteral trongle math <:)
    const { x, y } = this.position;
    const position = new Vector2(x, y);
    const angle = this.velocity.angle();
    const sideLength = this.birdConfig.birdSize;
    const R = sideLength / (2 * Math.cos(Math.PI / 6));
    const r = Math.tan(Math.PI / 6) * (sideLength / 2);
    return [
      new Vector2(0, R * 2),
      new Vector2(-sideLength / 2, -r),
      new Vector2(sideLength / 2, -r),
      new Vector2(0, R * 2),
    ].map((e) => e.add(position).rotateAround(position, angle));
  }

  run(birds: Bird[]) {
    const { separation, alignment, cohesion } = this.physics(birds);
    // Arbitrarily weight these forces
    separation.multiplyScalar(this.birdConfig.separationMultiplier);
    alignment.multiplyScalar(this.birdConfig.alignmentMultiplier);
    cohesion.multiplyScalar(this.birdConfig.cohesionMultiplier);
    // update physics
    // Add the force vectors to acceleration
    this.acceleration.add(separation).add(alignment).add(cohesion);
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.clampLength(
      -this.birdConfig.maxSpeed,
      this.birdConfig.maxSpeed
    );
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.multiplyScalar(0);
    // wrap birds around borders
    const halfWidth = this.width / 2,
      halfHeight = this.height / 2;
    if (this.position.x < -halfWidth) {
      this.position.x = halfWidth + this.birdConfig.birdSize;
    }
    if (this.position.y < -halfHeight) {
      this.position.y = halfHeight + this.birdConfig.birdSize;
    }
    if (this.position.x > halfWidth + this.birdConfig.birdSize) {
      this.position.x = -halfWidth;
    }
    if (this.position.y > halfHeight + this.birdConfig.birdSize) {
      this.position.y = -halfHeight;
    }
    // update three entity
    this.line.position.setX(this.position.x);
    this.line.position.setY(this.position.y);
    this.line.rotation.set(0, 0, this.velocity.angle());
  }

  seek(target: Vector2) {
    const desired = new Vector2().subVectors(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(this.birdConfig.maxSpeed);
    // Steering = Desired minus Velocity
    const steer = new Vector2().subVectors(desired, this.velocity);
    steer.clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    return steer;
  }

  physics(birds: Bird[]) {
    // separation vars
    const separation = new Vector2(0, 0);
    let count = 0;
    // alignment+cohesion vars
    const sum = new Vector2(0, 0);
    let count2 = 0;

    for (const bird of birds) {
      // separation
      const d = this.position.distanceTo(bird.position);

      if (d > 0) {
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if (d < this.birdConfig.desiredSeparation) {
          // Calculate vector pointing away from neighbor
          const diff = new Vector2().subVectors(this.position, bird.position);
          diff.normalize();
          diff.divideScalar(d); // Weight by distance
          separation.add(diff);
          count++; // Keep track of how many
        }
        // alignment+cohesion
        if (d < this.birdConfig.neighborDistance) {
          sum.add(bird.velocity);
          count2++;
        }
      }
    }

    // separation calculations
    // Average -- divide by how many
    if (count > 0) {
      separation.divideScalar(count);
    }

    // As long as the vector is greater than 0
    if (separation.length() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      separation
        .normalize()
        .multiplyScalar(this.birdConfig.maxSpeed)
        .sub(this.velocity)
        .clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    }

    // alignment calculations
    let alignment: Vector2 = new Vector2(0, 0);
    if (count2 > 0) {
      sum
        .divideScalar(count)
        .normalize()
        .multiplyScalar(this.birdConfig.maxSpeed);
      alignment = new Vector2()
        .subVectors(sum, this.velocity)
        .clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    }
    let cohesion: Vector2 = new Vector2(0, 0);
    // cohesion calculations
    if (count2 > 0) {
      sum.divideScalar(count);
      cohesion = this.seek(sum); // Steer towards the location
    }

    return { separation, alignment, cohesion };
  }
}
