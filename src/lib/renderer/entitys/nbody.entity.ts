import { simplex3 } from "@/lib/util/noise";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineLoop,
  LineBasicMaterial,
  Vector2,
  Vector3,
  type ColorRepresentation,
} from "three";
import { TracePathEntity } from "./tracePath.entity";

export interface INBodyEntityOptions {
  numberVertices: number;
  radius: number;
  mass: number;
  frequency: number;
  magnitude: number;
  seed: number;
  origin: Vector3;
  linearVelocity: Vector3;
  angularVelocity: number;
  color: ColorRepresentation;
}

function generateTerrain(options: INBodyEntityOptions): Vector3[] {
  return Array.from(Array(options.numberVertices).keys()).map((index) => {
    const angle = (2 * Math.PI * index) / options.numberVertices;
    // Figure out the x/y coordinates for the given angle
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    // Randomly deform the radius of the circle at this point
    const deformation =
      simplex3(x * options.frequency, y * options.frequency, options.seed) + 1;
    const radius = options.radius * (1 + options.magnitude * deformation);
    const vector = new Vector3(
      options.origin.x + radius * x,
      options.origin.y + radius * y,
      options.origin.z
    );
    return vector;
  });
}

export class NBodyEntity {
  // three.js entity variables
  geometry: BufferGeometry = new BufferGeometry();
  material: LineBasicMaterial = new LineBasicMaterial({
    vertexColors: true,
    color: new Color("white"),
  });
  line: LineLoop = new LineLoop(this.geometry, this.material);
  debugPath: TracePathEntity;

  constructor(options: INBodyEntityOptions) {
    // overwrite defualt options with provided
    const vertices = generateTerrain(options);
    // visual entity creation
    this.setVertices(vertices);
    this.geometry.center();
    this.debugPath = new TracePathEntity(
      new Vector2(options.origin.x, options.origin.y),
      new Color(options.color)
    );
  }

  dispose(): void {
    this.material.dispose();
    this.geometry.dispose();
  }

  setVertices(vertices: Vector3[]): void {
    const positions = new Float32Array(vertices.map((e) => e.toArray()).flat());
    const colors = new Float32Array(
      new Array(vertices.length).fill(this.material.color.toArray()).flat()
    );
    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("color", new BufferAttribute(colors, 3));
  }
}
