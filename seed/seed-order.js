import 'dotenv/config';
import mongoose from "mongoose";
import { createClient } from 'redis';
import Customer from "../models/customer.js";

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;
const ORDER_STREAM = "order_stream";

async function seedOrders() {
  if (!MONGO_URI || !REDIS_URL) {
    throw new Error("MONGO_URI and REDIS_URL must be defined in your .env file");
  }

  // 1. Connect to MongoDB to get the customers
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB to fetch customers...");
  const customers = await Customer.find({});
  if (customers.length === 0) {
    console.error("No customers found in the database. Please run the customer seeder and consumer first.");
    await mongoose.disconnect();
    return;
  }
  console.log(`Found ${customers.length} customers to create orders for.`);


  const redisClient = createClient({ url: REDIS_URL });
  await redisClient.connect();
  console.log("Connected to Redis to seed orders.");

  let totalOrders = 0;
  for (const customer of customers) {
    const numOrders = Math.floor(Math.random() * 15) + 1; // 1 to 15 orders
    for (let j = 0; j < numOrders; j++) {
      const orderAmount = Math.floor(Math.random() * 2000) + 100;
      await redisClient.xAdd(ORDER_STREAM, '*', {
        customerId: customer._id.toString(),
        amount: String(orderAmount),
        purchaseDate: new Date().toISOString(),
      });
      totalOrders++;
    }
  }

  console.log(` All ${totalOrders} orders have been published to the stream.`);


  await mongoose.disconnect();
  await redisClient.quit();
}

seedOrders().catch(err => {
  console.error("Error during order seeding:", err);
  process.exit(1);
});