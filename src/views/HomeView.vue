<template>
  <div class="home-wrapper">
    <div class="text-4xl text-secondary-200">colin casazza</div>

    <div class="text-lx mb-4 select-text">
      <div>colanzio5@gmail.com</div>
      <div>san diego, ca</div>
      <div>(603)714-2047</div>
      <div class="link w-min" href="https://github.com/colanzio5">
        github.com/colanzio5
      </div>
      <div class="link w-min" href="https://www.linkedin.com/in/ccasazza/">
        linkedin.com/in/ccasazza
      </div>
    </div>

    <div class="text-4xl text-secondary-200">about me</div>
    <div class="mb-4">
      computer scientist with an interest in empowering robotics, aerospace, and
      other stem industries with software tools.
    </div>

    <div class="text-4xl text-secondary-200">experience</div>
    <div class="text-xl mb-4">
      
      <div class="text-highlight-100 text-lg">qualcomm</div>
      <div class="text-lg pb-1">
        october 2021 - current - cloud tools software engineer
      </div>
      <div class="text-lg pb-1">
        march 2020 - october 2021 - it engineer, programmer analyst, site
        reliability engineer
      </div>
      <div class="text-lg pb-1">
        may 2018 - sep 2018 - it engineering intern
      </div>

      <div class="text-highlight-100 text-lg">voyager space technologies</div>
      <div class="text-lg pb-1">
        jul 2018 - aug 2019 - full stack software engineer
      </div>

      <div class="text-highlight-100 text-lg">sdsu rocket project</div>
      <div class="text-lg pb-1">
        sep 2015 - jan 2018 - avionics systems engineer
      </div>

      <div class="text-highlight-100 text-lg">freelance developer</div>
      <div class="text-lg pb-1">
        jun 2017 - jan 2018 - full stack web developer
      </div>

      <div class="text-highlight-100 text-lg">san diego state university</div>
      <div class="text-lg pb-1">
        sep 2015 - dec 2019 - bachelor’s degree in computer science
      </div>
    </div>
  </div>
  <div class="absolute bottom-4 left-4">
    <router-link class="select-text cursor-pointer" to="/projects/three/flock">
      <div class="link text-lg">like the background? click here</div>
    </router-link>
  </div>
</template>

<style lang="postcss">
.home-wrapper {
  @apply h-full max-w-2xl sm:w-full select-none pt-4 text-white overflow-y-scroll;
}
</style>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class HomeView extends Vue {}
</script>
