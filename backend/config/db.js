const mongoose = require("mongoose");

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      console.log("No MONGODB_URI provided. Initializing local MongoDB instance...");
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri() + "veltrix";
      process.env.MONGODB_URI = uri;
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
