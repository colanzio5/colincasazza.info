import Stats from "three/examples/jsm/libs/stats.module.js";
import { Color, WebGLRenderer } from "three";
import {
  createModule,
  action,
  createSubModule,
  mutation,
} from "vuex-class-component";
import ViewsStore from "@/store/renderer/views.vuex";
import { toRaw } from "vue";
import { vxm } from "@/store";
import { ViewPort } from "@/lib/renderer/viewPort";
import { RenderLoop } from "@/lib/renderer/renderLoop";
import { View } from "@/lib/renderer/view";

const VuexModule = createModule({
  namespaced: "renderer",
  strict: false,
});

export default class RendererStore extends VuexModule {
  views = createSubModule(ViewsStore);
  stats: Stats = Stats();
  renderer: WebGLRenderer = new WebGLRenderer({ antialias: true });
  renderLoop: RenderLoop = new RenderLoop();
  rendererRootViewPort: ViewPort = new ViewPort();

  @mutation mounted(props: { container: HTMLCanvasElement }): void {
    this.rendererRootViewPort.mounted({ container: props.container });
    // setup stats
    this.rendererRootViewPort.container.appendChild(this.stats.dom);
    this.stats.domElement.style.cssText =
      "position:absolute;bottom:5px;right:5px;cursor:pointer;z-index:999;";
    props.container.appendChild(this.renderer.domElement);
    vxm.renderer.resize();
  }

  @mutation resize(): void {
    // first resize the renderer root viewport
    const { left, bottom, width, height } = this.rendererRootViewPort;
    this.renderer.setSize(width, height, true);
    // finally resize all the views
    this.rendererRootViewPort.resize();
    vxm.renderer.views.forEach((view) => view.viewPort.resize());
  }

  @action async start(): Promise<void> {
    this.renderLoop.stop = false;
    await this.animate();
  }

  @action async stop(): Promise<void> {
    this.renderLoop.stop = true;
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
      this.views.forEach(this.renderView);
      // update stats pannel
      this.stats.update();
    }
  }

  @mutation renderView(view: View): void {
    view.renderTickCallback();
    const { width, height, left, bottom } = view.viewPort;
    // console.log("rendering view : " + view.id);
    // console.log(left, bottom, width, height);
    this.renderer.setViewport(left, bottom, width, height);
    this.renderer.setScissor(left, bottom, width, height);
    this.renderer.setScissorTest(true);
    this.renderer.setClearColor(new Color("red"), 1);
    this.renderer.render(toRaw(view.scene), view.camera);
    view.camera.updateProjectionMatrix();
    view.controls.update();
  }
}
