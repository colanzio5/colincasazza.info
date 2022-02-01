import { Bird } from "@/lib/flock/bird";
import { Flock, IFlockConfig } from "@/lib/flock/flock";
import { IViewData, View } from "@/lib/renderer/view";
import { Color, Vector3, Vector2 } from "three";

export interface IBackgroundViewData extends IViewData {
  flock: Flock;
}


export class BackgroundView extends View {
  flock: Flock = new Flock();

  constructor() {
    super({
      cameraOptions: {
        fov: 75,
        near: 0.1,
        far: 1200,
        startingPosition: new Vector3(0, 0, 1000),
      },
      controlsOptions: {
        startDirection: new Vector3(0, 0, 0),
        enabled: false,
      },
      id: "BACKGROUND_VIEW",
      background: new Color("black")
    });
  }

  renderTickCallback() {
    const width = this.visibleWidthAtZDepth;
    const height = this.visibleHeightAtZDepth;
    this.flock.resize(width, height);
    this.flock.birds.forEach(bird => bird.run(this.flock.birds))
  }

  applyFlockConfig(flockConfig: IFlockConfig): void {
    let birdsRemoved: Bird[] = this.flock.birds;
    this.flock = new Flock(flockConfig);
    for(const bird of birdsRemoved) {
      this.addBirdToFlock(bird)
    }
  }

  addBirdToFlock(params: { position?: Vector2, velocity?: Vector2, acceleration?: Vector2 }): Bird {
    const config = this.flock.flockConfig.birdConfigs.selectRandom();
    const birdAdded = new Bird(this.flock, config, params)
    if (this.flock.birds.length >= this.flock.flockConfig.maxFlockSize) {
      const birdRemoved = this.flock.birds.shift();
      if(birdRemoved) {
        birdRemoved.dispose();
        this.scene.children.pop();
        this.scene = this.scene.remove(birdRemoved.line);
      }
    }
    this.flock.birds = this.flock.birds.concat(birdAdded);
    this.scene = this.scene.add(birdAdded.line);
    return birdAdded
  }
}
