import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

export const loginLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      prefix: 'rl:login',
    })
  : null;
