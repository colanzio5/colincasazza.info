<template>
  <div ref="gui-container"></div>
</template>

<script lang="ts">
import useEmitter from "@/emitter";
import { IWeightedArray } from "@/lib/util/random";
import { vxm } from "@/store";
import { GUI } from "dat.gui";
import { Vue } from "vue-class-component";
import { IBirdConfig } from "./background";
import FlockBackground from "./FlockBackground.vue";

export default class BackgroundDebug extends Vue {
  gui!: GUI;
  emitter = useEmitter();

  get container(): HTMLElement {
    return this.$refs["gui-container"] as HTMLElement;
  }

  mounted() {
    console.log(vxm.background.birdConfigs);
    this.initGui();
  }

  unmounted() {
    this.destroyGUI();
  }

  destroyGUI() {
    while (this.container?.lastChild)
      this.container.removeChild(this.container.lastChild);
  }

  async initGui() {
    this.destroyGUI();
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
      .name("max flock size")
      .onFinishChange(this.applyChanges);
    globals.open();

    const birdTypes = this.gui.addFolder("birds");
    const sortedConfigs = vxm.background.birdConfigs.sort(
      (a: IBirdConfig, b: IBirdConfig) => a.probability - b.probability
    );

    sortedConfigs.forEach((config: IBirdConfig) => {
      const probability =
        config.probability === -1 ? config.id + " (default)" : config.id;
      const birdFolder = birdTypes.addFolder(probability);
      if (config.probability !== -1) {
        birdFolder.add(config, "probability").step(0.01).min(0).max(1);
        birdFolder.domElement.title =
          "**note** bird order determines spawn type when sum all probabilities > 1";
      }
      console.log(config);
      birdFolder
        .addColor(config, "birdColor")
        .setValue(config.birdColor)
        .onFinishChange(
          vxm.background.updateBirdConfig.bind(this, config)
        ).domElement.inputMode = "none"; // disable keyboard inputs
      const dist = birdFolder
        .add(config, "neighborDistance")
        .min(0)
        .max(config.desiredSeparation)
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      dist.domElement.title =
        "**note** neighbor distance must < desired separation";
      birdFolder.add(config, "desiredSeparation").onFinishChange(() => {
        vxm.background.updateBirdConfig.bind(this, config)();
        dist.max(config.desiredSeparation);
      });
      birdFolder
        .add(config, "separationMultiplier")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      birdFolder
        .add(config, "alignmentMultiplier")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      birdFolder
        .add(config, "cohesionMultiplier")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      birdFolder
        .add(config, "maxSpeed")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      birdFolder
        .add(config, "maxForce")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      birdFolder
        .add(config, "birdSize")
        .onFinishChange(vxm.background.updateBirdConfig.bind(this, config));
      if (config.probability !== -1) {
        birdFolder.add(
          { "-": vxm.background.removeBirdConfig.bind(this, config) },
          "-"
        );
      }
    });
    birdTypes.add({ "+": this.addBirdType }, "+");
    // birdTypes.add({ applyChanges: this.applyChanges }, "applyChanges");
    birdTypes.open();
  }

  addBirdType() {
    // this.flockConfig.birdConfigs.push(
    //   new BirdConfig({
    //     neighborDistance: 25,
    //     desiredSeparation: 30,
    //     separationMultiplier: 0.4,
    //     alignmentMultiplier: 0.3,
    //     cohesionMultiplier: 0.3,
    //     maxSpeed: 2,
    //     maxForce: 0.05,
    //     birdSize: 5,
    //     color: themeColors.primary["100"],
    //     probability: 0.0,
    //   })
    // );

    this.initGui();
  }
}
</script>
