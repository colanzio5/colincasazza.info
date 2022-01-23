import { RAPIER } from "@/main";
import { Object3D } from "three";

export interface IEntity {
  physicsEnabled: boolean;
  rigidBody?: RAPIER.RigidBody;
  line: Object3D;
}
