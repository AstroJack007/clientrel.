import "dotenv/config";
import { createClient } from "redis";
import mongoose from "mongoose";
import Customer from "../models/customer.js";

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const STREAM_NAME = "customer_stream";
const GROUP_NAME = "cus_group";

async function main() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is not set in env");
    if (!REDIS_URL) throw new Error("REDIS_URL is not set in env");

    await mongoose.connect(MONGO_URI);
    console.log("Consumer connected to MongoDB");

    const redisClient = createClient({ url: REDIS_URL });
    await redisClient.connect();
    console.log("Consumer connected to Redis");

    try {
      await redisClient.xGroupCreate(STREAM_NAME, GROUP_NAME, "0", { MKSTREAM: true });
      console.log(`Created consumer group ${GROUP_NAME}`);
    } catch (error) {
      if (error?.message?.includes('BUSYGROUP')) {
        console.log(`Consumer group ${GROUP_NAME} already exist`);
      } else {
        console.error("Error creating consumer groups : ", error);
        process.exit(1);
      }
    }
    console.log("Consumer is waiting for messages ....");

    while (true) {
      try {
        const response = await redisClient.xReadGroup(
          GROUP_NAME,
          "consumer_1",
          { key: STREAM_NAME, id: ">" }, //'>' means get new messages
          { BLOCK: 0, COUNT: 1 } // block infinite, process one message at a time
        );

        if (response) {
          const [stream] = response;
          const [message] = stream.messages;
          const { name, email } = message.message;
          
          console.log(`Processing message ${message.id} : `, { name, email });

          const newCustomer = new Customer({ name, email });
          await newCustomer.save();
          console.log(`Customer saved to db email: ${email}`);

          await redisClient.xAck(STREAM_NAME, GROUP_NAME, message.id);
        }
      } catch (err) {
        console.error("Errror processing stream message :", err);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

main().catch((err) => {
  console.error("Fatal error in consumer:", err);
  process.exit(1);
});
