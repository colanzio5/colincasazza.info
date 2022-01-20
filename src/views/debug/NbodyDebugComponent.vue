<template>
  <ViewPortComponent v-if="view" class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib";
import { IPlanetOptions, PlanetEntity } from "@/lib/entity/planet.entity";
import { vxm } from "@/store";
import RendererStore from "@/store/renderer/renderer.vuex";
import { Line, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";

function generateView(
  renderer: RendererStore,
  renderTickCallback: () => void
): View {
  const view = new View({
    cameraOptions: {
      fov: 75,
      near: 0.1,
      far: 1000000,
    },
    renderTickCallback,
    id: "NBODY_DEMO_COMPONENT",
  });

  const vector = new Vector3(0, 0, 750000);
  view.camera.position.set(vector.x, vector.y, vector.z);
  view.camera.lookAt(vector.x, vector.y, 0);
  view.controls.target = new Vector3(vector.x, vector.y, 0);
  view.controls.center = new Vector3(vector.x, vector.y, vector.z);
  view.controls.minAzimuthAngle = 0;
  view.controls.minPolarAngle = 0;
  view.controls.maxZoom = 1000000;
  view.controls.enableRotate = false;

  return view;
}

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class NbodyDebugComponent extends Vue {
  planet!: PlanetEntity;
  moon!: PlanetEntity;
  view!: View;

  created(): void {
    this.view = generateView(vxm.renderer, this.animate);
  }

  mounted(): void {
    this.planet = new PlanetEntity(
      {
        origin: new Vector2(0, 0),
        mass: 5.972 * 10 ** 24,
        radius: 6371,
        startingLinearVelocity: new Vector2(0, 500),
      } as IPlanetOptions,
      this.view.physicsWorld
    );
    this.moon = new PlanetEntity(
      {
        origin: new Vector2(-380400, 0),
        mass: 7.34767309 * 10 ** 22,
        frequency: 5,
        magnitude: 0.1,
        startingLinearVelocity: new Vector2(0, 35000),
        radius: 1737.4,
      } as IPlanetOptions,
      this.view.physicsWorld
    );
    this.view.scene.add(
      ...[this.planet.debugPath.line, this.moon.debugPath.line]
    );
    this.view.addEntities([
      this.planet,
      this.planet.debugPath,
      this.moon,
      this.planet.debugPath,
    ]);
    vxm.renderer.views.addView({ view: this.view, makeActive: true });
    this.view.viewPort.isMounted = true;
  }

  animate(): void {
    if (!this.view) return;
    this.applyGravityToView(this.view);
    this.view.physicsWorld.step();
    for (const entity of this.view.entities) {
      if (!entity.rigidBody) continue;
      const { x, y } = entity.rigidBody.translation();
      entity.line.position.setX(x);
      entity.line.position.setY(y);
      entity.line.rotation.set(0, 0, entity.rigidBody.rotation());
      (entity.line as Line).geometry.computeBoundingSphere();
      (entity as PlanetEntity).debugPath.addPoint(new Vector2(x, y));
    }
    this.view.camera.updateProjectionMatrix();
  }

  unmounted(): void {
    [this.moon, this.planet].forEach((e) => e?.destroy());
  }

  applyGravityToView(view: View): View {
    for (const entity of view.entities) {
      if (entity.rigidBody == null) continue;

      const otherBodies = view.entities.filter((item) => item !== entity);
      const G = 6.67 * 10 ** -11;
      for (const body of otherBodies) {
        if (!body.rigidBody) continue;
        const entityPos = new Vector2(
          entity.rigidBody.translation().x,
          entity.rigidBody.translation().y
        );
        const itemPos = new Vector2(
          body.rigidBody.translation().x,
          body.rigidBody.translation().y
        );
        const R = itemPos.distanceTo(entityPos);
        const fG = itemPos
          .sub(entityPos)
          .multiplyScalar(
            G * ((entity.rigidBody.mass() * body.rigidBody.mass()) / R ** 3)
          );
        entity.rigidBody.applyForce(fG, true);
      }
    }
    return view;
  }
}
</script>

<style lang="scss"></style>
