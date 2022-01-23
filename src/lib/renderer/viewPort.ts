// by default three.js takes vertical FOV as camera param
// I'd rather use horizontal FOV as the instantiation interface

import { vxm } from "@/store";

// so we have this helper function
function getVerticalFOV(aspect: number, horizontalFov: number): number {
  return (
    (Math.atan(Math.tan(((horizontalFov / 2) * Math.PI) / 180) / aspect) *
      2 *
      180) /
    Math.PI
  );
}

export class ViewPort {
  container!: HTMLElement | HTMLCanvasElement;
  height = 0;
  width = 0;
  left = 0;
  bottom = 0;

  horizontalFov = 90;
  isMounted = false;

  get aspect(): number {
    return this.width / this.height;
  }
  get verticalFov(): number {
    return getVerticalFOV(this.aspect, this.horizontalFov);
  }

  mounted(props: { container: HTMLElement }): void {
    this.container = props.container;
    this.resize();
    this.isMounted = true;
  }

  getOffset(ele: HTMLElement | HTMLCanvasElement) {
    // Get the top, left coordinates of two elements
    const eleRect = ele.getBoundingClientRect();
    const targetRect = vxm.renderer.renderer.domElement;
    var bottom =  ( targetRect.offsetTop + targetRect.height ) - ( eleRect.y + eleRect.height );
    // Calculate the top and left positions
    const top = eleRect.top - targetRect.offsetTop;
    const left = eleRect.left - targetRect.offsetLeft;
    return {
      left,
      top,
      bottom
    };
  }

  resize(): void {
    const { top, left, bottom} = this.getOffset(this.container);
    this.height = this.container.clientHeight;
    this.width = this.container.clientWidth;
    this.left = left;
    this.bottom = bottom;
  }

  destroy(): void {
    throw new Error("not implemented");
  }
}
