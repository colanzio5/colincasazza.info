<template>
  <div ref="gui-container"></div>
</template>

<script lang="ts">
import useEmitter from "@/emitter";
import themeColors from "@/styles/themeColors";
import { GUI } from "dat.gui";
import { cloneDeep } from "lodash";
import { Vue } from "vue-class-component";

export default class BackgroundDebug extends Vue {
  gui!: GUI;
  emitter = useEmitter();

  get container(): HTMLElement {
    return this.$refs["gui-container"] as HTMLElement;
  }

  mounted() {;
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
      .add(this.flockConfig, "maxFlockSize", 0)
      .onFinishChange(this.applyChanges);
    globals.open();
    const birdTypes = this.gui.addFolder("birds");
    this.flockConfig.birdConfigs
      .sort((a: BirdConfig, b: BirdConfig) => a.probability - b.probability)
      .forEach((config: BirdConfig) => {
        const birdFolder = birdTypes.addFolder(
          config.probability === -1 ? config.id + " (default)" : config.id
        );
        if (config.probability !== -1) {
          birdFolder
            .add(config, "probability")
            .step(0.01)
            .min(0)
            .max(1)
            .onFinishChange(this.applyChanges).domElement.title =
            "**note** bird order determines spawn type when sum all probabilities > 1";
        }
        birdFolder
          .addColor(config, "color")
          .setValue(config.color)
          .onFinishChange(this.applyChanges)
          .domElement.inputMode = "none"; // disable keyboard inputs
        const dist = birdFolder
          .add(config, "neighborDistance")
          .min(0)
          .max(config.desiredSeparation)
          .onFinishChange(this.applyChanges);
        dist.domElement.title =
          "**note** neighbor distance must < desired separation";
        birdFolder.add(config, "desiredSeparation").onFinishChange(() => {
          this.applyChanges();
          dist.max(config.desiredSeparation);
        });

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
        color: themeColors.primary["100"],
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
