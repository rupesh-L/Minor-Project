import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Mongo Db connected locally.");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
