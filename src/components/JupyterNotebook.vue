<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
Options({
  name: "JupyterNotebook",
});
export default class JupyterNotebook extends Vue {
  @Prop() notebookPath!: string;

  get iFrame(): HTMLIFrameElement {
    return this.$refs[this.notebookPath] as HTMLIFrameElement;
  }
}
</script>

<template>
  <iframe
    :src="notebookPath"
    :ref="notebookPath"
    sandbox="allow-same-origin allow-scripts"
    class="w-full h-full p-4 pb-12"
  ></iframe>
</template>

<style lang="postcss" scoped>
.jp-Notebook {
  @apply w-full h-full bg-transparent text-xs;
}

.jp-Notebook > * {
  background: transparent;
}
</style>
