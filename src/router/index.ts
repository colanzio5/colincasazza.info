import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import NbodyDebugComponent from "@/views/debug/PlanetDebugComponent.vue";
import PlanetDebugComponent from "@/views/debug/PlanetDebugComponent.vue";
import MultiViewPortDebug from "@/views/debug/MultiViewPortDebug.vue";
import BackgroundDebug from "@/views/debug/BackgroundDebug.vue";

// import JupyterNotebook from "../components/JupyterNotebook.vue";
import Projects from "@/views/projects/Projects.vue";
import CameraDemo from "@/views/projects/three/CameraDemo.vue";
import NBody from "@/views/projects/three/NBody.vue";
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
    path: "/projects/three/threejs-orthographic-vs-perspective",
    component: CameraDemo,
  },
  {
    path: "/projects/three/nbody",
    component: NBody,
  },
  // debug
  {
    path: "/debug/nbody",
    component: NbodyDebugComponent,
  },
  {
    path: "/debug/planet",
    component: PlanetDebugComponent,
  },
  {
    path: "/debug/multi-viewport",
    component: MultiViewPortDebug,
  },  
  {
    path: "/debug/background",
    component: BackgroundDebug,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
