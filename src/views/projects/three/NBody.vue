<template>
  <NBodyControlsComponent :simConfig="simConfig" />
  <ViewPortComponent class="w-full h-full" :options="viewOptions" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { INBodyOptions, NBodyEntity } from "@/lib/nBody/nBody.entity";
import { ISimConfig, NBodySimulation } from "@/lib/nBody/nBodySimulation";
import { IViewData, IViewOptions } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import { vxm } from "@/store";
import themeColors from "@/styles/themeColors";
import NBodyControlsComponent from "@/views/debug/NBodyControlsComponent.vue";
import { Color, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    NBodyControlsComponent,
    ViewPortComponent,
  },
})
export default class NBody extends Vue {
  viewOptions: IViewOptions<any> = {
    cameraOptions: {
      fov: 75,
      near: 0.1,
      far: 10 * 10 ** 7,
      startingPosition: new Vector3(0, 0, 10000),
    },
    controlsOptions: {
      startDirection: new Vector3(0, 0, 0),
      enabled: true,
    },
    renderTickCallback: this.renderTickCallback,
    id: "NBODY_SIMULATION",
    background: new Color("black"),
    viewData: {}
  };
  nBodySimulation!: NBodySimulation;
  simConfig: ISimConfig = {
    nBodies: [
      {
        startPosition: new Vector3(-380400, 0, 0),
        mass: 7.34767309 * 10 ** 22,
        radius: 1737.4,
        startVelocity: new Vector3(0, 25000, 0),
      },
      {
        startPosition: new Vector3(0, 0, 0),
        mass: 5.972 * 10 ** 24,
        radius: 6371,
        startVelocity: new Vector3(0, 100, 0),
      },
    ],
  };

  created(): void {
    this.nBodySimulation = new NBodySimulation();
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

  async configSimulation(simConfig: ISimConfig) {
    const view = await vxm.renderer.getViewById<IViewData>({ viewId: "NBODY_SIMULATION" })
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
        color: new Color(themeColors.primary[100]),
      };
      return new NBodyEntity(nBodyConfig, view.physicsWorld);
    });
    //add new nBodies to the scene
    view.scene.add(
      ...this.nBodySimulation.nBodies.map((body) => body.line)
    );
  }

  renderTickCallback() {
    this.nBodySimulation.applyGravity();
    this.nBodySimulation.world.step();
    this.nBodySimulation.updateEntities();
  }

  clearSimulation() {
    this.nBodySimulation.nBodies.forEach((body) => body.destroy());
  }

  resetSimulation() {
    this.clearSimulation();
    this.configSimulation(this.simConfig);
  }
}
</script>
