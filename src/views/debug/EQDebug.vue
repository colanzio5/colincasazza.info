<template>
  <ViewPortComponent @click="load" class="w-full h-full" :view="view" />
</template>

<script lang="ts">
import ViewPortComponent from "@/components/renderer/ViewPortComponent.vue";
import { View } from "@/lib/renderer/view";
import { vxm } from "@/store";
import {
  AudioAnalyser,
  AudioListener,
  AudioLoader,
  Color,
  DataTexture,
  LuminanceFormat,
  Mesh,
  PlaneGeometry,
  RedFormat,
  ShaderMaterial,
  Vector3,
} from "three";

import * as THREE from "three";
import { Options, Vue } from "vue-class-component";
import themeColors from "@/styles/themeColors";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4( position, 1.0 );
}
`;

const backgroundColorString = new Color("black").toArray().join(", ");
const colorString = new Color(themeColors.primary["100"]).toArray().join(", ");
const fragmentShader = `
uniform sampler2D tAudioData;
varying vec2 vUv;
void main() {
  vec3 backgroundColor = vec3( ${backgroundColorString} );
  vec3 color = vec3( ${colorString} );
  float f = texture2D( tAudioData, vec2( vUv.x, 0.0 ) ).r;
  float i = step( vUv.y, f ) * step( f - 0.001, vUv.y );
  gl_FragColor = vec4( mix( backgroundColor, color, i ), 1.0 );
}
`;

@Options({
  components: {
    ViewPortComponent,
  },
})
export default class EQDebug extends Vue {
  view!: View;
  // geometry!: PlaneGeometry;
  // material!: MeshBasicMaterial;
  // plane!: Mesh;
  scrollIdx = 0;
  throttle = 0;
  last = 0;
  hz = 1;
  inc = 5;

  // audio anayzer
  analyser!: AudioAnalyser;
  uniforms!: {
    tAudioData: {
      value: DataTexture;
    };
  };
  fftSize = 128;
  listener!: AudioListener;
  audio!: THREE.Audio;
  geometry!: PlaneGeometry;
  material!: ShaderMaterial;
  plane!: Mesh<any, any>;
  mesh!: Mesh<any, any>;
  loaded = false;

  created(): void {
    this.view = new View({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1000000,
        startingPosition: new Vector3(0, 0, 100),
      },
      controlsOptions: {
        enabled: true,
        enableRotate: true,
        startDirection: new Vector3(0, 0, 0),
      },
      renderTickCallback: this.renderTickCallback,
      id: "PLANET_DEBUG_VIEW",
      background: new Color("black"),
    });
  }

  async load() {
    if (this.loaded) return;
    // audio analyzer setup
    this.listener = new AudioListener();
    this.audio = new THREE.Audio(this.listener);
    const file = "/sounds/XXYYXX - Closer.mp3";
    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
      const loader = new AudioLoader();
      const buffer = await loader.loadAsync(file);
      this.audio.setBuffer(buffer);
      this.audio.play();
    } else {
      const mediaElement = new Audio(file);
      mediaElement.play();
      this.audio.setMediaElementSource(mediaElement);
    }
    this.analyser = new AudioAnalyser(this.audio, this.fftSize);
    // eq shader setup
    const format = vxm.renderer.renderer.capabilities.isWebGL2
      ? RedFormat
      : LuminanceFormat;
    this.uniforms = {
      tAudioData: {
        value: new DataTexture(this.analyser.data, this.fftSize / 2, 1, format),
      },
    };
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    this.geometry = new PlaneGeometry(1, 1);
    this.mesh = new Mesh(this.geometry, this.material);
    this.view.scene.add(this.mesh);
    this.loaded = true;
  }

  unmounted(): void {
    this.view.scene.remove(this.mesh);
  }

  renderTickCallback(view: View, timeStepMS: number): void {
    if (!this.analyser || !this.uniforms) return;
    this.analyser.getFrequencyData();
    this.uniforms.tAudioData.value.needsUpdate = true;
  }
}
</script>

<style lang="scss"></style>
