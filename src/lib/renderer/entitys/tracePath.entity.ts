import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
  Vector2,
  Vector3,
} from "three";

export class TracePathEntity {
  geometry: BufferGeometry;
  material: PointsMaterial;
  line: Points;
  maxPoints = 10000;

  constructor(startingPosition: Vector2, color: Color) {
    const startingPoints = new Array(this.maxPoints)
      .fill(startingPosition.toArray().concat(0))
      .flat(2);
    const startingPointsFloat32Array = new Float32Array(this.maxPoints * 3);
    startingPointsFloat32Array.set(startingPoints);
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new BufferAttribute(startingPointsFloat32Array, 3)
    );
    this.material = new PointsMaterial({ color });
    this.line = new Points(this.geometry, this.material);
    this.line.frustumCulled = false;
  }

  destroy(): void {
    this.material.dispose();
    this.geometry.dispose();
  }

  // add point in the orbital path, rotate old items off the front
  //  and place on the back, add new point to the front
  addPoint(point: Vector3): void {
    const points = this.line.geometry.getAttribute("position").clone();
    const newPoints = Array.from(points.array);
    const rolloverItems = [
      newPoints.shift() as number,
      newPoints.shift() as number,
      newPoints.shift() as number,
    ];
    newPoints.push(...rolloverItems);
    newPoints[0] = point.x;
    newPoints[1] = point.y;
    newPoints[2] = point.z;
    // ! compare performance to line.geometry.setFromPoints();
    this.line.geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(newPoints), 3)
    );
  }
}
