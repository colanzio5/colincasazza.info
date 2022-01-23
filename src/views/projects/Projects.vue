<template>
  <div class="projects-wrapper">
    <div v-for="category in categories" :key="category.subject">
      <div class="text-4xl">{{ category.subject }}</div>
      <div class="mb-2" v-for="item in category.items" :key="item.heading">
        <div class="text-xl">{{ item.heading }}</div>
        <div class="text-sm" v-html="item.text"></div>
        <router-link class="link" :to="item.link">{{
          getFullLink(item)
        }}</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.projects-wrapper {
  @apply w-full h-full text-white overflow-y-scroll text-left p-0;
}
</style>

<script lang="ts">
import { Vue } from "vue-class-component";
export default class Projects extends Vue {
  getFullLink(item: { link: string }): string {
    return window.location.origin + item.link;
  }
  // ! this (and router objects) should both be coming
  // ! from the same source. [refactor]
  categories = [
    // {
    //   subject: "Notebooks",
    //   items: [
    //     {
    //       heading: "Inverse Kinematics Approximation",
    //       text: "Apromixation of a 2d inverse kinematic function.",
    //       link: "/projects/notebooks/2d-inverse-kinematics",
    //     },
    //   ],
    // },
    {
      subject: "Three.js",
      items: [
        {
          heading: "NBody",
          text: "Simple NBody Simulation w/ <a href='https://rapier.rs/'>rapier</a> physics engine.",
          link: "/projects/three/nbody",
        },
        {
          heading: "Perspective vs Ortho Camera Demo",
          text: "A quick three.js camera demo, taken from the three.js website's examples and implemented here in vue3. <br /> See <a href='https://threejs.org/examples/#webgl_camera'>threejs.org/examples/#webgl_camera</a> for original implementation.",
          link: "/projects/three/threejs-orthographic-vs-perspective",
        },
      ],
    },
  ];
}
</script>
