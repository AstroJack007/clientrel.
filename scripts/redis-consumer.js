import "dotenv/config";
import { createClient } from "redis";
import mongoose from "mongoose";
import Customer from "../models/customer.js";
import Order from "../models/orders.js";

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

// --- CONFIGURATION ---
const STREAMS = {
  customer_stream: { handler: handleCustomerMessage },
  order_stream: { handler: handleOrderMessage },
};
const GROUP_NAME = "processing_group";
const CONSUMER_NAME = "consumer-1"; // Using a single, static consumer name

// --- HANDLERS ---
async function handleCustomerMessage(message) {
  const { name, email } = message.message;
  console.log(`[CUSTOMER] Processing message ${message.id}:`, { name, email });
  const newCustomer = new Customer({ name, email });
  await newCustomer.save();
  console.log(`[CUSTOMER] Saved to DB, email: ${email}`);
}

async function handleOrderMessage(message) {
  const { customerId, amount, purchaseDate } = message.message;
  console.log(`[ORDER] Processing message ${message.id}:`, { customerId, amount });

  const orderAmount = parseFloat(amount);
  await Order.create({
    customerId,
    amount: orderAmount,
    purchaseDate: new Date(purchaseDate),
  });

  await Customer.updateOne(
    { _id: customerId },
    {
      $inc: { totalSpends: orderAmount, visitCount: 1 },
      $set: { lastSeen: new Date(purchaseDate) }
    }
  );
  console.log(`[ORDER] Order saved and customer ${customerId} updated.`);
}


// --- MAIN LOGIC ---
async function main() {
  if (!MONGO_URI || !REDIS_URL) {
    throw new Error("MONGO_URI and REDIS_URL must be set in your .env file");
  }

  await mongoose.connect(MONGO_URI);
  console.log("Consumer connected to MongoDB");

  const redisClient = createClient({ url: REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  console.log("Consumer connected to Redis");

 
  for (const streamName of Object.keys(STREAMS)) {
    try {
      await redisClient.xGroupCreate(streamName, GROUP_NAME, "0", { MKSTREAM: true });
      console.log(`Created/ensured group "${GROUP_NAME}" exists for stream "${streamName}".`);
    } catch (error) {
      if (error?.message?.includes('BUSYGROUP')) {
        console.log(`Group "${GROUP_NAME}" already exists for stream "${streamName}".`);
      } else {
        throw error;
      }
    }
  }

  console.log(`\n--- Consumer "${CONSUMER_NAME}" is waiting for messages... ---`);

  const streamConfigs = Object.keys(STREAMS).map(key => ({ key, id: '>' }));

  while (true) {
    try {
      const response = await redisClient.xReadGroup(
        GROUP_NAME,
        CONSUMER_NAME,
        streamConfigs,
        { BLOCK: 0, COUNT: 10 }
      );

      if (response) {
        for (const stream of response) {
          const streamName = stream.name;
          for (const message of stream.messages) {
            console.log(`\nReceived message from stream: ${streamName}`);
            await STREAMS[streamName].handler(message);
            await redisClient.xAck(streamName, GROUP_NAME, message.id);
          }
        }
      } else {
        
        console.log("No new messages, waiting...");
      }
    } catch (err) {
      console.error("Error reading from stream:", err);
     
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

main().catch(err => {
  console.error("A fatal error occurred in the consumer:", err);
  process.exit(1);
});