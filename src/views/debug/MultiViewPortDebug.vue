<template>
  <div class="w-full h-full grid grid-cols-4 gap-4 pt-4 justify-items-stretch">
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
    <Background class="border-2 border-primary-300 justify-self-auto w-full" />
  </div>
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import NBodyDatGUI from "@/views/projects/three/NBodyDatGUI.vue";
import { Options, Vue } from "vue-class-component";
import Background from "../background/Background.vue";

@Options({
  components: {
    NBodyDatGUI,
    ViewPortComponent,
    Background
  },
})
export default class MultiViewPortDebug extends Vue {
  numberOfViews: number = 4;
}
</script>
