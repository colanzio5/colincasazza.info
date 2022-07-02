<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  inheritAttrs: false,
})
export default class Footer extends Vue {}
</script>

<style lang="postcss">
.footer {
  @apply max-w-[80vw] flex justify-start overflow-x-scroll overflow-y-hidden select-none;
}
</style>
<template>
  <span class="footer">
    <div v-if="$route.name === 'HomeView'">
      <span class="text-white">
        like the background? click
        <router-link to="/projects/three/flock" class="link">here</router-link>.
      </span>
    </div>
    <div v-if="$route.name === 'Projects'">
      <span class="text-white">
        source code to projects can be found at
        <a class="link" href="https://github.com/colanzio5/colincasazza.info"
          >https://github.com/colanzio5/colincasazza.info</a
        >
      </span>
    </div>
  </span>
</template>
