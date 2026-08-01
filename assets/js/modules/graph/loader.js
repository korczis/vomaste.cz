// Lazy, once-only, cached fetch of a graph layer payload (the full
// registry layer on /map/ — mission § 18: "Aktivace plné vrstvy stáhne
// payload právě jednou. Druhé přepnutí použije cache."). One module-level
// cache keyed by URL is correct here (not per-controller): the payload's
// bytes don't depend on which controller instance asked for them, and a
// page only ever has one graph workbench active at a time.
const cache = new Map();

export function fetchLayer(url) {
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`graph loader: ${url} -> HTTP ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      cache.delete(url); // a failed fetch must not poison the cache — a later retry should try again
      throw err;
    });
  cache.set(url, promise);
  return promise;
}

export function readJsonIsland(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch (e) {
    return null;
  }
}
