import { RenderLoop } from "@/lib/renderer/renderLoop";
import { View } from "@/lib/renderer/view";
import { ViewPort } from "@/lib/renderer/viewPort";
import { vxm } from "@/store";
import { WebGLRenderer } from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { toRaw } from "vue";
import { action, createModule, mutation } from "vuex-class-component";

const VuexModule = createModule({
  namespaced: "renderer",
  strict: false,
  enableLocalWatchers: true,
});

export default class RendererStore extends VuexModule {
  views: View[] = [];
  stats: Stats = Stats();
  renderer: WebGLRenderer = new WebGLRenderer({ antialias: true });
  renderLoop: RenderLoop = new RenderLoop();
  rendererRootViewPort: ViewPort = new ViewPort();

  @mutation mounted(props: { container: HTMLCanvasElement }): void {
    vxm.renderer.rendererRootViewPort.mount({ container: props.container });
    // setup stats
    vxm.renderer.rendererRootViewPort.container.appendChild(
      vxm.renderer.stats.dom
    );
    vxm.renderer.stats.domElement.style.cssText =
      "position:absolute;bottom:5px;right:5px;cursor:pointer;z-index:999;";
    props.container.appendChild(vxm.renderer.renderer.domElement);
    vxm.renderer.resize();
  }

  @mutation resize(): void {
    // first resize the renderer root viewport
    const { width, height } = vxm.renderer.rendererRootViewPort;
    vxm.renderer.renderer.setSize(width, height, true);

    // finally resize all the views
    vxm.renderer.rendererRootViewPort.resize();
    vxm.renderer.views.forEach((view) => {
      view.camera.aspect = vxm.renderer.rendererRootViewPort.aspect;
      view.viewPort.resize();
    });
  }

  @mutation addView<T extends View>(props: {
    view: T;
    container: HTMLElement;
  }): void {
    props.view.mount(props.container);
    vxm.renderer.views = vxm.renderer.views.concat(props.view);
  }

  @mutation removeView(props: { viewId: string }) {
    this.views.splice(
      this.views.findIndex((v) => v.id === props.viewId),
      1
    );
  }

  @action async getViewById<T extends View>(props: {
    viewId: string;
  }): Promise<T> {
    for (const view of vxm.renderer.views)
      if (view.id === props.viewId) return view as T;
    throw new Error("no view with matching id was found");
  }

  @action async callViewMethod<T extends View>(props: {
    viewId: string;
    method: string;
    args: any[];
  }): Promise<void> {
    const view = await vxm.renderer.getViewById<T>(props);
    if (typeof (view as any)[props.method] === "function") {
      (view as any)[props.method](...props.args);
    } else if (typeof (view as any)[props.method] === "undefined") {
      throw new Error("unable to call method, method undefined");
    } else {
      throw new Error(
        "unable to call method with type of" +
          typeof (view as any)[props.method]
      );
    }
  }

  @mutation stop(): void {
    vxm.renderer.renderLoop.stop = true;
  }

  @action async start(): Promise<void> {
    vxm.renderer.renderLoop.stop = false;
    vxm.renderer.animate();
  }

  @action async animate(): Promise<void> {
    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved
    // request another frame
    requestAnimationFrame(() => vxm.renderer.start());
    // calc elapsed time since last loop
    vxm.renderer.renderLoop.now = Date.now();
    vxm.renderer.renderLoop.elapsed =
      vxm.renderer.renderLoop.now - vxm.renderer.renderLoop.then;
    // if enough time has elapsed, draw the next frame
    if (
      vxm.renderer.renderLoop.elapsed > vxm.renderer.renderLoop.fpsInterval &&
      !vxm.renderer.renderLoop.stop
    ) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      vxm.renderer.renderLoop.then =
        vxm.renderer.renderLoop.now -
        (vxm.renderer.renderLoop.elapsed % vxm.renderer.renderLoop.fpsInterval);

      const timeStepMS = vxm.renderer.renderLoop.elapsed / 1000;
      // render each view
      vxm.renderer.views.forEach((view) =>
        vxm.renderer.renderView({ view, timeStepMS })
      );
      // update stats pannel
      vxm.renderer.stats.update();
    }
  }

  @mutation renderView(props: { view: View; timeStepMS: number }): void {
    const { view, timeStepMS } = props;
    view.renderTickCallback(view, timeStepMS);
    const { width, height, left, bottom } = view.viewPort;
    this.renderer.setViewport(left, bottom, width, height);
    this.renderer.setScissor(left, bottom, width, height);
    this.renderer.setScissorTest(true);
    this.renderer.setClearColor(view.background);
    this.renderer.render(toRaw(view.scene), view.camera);
    view.camera.updateProjectionMatrix();
    view.controls.update();
  }
}
