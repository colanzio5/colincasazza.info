<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { randomFromRange } from "@/lib/util/random";
import { Vector2 } from "three";
import { lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import { BackgroundView } from "./background";
@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class Background extends Vue {
  drag = false;
  view: BackgroundView = new BackgroundView();

  async mounted(): Promise<void> {
    // make sure the size of flock space is correct
    this.view.flock.resize(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    //add birds to the flock
    const halfWidth = this.view.flock.width / 2;
    const halfHeight = this.view.flock.height / 2;
    for (let i = 0; i < this.view.flock.flockConfig.maxFlockSize; i++) {
      const position = new Vector2(
        randomFromRange(-halfWidth, halfWidth),
        randomFromRange(-halfHeight, halfHeight)
      );
      this.view.addBirdToFlock({ position });
    }

    // window.addEventListener("mousedown", () => (this.drag = true));
    // window.addEventListener(
    //   "mousemove",
    //   throttle(this.onMouseMove, 10)
    // );
    // window.addEventListener("mouseup", () => (this.drag = false));
  }

  unmounted() {
    // window.removeEventListener("mousedown", () => (this.drag = true));
    // window.removeEventListener(
    //   "mousemove",
    //   throttle(this.onMouseMove, 10)
    // );
    // window.removeEventListener("mouseup", () => (this.drag = false));
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.drag) return;
    const halfWidth = this.view.flock.width / 2;
    const halfHeight = this.view.flock.height / 2;
    const normClickX = event.x / this.view.viewPort.width;
    const normClickY = event.y / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    this.view.addBirdToFlock({ position });
  }
}
</script>
