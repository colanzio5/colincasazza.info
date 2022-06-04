<template>
  <div ref="gui-container"></div>
</template>

<script lang="ts">
import useEmitter from "@/emitter";
import { truncate } from "@/lib/util/numbers";
import {
  generateRandomColor,
  randomFromRange,
  randomIntFromRange,
} from "@/lib/util/random";
import { vxm } from "@/store";
import { GUI } from "dat.gui";
import { Color } from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { Vue } from "vue-class-component";
import { IBirdConfig } from "./background";

export default class BackgroundDebug extends Vue {
  gui!: GUI;
  emitter = useEmitter();

  get container(): HTMLElement {
    return this.$refs["gui-container"] as HTMLElement;
  }

  created() {
    /** init event listeners */
    vxm.background.$subscribeAction("updateBirdConfig", {
      before: () => null,
      after: () => {
        this.initGui();
      },
    });
    vxm.background.$subscribeAction("removeBirdConfig", {
      before: () => null,
      after: () => {
        this.initGui();
      },
    });
    vxm.background.$subscribeAction("addBirdConfig", {
      before: () => null,
      after: () => {
        this.initGui();
      },
    });
  }

  async mounted() {
    await vxm.background.initFlock();
    this.initGui();
  }

  unmounted() {
    this.gui?.destroy();
    while (this.container?.lastChild)
      this.container.removeChild(this.container.lastChild);
  }

  initGui() {
    this.gui?.destroy();
    this.gui = new GUI({ autoPlace: false, closeOnTop: true });
    this.container.appendChild(this.gui.domElement);
    this.gui.domElement.id = "gui";
    this.gui.domElement.style.overflowY = "scroll";
    this.gui.domElement.style.position = "fixed";
    this.gui.domElement.style.maxHeight = "40%";
    this.gui.domElement.style.maxWidth = "60%";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";
    const globals = this.gui.addFolder("globals");
    globals
      .add(vxm.background, "maxFlockSize")
      .min(0)
      .max(2000)
      .name("max flock size");
    globals.open();
    const birdTypes = this.gui.addFolder("birds");
    const sortedConfigs = vxm.background.birdConfigs.sort(
      (a: IBirdConfig, b: IBirdConfig) => a.probability - b.probability
    );
    sortedConfigs.forEach((config: IBirdConfig) => {
      const isDefault = config.probability === -1;
      const birdFolder = birdTypes.addFolder(config.id);
      birdFolder.name = truncate(config.id, 25);
      if (!isDefault) {
        birdFolder
          .add(
            { "-": vxm.background.removeBirdConfig.bind(this, config.id) },
            "-"
          )
          .name("(-) remove species");
        birdFolder.add(config, "probability").step(0.01).min(0).max(1);
        birdFolder.domElement.title =
          "**note** bird order determines spawn type when sum all probabilities > 1";
      }
      birdFolder
        .addColor(config, "birdColor")
        .setValue(config.birdColor)
        .onFinishChange(() => vxm.background.updateBirdConfig(config)).domElement.inputMode =
        "none"; // disable keyboard inputs
      birdFolder
        .add(config, "neighborDistance")
        .min(0)
        .onFinishChange(vxm.background.updateBirdConfig).domElement.title =
        "**note** neighbor distance must < desired separation";
      birdFolder
        .add(config, "desiredSeparation")
        .min(0)
        .onFinishChange(vxm.background.updateBirdConfig);
      // attributes w/o options
      [
        "separationMultiplier",
        "alignmentMultiplier",
        "cohesionMultiplier",
        "maxSpeed",
        "maxForce",
        "birdSize",
      ].forEach((attr) => {
        birdFolder
          .add(config, attr)
          .onFinishChange(vxm.background.updateBirdConfig);
      });
    });
    birdTypes
      .add({ "+": this.generateRandomBirdConfig }, "+")
      .name("(+) add new bird species");
    // birdTypes.add({ applyChanges: this.applyChanges }, "applyChanges");
    birdTypes.open();
  }

  async generateRandomBirdConfig() {
    const randomConfig: IBirdConfig = {
      id: generateUUID(),
      probability: randomFromRange(0.0, 1.0),
      neighborDistance: randomIntFromRange(0, 50),
      desiredSeparation: randomIntFromRange(50, 250),
      separationMultiplier: randomFromRange(0.001, 1),
      alignmentMultiplier: randomFromRange(0.001, 1),
      cohesionMultiplier: randomFromRange(0.001, 1),
      maxForce: randomFromRange(0.0001, 1),
      maxSpeed: randomFromRange(0.001, 3),
      birdColor: "#" + generateRandomColor().getHexString(),
      birdSize: randomFromRange(3, 7),
    };
    await vxm.background.addBirdConfig(randomConfig);
  }
}
</script>
