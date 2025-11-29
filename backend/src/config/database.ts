import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    throw error;
  }
}
