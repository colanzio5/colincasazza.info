<template>
  <ViewPortComponent v-if="view" class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { INBodyOptions, NBodyEntity } from "@/lib/nBody/nBody.entity";
import { IViewOptions, View } from "@/lib/renderer/view";
import { Line, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class NbodyDebugComponent extends Vue {
  view!: View;
  planet!: NBodyEntity;
  moon!: NBodyEntity;

  viewOptions: IViewOptions = {
    id: "NBODY_DEBUG_VIEW",
    renderTickCallback: this.renderTickCallback,
    cameraOptions: {
      fov: 75,
      near: 0.1,
      far: 1000000,
      startingPosition: new Vector3(0, 0, 10000),
    },
    controlsOptions: {
      startDirection: new Vector3(0, 0, 0),
      enabled: true,
    },
  };

  created(): void {
    this.view = new View(this.viewOptions);
  }

  mounted(): void {
    // ? does this even work from outside the store
    this.view.controls.minAzimuthAngle = 0;
    this.view.controls.minPolarAngle = 0;
    this.view.controls.maxZoom = 1000000;
    this.view.controls.enableRotate = false;
    this.planet = new NBodyEntity(
      {
        origin: new Vector2(0, 0),
        mass: 5.972 * 10 ** 24,
        radius: 6371,
        startingLinearVelocity: new Vector2(0, 500),
      } as INBodyOptions,
      this.view.physicsWorld
    );
    this.moon = new NBodyEntity(
      {
        origin: new Vector2(-380400, 0),
        mass: 7.34767309 * 10 ** 22,
        frequency: 5,
        magnitude: 0.1,
        startingLinearVelocity: new Vector2(0, 35000),
        radius: 1737.4,
      } as INBodyOptions,
      this.view.physicsWorld
    );
    this.view.scene.add(
      ...[this.planet.debugPath.line, this.moon.debugPath.line]
    );
    this.view.addEntities([
      this.planet.line,
      this.planet.debugPath.line,
      this.moon.line,
      this.planet.debugPath.line,
    ]);
  }

  unmounted(): void {
    [this.moon, this.planet].forEach((e) => e?.destroy());
  }

  renderTickCallback(): void {
    if (!this.view) return;
    this.view.applyGravity();
    this.view.physicsWorld.step();
    for (const entity of this.view.entities) {
      if (!entity.rigidBody) continue;
      const { x, y } = entity.rigidBody.translation();
      entity.line.position.setX(x);
      entity.line.position.setY(y);
      entity.line.rotation.set(0, 0, entity.rigidBody.rotation());
      (entity.line as Line).geometry.computeBoundingSphere();
      (entity as NBodyEntity).debugPath.addPoint(new Vector2(x, y));
    }
    this.view.camera.updateProjectionMatrix();
  }
}
</script>

<style lang="scss"></style>
