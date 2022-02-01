<template></template>

<style lang="postcss">
.dg.ac {
  z-index: 9999;
  color: white;
}
</style>

<script lang="ts">
import { Bird, BirdConfig } from "@/lib/flock/bird";
import { IFlockConfig } from "@/lib/flock/flock";
import { View } from "@/lib/renderer/view";
import { randomColor } from "@/lib/util/random";
import { vxm } from "@/store";
import { GUI } from "dat.gui";
import { throttle } from "lodash";
import { Vue } from "vue-class-component";
import { IBackgroundViewData } from "./background.types";
import BackgroundView from "./BackgroundView.vue";

export default class BackgroundDebug extends Vue {
  gui = new GUI();
  flockConfig: IFlockConfig;

  computed() {
    const view = vxm.renderer.views.find((v) => v.id === "BACKGROUND_VIEW");
    if (view) throw new Error("background view was not found.");
    this.initGui();
  }

  unmounted() {
    this.gui.destroy();
  }

  async initGui() {
    if (this.gui?.destroy) this.gui.destroy();
    this.gui = new GUI();
    this.gui.domElement.style.position = "relative";
    this.gui.domElement.style.left = "0px";
    this.gui.domElement.style.bottom = "0px";
    this.gui.domElement.style.zIndex = "9999";

    const globals = this.gui.addFolder("globals");
    globals
      .add(this.flockConfig, "maxFlockSize", 0)
      .onFinishChange(this.applyFlockConfig);
    globals.open();

    const birdTypes = this.gui.addFolder("birds");
    this.flockConfig.birdConfigs.forEach((config) => {
      const birdFolder = birdTypes.addFolder(config.id);
      birdFolder.add(config, "probability").step(0.01).min(0.0).max(1.0);
      birdFolder
        .addColor(config, "color")
        .setValue(config.color.getStyle() || config.color)
        .onFinishChange(
          throttle(this.applyFlockConfig, 500, { trailing: true })
        );
      birdFolder
        .add(config, "neighborDistance")
        .onFinishChange(this.applyFlockConfig);
      birdFolder
        .add(config, "desiredSeparation")
        .onFinishChange(this.applyFlockConfig);
      birdFolder
        .add(config, "separationMultiplier")
        .onFinishChange(this.applyFlockConfig);
      birdFolder
        .add(config, "alignmentMultiplier")
        .onFinishChange(this.applyFlockConfig);
      birdFolder
        .add(config, "cohesionMultiplier")
        .onFinishChange(this.applyFlockConfig);
      birdFolder.add(config, "maxSpeed").onFinishChange(this.applyFlockConfig);
      birdFolder.add(config, "maxForce").onFinishChange(this.applyFlockConfig);
      // rendering constants
      birdFolder.add(config, "birdSize").onFinishChange(this.applyFlockConfig);
    });
    birdTypes.add({ addType: this.addBirdType }, "addType");
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
    this.applyFlockConfig();
  }

  async applyFlockConfig() {
    const view = await vxm.renderer.getViewById<IBackgroundViewData>({
      viewId: "BACKGROUND_VIEW",
    });

    const { birdsAdded, birdsRemoved } = view.viewData.flock.applyFlockConfig();
    view.viewData.flock.flockConfig = this.flockConfig;
    view.viewData.flock.birds = birdsAdded;
    view.scene.add(...birdsAdded.map((i) => i.line));
    view.scene.remove(...birdsRemoved.map((i) => i.line));
  }
}
</script>
