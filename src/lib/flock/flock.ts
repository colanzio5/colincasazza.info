import {
  Color,
  Vector2,
} from "three";
import { Bird } from "./bird";

export interface IFlockConfig {
  // flocking constants
  separationMultiplier: number;
  alignmentMultiplier: number;
  cohesionMultiplier: number;
  maxSpeed: number;
  maxForce: number;
  // rendering constants
  maxFlockSize: number;
  birdRadius: number;
  birdSize: number;
  birdColors: { value: Color, probability: number }[];
  // todo: this should actually be flockBoundary (trapezoid) 
  // todo: unproject the camera onto the 2d plane the flock is on to generate flockBoundary
  // todo: check if bird is outside of flockBoundary
  // this is the width and height of
  // the visible space in three.js space
  // NOT browser pixel space
  width: number;
  height: number;
}

export class Flock {
  flockConfig: IFlockConfig;
  birds: Bird[] = [];

  constructor(flockParams: IFlockConfig) {
    this.flockConfig = flockParams;
  }

  addBird(position: Vector2): [birdAdded: Bird, birdRemoved: Bird | undefined] {
    const birdAdded = new Bird(position, this.flockConfig);
    if (this.birds.length > this.flockConfig.maxFlockSize) {
      const birdRemoved = this.birds.shift();
      return [birdAdded, birdRemoved];
    }
    this.birds.push(birdAdded);
    return [birdAdded, undefined];
  }
  run(): void {
    for(const bird of this.birds) {
      bird.run(this.birds);
    }
  }

  resize(width: number, height: number): void {
    this.flockConfig.width = width;
    this.flockConfig.height = height;
    for(const bird of this.birds){
      bird.birdConfig.width = width;
      bird.birdConfig.height = height;
    }
  }
}
