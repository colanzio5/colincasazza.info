<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { Flock, IFlockConfig } from "@/lib/flock/flock";
import { View } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import { Color, Vector2, Vector3 } from "three";
import { lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class BackgroundView extends Vue {
  view!: View;
  flock!: Flock;

  created() {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1000,
        startingPosition: new Vector3(0, 0, 1000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: false,
      },
      renderTickCallback: this.renderTickCallback,
      id: "BACKGROUND_VIEW",
      background: new Color("black"),
    });
  }

  mounted(): void {
    this.flock = new Flock({
    birdSize: 5,
    birdRadius: 10,
    maxSpeed: 3,
    maxForce: 0.1,
    maxFlockSize: 250,
    birdColors: [new Color("rgb(0,255,255)")],
    width: 0,
    height: 0,
  });
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
  }

  renderTickCallback() {
    const width = this.view.visibleWidthAtZDepth();
    const height = this.view.visibleHeightAtZDepth();
    this.flock.resize(width, height);
    this.flock.run();
  }

  onMouseMove(event: MouseEvent): void {
    const halfWidth = this.flockConfig.width / 2;
    const halfHeight = this.flockConfig.width / 2;
    const normClickX = event.x / this.view.viewPort.width;
    const normClickY = event.y / this.view.viewPort.height;
    const x = lerp(-halfWidth, halfWidth, normClickX);
    const y = lerp(-halfHeight, halfHeight, normClickY);
    this.addBirdToFlock({ x, y });
  }

  addBirdToFlock(params: { x: number; y: number }): void {
    const [birdAdded, birdRemoved] = this.flock.addBird(
      new Vector2(params.x, params.y)
    );
    this.view.addEntities([birdAdded.line]);
    if (birdRemoved) this.view.removeEntities([birdRemoved.line]);
  }
}
</script>

<style lang="scss"></style>
