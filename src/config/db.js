const mongoose = require("mongoose");

const cleanupLegacyIndexes = async () => {
  try {
    const usersCollection = mongoose.connection.collection("users");
    const indexes = await usersCollection.indexes();
    const hasLegacyPhoneIndex = indexes.some((index) => index.name === "phone_1");

    if (hasLegacyPhoneIndex) {
      await usersCollection.dropIndex("phone_1");
      console.log("Removed legacy index users.phone_1");
    }
  } catch (error) {
    console.warn("Skipping legacy index cleanup:", error.message);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    await cleanupLegacyIndexes();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;