import { useEffect, useState } from "react";
import { SoundNames } from "./sounds";

const STATIC_ASSETS: string[] = [
  "/cards/cardback.png",
  "/cards/cardback-au.png",
  "/blackheart.svg",
  "/skull.svg",
  "/wave.svg",
  "/whiteheart.svg",
];

for (const sound of SoundNames) {
  STATIC_ASSETS.push(`/sounds/${sound}.mp3`);
  STATIC_ASSETS.push(`/sounds/${sound}.ogg`);
}

for (const s of ["A", "C", "D", "H", "I", "S"]) {
  for (let i = 2; i <= 14; i++) {
    STATIC_ASSETS.push(`/cards/${s}-${i}.png`);
  }
}

const hasSuffix = (str: string, suffixes: string[]) => {
  return suffixes.some((s) => str.endsWith(s));
};

function useAssetsPreloader() {
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoadedCount] = useState<number>(0);
  const total = STATIC_ASSETS.length;

  useEffect(() => {
    const incrementLoadedCount = () => {
      setLoadedCount((prev) => {
        if (prev + 1 >= STATIC_ASSETS.length) {
          setDone(true);
        }
        return prev + 1;
      });
    };

    const loadImage = (path: string) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        incrementLoadedCount();
      };
      img.onerror = () => {
        setError(true);
        incrementLoadedCount();
      };
    };

    const loadSound = (path: string) => {
      const audio = new Audio(path);
      audio.oncanplaythrough = () => {
        incrementLoadedCount();
      };
      audio.onerror = () => {
        setError(true);
        incrementLoadedCount();
      };
    };

    for (const asset of STATIC_ASSETS) {
      if (hasSuffix(asset, [".png", ".svg"])) {
        loadImage(asset);
      } else if (hasSuffix(asset, [".mp3", ".ogg"])) {
        loadSound(asset);
      }
    }
  }, []);

  return { done, error, loaded, total };
}

export { STATIC_ASSETS, useAssetsPreloader };
