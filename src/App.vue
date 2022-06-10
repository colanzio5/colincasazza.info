
<script lang="ts">
import RendererRootViewPortComponent from "@/components/renderer/RendererRootViewPortComponent.vue";
import NavBar from "@/views/NavBar.vue";
import { Options, Vue } from "vue-class-component";
import { vxm } from "./store";
import FlockBackground from "./views/background/FlockBackground.vue";

@Options({
  components: {
    FlockBackground,
    RendererRootViewPortComponent,
    NavBar,
  },
})
export default class App extends Vue {
  get isAppReady(): boolean {
    return vxm.renderer.rendererRootViewPort.isMounted;
  }

  mounted(): void {
    vxm.renderer.start();
  }
}
</script>

<template>
  <div class="app-wrapper">
    <div class="w-full h-full relative">
      <RendererRootViewPortComponent class="z-10" />
      <div v-if="isAppReady">
        <FlockBackground class="absolute w-full h-full" />
        <div class="absolute w-full h-full flex flex-col z-30 p-4 pb-16">
          <NavBar />
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
html,
body {
  background: black;
}
.app-wrapper {
  @apply w-screen h-screen overflow-hidden;
}
</style>

