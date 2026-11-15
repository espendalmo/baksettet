const VERSION = "9.0.2";
const CHANNEL = "beta";
const SCOPE = new URL("./", self.location.href);
const PREFIX = `bak-settet:${SCOPE.pathname}:${CHANNEL}:`;
const CACHE = `${PREFIX}${VERSION}`;
const ASSETS = [
  "index.html", "editor.html", "app.css", "app.js", "model.js", "update.js", "seed.js",
  "manifest.webmanifest", "version.json", "icon.svg", "icon-192.png", "icon-512.png"
];
const FEEDS = ["songs.json", "projects.json"];
let activation = Promise.resolve();

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const entries = await Promise.all([...ASSETS, ...FEEDS].map(async file => {
      const key = new URL(file, SCOPE);
      const fresh = new URL(key);
      fresh.searchParams.set("__bak_release", VERSION);
      const response = await fetch(fresh, { cache: "reload", credentials: "same-origin" });
      if (!response.ok) throw new Error(`Mangler ${file}`);
      if (file === "version.json") {
        const release = await response.clone().json();
        if (release.version !== VERSION || release.channel !== CHANNEL) throw new Error("Ufullstendig publisering");
      }
      return [key.href, response];
    }));
    const cache = await caches.open(CACHE);
    await Promise.all(entries.map(([key, response]) => cache.put(key, response)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  activation = (async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })();
  event.waitUntil(activation);
});

self.addEventListener("message", event => {
  if (event.data?.type === "GET_VERSION") event.waitUntil(activation.then(() => event.ports[0]?.postMessage({ version: VERSION, channel: CHANNEL })));
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
  if (event.data?.type === "CLAIM_CLIENTS") event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  if (url.searchParams.has("__bak_published") || url.searchParams.has("__bak_live")) return;
  const file = url.pathname.slice(SCOPE.pathname.length) || "index.html";
  if (![...ASSETS, ...FEEDS].includes(file)) return;
  const key = new URL(file, SCOPE);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (FEEDS.includes(file)) {
      try {
        const response = await fetch(event.request);
        if (!response.ok) return (await cache.match(key)) || response;
        await cache.put(key, response.clone()).catch(() => {});
        return response;
      } catch {
        return (await cache.match(key)) || Response.error();
      }
    }
    return (await cache.match(key)) || fetch(event.request);
  })());
});
