import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Euler,
  Line,
  LineBasicMaterial,
  Material,
  Vector2,
  Vector3,
} from "three";
import { randomFromRange, randomSelectFromWeightedArray } from "../util/random";
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
    this.acceleration = new Vector2();

    this.velocity = new Vector2(
      randomFromRange(-flockConfig.maxSpeed, flockConfig.maxSpeed),
      randomFromRange(-flockConfig.maxSpeed, flockConfig.maxSpeed)
    );
    this.position = position;
    this.birdConfig = flockConfig;
    // create the three stuff needed to render
    this.geometry = new BufferGeometry();
    const vertices = new Float32Array(
      this.getVertices().flatMap((e) => e.toArray().concat(0))
    );
    this.geometry.setAttribute("position", new BufferAttribute(vertices, 3));
    this.material = new LineBasicMaterial({
      color: randomSelectFromWeightedArray(this.birdConfig.birdColors),
    });
    // ! random colors
    // const r = Math.round(randomFromRange(0, 255)),
    //   g = Math.round(randomFromRange(0, 255)),
    //   b = Math.round(randomFromRange(0, 255));
    // this.material = new LineBasicMaterial({
    //   color: new Color(`rgb(${r},${g},${b})`),
    // });
    this.line = new Line(this.geometry, this.material);
    this.line.position.set(position.x, position.y, 0);
    this.geometry.center();
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }

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

  run(birds: Bird[]) {
    const { separation, alignment, cohesion } = this.fastPhysics(birds);
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
    // update three entity
    this.line.position.setX(this.position.x);
    this.line.position.setY(this.position.y);
    // this.line.setRotationFromEuler(new Euler(0,0,this.velocity.angle(),"XYZ"))
    this.line.rotation.set(0, 0, this.velocity.angle() - Math.PI / 2);
    this.line.geometry.center();
  }

  seek(target: Vector2) {
    const desired = new Vector2().subVectors(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(this.birdConfig.maxSpeed);
    // Steering = Desired minus Velocity
    const steer = new Vector2().subVectors(desired, this.velocity);
    steer.clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    // steer.clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce); // Limit to maximum steering force
    return steer;
  }

  fastPhysics(birds: Bird[]) {
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

  separate(birds: Bird[]) {
    const steer = new Vector2(0, 0);
    let count = 0;

    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if (d > 0 && d < this.birdConfig.desiredSeparation) {
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
      steer.clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
    }
    return steer;
  }

  align(birds: Bird[]) {
    const sum = new Vector2(0, 0);
    let count = 0;
    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      if (d > 0 && d < this.birdConfig.neighborDistance) {
        sum.add(bird.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(this.birdConfig.maxSpeed);
      const steer = new Vector2().subVectors(sum, this.velocity);
      steer.clampLength(-this.birdConfig.maxForce, this.birdConfig.maxForce);
      return steer;
    } else {
      return new Vector2(0, 0);
    }
  }

  cohesion(birds: Bird[]) {
    const sum = new Vector2(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (const bird of birds) {
      const d = this.position.distanceTo(bird.position);
      if (d > 0 && d < this.birdConfig.neighborDistance) {
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
  }
}
