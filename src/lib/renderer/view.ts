import { ViewPort } from "@/lib/renderer/viewPort";
import { RAPIER } from "@/main";
import {
  Camera,
  Color,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { generateUUID } from "three/src/math/MathUtils";

export interface IControlsOptions {
  enabled: boolean;
  startDirection: Vector3;
}

export interface ICameraOptions {
  fov?: number;
  aspect?: number;
  near?: number;
  far?: number;
  startingPosition?: Vector3;
}

export interface IViewOptions {
  background?: Color;
  id?: string;
  scene?: Scene;
  physicsWorld?: RAPIER.World;
  // required variables
  renderTickCallback?: () => void;
  // setup after view creation by viewStore
  cameraOptions: ICameraOptions;
  controlsOptions: IControlsOptions;
}

export class View {
  id: string = generateUUID();
  options: IViewOptions;
  scene: Scene = new Scene();
  viewPort: ViewPort = new ViewPort();
  background: Color = new Color("red");
  entities: Object3D[] = [];
  physicsWorld: RAPIER.World = new RAPIER.World({ x: 0, y: 0 });
  // options provided by the user are updated
  // in the vuex store
  cameraOptions: ICameraOptions = {
    fov: 70,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    startingPosition: new Vector3(0, 0, 100),
  };
  camera!: PerspectiveCamera;
  // object created in the vuex store
  // when calling addView() store mutation
  // this is because we need domElement to create
  // which is only available after mounting vue component
  controlsOptions: IControlsOptions = {
    enabled: false,
    startDirection: new Vector3(0, 0, 100),
  };
  controls!: OrbitControls;

  constructor(props: IViewOptions) {
    // some options will be used to create inner
    // classes (like controls and camera) later in view vuex store
    this.options = props;
    this.controlsOptions = props.controlsOptions;
    this.cameraOptions = props.cameraOptions;
    // overwrite other options if given
    if (props.renderTickCallback)
      this.renderTickCallback = props.renderTickCallback;
    if (props.physicsWorld) this.physicsWorld = props.physicsWorld;
    if (props.scene) this.scene = props.scene;
    if (props.id) this.id = props.id;
    if (props.background) this.background = props.background;
  }

  get isMounted() {
    return this.viewPort.isMounted || false;
  }

  renderTickCallback(): void {
    throw new Error(
      ` view id: ${this.id} render tick callback not implemented`
    );
  }

  addEntities(entities: Object3D[]): void {
    this.entities.push(...entities);
    this.scene.add(...entities);
  }

  removeEntities(entities: Object3D[]): void {
    this.entities = this.entities.filter((e) => entities.includes(e));
    this.scene.remove(...entities);
  }

  positionCamera(vector: Vector3): void {
    const { x, y, z } = vector;
    this.controls.center = new Vector3(x, y, z);
    this.camera.position.set(x, y, z);
    this.controls.target = new Vector3(x, y, 0);
    this.camera.lookAt(x, y, 0);
    this.camera.updateMatrix();
  }
  
  visibleHeightAtZDepth(): number {
    // compensate for cameras not positioned at z=0
    const depth = this.camera.position.z;

    // vertical fov in radians
    const vFOV = (this.camera.fov * Math.PI) / 180;

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(): number {
    return this.visibleHeightAtZDepth() * this.camera.aspect;
  }
}

export type ViewMap = Map<string, View>;
