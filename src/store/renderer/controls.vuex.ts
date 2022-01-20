import { createModule, mutation, action } from "vuex-class-component";
import { vxm } from "..";

const VuexModule = createModule({
  namespaced: "controls",
  strict: false,
});

export class ControlsState {
  // keyboard state
  right = false;
  left = false;
  up = false;
  down = false;
  space = false;
  // mouse state
  mouseX = 0;
  mouseY = 0;
}

export default class ControlsStore extends VuexModule {
  currentInputs: ControlsState = new ControlsState();

  @action async mount(): Promise<void> {
    window.addEventListener("mousemove", this.onDocumentMouseMove);
    window.addEventListener("keydown", this.onkeydown);
    window.addEventListener("keyup", this.onkeyup);
  }

  @action async destroy(): Promise<void> {
    window.removeEventListener("keydown", this.onkeydown);
    window.removeEventListener("keyup", this.onkeyup);
  }

  @mutation onkeydown(evt: KeyboardEvent): void {
    const newInputs = { ...this.currentInputs };
    if (evt.keyCode == 39) newInputs.right = true;
    if (evt.keyCode == 37) newInputs.left = true;
    if (evt.keyCode == 38 || evt.keyCode == 65) newInputs.up = true;
    if (evt.keyCode == 40 || evt.keyCode == 90) newInputs.down = true;
    if (evt.keyCode == 32) newInputs.space = true;
    this.currentInputs = newInputs;
  }
  @mutation onkeyup(evt: KeyboardEvent): void {
    const newInputs = { ...this.currentInputs };
    if (evt.keyCode == 39 || evt.keyCode == 68) newInputs.right = false;
    if (evt.keyCode == 37 || evt.keyCode == 65) newInputs.left = false;
    if (evt.keyCode == 38 || evt.keyCode == 65) newInputs.up = false;
    if (evt.keyCode == 40 || evt.keyCode == 90) newInputs.down = false;
    if (evt.keyCode == 32) newInputs.space = false;
    this.currentInputs = newInputs;
  }
  @mutation onDocumentMouseMove(evt: MouseEvent): void {
    this.currentInputs.mouseX =
      evt.clientX - vxm.renderer.rendererRootViewPort.width;
    this.currentInputs.mouseY =
      evt.clientY - vxm.renderer.rendererRootViewPort.height;
  }
}
