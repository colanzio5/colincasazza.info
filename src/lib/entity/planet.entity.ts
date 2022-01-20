import RAPIER from "@dimforge/rapier2d-compat";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineLoop,
  LineBasicMaterial,
  Vector2,
} from "three";
import { simplex3 } from "../util/noise";
import { IEntity } from "./entity";
import { OrbitalPathEntity } from "./orbitalPath.entity";

export interface IPlanetOptions {
  numberVertices: number;
  radius: number;
  mass: number;
  frequency: number;
  magnitude: number;
  seed: number;
  origin: Vector2;
  startingLinearVelocity: Vector2;
}

const DEFAULT_TERRAIN_OPTIONS = {
  numberVertices: 10 ** 2,
  radius: 1737, // https://solarsystem.nasa.gov/moons/earths-moon/by-the-numbers,
  mass: 7.346 * 10 ** 22, // https://www.google.com/search?q=weight+of+moon+in+kg;
  frequency: 3,
  magnitude: 0.05,
  seed: new Date().getMilliseconds(),
  origin: new Vector2(0, 0),
  startingLinearVelocity: new Vector2(0, 0),
};

function generateTerrain(options: IPlanetOptions): Vector2[] {
  return Array.from(Array(options.numberVertices).keys()).map((index) => {
    const angle = (2 * Math.PI * index) / options.numberVertices;
    // Figure out the x/y coordinates for the given angle
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    // Randomly deform the radius of the circle at this point
    const deformation =
      simplex3(x * options.frequency, y * options.frequency, options.seed) + 1;
    const radius = options.radius * (1 + options.magnitude * deformation);
    const vector = new Vector2(
      options.origin.x + radius * x,
      options.origin.y + radius * y
    );
    return vector;
  });
}

export class PlanetEntity implements IEntity {
  // three.js entity variables
  geometry: BufferGeometry = new BufferGeometry();
  material: LineBasicMaterial = new LineBasicMaterial({
    vertexColors: true,
    color: new Color("white"),
  });
  line: LineLoop = new LineLoop(this.geometry, this.material);
  debugPath: OrbitalPathEntity;
  // physics variables
  physicsEnabled = true;
  rigidBody: RAPIER.RigidBody;

  constructor(options: IPlanetOptions, physicsWorld: RAPIER.World) {
    // overwrite defualt options with provided
    options = {
      ...DEFAULT_TERRAIN_OPTIONS,
      ...options,
    } as IPlanetOptions;
    const vertices = generateTerrain(options);
    // visual entity creation
    this.setVertices(vertices);
    this.geometry.center();
    this.debugPath = new OrbitalPathEntity(
      new Vector2(options.origin.x, options.origin.y),
      new Color("white")
    );
    // rigid body description
    const rigidBodyDesc = new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic)
      .setLinvel(
        options.startingLinearVelocity.x,
        options.startingLinearVelocity.y
      )
      .setTranslation(options.origin.x, options.origin.y)
      .setAdditionalMass(options.mass)
      .setCanSleep(true)
      .setCcdEnabled(false);
    // instiate physics object in world
    this.rigidBody = physicsWorld.createRigidBody(rigidBodyDesc);
  }

  destroy(): void {
    this.material.dispose();
    this.geometry.dispose();
  }

  setVertices(vertices: Vector2[]): void {
    const positions = new Float32Array(
      vertices.map((e) => e.toArray().concat(0)).flat(1)
    );
    const colors = new Float32Array(
      new Array(vertices.length).fill([0.0, 255.0, 255.0]).flat(1)
    );
    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("color", new BufferAttribute(colors, 3));
  }
}
