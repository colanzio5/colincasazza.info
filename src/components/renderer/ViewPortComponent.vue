<template>
  <div :ref="_view.id" :id="_view.id">{{ _view.id }}</div>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import { View } from "@/lib/renderer/view";
import { Model } from "vue-property-decorator";
import { vxm } from "@/store";

export default class ViewPort extends Vue {
  @Model("view", { type: View, required: true }) _view!: View;

  get container(): HTMLElement {
    return this.$refs[this._view.id] as HTMLElement;
  }

  mounted(): void {
    vxm.renderer.views.mountView({
      view: this._view,
      container: this.container as HTMLElement,
      makeActive: true,
    });
    this._view.viewPort.resize();
  }

  unmounted(): void {
    vxm.renderer.views.deleteViewById({ id: this._view.id });
  }
}
</script>
