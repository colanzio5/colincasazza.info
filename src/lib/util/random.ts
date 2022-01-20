export function randomFromRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomSelectFromWeightedArray<T>(
  values: { value: T; probability: number }[]
): T {
  let i,
    pickedValue,
    randomNr = Math.random(),
    threshold = 0;

  for (i = 0; i < values.length; i++) {
    if (values[i].probability === -1) {
      continue;
    }

    threshold += values[i].probability;
    if (threshold > randomNr) {
      pickedValue = values[i].value;
      break;
    }
  }

  if (!pickedValue) {
    //nothing found based on probability value, so pick element marked with wildcard
    pickedValue = values.find((value) => value.probability === -1)?.value;
  }

  return pickedValue as T;
}
