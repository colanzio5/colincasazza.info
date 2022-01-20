<template>
  <div class="bg-pink-100 w-screen h-screen flex justify-center items-center p-2">
    <div class="w-full h-full relative">
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
}
</script>
