<template>
  <div :ref="view.id"></div>
</template>

<script lang="ts">
import { View } from "@/lib/renderer/view";
import { vxm } from "@/store";
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";

export default class ViewPort extends Vue {
  @Prop({ required: true, type: Object }) readonly view!: View;

  get container(): HTMLElement {
    return this.$refs[this.view.id] as HTMLElement;
  }

  async mounted(): Promise<void> {
    if(!this.view) throw new Error("view was not provided to viewport.");
    await vxm.renderer.addView({
      view: this.view,
      container: this.container as HTMLElement,
    })
  }

  unmounted(): void {
    vxm.renderer.removeView({ viewId: this.view.id });
  }
}
</script>

