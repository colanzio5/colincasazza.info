<template>
  <ViewPortComponent class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib/renderer/view";
import themeColors from "@/styles/themeColors";
import {
  BufferAttribute,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from "three";
import { Options, Vue } from "vue-class-component";

const GRID_HEIGHT = 100,
  GRID_WIDTH = 100,
  GRID_W_DIVISIONS = 3,
  GRID_H_DIVISIONS = 6;

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class WavesOnAPlaneGeometry extends Vue {
  view!: View;
  geometry!: PlaneGeometry;
  material!: MeshBasicMaterial;
  plane!: Mesh;
  scrollIdx = 0;
  throttle = 0;
  last = 0;
  hz = 1;
  inc = 5;

  created(): void {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1000000,
        startingPosition: new Vector3(0, 0, 100),
      },
      controlsOptions: {
        enabled: true,
        enableRotate: true,
        startDirection: new Vector3(0, 0, 0),
      },
      renderTickCallback: this.renderTickCallback,
      id: "PLANET_DEBUG_VIEW",
      background: new Color("black"),
    });
    const options = [
      GRID_WIDTH,
      GRID_HEIGHT,
      GRID_W_DIVISIONS,
      GRID_H_DIVISIONS,
    ];
    this.geometry = new PlaneGeometry(...options);
    this.material = new MeshBasicMaterial({
      color: themeColors.primary["500"],
      wireframe: true,
    });
    this.plane = new Mesh(this.geometry, this.material);
    this.plane.rotateX(-70 * (Math.PI / 180));
    this.geometry.center();
  }

  mounted(): void {
    this.view.scene.add(this.plane);
  }

  unmounted(): void {
    this.view.scene.add(this.plane);
  }

  renderTickCallback(view: View, timeStepMS: number): void {
    const current = this.geometry.getAttribute("position");
    if (!current) return;
    if ((this.last += timeStepMS) < 1 / (this.hz += 0.001)) return;
    this.last = 0;
    const next = Float32Array.from(current.array);
    const row = this.scrollIdx++ % (GRID_H_DIVISIONS + 1);
    const itemsPerRow = GRID_W_DIVISIONS + 1;
    const start = row * itemsPerRow;
    const end = start + itemsPerRow - 1;
    for (let i = start; i <= end; i++) {
      next[i * current.itemSize + 2] =
        next[i * current.itemSize + 2] + this.inc;
    }
    const prevRow = row - 1 == -1 ? GRID_H_DIVISIONS : row - 1;
    const prevStart = prevRow * itemsPerRow;
    const prevEnd = prevStart + itemsPerRow - 1;
    for (let i = prevStart; i <= prevEnd; i++) {
      next[i * current.itemSize + 2] = 0;
    }
    this.geometry.setAttribute(
      "position",
      new BufferAttribute(next, current.itemSize)
    );
  }
}
</script>

<style lang="scss"></style>
