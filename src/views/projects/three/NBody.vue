<template>
  <div class="w-full h-full">
    <NBodyDatGUI :simConfig="simConfig" />
    <ViewPortComponent class="w-full h-full" :view="view" />
  </div>
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { INBodyOptions, NBodyEntity } from "@/lib/nBody/nBody.entity";
import { ISimConfig, NBodySimulation } from "@/lib/nBody/nBodySimulation";
import { View } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import themeColors from "@/styles/themeColors";
import RAPIER from "@dimforge/rapier2d-compat";
import { Color, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";
import NBodyDatGUI from "./NBodyDatGUI.vue";

@Options({
  components: {
    NBodyDatGUI,
    ViewPortComponent,
  },
})
export default class NBody extends Vue {
  view!: View;
  physicsWorld = new RAPIER.World({ x: 0, y: 0 });
  nBodySimulation!: NBodySimulation;
  simConfig: ISimConfig = {
    nBodies: [
      {
        startPosition: new Vector3(0, 0, 0),
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
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 100000,
        startingPosition: new Vector3(0, 0, 10000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: true,
      },
      renderTickCallback: this.renderTickCallback,
      id: "NBODY_SIMULATION",
      background: new Color("black"),
    });
    this.nBodySimulation = new NBodySimulation();
  }

  configSimulation(simConfig: ISimConfig) {
    this.nBodySimulation.nBodies = simConfig.nBodies.map((body) => {
      const nBodyConfig: INBodyOptions = {
        numberVertices: randomFromRange(500,1000),
        frequency: randomFromRange(0, 10),
        magnitude: randomFromRange(0, 10),
        seed: randomFromRange(0, 10),
        radius: body.radius,
        mass: body.mass,
        origin: body.startPosition,
        startingLinearVelocity: body.startVelocity,
        color: new Color(themeColors.primary[100]),
      };
      return new NBodyEntity(nBodyConfig, this.physicsWorld);
    });
    //add new nBodies to the scene
    this.view.scene = this.view.scene.add(
      ...this.nBodySimulation.nBodies.map((body) => body.line)
    );
  }

  renderTickCallback() {
    console.log(this.view.viewPort)
    this.nBodySimulation.applyGravity();
    this.physicsWorld.step();
    this.nBodySimulation.updateEntities();
  }

  clearSimulation() {
    this.nBodySimulation.nBodies.forEach(body => this.view.scene.remove(body.line));
    this.nBodySimulation.nBodies.forEach((body) => body.destroy());
  }

  resetSimulation() {
    this.clearSimulation();
    this.configSimulation(this.simConfig);
  }
}
</script>
