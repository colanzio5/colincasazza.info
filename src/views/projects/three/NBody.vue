<template>
  <NBodyDatGUI :simConfig="simConfig" />
  <ViewPortComponent class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import {
  INBodyEntityOptions,
  NBodyEntity,
} from "@/lib/renderer/entitys/nbody.entity";
import { View } from "@/lib/renderer/view";
import { randomFromRange, randomIntFromRange } from "@/lib/util/random";
import RAPIER, {
  RigidBody,
  RigidBodyDesc,
  RigidBodyType,
  World,
} from "@dimforge/rapier2d-compat";
import { toRaw } from "@vue/reactivity";
import { Color, ColorRepresentation, Scene, Vector2, Vector3 } from "three";
import { Options, Vue } from "vue-class-component";
import NBodyDatGUI from "@/views/projects/three/NBodyDatGUI.vue"

@Options({
  components: {
    NBodyDatGUI,
    ViewPortComponent,
  },
})
export default class NBody extends Vue {
  view!: View;
  nBodies: { entity: NBodyEntity; rigidBody: RigidBody }[] = [];
  simConfig: {
    radius: number;
    mass: number;
    origin: Vector3;
    linearVelocity: Vector3;
    angularVelocity: number;
    color: ColorRepresentation;
  }[] = [
    {
      origin: new Vector3(-380400, 0),
      mass: 7.34767309 * (10 ** 22),
      radius: 1737.4,
      linearVelocity: new Vector3(0, 2500),
      angularVelocity: 0,
      color: themeColors.primary["100"],
    },
    {
      origin: new Vector3(0, 0),
      mass: 5.972 * (10 ** 24),
      radius: 6371,
      linearVelocity: new Vector3(0, 100),
      angularVelocity: 0,
      color: themeColors.primary["100"],
    },
  ];
  physicsWorld!: World;

  created(): void {
    this.physicsWorld = new RAPIER.World({ x: 0, y: 0 });
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1000000,
        startingPosition: new Vector3(0, 0, 400000),
      },
      controlsOptions: {
        enabled: true,
        startDirection: new Vector3(0, 0, 0),
      },
      renderTickCallback: this.renderTickCallback,
      id: "PLANET_DEBUG_VIEW",
      background: new Color("black"),
    });
  }

  mounted(): void {
    this.configSimulation();
  }

  unmounted(): void {
    for (const { entity } of this.nBodies) {
      this.view.scene.remove(toRaw(entity.line));
      this.view.scene.remove(toRaw(entity.debugPath.line));
    }
  }
  renderTickCallback(_: View) {
    this.applyGravity();
    this.physicsWorld.step();
    // update visual entities to reflect rigidbodies
    for (const { entity, rigidBody } of this.nBodies) {
      const { x, y } = rigidBody.translation();
      entity.line.position.setX(x);
      entity.line.position.setY(y);
      entity.line.rotation.set(0, 0, rigidBody.rotation());
      entity.line.geometry.computeBoundingSphere();
      entity.debugPath.addPoint(new Vector3(x, y));
    }
  }

  configSimulation() {
    this.nBodies = Array.from(this.simConfig).map((config) => {
      const options: INBodyEntityOptions = {
        numberVertices: randomIntFromRange(500, 1000),
        frequency: randomIntFromRange(0, 5),
        magnitude: randomFromRange(0, 0.3),
        seed: randomIntFromRange(0, 5),
        ...config,
      };
      const entity = new NBodyEntity(options);
      const rigidBodyDesc = new RigidBodyDesc(RigidBodyType.Dynamic)
        .setTranslation(options.origin.x, options.origin.y)
        .setAngvel(options.angularVelocity)
        .setAdditionalMass(options.mass)
        .setCanSleep(true)
        .setCcdEnabled(false)
        .setLinvel(options.linearVelocity.x, options.linearVelocity.y);
      const rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);
      return { entity, rigidBody };
    });

    for (const { entity } of this.nBodies) {
      this.view.scene.add(toRaw(entity.line));
      this.view.scene.add(toRaw(entity.debugPath.line));
    }
  }

  clearSimulation() {
    this.nBodies.forEach(body => body.entity.dispose())
    this.view.scene = new Scene();
    this.nBodies = []
  }

  applyGravity() {
    for (const body of this.nBodies) {
      const otherBodies = this.nBodies.filter((b) => b !== body);
      const { rigidBody } = body;
      const G = 6.67 * 10 ** -16;
      const fGOtherBodies = otherBodies.map((item) => {
        const planetoidPos = new Vector2(
          rigidBody.translation().x,
          rigidBody.translation().y
        );
        const itemPos = new Vector2(
          item.rigidBody.translation().x,
          item.rigidBody.translation().y
        );
        const R = itemPos.distanceTo(planetoidPos);
        return itemPos
          .clone()
          .sub(planetoidPos)
          .multiplyScalar(G * ((rigidBody.mass() * rigidBody.mass()) / R ** 2));
      });
      const fGNet = fGOtherBodies.reduce(
        (previous: Vector2, current: Vector2) => previous.add(current),
        new Vector2()
      );
      rigidBody.applyForce(fGNet, true);
    }
  }
}
</script>

<style lang="scss"></style>
