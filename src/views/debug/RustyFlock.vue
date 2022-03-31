<template>
  <ViewPortComponent class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib/renderer/view";
import { randomFromRange } from "@/lib/util/random";
import themeColors from "@/styles/themeColors";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ColorRepresentation,
  LineBasicMaterial,
  LineSegments,
  Vector2,
  Vector3,
} from "three";
import { toRaw } from "vue";
import { Options, Vue } from "vue-class-component";
import { BirdConfig, Flock } from "wasm-lib";

interface IBirdConfig {
  neighbor_distance: number;
  desired_separation: number;
  separation_multiplier: number;
  alignment_multiplier: number;
  cohesion_multiplier: number;
  max_speed: number;
  max_force: number;
  bird_size: number;
}

@Options({
  components: {
    ViewPortComponent: ViewPortComponent,
  },
})
export default class RustyFlock extends Vue {
  isDragging = false;
  view!: View;
  flock!: Flock;
  birdConfigs: Map<string, IBirdConfig> = new Map();
  birdsGeometry!: BufferGeometry;
  birdsMaterial!: LineBasicMaterial;
  birdsLine!: LineSegments;
  set = false;

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
      color: themeColors.primary[100],
    });
    this.birdsLine = new LineSegments(this.birdsGeometry, this.birdsMaterial);
    this.view.scene.add(this.birdsLine);
    this.flock = Flock.new(10000);
  }

  mounted() {
    const BIRD_SIZE = 5;
    const defaultBirdConfigParams: IBirdConfig = {
      neighbor_distance: 100,
      desired_separation: 1,
      separation_multiplier: 0.9,
      alignment_multiplier: 0.9,
      cohesion_multiplier: 0.5,
      max_speed: 3,
      max_force: 0.01,
      bird_size: BIRD_SIZE,
    };
    const config = BirdConfig.new(
      defaultBirdConfigParams.neighbor_distance,
      defaultBirdConfigParams.desired_separation,
      defaultBirdConfigParams.separation_multiplier,
      defaultBirdConfigParams.alignment_multiplier,
      defaultBirdConfigParams.cohesion_multiplier,
      defaultBirdConfigParams.max_speed,
      defaultBirdConfigParams.max_force,
      defaultBirdConfigParams.bird_size
    );
    this.flock.add_bird_config("default_config", config);
    for (let i = 0; i < 1000; i++) {
      this.addBirdToWasmFlock({
        configName: "default_config",
        birdColor: "red",
        birdSize: BIRD_SIZE,
        birdConfig: defaultBirdConfigParams,
      });
    }
  }

  updateFlockVertices(vertices: number[]) {
    // this.birdsGeometry.attributes["position"].setXYZ(index, x,y,z);
    console.log(vertices);
    this.birdsGeometry.setAttribute(
      "position",
      new BufferAttribute(vertices, 3)
    );
  }

  renderTickCallback(_: View) {
    console.log
    this.flock.update(
      this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth,
      this.updateFlockVertices
    );
  }

  addBirdToWasmFlock(props: {
    configName: string;
    birdConfig: IBirdConfig;
    birdSize: number;
    birdColor: ColorRepresentation;
  }): IBirdConfig {
    const pos_x = randomFromRange(
      -this.view.visibleWidthAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    const pos_y = randomFromRange(
      -this.view.visibleHeightAtZDepth,
      this.view.visibleHeightAtZDepth
    );
    const vel_x = randomFromRange(-0.5, 0.5);
    const vel_y = randomFromRange(-0.5, 0.5);
    const acc_x = randomFromRange(-0.5, 0.5);
    const acc_y = randomFromRange(-0.5, 0.5);
    this.flock.add_bird(
      pos_x,
      pos_y,
      vel_x,
      vel_y,
      acc_x,
      acc_y,
      "default_config"
    );
    return props.birdConfig;
  }
}
</script>
