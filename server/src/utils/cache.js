const store = new Map();

export async function cached(key, ttlMs, loader) {
  const hit = store.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.value;

  const value = await loader(); // if this throws, nothing gets cached
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}