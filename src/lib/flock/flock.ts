import {
  Color,
  Vector2,
} from "three";
import { Bird } from "./bird";

export interface IFlockConfig {
  birdRadius: number;
  birdSize: number;
  maxSpeed: number;
  maxForce: number;
  maxFlockSize: number;
  birdColors: Color[];
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
