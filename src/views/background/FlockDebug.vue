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
import { generateUUID } from "three/src/math/MathUtils";
import { Vue } from "vue-class-component";
import type { IBirdConfig } from "./background";
import { DEFAULT_BIRD_ID } from "./background";

export default class BackgroundDebug extends Vue {
  gui: GUI = new GUI({ autoPlace: false, closeOnTop: true });
  emitter = useEmitter();

  get container(): HTMLElement {
    return this.$refs["gui-container"] as HTMLElement;
  }

  get birdsFolder(): GUI {
    return this.gui.__folders["birds"];
  }

  get globalsFloder(): GUI {
    return this.gui.__folders["globals"];
  }

  async mounted() {
    await vxm.background.$subscribeAction("initFlock", {
      before: () => null,
      after: () => null,
    });
    this.container.appendChild(this.gui.domElement);
    this.gui.domElement.id = "gui";
    this.gui.domElement.style.overflowY = "scroll";
    this.gui.domElement.style.position = "fixed";
    this.gui.domElement.style.maxHeight = "40%";
    this.gui.domElement.style.maxWidth = "60%";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";
    this.gui.addFolder("globals");
    this.gui.addFolder("birds");
    this.gui
      .add({ "+": () => this.generateRandomBirdConfig() }, "+")
      .name("(+) add new bird species");
    this.globalsFloder
      .add(vxm.background, "maxFlockSize")
      .min(1)
      .max(2000)
      .name("max flock size");
    this.globalsFloder.open();
    await vxm.background.birdConfigs.forEach(this.addBirdConfigToGui);
  }

  unmounted() {
    this.gui?.destroy();
    while (this.container?.lastChild)
      this.container.removeChild(this.container.lastChild);
  }

  async generateRandomBirdConfig() {
    const randomConfig: IBirdConfig = {
      id: generateUUID(),
      weight: randomIntFromRange(0, 300),
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
    this.addBirdConfigToGui(randomConfig);
    await vxm.background.addBirdConfig(randomConfig);
  }

  async removeBirdConfigFromGui(birdConfigIdToRemove: string) {
    this.gui.__folders[birdConfigIdToRemove].destroy();
    await vxm.background.removeBirdConfig.bind(birdConfigIdToRemove);
  }

  addBirdConfigToGui(configToAdd: IBirdConfig) {
    const birdFolder = this.birdsFolder.addFolder(configToAdd.id);
    birdFolder.name = truncate(configToAdd.id, 25);
    birdFolder
      .addColor(configToAdd, "birdColor")
      .setValue(configToAdd.birdColor)
      .onFinishChange(async (updatedColor) => {
        await vxm.background.updateBirdConfig({
          ...configToAdd,
          birdColor: updatedColor,
        });
      }).domElement.inputMode = "none"; // disable keyboard inputs
    // attributes w/o options
    [
      "weight",
      "neighborDistance",
      "desiredSeparation",
      "separationMultiplier",
      "alignmentMultiplier",
      "cohesionMultiplier",
      "maxSpeed",
      "maxForce",
      "birdSize",
    ].forEach((attr) => {
      birdFolder.add(configToAdd, attr).onFinishChange(async (updatedValue) => {
        await vxm.background.updateBirdConfig({
          ...configToAdd,
          [attr]: updatedValue,
        });
      });
    });

    this.birdsFolder.open();
    if (configToAdd.id !== DEFAULT_BIRD_ID) {
      birdFolder
        .add(
          {
            "-": (configToAdd: IBirdConfig) =>
              this.removeBirdConfigFromGui(configToAdd.id),
          },
          "-"
        )
        .name("(-) remove species");
    }
  }
}
</script>
