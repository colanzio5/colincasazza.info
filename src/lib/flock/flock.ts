import themeColors from "@/styles/themeColors";
import { Color, Object3D, Vector2 } from "three";
import { IWeightedArray, WeightedArray } from "../util/random";
import { Bird, BirdConfig } from "./bird";

export interface IFlockConfig {
  birdConfigs: WeightedArray<BirdConfig>;
  maxFlockSize: number;
}

const birdConfigs: IWeightedArray<BirdConfig> = [
  new BirdConfig({
    probability: 1 / 100,
    neighborDistance: 25,
    desiredSeparation: 30,
    separationMultiplier: 0.4,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.3,
    maxSpeed: 2,
    maxForce: 0.05,
    birdSize: 5,
    color: themeColors.primary[200],
  }),
  new BirdConfig({
    probability: -1,
    neighborDistance: 25,
    desiredSeparation: 30,
    separationMultiplier: 0.4,
    alignmentMultiplier: 0.3,
    cohesionMultiplier: 0.3,
    maxSpeed: 2,
    maxForce: 0.05,
    birdSize: 5,
    color: themeColors.secondary[200],
  }),
]


export class Flock {
  flockConfig: IFlockConfig;
  birds: Bird[] = [];
  // todo: this should actually be flockBoundary (trapezoid)
  // todo: unproject the camera onto the 2d plane the flock is on to generate flockBoundary
  // todo: check if bird is outside of flockBoundary
  // this is the width and height of
  // the visible space in three.js space
  // NOT browser pixel space
  width: number = 0;
  height: number = 0;

  constructor(
    flockConfig: IFlockConfig = {
      birdConfigs: birdConfigs,
      maxFlockSize: 200,
    }
  ) {
    this.flockConfig = flockConfig;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.birds.map((bird) => {
      bird.height = height;
      bird.width = width;
      return bird;
    });
  }

  disposeAll() {
    this.birds.forEach((bird) => bird.dispose());
  }
}
