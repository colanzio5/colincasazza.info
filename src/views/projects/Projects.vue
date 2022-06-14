<template>
  <div class="projects-wrapper">
    <div v-for="category in categories" :key="category?.subject">
      <div class="text-4xl mb-2 text-secondary-500">{{ category?.subject }}</div>
      <div class="mb-2" v-for="item in category?.items" :key="item.heading">
        <div class="text-xl text-highlight-500">{{ item.heading }}</div>
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
  @apply w-full h-full pt-4 text-white overflow-y-scroll text-left p-0 break-words;
}
</style>

<script lang="ts">
import { Vue } from "vue-class-component";
export default class Projects extends Vue {
  getFullLink(item: { link: string }): string {
    return (window.location.origin || "colincasazza.info") + item.link;
  }
  // ! this (and router objects) should both be coming
  // ! from the same source. [refactor]
  categories = [
    {
      subject: "three.js",
      items: [
        {
          heading: "flocking",
          text: "simulated flocking behavior based on separation, alignment, and cohesion. inspired by <a class='text-primary-400' href='https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html'>thecodingtrain.com<a/>.",
          link: "/projects/three/flock",
        },
        {
          heading: "nbody",
          text: "simple nbody simulation w/ <a class='text-primary-400' href='https://rapier.rs/'>rapier</a> physics engine.",
          link: "/projects/three/nbody",
        },
        {
          heading: "perspective vs ortho camera demo",
          text: "a quick three.js camera demo, taken from the three.js website's examples and implemented in vue3. <a class='text-primary-400' href='https://threejs.org/examples/#webgl_camera'>here's</a> the original implementation.",
          link: "/projects/three/camera-types",
        },
      ],
    },
    {
      subject: "notebooks",
      items: [
        {
          heading: "inverse kinematics approximation",
          text: "apromixation of a 2d inverse kinematic function.",
          link: "/projects/notebooks/2d-inverse-kinematics",
        },
      ],
    },
    (process.env.NODE_ENV !== "production" ? {
      subject: "debug",
      items: [
        {
          heading: "2d terrain generation",
          text: "paramaterized terrain generation with simplex3 noise.",
          link: "/debug/terrain-generation",
        },
        {
          heading: "multiple viewports",
          text: "rendering to multiple virtual viewports in the same renderer",
          link: "/debug/multi-viewport",
        },
        {
          heading: "3d eq poc",
          text: "3d plane from audio analyzer stream",
          link: "/debug/eq"
        },
        {
          heading: "waves on a plane",
          text: "simple morphing a plane",
          link: "/debug/waves"
        },
        {
          heading: "rusty flock",
          text: "rust backend for flocking algorithm",
          link: "/debug/rusty-flock"
        }
      ],
    } : null),
  ];
}
</script>
