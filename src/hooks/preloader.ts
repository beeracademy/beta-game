import { useEffect, useState } from "react";
import { SoundNames } from "./sounds";

function useAssetsPreloader() {
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoadedCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  // Other
  const assets: string[] = [
    "cards/cardback.png",
    "cards/cardback-au.png",
    "blackheart.svg",
    "skull.svg",
    "wave.svg",
    "whiteheart.svg",
  ];

  // Sounds
  for (const sound of SoundNames) {
    assets.push(`/sounds/${sound}.mp3`);
    assets.push(`/sounds/${sound}.ogg`);
  }

  // Cards
  for (const s of ["A", "C", "D", "H", "I", "S"]) {
    for (let i = 2; i <= 14; i++) {
      assets.push(`/cards/${s}-${i}.png`);
    }
  }

  useEffect(() => {
    setTotal(assets.length);

    for (const asset of assets) {
      if (hasSuffix(asset, [".png", ".svg"])) {
        loadImages(asset);
      }

      if (hasSuffix(asset, [".mp3", ".ogg"])) {
        loadSound(asset);
      }
    }
  }, []);

  const incrementLoadedCount = () => {
    setLoadedCount((prev) => {
      if (prev + 1 === assets.length) {
        setDone(true);
      }
      return prev + 1;
    });
  };

  const loadImages = async (path: string) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      incrementLoadedCount();
    };
    img.onerror = () => {
      setError(true);
    };
  };

  const loadSound = async (path: string) => {
    const audio = new Audio(path);
    audio.oncanplaythrough = () => {
      incrementLoadedCount();
    };
    audio.onerror = () => {
      setError(true);
    };
  };

  return { done, error, loaded, total };
}

const hasSuffix = (str: string, substr: string[]) => {
  return substr.some((s) => str.includes(s));
};

export { useAssetsPreloader };
