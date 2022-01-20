<template>
  <div class="bg-blue-100 w-screen h-screen flex justify-center items-center">
    <div class="w-5/6 h-5/6 relative">
      <RendererRootViewPortComponent class="z-10" />
      <div v-if="isAppReady" class="w-full h-full">
        <BackgroundView />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import RendererRootViewPortComponent from "@/components/renderer/RendererRootViewPortComponent.vue";
import BackgroundView from "@/views/BackgroundView.vue";
import { Options, Vue } from "vue-class-component";
import { vxm } from "./store";

@Options({
  components: {
    BackgroundView,
    RendererRootViewPortComponent,
  },
})
export default class App extends Vue {
  get isAppReady(): boolean {
    return vxm.renderer.rendererRootViewPort.isMounted;
  }

  async mounted(): Promise<void> {
    await vxm.renderer.start();
  }

  //  class="absolute inset-0 justify-center items-center"
}
</script>
