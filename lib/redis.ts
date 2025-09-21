import { Redis } from '@upstash/redis';

let redis: Redis | undefined;

export function getRedis() {
    if (!redis) {
        const url = process.env.UPSTASH_REDIS_REST_URL;

        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            throw new Error(
                'Missing Redis env: set KV_REST_API_URL (or KV_URL/REDIS_URL) and KV_REST_API_TOKEN (or KV_REST_API_READ_ONLY_TOKEN)'
            );
        }

        redis = new Redis({ url, token });
    }
    return redis;
}

export { Redis };
