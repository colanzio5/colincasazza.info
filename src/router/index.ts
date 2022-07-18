import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
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
    name: "HomeView",
  },
  {
    path: "/projects",
    component: Projects,
    name: "Projects",
  },
  // three.js projects
  {
    path: "/projects/three/camera-types",
    component: CameraDemo,
    name: "CameraDemo",
  },
  {
    path: "/projects/three/nbody",
    component: NBody,
    name: "NBody",
  },
  {
    path: "/projects/three/flock",
    component: FlockDebug,
    name: "FlockDebug",
  },
  //notebooks
  {
    path: "/projects/notebooks/2d-inverse-kinematics",
    component: JupyterNotebook,
    name: "JupyterNotebook",
    props: { notebookPath: "/notebooks/Inverse Kinematics Approximation.html" },
  },
  // debug
  {
    path: "/debug/terrain-generation",
    component: NBodyEntityDebug,
    name: "NBodyEntityDebug",
  },
  {
    path: "/debug/multi-viewport",
    component: MultiViewPortDebug,
    name: "MultiViewPortDebug",
  },
  {
    path: "/debug/waves",
    component: WavesOnAPlaneGeometry,
    name: "WavesOnAPlaneGeometry",
  },
  {
    path: "/debug/eq",
    component: EQDebug,
    name: "EQDebug",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
