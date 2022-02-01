<template></template>
<style lang="postcss">
.dg.ac {
  z-index: 9999;
  color: white;
}
</style>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { Vector2, Vector3 } from "three";
import { GUI } from "dat.gui";
import { ISimConfig } from "@/lib/nBody/nBodySimulation";
import NBody from "@/views/projects/three/NBody.vue";
import { Model } from "vue-property-decorator";


export default class NBodyControlsComponent extends Vue {
  @Model("simConfig", { type: Object, required: true }) _simConfig!: ISimConfig;

  dataPrescision = 10;
  gui: GUI = new GUI();

  get simConfig(): ISimConfig {
    return (this.$props as any).simConfig as ISimConfig;
  }

  mounted() {
    this.configGUI();
  }
  unmounted() {
    this.gui.destroy();
  }

  configGUI() {
    this.gui.destroy();
    this.gui = new GUI();
    this.gui.addFolder("nBodies");
    for (const [index, nBody] of this._simConfig.nBodies.entries()) {
      const bodyFolder = this.gui.addFolder("nbody-" + index);
      bodyFolder.add(nBody.startPosition, "x").name("pos_x");
      bodyFolder.add(nBody.startPosition, "y").name("pos_y");
      bodyFolder.add(nBody.startVelocity, "x").name("linVel_x");
      bodyFolder.add(nBody.startVelocity, "y").name("linVel_y");
      bodyFolder.add(nBody, "mass");
      bodyFolder.add(nBody, "radius");
      bodyFolder
        .add(
          {
            remove: (): void => {
              this.removeNbodyAtIndex(index);
            },
          },
          "remove"
        )
        .name("-");
    }
    this.gui.add(this, "addNbody").name("+");
    this.gui.add(this, "resetSimulation").name("reset");
  }

  removeNbodyAtIndex(indexToRemove: number) {
    this._simConfig.nBodies = this._simConfig.nBodies.filter(
      (_, index) => index != indexToRemove
    );
    this.configGUI();
  }

  addNbody() {
    const randPos = () => {
      const bounds = 380400;
      return new Vector3(
        this.randomIntFromInterval(-bounds, bounds),
        this.randomIntFromInterval(-bounds, bounds),
        0
      );
    };
    const randVel = () => {
      const bounds = 25000;
      return new Vector3(
        this.randomIntFromInterval(-bounds, bounds),
        this.randomIntFromInterval(-bounds, bounds),
        0
      );
    };
    const planetDensity = 10 ** 18;
    const rad = this.randomIntFromInterval(0, 5000);
    this._simConfig.nBodies.push({
      startPosition: randPos(),
      radius: rad,
      mass: 2 * Math.PI * rad * planetDensity,
      startVelocity: randVel(),
    });
    this.configGUI();
  }

  resetSimulation() {
    (this.$parent as NBody).resetSimulation();
  }

  randomIntFromInterval(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dg {
  font-family: "Courier New", Courier, monospace !important;
}
</style>
