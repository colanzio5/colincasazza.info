<template>
  <div class="w-full flex justify-center sm:justify-start space-x-4">
    <router-link class="link navbar-link" to="/">Home</router-link>
    <router-link class="link navbar-link" to="/projects">Projects</router-link>
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