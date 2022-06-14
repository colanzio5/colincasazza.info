
import themeColors from "@/styles/themeColors";
import type { ColorRepresentation } from "three";
import type { BirdConfig } from "wasm-lib";

export interface IBirdConfig {
  id: string;
  weight: number;
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

export const DEFAULT_BIRD_ID = "default";
export const backgroundBirdConfigs: IBirdConfig[] = [
  {
    id: DEFAULT_BIRD_ID,
    weight: 100,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 10,
    birdColor: themeColors.secondary[500],
  },
  {
    id: "black_sheep",
    weight: 1,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 15,
    birdColor: themeColors.primary[500],
  },
];

// todo: choose flock size based on screen size
export const MAX_FLOCK_SIZE = 500;
