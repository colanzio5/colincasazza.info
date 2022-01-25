<template>
  <div class="w-full flex items-center justify-center sm:justify-start space-x-4 select-none">
    <router-link class="link navbar-link" to="/">home</router-link>
    <router-link class="link navbar-link" to="/projects">projects</router-link>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
@Options({
  inheritAttrs: false,
})
export default class NavBar extends Vue {}
</script>

<style lang="postcss">
.navbar-link {
  @apply text-center text-4xl underline;
}
</style>