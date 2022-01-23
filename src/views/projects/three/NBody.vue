<template>
  <!-- <NBodyDatGUI :simConfig="simConfig" /> -->
  <ViewPortComponent class="w-full flex flex-grow" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { INBodyOptions, NBodyEntity } from "@/lib/nBody/nBody.entity";
import { ISimConfig, NBodySimulation } from "@/lib/nBody/nBodySimulation";
import { View } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import NBodyDatGUI from "@/views/projects/three/NBodyDatGUI.vue";
import { Color, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    NBodyDatGUI,
    ViewPortComponent,
  },
})
export default class NBody extends Vue {
  view!: View;
  nBodySimulation!: NBodySimulation;
  simConfig: ISimConfig = {
    nBodies: [
      {
        startPosition: new Vector2(-380400, 0),
        mass: 7.34767309 * 10 ** 22,
        radius: 1737.4,
        startVelocity: new Vector2(0, 25000),
      },
      {
        startPosition: new Vector2(0, 0),
        mass: 5.972 * 10 ** 24,
        radius: 6371,
        startVelocity: new Vector2(0, 100),
      },
    ],
  };

  created(): void {
    this.nBodySimulation = new NBodySimulation();
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
      renderTickCallback: this.nBodySimulation.renderTickCallback,
      id: "NBODY_SIMULATION",
      background: new Color("black"),
    })
  }

  debounce(func: any, timeout = 1000): any {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  configSimulation(simConfig: ISimConfig) {
    const scalingFactor = 10;
    // create nBodies from config
    this.nBodySimulation.nBodies = simConfig.nBodies.map((body) => {
      const nBodyConfig: INBodyOptions = {
        numberVertices: 500,
        radius: body.radius / scalingFactor,
        mass: body.mass / scalingFactor,
        frequency: randomFromRange(0, 10),
        magnitude: randomFromRange(0, 10),
        seed: randomFromRange(0, 10),
        origin: body.startPosition.divideScalar(scalingFactor),
        startingLinearVelocity: body.startVelocity.divideScalar(scalingFactor),
      };
      return new NBodyEntity(nBodyConfig, this.view.physicsWorld);
    });
    //add new nBodies to the scene
    this.view.scene.add(
      ...this.nBodySimulation.nBodies.map((body) => body.line)
    );
  }

  clearSimulation() {
    this.nBodySimulation.nBodies.forEach((body) => body.destroy());
  }
}
</script>
