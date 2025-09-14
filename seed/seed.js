
import 'dotenv/config';
import mongoose from "mongoose";
import Customer from "../models/customer.js";
import Order from "../models/orders.js";

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in your .env file");
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    console.log("Cleared existing customer and order data.");

    const customers = [];
    for (let i = 0; i < 200; i++) {
      const lastSeenDate = new Date();
      // Make some users inactive
      if (i % 3 === 0) {
        lastSeenDate.setMonth(lastSeenDate.getMonth() - (Math.floor(Math.random() * 8) + 1)); // 1-8 months ago
      } else {
        lastSeenDate.setDate(lastSeenDate.getDate() - Math.floor(Math.random() * 30)); // within the last month
      }

      customers.push({
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        totalSpends: 0,
        visitCount: 0,
        lastSeen: lastSeenDate,
      });
    }

    const createdCustomers = await Customer.insertMany(customers);
    console.log("Created 200 customers.");

    const orders = [];
    for (const customer of createdCustomers) {
      const numOrders = Math.floor(Math.random() * 15) + 1; // 1 to 15 orders per customer
      let customerTotalSpends = 0;

      for (let j = 0; j < numOrders; j++) {
        const orderAmount = Math.floor(Math.random() * 2000) + 100; // Spend between 100 and 2100
        customerTotalSpends += orderAmount;

        const purchaseDate = new Date(customer.lastSeen);
        purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 7 * j)); // Orders placed leading up to lastSeen date

        orders.push({
          customerId: customer._id,
          amount: orderAmount,
          purchaseDate: purchaseDate,
        });
      }

      // Update the customer with their total spend and visit count
      await Customer.updateOne(
        { _id: customer._id },
        {
          $set: {
            totalSpends: customerTotalSpends,
            visitCount: numOrders,
          },
        }
      );
    }

    await Order.insertMany(orders);
    console.log(`Created ${orders.length} orders.`);
    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
};

seedDatabase();
