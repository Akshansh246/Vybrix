import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
    console.log('Connected to Redis Successfully!')
})

redis.on('error', (err) => {
    console.log('Error connecting to Redis', err);
})

export async function refreshTTL(sandboxId) {
    await redis.expire(`sandbox:${sandboxId}`, 120)
}