<template></template>

<style lang="postcss">
.dg.ac {
  z-index: 9999;
  color: white;
}
</style>

<script lang="ts">
import useEmitter from "@/emitter";
import { BirdConfig } from "@/lib/flock/bird";
import { IFlockConfig } from "@/lib/flock/flock";
import { randomColor } from "@/lib/util/random";
import { GUI } from "dat.gui";
import { cloneDeep } from "lodash";
import { Vue } from "vue-class-component";
import { backgroundFlock } from "./background";

export default class BackgroundDebug extends Vue {
  gui = new GUI();
  flockConfig!: IFlockConfig;
  emitter = useEmitter();

  mounted() {
    this.flockConfig = cloneDeep({ ...backgroundFlock.flockConfig });
    this.initGui();
  }

  unmounted() {
    this.gui.destroy();
  }

  async initGui() {
    this.gui.destroy();
    this.gui = new GUI();
    this.gui.domElement.style.width = "max-content";
    this.gui.domElement.style.position = "relative";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";
    const globals = this.gui.addFolder("globals");
    globals
      .add(this.flockConfig, "maxFlockSize", 0)
      .onFinishChange(this.applyChanges);
    globals.open();
    const birdTypes = this.gui.addFolder("birds");
    this.flockConfig.birdConfigs.forEach((config: BirdConfig) => {
      const birdFolder = birdTypes.addFolder(
        config.probability === -1 ? config.id + " (default)" : config.id
      );
      if (config.probability !== -1) {
        birdFolder
          .add(config, "probability")
          .step(0.01)
          .onFinishChange(this.applyChanges);
      }
      birdFolder
        .addColor(config, "color")
        .setValue(config.color)
        .onFinishChange(this.applyChanges);
      birdFolder
        .add(config, "neighborDistance")
        .onFinishChange(this.applyChanges);
      birdFolder
        .add(config, "desiredSeparation")
        .onFinishChange(this.applyChanges);
      birdFolder
        .add(config, "separationMultiplier")
        .onFinishChange(this.applyChanges);
      birdFolder
        .add(config, "alignmentMultiplier")
        .onFinishChange(this.applyChanges);
      birdFolder
        .add(config, "cohesionMultiplier")
        .onFinishChange(this.applyChanges);
      birdFolder.add(config, "maxSpeed").onFinishChange(this.applyChanges);
      birdFolder.add(config, "maxForce").onFinishChange(this.applyChanges);
      birdFolder.add(config, "birdSize").onFinishChange(this.applyChanges);
      if (config.probability !== -1) {
        birdFolder
          .add({ "-": this.removeBird.bind(this, config) }, "-")
          .onFinishChange(this.applyChanges);
      }
      birdFolder.open();
    });
    birdTypes.add({ "+": this.addBirdType }, "+");
    // birdTypes.add({ applyChanges: this.applyChanges }, "applyChanges");
    birdTypes.open();
  }

  addBirdType() {
    this.flockConfig.birdConfigs.push(
      new BirdConfig({
        neighborDistance: 25,
        desiredSeparation: 30,
        separationMultiplier: 0.4,
        alignmentMultiplier: 0.3,
        cohesionMultiplier: 0.3,
        maxSpeed: 2,
        maxForce: 0.05,
        birdSize: 5,
        color: randomColor().getStyle(),
        probability: 0.0,
      })
    );
    this.initGui();
  }

  removeBird(config: BirdConfig) {
    this.flockConfig.birdConfigs = this.flockConfig.birdConfigs.filter(
      (c: BirdConfig) => c.id !== config.id
    );
    this.initGui();
  }

  applyChanges() {
    this.emitter.emit("apply-flock-config", cloneDeep(this.flockConfig));
  }
}
</script>
