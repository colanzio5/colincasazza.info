import { World } from "@dimforge/rapier2d-compat";
import { Vector2, Vector3 } from "three";
import { randomFromRange } from "@/lib/util/random";
import { INBodyOptions, NBodyEntity } from "@/lib/nBody/nBody.entity";

export interface ISimConfig {
  nBodies: {
    startPosition: Vector2;
    mass: number;
    radius: number;
    startVelocity: Vector2;
  }[];
}
export class NBodySimulation {
  nBodies: NBodyEntity[] = [];
  gravity: { x: number; y: number } = { x: 0.0, y: 0.0 };
  world: World = new World(this.gravity);


  // call back functions
  renderTickCallback = (timestep: number = 1 / 60): void => {
    this.applyGravity();
    this.world.step();
    this.updateEntities();
  };

  applyGravity() {
    this.nBodies.forEach((planetoid, index, array) => {
      const otherPlanets = array.filter((item) => item !== planetoid);
      const G = 6.67 * 10 ** -17;

      const fGOtherPlanets = otherPlanets.map((item) => {
        const planetoidPos = new Vector2(
          planetoid.rigidBody.translation().x,
          planetoid.rigidBody.translation().y
        );
        const itemPos = new Vector2(
          item.rigidBody.translation().x,
          item.rigidBody.translation().y
        );
        const R = itemPos.distanceTo(planetoidPos);
        return itemPos
          .clone()
          .sub(planetoidPos)
          .multiplyScalar(
            G * ((planetoid.rigidBody.mass() * item.rigidBody.mass()) / R ** 2)
          );
      });
      const fGNet = fGOtherPlanets.reduce(
        (previous: Vector2, current: Vector2) => previous.add(current),
        new Vector2()
      );
      planetoid.rigidBody.applyForce(fGNet, true);
    });
  }

  updateEntities() {
    // ! need to make an entity class for drawing rigidBodies
    this.nBodies.forEach(({ line, rigidBody, debugPath }) => {
      const { x, y } = rigidBody.translation();
      line.position.setX(x);
      line.position.setY(y);
      line.rotation.set(0, 0, rigidBody.rotation());
      line.geometry.computeBoundingSphere();
      debugPath.addPoint(new Vector3(x, y));
    });
  }
}
