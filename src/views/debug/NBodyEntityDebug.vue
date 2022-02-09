<template>
  <ViewPortComponent class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { NBodyEntity } from "@/lib/renderer/entitys/nbody.entity";
import { View } from "@/lib/renderer/view";
import { randomFromRange, randomIntFromRange } from "@/lib/util/random";
import { Color, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";
import { Prop } from 'vue-property-decorator';

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class NBodyEntityComponent extends Vue {
  @Prop({ required: true, type: String }) id!: string;

  rot: number = randomFromRange(-0.001, 0.001)
  view!: View;
  planetEntity!: NBodyEntity;

  created(): void {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1000000,
      },
      renderTickCallback: this.renderTickCallback,
      id: "PLANET_DEBUG_VIEW",
      background: new Color("black"),
    });
    this.planetEntity = new NBodyEntity({
      numberVertices: 1000,
      radius: randomIntFromRange(1000,2000), // https://solarsystem.nasa.gov/moons/earths-moon/by-the-numbers/
      frequency: randomIntFromRange(3,5),
      magnitude: randomFromRange(0,0.5),
      seed: new Date().getMilliseconds(),
      origin: new Vector3(0, 0),
      mass: 0.07346 * 10 ** 24, // https://www.google.com/search?q=weight+of+moon+in+kg,
      linearVelocity: new Vector3(),
      angularVelocity: 0,
      color: "white"
    });
  }

  mounted(): void {
    const vector = new Vector2(0, 0);
    this.view.camera.position.set(vector.x, vector.y, 5000);
    this.view.camera.lookAt(vector.x, vector.y, 0);
    this.view.controls.target = new Vector3(vector.x, vector.y, 0);
    this.view.controls.center = new Vector3(vector.x, vector.y, 5000);
    this.view.controls.minAzimuthAngle = 0;
    this.view.controls.minPolarAngle = 0;
    this.view.controls.enableRotate = false;
    this.view.scene.add(this.planetEntity.line);
    this.view.viewPort.isMounted = true;
  }

  unmounted(): void {
    this.planetEntity.destroy();
  }

  renderTickCallback(_: View): void {
    this.planetEntity.line.rotateZ(this.rot)
  }
}
</script>

<style lang="scss"></style>
