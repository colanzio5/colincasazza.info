import themeColors from "@/styles/themeColors";
import { Color, Object3D, Vector2 } from "three";
import { WeightedArray } from "../util/random";
import { Bird, BirdConfig } from "./bird";

export interface IFlockConfig {
  birdConfigs: WeightedArray<BirdConfig>;
  maxFlockSize: number;
}

const birdConfigs = [
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
    color: new Color(themeColors.secondary[200]),
  }),
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
    color: new Color(themeColors.primary[200]),
  })
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
      birdConfigs: new WeightedArray<BirdConfig>(...birdConfigs),
      maxFlockSize: 200,
    }
  ) {
    this.flockConfig = flockConfig;
  }

  addBird(
    position: Vector2,
    birdConfig: BirdConfig
  ): {
    birdAdded: Bird;
    birdRemoved: Bird | undefined;
  } {
    const birdAdded = new Bird(this, birdConfig, { position });
    if (this.birds.length >= this.flockConfig.maxFlockSize) {
      const birdRemoved = this.birds.shift();
      return { birdAdded, birdRemoved };
    }
    this.birds.push(birdAdded);
    return { birdAdded, birdRemoved: undefined };
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
