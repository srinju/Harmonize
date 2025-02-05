import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const publishMessage = async (channel : string , message : object) => {
    await redis.publish(channel , JSON.stringify(message));
}

export default redis;