<template>
  <div class="home-wrapper">
    <div class="text-4xl">Colin Casazza</div>
    <br />
    <div class="text-lx">
      <div>colanzio5@gmail.com</div>
      <div>San Diego, CA</div>
      <div>(603)714-2047</div>
      <a class="link" href="https://github.com/colanzio5">
        <div>github.com/colanzio5</div>
      </a>
      <a class="link" href="https://www.linkedin.com/in/ccasazza/">
        <div>linkedin.com/in/ccasazza</div>
      </a>
    </div>
    <br />

    <div class="text-4xl">About Me</div>
    <div>
      Software developer with an interest in creating tools for robotics,
      aerospace, and other STEM industries. Demonstrated history with data
      science, programming for systems engineering, and full stack web
      development including design and implementation of stable, scalable
      infrastructure.
    </div>
    <br />

    <div class="text-4xl">Experience</div>
    <div class="text-xl">
      <h3>Qualcomm/IT Engineer - Search, Big Data, and Analytics</h3>
      <div class="text-sm pb-1">
        October 2021 - current - Cloud Tools Software Engineer
      </div>
      <div class="text-sm pb-1">
        March 2020 - October 2021 - IT Engineer, Programmer Analyst, Site
        Reliability Engineer
      </div>
      <div>May 2018 - Sep 2018 - IT Engineering Intern</div>
      <h3>Voyager Space Technologies</h3>
      <div class="text-sm pb-1">
        Jul 2018 - Aug 2019 - Full Stack Software Engineer
      </div>
      <h3>SDSU Rocket Project</h3>
      <div class="text-sm pb-1">
        Sep 2015 - Jan 2018 - Avionics Systems Engineer
      </div>
      <h3>Freelance Developer</h3>
      <div class="text-sm pb-1">
        Jun 2017 - Jan 2018 - Full Stack Web Developer
      </div>
      <h3>San Diego State University</h3>
      <div class="text-sm pb-1">
        Sep 2015 - Dec 2019 - Bachelor’s Degree in Computer Science
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
.home-wrapper {
  @apply w-full h-full text-white overflow-y-scroll text-center p-4 sm:text-left sm:p-0;
}
</style>

<script lang="ts">
import { Vue } from "vue-class-component";

export default class HomeView extends Vue {}
</script>
