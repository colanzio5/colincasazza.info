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
import { cloneDeep, throttle } from "lodash";
import { Color } from "three";
import { Vue } from "vue-class-component";
import { backgroundFlock } from "./background";

export default class BackgroundDebug extends Vue {
  gui = new GUI();
  flockConfig: IFlockConfig = cloneDeep(backgroundFlock.flockConfig);
  emitter = useEmitter();

  mounted() {
    this.initGui();
  }

  unmounted() {
    this.gui.destroy();
  }

  async initGui() {
    if (this.gui.destroy) this.gui.destroy();
    this.gui = new GUI();
    this.gui.domElement.style.width = "max-content";
    this.gui.domElement.style.position = "relative";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";
    const globals = this.gui.addFolder("globals");
    globals.add(this.flockConfig, "maxFlockSize", 0);
    globals.open();
    const birdTypes = this.gui.addFolder("birds");
    this.flockConfig.birdConfigs.forEach((config) => {
      const birdFolder = birdTypes.addFolder(config.id);
      birdFolder.add(config, "probability").step(0.01).min(0.0).max(1.0);
      birdFolder.addColor(config, "color").setValue(new Color(config.color));
      birdFolder.add(config, "neighborDistance");
      birdFolder.add(config, "desiredSeparation");
      birdFolder.add(config, "separationMultiplier");
      birdFolder.add(config, "alignmentMultiplier");
      birdFolder.add(config, "cohesionMultiplier");
      birdFolder.add(config, "maxSpeed");
      birdFolder.add(config, "maxForce");
      birdFolder.add(config, "birdSize");
    });
    birdTypes.add({ addType: this.addBirdType }, "addType");
    birdTypes.add({ applyChanges: this.applyChanges }, "applyChanges");
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
        color: randomColor(),
        probability: 0.0,
      })
    );
    this.initGui();
  }

  applyChanges() {
    this.emitter.emit("apply-flock-config", cloneDeep(this.flockConfig));
  }
}
</script>
