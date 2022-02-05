import { RenderLoop } from "@/lib/renderer/renderLoop";
import { View } from "@/lib/renderer/view";
import { ViewPort } from "@/lib/renderer/viewPort";
import { vxm } from "@/store";
import { Color, WebGLRenderer } from "three";
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
    vxm.renderer.rendererRootViewPort.container.appendChild(this.stats.dom);
    this.stats.domElement.style.cssText =
      "position:absolute;bottom:5px;right:5px;cursor:pointer;z-index:999;";
    props.container.appendChild(this.renderer.domElement);
    vxm.renderer.resize();
  }

  @mutation resize(): void {
    // first resize the renderer root viewport
    const { width, height } = this.rendererRootViewPort;
    this.renderer.setSize(width, height, true);

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
    this.views = this.views.concat(props.view);
  }

  @mutation removeView(props: { viewId: string }) {
    vxm.renderer.views = vxm.renderer.views.filter(({ options }) => {
      options.id !== props.viewId;
    });
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
    args: any[]
  }): Promise<void> {
    const view = await this.getViewById<T>(props);
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
    this.renderLoop.stop = true;
  }

  @action async start(): Promise<void> {
    this.renderLoop.stop = false;
    this.animate();
  }

  @action async animate(): Promise<void> {
    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved
    // request another frame
    requestAnimationFrame(() => this.start());
    // calc elapsed time since last loop
    this.renderLoop.now = Date.now();
    this.renderLoop.elapsed = this.renderLoop.now - this.renderLoop.then;
    // if enough time has elapsed, draw the next frame
    if (
      this.renderLoop.elapsed > this.renderLoop.fpsInterval &&
      !this.renderLoop.stop
    ) {
      // Get ready for next frame by setting then=now, but also adjust for your
      // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
      this.renderLoop.then =
        this.renderLoop.now -
        (this.renderLoop.elapsed % this.renderLoop.fpsInterval);

      const timeStepMS = this.renderLoop.elapsed / 1000;
      // render each view
      vxm.renderer.views.forEach(this.renderView);
      // update stats pannel
      this.stats.update();
    }
  }

  @mutation renderView(view: View): void {
    view.renderTickCallback(view);
    const { width, height, left, bottom } = view.viewPort;
    this.renderer.setViewport(left, bottom, width, height);
    this.renderer.setScissor(left, bottom, width, height);
    this.renderer.setScissorTest(true);
    this.renderer.setClearColor(view.background, 1);
    this.renderer.render(toRaw(view.scene), view.camera);
    view.camera.updateProjectionMatrix();
    view.controls.update();
  }
}
