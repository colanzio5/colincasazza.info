<template></template>

<style lang="postcss">
.dg.ac {
  z-index: 9999;
  color: white;
  /* position: absolute;
  height: 100%;
  bottom: 0;
  left: 0; */
}

</style>

<script lang="ts">
import { Vue } from "vue-class-component";
import { vxm } from "@/store";
import { GUI } from "dat.gui";
import { Flock, IFlockConfig } from "@/lib/flock/flock";
import { Color } from "three";
import { randomColor } from "@/lib/util/random";

export default class BackgroundDebug extends Vue {
  gui = new GUI();
  flockConfig!: IFlockConfig;

  async mounted() {
    const flock = await this.getFlock();
    this.flockConfig = flock.flockConfig;
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
    // config colors gui
    const colors = this.gui.addFolder("Colors");
    this.flockConfig.birdColors.forEach(
      (color: { probability: number; value: Color }) => {
        // const colorFolder = colors.addFolder("");
        colors.add(color, "probability").step(0.01).min(0.0).max(1.0);
        colors
          .addColor(color, "value")
          .setValue(color.value.getStyle())
          .onChange(this.updateFlockConfig);
      }
    );
    colors.add({ addColor: this.addColor }, "addColor");
    colors.open();
    // config weights gui
    const weights = this.gui.addFolder("weights");
    weights
      .add(this.flockConfig, "neighborDistance")
      .onChange(this.updateFlockConfig);
    weights
      .add(this.flockConfig, "desiredSeparation")
      .onChange(this.updateFlockConfig);
    weights
      .add(this.flockConfig, "separationMultiplier")
      .onChange(this.updateFlockConfig);
    weights
      .add(this.flockConfig, "alignmentMultiplier")
      .onChange(this.updateFlockConfig);
    weights
      .add(this.flockConfig, "cohesionMultiplier")
      .onChange(this.updateFlockConfig);
    weights.add(this.flockConfig, "maxSpeed").onChange(this.updateFlockConfig);
    weights.add(this.flockConfig, "maxForce").onChange(this.updateFlockConfig);
    // rendering constants
    weights
      .add(this.flockConfig, "maxFlockSize")
      .onChange(this.updateFlockConfig);
    weights
      .add(this.flockConfig, "birdRadius")
      .onChange(this.updateFlockConfig);
    weights.add(this.flockConfig, "birdSize").onChange(this.updateFlockConfig);
    weights.open();
  }

  async addColor() {
    this.flockConfig.birdColors.map(
      (color: { probability: number; value: Color }) =>
        (color.value = new Color(color.value))
    );
    this.flockConfig.birdColors.push({
      value: randomColor(),
      probability: 0.0,
    });
    this.updateFlockConfig();
    this.initGui();
  }

  async updateFlockConfig() {
    const view = await vxm.renderer.views.getViewById("BACKGROUND_VIEW");
    const flock = (view.meta as { flock: Flock }).flock;
    flock.flockConfig = { ...flock.flockConfig, ...this.flockConfig };
    view.meta = { flock: flock };
    vxm.renderer.views.setViewById({ id: "BACKGROUND_VIEW", view });
    console.dir((await this.getFlock()).flockConfig);
  }

  async getFlock() {
    const view = await vxm.renderer.views.getViewById("BACKGROUND_VIEW");
    return (view.meta as { flock: Flock }).flock;
  }
}
</script>
