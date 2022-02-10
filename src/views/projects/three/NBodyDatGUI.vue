<template>
  <div ref="gui-container"></div>
</template>

<script lang="ts">
import { randomColor, randomFromRange } from "@/lib/util/random";
import themeColors from "@/styles/themeColors";
import NBody from "@/views/projects/three/NBody.vue";
import { GUI } from "dat.gui";
import { ColorRepresentation, Vector3 } from "three";
import { Vue } from "vue-class-component";
import { Model } from "vue-property-decorator";

export default class Controls extends Vue {
  @Model("simConfig", { required: true, type: Object }) _simConfig!: {
    radius: number;
    mass: number;
    origin: Vector3;
    linearVelocity: Vector3;
    angularVelocity: number;
    color: ColorRepresentation;
  }[];
  dataPrescision = 10;
  gui: GUI = new GUI();

  get nBodySimulation(): NBody {
    return this.$parent as NBody;
  }

  get container(): HTMLElement {
    return this.$refs["gui-container"] as HTMLElement;
  }

  mounted() {
    this.configGUI();
  }

  unmounted() {
    this.destroyGUI();
  }

  destroyGUI() {
    this.gui.destroy();
    while (this.container?.lastChild)
      this.container.removeChild(this.container.lastChild);
  }

  configGUI() {
    this.destroyGUI();
    this.gui = new GUI({ autoPlace: false, closeOnTop: true });
    this.container.appendChild(this.gui.domElement);
    this.gui.domElement.id = "gui";
    this.gui.domElement.style.overflowY = "scroll";
    this.gui.domElement.style.position = "absolute";
    this.gui.domElement.style.maxHeight = "40%";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";
    this.gui.addFolder("nBodies");
    for (const [index, nBody] of this._simConfig.entries()) {
      const bodyFolder = this.gui.addFolder("nbody-" + index);
      // bodyFolder.add("origin", nBody.origin)
      bodyFolder.add(nBody.origin, "x").name("pos_x");
      bodyFolder.add(nBody.origin, "y").name("pos_y");
      bodyFolder.add(nBody.linearVelocity, "x").name("linVel_x");
      bodyFolder.add(nBody.linearVelocity, "y").name("linVel_y");
      bodyFolder.add(nBody, "mass").min(0);
      bodyFolder.add(nBody, "radius").min(0);
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
    this._simConfig.splice(indexToRemove)
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
    this._simConfig.push({
      origin: randPos(),
      radius: this.randomIntFromInterval(2000, 5000),
      mass: randomFromRange(10*(10**22), 10*(10**24)),
      linearVelocity: randVel(),
      angularVelocity: randomFromRange(-2, 2),
      color: themeColors.primary["100"],
    });
    this.configGUI();
  }

  resetSimulation() {
    this.nBodySimulation.clearSimulation();
    this.nBodySimulation.configSimulation();
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
