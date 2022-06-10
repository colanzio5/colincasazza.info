
import themeColors from "@/styles/themeColors";
import type { ColorRepresentation } from "three";
import type { BirdConfig } from "wasm-lib";

export interface IBirdConfig {
  id: string;
  probability: number;
  neighborDistance: number;
  desiredSeparation: number;
  separationMultiplier: number;
  alignmentMultiplier: number;
  cohesionMultiplier: number;
  maxSpeed: number;
  maxForce: number;
  birdSize: number;
  birdColor: ColorRepresentation;
  wasmObject?: BirdConfig;
}

export const backgroundBirdConfigs: IBirdConfig[] = [
  {
    id: "default",
    probability: -1,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 10,
    birdColor: themeColors.primary[800],
  },
  {
    id: "black_sheep",
    probability: 1 / 100,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 15,
    birdColor: themeColors.primary[800],
  },
];

// todo: choose flock size based on screen size
export const MAX_FLOCK_SIZE = 2000;
