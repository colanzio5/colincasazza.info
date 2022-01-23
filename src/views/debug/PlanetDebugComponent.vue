<template>
  <div></div>
  <!-- <ViewPortComponent class="w-full h-full" :view="view" /> -->
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
// import { IPlanetOptions } from "@/lib/entity/planet.entity";
// import { ViewFactory } from "@/lib/views/factories/viewFactory";
// import RendererStore from "@/store/renderer.vuex";
// import { Color, PerspectiveCamera, Vector2, Vector3 } from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Options, Vue } from "vue-class-component";

// export class PlanetViewFactory extends ViewFactory {
//   constructor(renderer: RendererStore) {
//     const camera = new PerspectiveCamera(
//       75,
//       renderer.rendererRootViewPort.aspect,
//       0.1,
//       1000000
//     );
//     const controls = new OrbitControls(camera, renderer.renderer.domElement);
//     super({
//       id: "PLANET_DEBUG_VIEW",
//       background: new Color("black"),
//       camera,
//       controls,
//       physicsWorld
//     });
//     const vector = new Vector2(0, 0);
//     camera.position.set(vector.x, vector.y, 5000);
//     camera.lookAt(vector.x, vector.y, 0);
//     controls.target = new Vector3(vector.x, vector.y, 0);
//     controls.center = new Vector3(vector.x, vector.y, 5000);
//     controls.minAzimuthAngle = 0;
//     controls.minPolarAngle = 0;
//     controls.enableRotate = false;
//   }
// }
// const planetEntityOptions: IPlanetOptions = {
//   numberVertices: 1000,
//   radius: 1737, // https://solarsystem.nasa.gov/moons/earths-moon/by-the-numbers/
//   frequency: 3,
//   magnitude: 0.15,
//   seed: new Date().getMilliseconds(),
//   origin: new Vector2(0, 0),
//   mass: 0.07346 * 10 ** 24, // https://www.google.com/search?q=weight+of+moon+in+kg,
//   startingLinearVelocity: new Vector2(),
// };

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class PlanetDebugComponent extends Vue {
  // rigidBodies: RigidBody[] = [];
  // view?: View;
  // planetEntity!: PlanetEntity;
  // mounted(): void {
  //   this.planetEntity = new PlanetEntity(planetEntityOptions);
  //   this.view = new PlanetViewFactory(vxm.renderer).getInstance();
  //   this.view.scene.add(this.planetEntity.line);
  //   this.view.viewPort.isMounted = true;
  // }
  // unmounted(): void {
  //   this.planetEntity.destroy();
  // }
}
</script>

<style lang="scss"></style>
