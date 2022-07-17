
import themeColors from "@/styles/themeColors";
import type { ColorRepresentation } from "three";
import { generateUUID } from "three/src/math/MathUtils";
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
    weight: 80,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 6,
    birdColor: themeColors.compliment[500],
  },
  {
    id: generateUUID(),
    weight: 1,
    neighborDistance: 200,
    desiredSeparation: 50,
    separationMultiplier: 1.7,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.01,
    maxSpeed: 2,
    maxForce: 0.01,
    birdSize: 12,
    birdColor: themeColors.highlight[200],
  },
];

// todo: choose flock size based on screen size
export const MAX_FLOCK_SIZE = 500;
