<template>
  <div class="app-wrapper">
    <div class="w-full h-full relative">
      <RendererRootViewPortComponent class="z-10" />
      <div v-if="isAppReady">
        <FlockBackground class="absolute w-full h-full" />
        <div class="absolute w-full h-full flex flex-col z-30 p-4 pb-16">
          <NavBar/>
          <router-view class="flex-grow" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.app-wrapper {
  @apply w-screen h-screen overflow-hidden;
}
</style>

<script lang="ts">
import RendererRootViewPortComponent from "@/components/renderer/RendererRootViewPortComponent.vue";
import FlockBackground from "@/views/background/FlockBackground.vue";

import NavBar from "@/views/NavBar.vue";
import { Options, Vue } from "vue-class-component";
import { vxm } from "./store";

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

  async mounted(): Promise<void> {
    await vxm.renderer.start();
  }
}
</script>
