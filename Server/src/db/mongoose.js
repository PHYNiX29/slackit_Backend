import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI =process.env.MONGODB_URI || "mongodb+srv://vsundriyalbe23:TgdINYl0OgjH63tA@cluster0.l0vl4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    mongoose.connect(mongoURI);

    const connection = mongoose.connection;
    connection.on(
      "error",
      console.error.bind(console, "MongoDB connection error:")
    );
    connection.once("open", () => {
      console.log("Connected to MongoDB Atlas");
    });
  } catch (error) {
    console.error("MONGODB Connection error", error);
    process.exit(1);
  }
};

export default connectDB;
