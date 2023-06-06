import * as Random from "random-js";

const randInt = (min: number, max: number): number => {
  return Random.integer(min, max)(Random.browserCrypto);
};

export { randInt };
