<template>
  <div class="home-wrapper">
    <div class="app-title">colin casazza</div>
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
    <div class="app-title">about me</div>
    <div class="mb-4">
      computer scientist with an interest in empowering robotics, aerospace, and
      other stem industries with software tools.
    </div>
    <div class="app-title">experience</div>
    <div class="mb-4">
      <div class="app-heading">qualcomm</div>
      <div class="pb-1">
        october 2021 - current - cloud tools software engineer
      </div>
      <div class="pb-1">
        march 2020 - october 2021 - it engineer, programmer analyst, site
        reliability engineer
      </div>
      <div class="pb-1">may 2018 - sep 2018 - it engineering intern</div>
      <div class="app-heading">voyager space technologies</div>
      <div class="pb-1">jul 2018 - aug 2019 - full stack software engineer</div>
      <div class="app-heading">sdsu rocket project</div>
      <div class="pb-1">sep 2015 - jan 2018 - avionics systems engineer</div>
      <div class="app-heading">freelance developer</div>
      <div class="pb-1">jun 2017 - jan 2018 - full stack web developer</div>
      <div class="app-heading">san diego state university</div>
      <div class="pb-1">
        sep 2015 - dec 2019 - bachelor’s degree in computer science
      </div>
    </div>
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
