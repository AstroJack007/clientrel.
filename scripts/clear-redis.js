import 'dotenv/config';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in your .env file");
}

const STREAMS_TO_CLEAR = ["customer_stream", "order_stream"];

async function clearRedisStreams() {
  const redisClient = createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  console.log("Connected to Redis.");

  for (const streamName of STREAMS_TO_CLEAR) {
    console.log(`Deleting stream: "${streamName}"...`);
    const result = await redisClient.del(streamName);
    if (result === 1) {
  console.log(`Successfully deleted "${streamName}".`);
    } else {
      console.log(` Stream "${streamName}" did not exist, nothing to delete.`);
    }
  }

  await redisClient.quit();
  console.log("Disconnected from Redis.");
}

clearRedisStreams().catch(err => {
  console.error("An error occurred:", err);
  process.exit(1);
});