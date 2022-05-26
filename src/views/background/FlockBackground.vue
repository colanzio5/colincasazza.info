<template>
  <ViewPortComponent :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib/renderer/view";
import {
selectRandomFromWeightedArray
} from "@/lib/util/random";
import { store, vxm } from "@/store";
import { throttle } from "lodash";
import {
BufferAttribute,
BufferGeometry,
Color,
LineBasicMaterial,
LineSegments,
Vector2,
Vector3
} from "three";
import { generateUUID, lerp } from "three/src/math/MathUtils";
import { Options, Vue } from "vue-class-component";
import init, { BirdConfig, Flock } from "wasm-lib";
import {
IBirdConfig,
MAX_FLOCK_SIZE
} from "./background";

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class FlockBackground extends Vue {
  addBirdsToFlockInterval!: NodeJS.Timer | number;
  // variables for rendering flock
  view!: View;
  birdsGeometry: any;
  birdsMaterial: any;
  birdsLine: any;
  // flock variables
  flock!: Flock;

  created() {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1200,
        startingPosition: new Vector3(0, 0, 1000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: false,
      },
      id: "BACKGROUND_VIEW",
      background: new Color("black"),
      renderTickCallback: this.renderTickCallback,
    });
    this.birdsGeometry = new BufferGeometry();
    this.birdsMaterial = new LineBasicMaterial({
      vertexColors: true,
    });
    this.birdsLine = new LineSegments(this.birdsGeometry, this.birdsMaterial);
    this.view.scene.add(this.birdsLine);
  }

  async mounted() {
    await init();
    this.flock = Flock.new(
      // todo: determine number birds to add based on screen size and performance
      // const n = (this.view.viewPort.width * this.view.viewPort.height) / 500;
      MAX_FLOCK_SIZE,
      BigInt(new Date().getUTCMilliseconds())
    );
    // add configs for flock
    for (const birdConfig of vxm.background.birdConfigs) {
      this.addBirdConfig(birdConfig, birdConfig.id);
    }
    vxm.background.isLoaded = true;

    vxm.background.$subscribeAction( "updateBirdConfig", {
      before: (payload :any) => console.log( "updating bird config, before", payload),
      after: (payload :any) => console.log( "updating bird config, after", payload),
    })


    vxm.background.$subscribeAction( "removeBirdConfig", {
      before: (payload :any) => console.log( "removing bird config, before", payload),
      after: (payload :any) => console.log( "removing bird config, after", payload),
    })

    


    // this.emitter.on("add_bird_config", this.applyFlockConfig);
    // this.emitter.on("remove_bird_config", this.removeBirdConfig);
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener(
      "mousedown",
      () => (vxm.background.isDragging = true),
      false
    );
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener(
      "mouseup",
      () => (vxm.background.isDragging = false),
      false
    );
    // add the birds, but throttle it
    let numberBirdsToAdd = MAX_FLOCK_SIZE;
    this.addBirdsToFlockInterval = window.setInterval(() => {
      if (!numberBirdsToAdd--)
        clearInterval(this.addBirdsToFlockInterval as NodeJS.Timer);
      const config = selectRandomFromWeightedArray(vxm.background.birdConfigs);
      this.flock.add_bird(
        config.id,
        this.view.visibleWidthAtZDepth,
        this.view.visibleHeightAtZDepth
      );
    }, 25);
  }

  unmounted() {
    /** remove all the random event listeners weve added */
    window.addEventListener("touchstart", throttle(this.touchDrag, 10), false);
    window.addEventListener("touchmove", throttle(this.touchDrag, 10), false);
    window.addEventListener(
      "mousedown",
      () => (vxm.background.isDragging = true),
      false
    );
    window.addEventListener("mousemove", throttle(this.mouseDrag, 10), false);
    window.addEventListener(
      "mouseup",
      () => (vxm.background.isDragging = false),
      false
    );
    clearInterval(this.addBirdsToFlockInterval as NodeJS.Timer);
    /** make sure we clean up the wasm resources
    can we write this into the flock free function */
    for (const config of vxm.background.birdConfigs) config.config?.free();
    this.flock.free();
  }

  updateFlockGeometry(vertices: Float32Array, colors: Float32Array) {
    this.birdsLine.geometry.setAttribute(
      "position",
      new BufferAttribute(vertices, 3)
    );
    this.birdsLine.geometry.setAttribute(
      "color",
      new BufferAttribute(colors, 3)
    );
  }

  renderTickCallback(_: View) {
    if (!vxm.background.isLoaded) return;
    this.flock.update(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth,
      3,
      this.updateFlockGeometry
    );
  }

  addBirdConfig(birdConfig: IBirdConfig, id: string = generateUUID()) {
    const color = new Color(birdConfig.birdColor);
    const config = BirdConfig.new(
      birdConfig.neighborDistance,
      birdConfig.desiredSeparation,
      birdConfig.separationMultiplier,
      birdConfig.alignmentMultiplier,
      birdConfig.cohesionMultiplier,
      birdConfig.maxSpeed,
      birdConfig.maxForce,
      birdConfig.birdSize,
      color.r,
      color.g,
      color.b
    );
    this.flock.add_bird_config(id, config);
  }

  updateBirdConfig(configId: string, updateBirdConfig: IBirdConfig) {
    const color = new Color(updateBirdConfig.birdColor);
    const config = BirdConfig.new(
      updateBirdConfig.neighborDistance,
      updateBirdConfig.desiredSeparation,
      updateBirdConfig.separationMultiplier,
      updateBirdConfig.alignmentMultiplier,
      updateBirdConfig.cohesionMultiplier,
      updateBirdConfig.maxSpeed,
      updateBirdConfig.maxForce,
      updateBirdConfig.birdSize,
      color.r,
      color.g,
      color.b
    );
    this.flock.update_bird_config(configId, config);
  }

  removeBirdConfig(id: string) {
    this.flock.remove_bird_config(id);
  }

  addBirdFromCanvasEvent(x: number, y: number) {
    const halfWidth = this.view.viewPort.width / 2;
    const halfHeight = this.view.viewPort.height / 2;
    const normClickX = x / this.view.viewPort.width;
    const normClickY = y / this.view.viewPort.height;
    const position = new Vector2(
      lerp(-halfWidth, halfWidth, normClickX),
      lerp(-halfHeight, halfHeight, normClickY) * -1
    );
    // this.addBirdToWasmFlock({ configId: "default" });
  }

  mouseDrag(event: MouseEvent) {
    if (!vxm.background.isDragging || vxm.background.updating) return;
    const { x, y } = event;
    this.addBirdFromCanvasEvent(x, y);
  }

  touchDrag(event: TouchEvent) {
    const touch = event.touches.item(event.touches.length - 1);
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    this.addBirdFromCanvasEvent(x, y);
  }
}
</script>
