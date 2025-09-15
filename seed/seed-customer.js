import 'dotenv/config';
import mongoose from "mongoose";
import { createClient } from 'redis';
import Customer from "../models/customer.js";
import Order from "../models/orders.js";

const MONGO_URI = process.env.MONGO_URI;
const REDIS_URL = process.env.REDIS_URL;

if (!MONGO_URI || !REDIS_URL) {
  throw new Error("MONGO_URI and REDIS_URL must be defined in your .env file");
}
const CUSTOMER_STREAM = "customer_stream";

async function seedCustomers() {
 
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB to clear data...");
  await Customer.deleteMany({});
  await Order.deleteMany({});
  console.log("Cleared existing customer and order data.");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");


  const redisClient = createClient({ url: REDIS_URL });
  await redisClient.connect();
  console.log("Seeder connected to Redis to seed customers.");

  console.log("Adding 200 customers to the stream...");
  for (let i = 0; i < 200; i++) {
    await redisClient.xAdd(CUSTOMER_STREAM, '*', {
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
    });
  }

  console.log(" All 200 customers have been published to the stream.");
  

  await redisClient.quit();
}

seedCustomers().catch(err => {
  console.error("Error during customer seeding:", err);
  process.exit(1);
});