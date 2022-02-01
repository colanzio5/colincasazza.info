import { Color } from "three";

export function randomFromRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomIntFromRange(min: number, max: number) {
  return Math.round(randomFromRange(min, max));
}

export function randomColor() {
  const r = randomIntFromRange(0, 255);
  const g = randomIntFromRange(0, 255);
  const b = randomIntFromRange(0, 255);
  return new Color(`rgb(${r},${g},${b})`);
}

export class WeightedArray<T extends { probability: number }> extends Array<T> {
  selectRandom(): T {
    let i;
    let pickedValue;
    let randomNr = Math.random();
    let threshold = 0;
    for (i = 0; i < this.length; i++) {
      if (this[i].probability === -1) {
        continue;
      }
      threshold += this[i].probability;
      if (threshold > randomNr) {
        pickedValue = this[i];
        break;
      }
    }
    if (!pickedValue) {
      //nothing found based on probability value, so pick element marked with wildcard
      pickedValue = this.find((value) => value.probability === -1);
      if(!pickedValue) throw new Error("weighted array has no default value.")
    }
    return pickedValue;
  }
}
