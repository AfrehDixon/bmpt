import Redis from 'ioredis';

/**
 * Shared Redis connection used to cache CMS reads so the public site
 * stays fast under load. If Redis is unavailable the helpers degrade
 * gracefully and fall back to hitting Postgres directly.
 */
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });
    client.on('error', (err) => {
      // Don't crash the app on cache errors — log once and move on.
      if (process.env.NODE_ENV === 'development') {
        console.warn('[redis] connection error:', err.message);
      }
    });
    return client;
  } catch {
    return null;
  }
}

export const redis = globalForRedis.redis ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

const DEFAULT_TTL = 60; // seconds

/** Read-through cache: returns cached JSON or runs `loader` and caches it. */
export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  if (!redis) return loader();
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    /* ignore cache read failure */
  }

  const value = await loader();

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    /* ignore cache write failure */
  }
  return value;
}

/** Invalidate one or more cache keys (or key prefixes via `*`). */
export async function invalidate(...patterns: string[]): Promise<void> {
  if (!redis) return;
  try {
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern);
        if (keys.length) await redis.del(...keys);
      } else {
        await redis.del(pattern);
      }
    }
  } catch {
    /* ignore */
  }
}

/** Drop every cms:* cache entry — used after admin writes. */
export async function clearCmsCache(): Promise<void> {
  await invalidate('cms:*');
}
