import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NBodyEntityDebug from "@/views/debug/NBodyEntityDebug.vue";
import MultiViewPortDebug from "@/views/debug/MultiViewPortDebug.vue";
import FlockDebug from "@/views/background/FlockDebug.vue";
import JupyterNotebook from "../components/JupyterNotebook.vue";
import Projects from "@/views/projects/Projects.vue";
import CameraDemo from "@/views/projects/three/CameraDemo.vue";
import NBody from "@/views/projects/three/NBody.vue";
import WavesOnAPlaneGeometry from "@/views/debug/WavesOnAPlaneGeometry.vue";
import EQDebug from "@/views/debug/EQDebug.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    component: HomeView,
  },
  {
    path: "/projects",
    component: Projects,
  },
  // three.js projects
  {
    path: "/projects/three/camera-types",
    component: CameraDemo,
  },
  {
    path: "/projects/three/nbody",
    component: NBody,
  },
  {
    path: "/projects/three/flock",
    component: FlockDebug,
  },
  //notebooks
  {
    path: "/projects/notebooks/2d-inverse-kinematics",
    component: JupyterNotebook,
    props: { notebookPath: "/notebooks/Inverse Kinematics Approximation.html" },
  },
  // debug
  {
    path: "/debug/terrain-generation",
    component: NBodyEntityDebug,
  },
  {
    path: "/debug/multi-viewport",
    component: MultiViewPortDebug,
  },
  {
    path: "/debug/waves",
    component: WavesOnAPlaneGeometry
  },
  {
    path: "/debug/eq",
    component: EQDebug
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
