// by default three.js takes vertical FOV as camera param
// I'd rather use horizontal FOV as the instantiation interface
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

  resize(): void {
    const parentPos = (
      this.container.parentElement as HTMLElement
    ).getBoundingClientRect();
    const childPos = this.container.getBoundingClientRect();
    this.height = this.container.clientHeight;
    this.width = this.container.clientWidth;
    this.left = parentPos.x - childPos.x;
    this.bottom = parentPos.y - childPos.y;
  }

  destroy(): void {
    throw new Error("not implemented");
  }
}
