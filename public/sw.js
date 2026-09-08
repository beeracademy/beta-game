const SW_VERSION = "__BUILD_HASH__";
const CACHE_NAME =
  SW_VERSION && !SW_VERSION.startsWith("__")
    ? `academy-assets-${SW_VERSION}`
    : "academy-assets-v1";

const SOUND_NAMES = [
  "baladada",
  "big_chungus",
  "bubbi_fuve",
  "camera_shutter",
  "cheering",
  "click",
  "crown",
  "dick",
  "doublekill",
  "downunder",
  "firework",
  "homosangen_fuve",
  "humiliation",
  "loser",
  "megakill",
  "mimimi",
  "mkd_fatality",
  "mkd_finishim",
  "mkd_flawless",
  "mkd_laugh",
  "monsterkill",
  "moops",
  "multikill",
  "old",
  "ole_vedel",
  "pop",
  "slot_machine",
  "slot_machine_winner",
  "snack",
  "triplekill",
  "tryk_paa_den_lange_tast",
  "ultrakill",
  "wicked",
  "wilhelm_scream",
];

function getStaticAssetUrls(audioFormat = "ogg") {
  const assets = [
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

  // Prioritize playing cards first so gameplay assets are immediately ready
  for (const s of ["A", "C", "D", "H", "I", "S"]) {
    for (let v = 2; v <= 14; v++) {
      assets.push(`/cards/${s}-${v}.png`);
    }
  }

  // Sounds: only download the format supported by the browser (ogg if supported, else mp3)
  const format = audioFormat === "mp3" ? "mp3" : "ogg";
  for (const sound of SOUND_NAMES) {
    assets.push(`/sounds/${sound}.${format}`);
  }

  // Wallpapers 1 through 6
  for (let i = 1; i <= 6; i++) {
    assets.push(`/wallpaper/${i}.png`);
  }

  // Icons
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of iconSizes) {
    assets.push(`/icons/icon-${size}x${size}.png`);
  }

  return assets;
}

let isPreloading = false;
let preferredAudioFormat = "ogg";

// Read query params from service worker registration URL (e.g. /sw.js?audio=ogg)
try {
  const url = new URL(self.location.href);
  const audioParam = url.searchParams.get("audio");
  if (audioParam === "mp3" || audioParam === "ogg") {
    preferredAudioFormat = audioParam;
  }
} catch {
  // Ignore URL parse error in non-standard environments
}

async function preloadAssets(audioFormat = preferredAudioFormat) {
  if (isPreloading) return;
  isPreloading = true;

  try {
    const cache = await caches.open(CACHE_NAME);
    const urls = getStaticAssetUrls(audioFormat);
    const concurrency = 8;
    let index = 0;
    let downloadedCount = 0;
    let cachedCount = 0;
    const total = urls.length;

    async function worker() {
      while (index < urls.length) {
        const curIndex = index++;
        const url = urls[curIndex];
        const fullUrl = new URL(url, self.location.origin).href;

        try {
          // Respect caching: check if already cached by relative path or full URL
          const match =
            (await cache.match(url, { ignoreSearch: true })) ||
            (await cache.match(fullUrl, { ignoreSearch: true }));
          if (!match) {
            const res = await fetch(url);
            if (res && res.ok) {
              await cache.put(url, res.clone());
              await cache.put(fullUrl, res);
              downloadedCount++;
            }
          } else {
            cachedCount++;
          }
        } catch {
          // Silently ignore individual asset download errors
        }
      }
    }

    const workers = [];
    for (let w = 0; w < Math.min(concurrency, urls.length); w++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    if (downloadedCount === 0) {
      console.log(
        `[ServiceWorker] All ${total} assets are already cached in "${CACHE_NAME}" (0 network downloads). Ready for offline play!`,
      );
    } else {
      console.log(
        `[ServiceWorker] Downloaded and cached ${downloadedCount} new assets (${cachedCount} were already in cache). All ${total} assets ready for offline play!`,
      );
    }

    try {
      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({
          type: "PRELOAD_COMPLETE",
          total,
          loaded: total,
          downloaded: downloadedCount,
          cached: cachedCount,
        });
      }
    } catch {
      // Ignore messaging errors
    }
  } catch {
    // Ignore overall preloader errors
  } finally {
    isPreloading = false;
  }
}

self.addEventListener("install", () => {
  // Activate immediately without waiting for asset downloads
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old cache versions
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      // Immediately control clients
      await self.clients.claim();
      // Start quiet background preload detached from page load
      preloadAssets(preferredAudioFormat);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (event.data.type === "PRELOAD_ASSETS") {
    if (event.data.audioFormat === "mp3" || event.data.audioFormat === "ogg") {
      preferredAudioFormat = event.data.audioFormat;
    }
    preloadAssets(preferredAudioFormat);
  }
});

// Paths whose responses are safe to cache and replay offline.
const CACHEABLE_PREFIXES = [
  "/cards/",
  "/sounds/",
  "/wallpaper/",
  "/icons/",
  "/assets/",
  "/fonts/",
];

const CACHEABLE_PATHS = new Set([
  "/blackheart.svg",
  "/whiteheart.svg",
  "/skull.svg",
  "/wave.svg",
  "/crown.svg",
  "/jester.svg",
  "/logo.png",
  "/emojiData.json",
  "/manifest.json",
  "/favicon.ico",
]);

function isCacheableAsset(url) {
  if (CACHEABLE_PATHS.has(url.pathname)) {
    return true;
  }
  return CACHEABLE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Ignore cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Bypass API calls, websockets, and Vite dev server internal paths
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/api-token-auth") ||
    url.pathname.startsWith("/ws") ||
    url.pathname.startsWith("/@vite") ||
    url.pathname.startsWith("/@fs") ||
    url.pathname.startsWith("/@id/") ||
    url.pathname.startsWith("/@react-refresh") ||
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.startsWith("/src/")
  ) {
    return;
  }

  // HTML documents: Network-first, fallback to the cached shell.
  // `request.mode` is not always 'navigate' (prefetches, prerenders and some
  // reload paths), so check the request destination as well.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      (async () => {
        let response = null;
        try {
          response = await fetch(request);
        } catch {
          // Offline — fall through to the cached shell below
        }

        if (response && response.ok) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/index.html", response.clone());
            await cache.put("/", response.clone());
          } catch {
            // Caching the shell is best-effort; never fail the navigation
          }
          return response;
        }

        // A non-ok response (404/500/redirect) is still a real answer from the
        // server, so pass it through instead of masking it with a stale shell.
        if (response) {
          return response;
        }
        const cached =
          (await caches.match("/index.html", { ignoreSearch: true })) ||
          (await caches.match("/", { ignoreSearch: true }));
        if (cached) {
          return cached;
        }
        return new Response("Offline", { status: 503, statusText: "Offline" });
      })(),
    );
    return;
  }

  // Anything else that is not a known cacheable asset is left entirely to the
  // browser. Intercepting it only risks turning a working request into a
  // service worker network error.
  if (!isCacheableAsset(url)) {
    return;
  }

  // Static game assets (cards, sounds, wallpaper, icons, assets, svg, etc.): Cache-first
  event.respondWith(
    (async () => {
      // 1. Try matching the exact request (ignoring query strings if any)
      let cached = await caches.match(request, { ignoreSearch: true });
      if (cached) {
        return cached;
      }

      // 2. Try matching by pathname or full URL in our cache
      const cache = await caches.open(CACHE_NAME);
      cached =
        (await cache.match(url.pathname, { ignoreSearch: true })) ||
        (await cache.match(request.url, { ignoreSearch: true })) ||
        (await cache.match(url.href, { ignoreSearch: true }));
      if (cached) {
        return cached;
      }

      try {
        const response = await fetch(request);
        if (response && response.ok) {
          try {
            await cache.put(request, response.clone());
            await cache.put(url.pathname, response.clone());
          } catch {
            // Best-effort caching only
          }
        }
        return response;
      } catch {
        // Never let respondWith reject: a rejected promise surfaces as an
        // unhandled TypeError plus a hard network error in the page.
        return new Response("", {
          status: 504,
          statusText: "Gateway Timeout",
        });
      }
    })(),
  );
});
