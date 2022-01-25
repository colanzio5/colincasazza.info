<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { Flock } from "@/lib/flock/flock";
import { View } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import { throttle } from "lodash";
import { Color, Vector2, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";

import themeColors from "@/styles/themeColors";

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class BackgroundView extends Vue {
  view!: View;
  drag = false;

  get flock() {
    return (this.view.meta as { flock: Flock }).flock as Flock;
  }

  created() {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1200,
        startingPosition: new Vector3(0, 0, 1000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: false,
      },
      renderTickCallback: this.renderTickCallback,
      id: "BACKGROUND_VIEW",
      background: new Color("black"),
      meta: {
        flock: new Flock({
          neighborDistance: 25,
          desiredSeparation: 30,
          separationMultiplier: 0.4,
          alignmentMultiplier: 0.3,
          cohesionMultiplier: 0.3,
          maxSpeed: 2,
          maxForce: 0.05,
          birdSize: 5,
          birdRadius: 5,
          maxFlockSize: 500,
          birdColors: [
            { value: new Color(themeColors.secondary[200]), probability: -1 },
            {
              value: new Color(themeColors.primary[200]),
              probability: 1 / 150,
            },
          ],
          width: 0,
          height: 0,
        }),
      },
    });
  }

  mounted(): void {
    // make sure the size of flock space is correct
    const width = this.view.visibleWidthAtZDepth(),
      height = this.view.visibleHeightAtZDepth();
    this.flock.resize(width, height);
    //add birds to the flock
    const halfWidth = this.flock.flockConfig.width / 2,
      halfHeight = this.flock.flockConfig.height / 2;
    for (let i = 0; i < this.flock.flockConfig.maxFlockSize; i++) {
      this.addBirdToFlock({
        x: randomFromRange(-halfWidth, halfWidth),
        y: randomFromRange(-halfHeight, halfHeight),
      });
    }
    window.addEventListener("mousedown", () => (this.drag = true));
    window.addEventListener(
      "mousemove",
      throttle(this.onMouseMove, 10, { leading: true })
    );
    window.addEventListener("mouseup", () => (this.drag = false));
  }

  unmounted() {
    window.removeEventListener("mousedown", () => (this.drag = true));
    window.removeEventListener(
      "mousemove",
      throttle(this.onMouseMove, 10, { leading: true })
    );
    window.removeEventListener("mouseup", () => (this.drag = false));
  }

  renderTickCallback() {
    const width = this.view.visibleWidthAtZDepth();
    const height = this.view.visibleHeightAtZDepth();
    this.flock.resize(width, height);
    this.flock.run();
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.drag) return;
    const halfWidth = this.flock.flockConfig.width / 2;
    const halfHeight = this.flock.flockConfig.height / 2;
    const normClickX = event.x / this.view.viewPort.width;
    const normClickY = event.y / this.view.viewPort.height;
    const x = lerp(-halfWidth, halfWidth, normClickX);
    const y = lerp(-halfHeight, halfHeight, normClickY) * -1;
    this.addBirdToFlock({ x, y });
  }

  addBirdToFlock(params: { x: number; y: number }): void {
    const { birdAdded, birdRemoved } = this.flock.addBird(
      new Vector2(params.x, params.y)
    );
    this.view.scene = this.view.scene.add(birdAdded.line);
    if (birdRemoved !== undefined) {
      birdRemoved.dispose();
      this.view.scene.children.pop();
      this.view.scene = this.view.scene.remove(birdRemoved.line);
    }
  }
}
</script>
