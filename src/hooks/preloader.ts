import { useEffect, useState } from "react";
import {
  type AudioFormat,
  checkOggSupport,
  registerServiceWorker,
} from "../serviceWorkerRegistration";
import { SoundNames } from "./sounds";

export function getStaticAssets(audioFormat: AudioFormat = "ogg"): string[] {
  const assets: string[] = [
    "/",
    "/index.html",
    "/cards/cardback.png",
    "/cards/cardback-au.png",
    "/blackheart.svg",
    "/skull.svg",
    "/wave.svg",
    "/whiteheart.svg",
    "/crown.svg",
    "/jester.svg",
    "/logo.png",
    "/emojiData.json",
  ];

  // Wallpapers 1 through 6
  for (let i = 1; i <= 6; i++) {
    assets.push(`/wallpaper/${i}.png`);
  }

  // Icons
  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    assets.push(`/icons/icon-${size}x${size}.png`);
  }

  // Cards: 6 suits (A, C, D, H, I, S), values 2-14
  for (const s of ["A", "C", "D", "H", "I", "S"]) {
    for (let i = 2; i <= 14; i++) {
      assets.push(`/cards/${s}-${i}.png`);
    }
  }

  // Sounds: only the format supported by the browser (ogg vs mp3)
  for (const sound of SoundNames) {
    assets.push(`/sounds/${sound}.${audioFormat}`);
  }

  return assets;
}

const STATIC_ASSETS: string[] = getStaticAssets("ogg");

function useAssetsPreloader() {
  const [done, setDone] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [loaded, setLoadedCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(STATIC_ASSETS.length);

  useEffect(() => {
    const audioFormat: AudioFormat = checkOggSupport() ? "ogg" : "mp3";
    const assets = getStaticAssets(audioFormat);
    setTotal(assets.length);

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      registerServiceWorker({
        onPreloadProgress: (data) => {
          setLoadedCount(data.loaded);
          if (data.total) setTotal(data.total);
          if (data.loaded >= (data.total || assets.length)) {
            setDone(true);
          }
        },
        onPreloadComplete: (data) => {
          setLoadedCount(data.total);
          setDone(true);
        },
      }).catch(() => {
        setError(true);
      });
      return;
    }

    // Fallback if Service Workers are not supported (e.g., restricted iframe)
    // Run quietly in background without creating DOM Image / Audio objects
    let cancelled = false;
    let count = 0;

    const runFallback = async () => {
      const concurrency = 4;
      let index = 0;

      async function worker() {
        while (index < assets.length && !cancelled) {
          const curIndex = index++;
          const url = assets[curIndex];
          try {
            await fetch(url, { cache: "force-cache" });
          } catch {
            // Silently ignore
          } finally {
            if (!cancelled) {
              count++;
              setLoadedCount(count);
            }
          }
        }
      }

      const workers = [];
      for (let i = 0; i < Math.min(concurrency, assets.length); i++) {
        workers.push(worker());
      }
      await Promise.all(workers);
      if (!cancelled) {
        setDone(true);
      }
    };

    runFallback().catch(() => {
      if (!cancelled) setError(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { done, error, loaded, total };
}

export { STATIC_ASSETS, useAssetsPreloader };
