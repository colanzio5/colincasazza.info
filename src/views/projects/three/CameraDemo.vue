<template>
  <div id="info">
    A simple
    <a href="https://threejs.org">three.js</a>
    camera demo. <br />
    <a
      href="https://blender.stackexchange.com/questions/648/what-are-the-differences-between-orthographic-and-perspective-views"
      >Orthographic vs Perspective</a
    >
    |
    <a
      href="https://github.com/colanzio5/colincasazza.info/blob/main/src/views/ThreeJSCameraDemo.vue"
      >source Code</a
    >
    <br />
    Press <b>O</b> for <b>O</b>rthographic and <b>P</b> for <b>P</b>erspective
  </div>
  <div id="canvas-container" />
</template>

<style lang="postcss" scoped>
#info {
  color: #fff;
  font-family: Monospace;
  font-size: 13px;
  line-height: 24px;
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  z-index: 990009;
}
#canvas-container {
  position: fixed;
  top: 0px;
  left: 0px;
  opacity: 0.9;
}
</style>

<script lang="ts">
import { Vue } from "vue-class-component";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { toRaw } from "@vue/reactivity";
import {
  Camera,
  BufferGeometry,
  CameraHelper,
  Group,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  MathUtils,
  Float32BufferAttribute,
} from "three";
export default class CameraDemo extends Vue {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
  frustumSize = 600;
  container?: HTMLElement;
  stats: Stats = Stats();
  camera: PerspectiveCamera = new PerspectiveCamera(
    50,
    0.5 * this.aspect,
    1,
    10000
  );
  scene: Scene = new Scene();
  renderer: WebGLRenderer = new WebGLRenderer({ antialias: true });
  mesh: Mesh = new Mesh(
    new SphereGeometry(100, 16, 8),
    new MeshBasicMaterial({ color: 0xffffff, wireframe: true })
  );
  mesh2: Mesh = new Mesh(
    new SphereGeometry(50, 16, 8),
    new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
  );
  mesh3: Mesh = new Mesh(
    new SphereGeometry(5, 16, 8),
    new MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
  );
  geometry: BufferGeometry = new BufferGeometry();
  vertices: number[] = new Array(0);
  cameraRig: Group = new Group();
  cameraPerspective: PerspectiveCamera = new PerspectiveCamera(
    50,
    0.5 * this.aspect,
    150,
    1000
  );
  cameraPerspectiveHelper: CameraHelper = new CameraHelper(
    this.cameraPerspective
  );
  cameraOrtho: OrthographicCamera = new OrthographicCamera(
    (0.5 * this.frustumSize * this.aspect) / -2,
    (0.5 * this.frustumSize * this.aspect) / 2,
    this.frustumSize / 2,
    this.frustumSize / -2,
    150,
    1000
  );
  cameraOrthoHelper: CameraHelper = new CameraHelper(this.cameraOrtho);
  activeCamera: Camera = this.cameraPerspective;
  activeHelper: CameraHelper = this.cameraPerspectiveHelper;
  particles: Points = new Points(
    this.geometry,
    new PointsMaterial({ color: 0x888888 })
  );
  animationFrameId?: number;
  mounted(): void {
    this.container = document.getElementById("canvas-container") as HTMLElement;
    this.camera.position.z = 2500;
    this.scene.add(this.cameraPerspectiveHelper);
    this.scene.add(this.cameraOrthoHelper);
    this.cameraOrtho.rotation.y = Math.PI;
    this.cameraPerspective.rotation.y = Math.PI;
    this.cameraRig.add(this.cameraPerspective);
    this.cameraRig.add(this.cameraOrtho);
    this.scene.add(this.cameraRig);
    this.scene.add(this.mesh);
    this.mesh2.position.y = 150;
    this.mesh.add(this.mesh2);
    this.mesh3.position.z = 150;
    this.cameraRig.add(this.mesh3);
    for (let i = 0; i < 10000; i++) {
      this.vertices.push(MathUtils.randFloatSpread(2000)); // x
      this.vertices.push(MathUtils.randFloatSpread(2000)); // y
      this.vertices.push(MathUtils.randFloatSpread(2000)); // z
    }
    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(this.vertices, 3)
    );
    this.scene.add(this.particles);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.autoClear = false;
    this.container.appendChild(this.stats.dom);
    this.stats.domElement.style.cssText =
      "position:absolute;bottom:5px;left:5px;cursor:pointer;";
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.animate();
  }
  unmounted(): void {
    window.removeEventListener("resize", () => this.onWindowResize());
    window.removeEventListener("keydown", (e) => this.onKeyDown(e));
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
  onKeyDown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case 79 /*O*/:
        this.activeCamera = this.cameraOrtho;
        this.activeHelper = this.cameraOrthoHelper;
        break;
      case 80 /*P*/:
        this.activeCamera = this.cameraPerspective;
        this.activeHelper = this.cameraPerspectiveHelper;
        break;
    }
  }
  onWindowResize(): void {
    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;
    this.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
    this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
    this.camera.aspect = 0.5 * this.aspect;
    this.camera.updateProjectionMatrix();
    this.cameraPerspective.aspect = 0.5 * this.aspect;
    this.cameraPerspective.updateProjectionMatrix();
    this.cameraOrtho.left = (-0.5 * this.frustumSize * this.aspect) / 2;
    this.cameraOrtho.right = (0.5 * this.frustumSize * this.aspect) / 2;
    this.cameraOrtho.top = this.frustumSize / 2;
    this.cameraOrtho.bottom = -this.frustumSize / 2;
    this.cameraOrtho.updateProjectionMatrix();
  }
  animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate);
    const r = Date.now() * 0.0005;
    this.mesh.position.x = 700 * Math.cos(r);
    this.mesh.position.z = 700 * Math.sin(r);
    this.mesh.position.y = 700 * Math.sin(r);
    this.mesh.children[0].position.x = 70 * Math.cos(2 * r);
    this.mesh.children[0].position.z = 70 * Math.sin(r);
    if (this.activeCamera === this.cameraPerspective) {
      this.cameraPerspective.fov = 35 + 30 * Math.sin(0.5 * r);
      this.cameraPerspective.far = this.mesh.position.length();
      this.cameraPerspective.updateProjectionMatrix();
      this.cameraPerspectiveHelper.update();
      this.cameraPerspectiveHelper.visible = true;
      this.cameraOrthoHelper.visible = false;
    } else {
      this.cameraOrtho.far = this.mesh.position.length();
      this.cameraOrtho.updateProjectionMatrix();
      this.cameraOrthoHelper.update();
      this.cameraOrthoHelper.visible = true;
      this.cameraPerspectiveHelper.visible = false;
    }
    this.cameraRig.lookAt(this.mesh.position);
    this.renderer.clear();
    this.activeHelper.visible = false;
    this.renderer.setViewport(0, 0, this.SCREEN_WIDTH / 2, this.SCREEN_HEIGHT);
    this.renderer.render(toRaw(this.scene), this.activeCamera);
    this.activeHelper.visible = true;
    this.renderer.setViewport(
      this.SCREEN_WIDTH / 2,
      0,
      this.SCREEN_WIDTH / 2,
      this.SCREEN_HEIGHT
    );
    this.renderer.render(toRaw(this.scene), this.camera);
    this.stats.update();
  }
}
</script>
