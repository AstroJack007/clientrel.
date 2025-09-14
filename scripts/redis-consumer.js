import "dotenv/config";
import { createClient } from "redis";
import mongoose from "mongoose";
import Customer from "../models/customer.js";
import Order from "../models/orders.js";

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

const CUSTOMER_STREAM = "customer_stream";
const ORDER_STREAM = "order_stream";
const GROUP_NAME = "processing_group";

async function processStream(redisClient, streamName, handler) {
  try {
    await redisClient.xGroupCreate(streamName, GROUP_NAME, "0", { MKSTREAM: true });
    console.log(`Created consumer group ${GROUP_NAME} for stream ${streamName}`);
  } catch (error) {
    if (error?.message?.includes('BUSYGROUP')) {
      console.log(`Consumer group ${GROUP_NAME} already exists for stream ${streamName}`);
    } else {
      console.error(`Error creating consumer group for ${streamName}: `, error);
      process.exit(1);
    }
  }

  while (true) {
    try {
      const response = await redisClient.xReadGroup(
        GROUP_NAME,
        `consumer_${streamName}`,
        { key: streamName, id: ">" },
        { BLOCK: 0, COUNT: 1 }
      );

      if (response) {
        const [stream] = response;
        const [message] = stream.messages;
        await handler(message);
        await redisClient.xAck(streamName, GROUP_NAME, message.id);
      }
    } catch (err) {
      console.error(`Error processing message from ${streamName}:`, err);
    }
  }
}

async function handleCustomerMessage(message) {
  const { name, email } = message.message;
  console.log(`Processing customer ${message.id}:`, { name, email });
  const newCustomer = new Customer({ name, email });
  await newCustomer.save();
  console.log(`Customer saved to db, email: ${email}`);
}

async function handleOrderMessage(message) {
  const { customerId, amount, purchaseDate } = message.message;
  console.log(`Processing order ${message.id}:`, { customerId, amount });

  const orderAmount = parseFloat(amount);
  const newOrder = new Order({
    customerId,
    amount: orderAmount,
    purchaseDate: new Date(purchaseDate),
  });
  await newOrder.save();

  await Customer.updateOne(
    { _id: customerId },
    {
      $inc: {
        totalSpends: orderAmount,
        visitCount: 1,
      },
      $set: {
        lastSeen: new Date(purchaseDate),
      }
    }
  );
  console.log(`Order saved and customer ${customerId} updated.`);
}


async function main() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is not set in env");
    if (!REDIS_URL) throw new Error("REDIS_URL is not set in env");

    await mongoose.connect(MONGO_URI);
    console.log("Consumer connected to MongoDB");

    const redisClient = createClient({ url: REDIS_URL });
    await redisClient.connect();
    console.log("Consumer connected to Redis");

    console.log("Consumer is waiting for messages....");

    await Promise.all([
        processStream(redisClient, CUSTOMER_STREAM, handleCustomerMessage),
        processStream(redisClient, ORDER_STREAM, handleOrderMessage)
    ]);

  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error in consumer:", err);
  process.exit(1);
});