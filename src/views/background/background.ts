import { Flock } from "@/lib/flock/flock";
import { IViewData } from "@/lib/renderer/view";

export interface IBackgroundViewData extends IViewData {
  flock: Flock;
}

export const backgroundFlock = new Flock();