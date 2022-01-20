import {
  BufferAttribute,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Material,
  Vector2,
} from "three";
import { randomFromRange } from "../util/random";
import { IFlockConfig } from "./flock";

export class Bird {
  // static state
  birdConfig: IFlockConfig;
  // dynamic state
  acceleration: Vector2;
  velocity: Vector2;
  position: Vector2;
  // rendering state
  geometry: BufferGeometry;
  material: Material;
  line: Line;

  constructor(position: Vector2, flockConfig: IFlockConfig) {
    this.acceleration = new Vector2(0, 0);

    this.velocity = new Vector2(randomFromRange(-1,1), randomFromRange(-1,1));
    this.position = position;
    this.birdConfig = flockConfig;
    // create the three stuff needed to render
    this.geometry = new BufferGeometry();
    const vertices = new Float32Array(
      this.getVertices().flatMap((e) => e.toArray().concat(0))
    );
    this.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
    const randomColorIndex = Math.floor(
      randomFromRange(0, this.birdConfig.birdColors.length)
    );
    this.material = new LineBasicMaterial({
      color: this.birdConfig.birdColors[randomColorIndex],
    });
    this.line = new Line(this.geometry, this.material);
    this.line.position.set(position.x, position.y, 0);
    this.geometry.center();
  }

  run(birds: Bird[]) {
    this.flock(birds);
    this.update();
    this.borders();
    this.render();
  }

  applyForce = (force: Vector2) => {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  flock = (birds: Bird[]) => {
    const sep = this.separate(birds); // Separation
    const ali = this.align(birds); // Alignment
    const coh = this.cohesion(birds); // Cohesion
    // Arbitrarily weight these forces
    sep.multiplyScalar(1.5);
    ali.multiplyScalar(1.3);
    coh.multiplyScalar(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  };

  update = () => {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.clampScalar(-this.birdConfig.maxSpeed, this.birdConfig.maxSpeed);
    this.position.add(this.velocity);
    // Reset accelertion to 0 each cycle
    this.acceleration.multiplyScalar(0);
  };

  seek = (target: Vector2) => {
    const desired = new Vector2().subVectors(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(this.birdConfig.maxSpeed);
    // Steering = Desired minus Velocity
    const steer = new Vector2().subVectors(desired, this.velocity);
    steer.clampScalar(-this.birdConfig.maxForce, this.birdConfig.maxForce); // Limit to maximum steering force
    return steer;
  };

  render = () => {
    const angle = this.position.angle();
    this.line.position.setX(this.position.x);
    this.line.position.setY(this.position.y);
    this.line.rotation.set(0, 0, this.position.angle());
  };

  getVertices(): Vector2[] {
    // equaliteral trongle math <:)
    const { x, y } = this.position;
    const position = new Vector2(x, y);
    const angle = this.position.angle();
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

  borders = () => {
    const halfWidth = this.birdConfig.width / 2,
      halfHeight = this.birdConfig.height / 2;
    if (this.position.x < -halfWidth) {
      this.position.x = halfWidth + this.birdConfig.birdRadius;
    }
    if (this.position.y < -halfHeight) {
      this.position.y = halfHeight + this.birdConfig.birdRadius;
    }
    if (this.position.x > halfWidth + this.birdConfig.birdRadius) {
      this.position.x = -halfWidth;
    }
    if (this.position.y > halfHeight + this.birdConfig.birdRadius) {
      this.position.y = -halfHeight;
    }
  };

  separate = (birds: Bird[]) => {
    const desiredseparation = 25.0;
    const steer = new Vector2(0, 0);
    let count = 0;

    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (d > 0 && d < desiredseparation) {
        // Calculate vector pointing away from neighbor
        const diff = new Vector2().subVectors(this.position, bird.position);
        diff.normalize();
        diff.divideScalar(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.divideScalar(count);
    }

    // As long as the vector is greater than 0
    if (steer.length() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.multiplyScalar(this.birdConfig.maxSpeed);
      steer.sub(this.velocity);
      steer.clampScalar(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    }
    return steer;
  };

  align = (birds: Bird[]) => {
    const neighbordist = 50;
    const sum = new Vector2(0, 0);
    let count = 0;
    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      if (d > 0 && d < neighbordist) {
        sum.add(bird.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(this.birdConfig.maxSpeed);
      const steer = new Vector2().subVectors(sum, this.velocity);
      steer.clampScalar(-this.birdConfig.maxForce, this.birdConfig.maxForce);
      return steer;
    } else {
      return new Vector2(0, 0);
    }
  };

  cohesion = (birds: Bird[]) => {
    const neighbordist = 50;
    const sum = new Vector2(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      if (d > 0 && d < neighbordist) {
        sum.add(bird.position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return new Vector2(0, 0);
    }
  };
}
