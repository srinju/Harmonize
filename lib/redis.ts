import { createClient } from "redis";


const redisClient = createClient({
    url : process.env.REDIS_URL
});

redisClient.on('error' , (err) => console.error("redis client error : " , err));

(async () => {
    await redisClient.connect();
    console.log("Connected to Redis");
})();

export const publishMessage = async(channel : string , message : object) => {
    await redisClient.publish(channel , JSON.stringify(message));
};

export const createSubscriber = async () => {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    return subscriber;
}

export default redisClient;