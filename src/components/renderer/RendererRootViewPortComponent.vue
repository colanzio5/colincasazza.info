<template>
  <div
    :ref="domCanvasId"
    :id="domCanvasId"
    class="absolute w-full h-full"
  />
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { vxm } from "@/store";
import RendererStore from "@/store/renderer/renderer.vuex";

export default class RendererRootViewPortComponent extends Vue {
  domCanvasId = "THREE_WEBGL_RENDER_CANVAS";

  get renderer(): RendererStore {
    return vxm.renderer;
  }

  get canvasElement(): HTMLCanvasElement {
    return this.$refs[this.domCanvasId] as HTMLCanvasElement;
  }

  get statsElement(): HTMLElement {
    return document.getElementById("stats") as HTMLElement;
  }

  mounted(): void {
    vxm.renderer.mounted({ container: this.canvasElement });
    window.addEventListener("resize", vxm.renderer.resize);
  }

  unmounted(): void {
    this.canvasElement.removeEventListener("resize", vxm.renderer.resize);
    // remove any child components created by three in this component
    this.renderer.renderer.dispose();
    while (this.statsElement?.lastChild)
      this.statsElement.removeChild(this.statsElement.lastChild);
    while (this.canvasElement?.lastChild)
      this.canvasElement.removeChild(this.canvasElement.lastChild);
  }
}
</script>
