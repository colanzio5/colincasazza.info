<template>
  <!-- <NBodyDatGUI :simConfig="simConfig" /> -->
  <div class="w-full h-full grid grid-cols-2 gap-4 justify-items-stretch">
    <ViewPortComponent
      v-for="view in views"
      :key="view.id"
      class="justify-self-auto w-full"
      :view="view"
    />
  </div>
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { Flock } from "@/lib/flock/flock";
import { View } from "@/lib/renderer/view";
import { randomColor, randomFromRange } from "@/lib/util/random";
import NBodyDatGUI from "@/views/projects/three/NBodyDatGUI.vue";
import { Color, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    NBodyDatGUI,
    ViewPortComponent,
  },
})
export default class MultiViewPortDebug extends Vue {
  numberOfViews: number = 4; // do a grid by default
  views: View[] = [];
  flock: Flock = new Flock({
    separationMultiplier: 0.9,
    alignmentMultiplier: 0.4,
    cohesionMultiplier: 0.3,
    maxSpeed: 3,
    maxForce: 0.1,
    birdSize: 5,
    birdRadius: 2,
    maxFlockSize: 10,
    birdColors: [
      { value: new Color("#60a5fa"), probability: -1 },
      { value: new Color("#fa60a5"), probability: 1 / 150 },
    ],
    width: 0,
    height: 0,
  });

  created(): void {
    this.views = [...Array(this.numberOfViews).keys()].map((index) => {
      return new View({
        cameraOptions: {
          fov: 75,
          near: 0.1,
          far: 1200,
          startingPosition: new Vector3(0, 0, 250),
        },
        controlsOptions: {
          startDirection: new Vector3(0, 0, 0),
          enabled: false,
        },
        id: `MULTI_VIEW_${(index + 1).toString().toUpperCase()}`,
        renderTickCallback: this.renderTickCallback,
        background: new Color("black"),
      });
    });
  }

  mounted(): void {
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

  addBirdToFlock(params: { x: number; y: number }): void {
    this.views.forEach((view) => {
      const [birdAdded, birdRemoved] = this.flock.addBird(
        new Vector2(params.x, params.y)
      );
      view.addEntities([birdAdded.line]);
      if (birdRemoved) view.removeEntities([birdRemoved.line]);
    });
  }

  renderTickCallback() {
    this.views.forEach((view) => {
        const width = view.visibleWidthAtZDepth();
        const height = view.visibleHeightAtZDepth();
        this.flock.resize(width, height);
      this.flock.run();
    });
  }
}
</script>
