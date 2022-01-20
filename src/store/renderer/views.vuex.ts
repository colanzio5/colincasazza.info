import { View, ViewMap } from "@/lib/renderer/view";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { action, createModule, mutation } from "vuex-class-component";
import { vxm } from "..";

const VuexModule = createModule({
  namespaced: "views",
  strict: false,
});

export default class ViewsStore extends VuexModule {
  private _views: ViewMap = new Map();
  private _activeViewId!: string;

  get activeView(): View | undefined {
    return this._views.get(this._activeViewId);
  }

  @mutation mountView(props: {
    view: View;
    container: HTMLElement;
    makeActive: boolean;
  }): void {
    // mount the viewport
    props.view.viewPort.mounted({ container: props.container });
    // create camera 
    const { fov, aspect, near, far } = props.view.cameraOptions;
    props.view.camera = new PerspectiveCamera(fov, aspect, near, far);
    // create controls
    props.view.controls = new OrbitControls(
      props.view.camera,
      // vxm.renderer.renderer.domElement
      props.view.viewPort.container
    );
    // configure camera
    props.view.camera.aspect = vxm.renderer.rendererRootViewPort.aspect;
    if (props.view.cameraOptions.startingPosition) {
      const { x, y, z } = props.view.cameraOptions.startingPosition;
      props.view.controls.center = new Vector3(x, y, z);
      props.view.camera.position.set(x, y, z);
      props.view.camera.updateMatrix();
    }
    // configure controls
    // props.view.controls.minAzimuthAngle = 0;
    // props.view.controls.minPolarAngle = 0;
    // props.view.controls.enableRotate = true;
    props.view.controls.enabled = props.view.controlsOptions.enabled;
    props.view.controls.maxDistance = props.view.camera.far;
    props.view.controls.minDistance = props.view.camera.near;
    if (props.view.controlsOptions.startDirection) {
      const { x, y, z } = props.view.controlsOptions.startDirection;
      props.view.controls.target = new Vector3(x, y, z);
      props.view.camera.lookAt(x, y, z);
      props.view.camera.updateMatrix();
    }
    // configure additional settings
    props.view.scene.background = props.view.background;
    if (props.makeActive) {
      this._activeViewId = props.view.id;
    }
    props.view.viewPort.isMounted = true;
    this._views.set(props.view.id, props.view);
  }

  @mutation setViewById(props: { id: string; view: View }): void {
    this._views.set(props.id, props.view);
  }

  @mutation deleteViewById(props: { id: string }): void {
    this._views.delete(props.id);
  }

  @action async getViewById(viewId: string): Promise<View> {
    const viewFound = this._views.get(viewId);
    if (viewFound) return viewFound;
    else
      throw new Error(
        `[views.vuex]: getViewById(${viewId}) no view with this id was found...`
      );
  }

  @action async forEach(
    fn: (value: View, key: string, map: Map<string, View>) => void
  ): Promise<void> {
    this._views.forEach(fn);
  }
}
