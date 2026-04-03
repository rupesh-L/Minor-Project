// Config for Upstash Redis
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function connectRedis() {
  try {
    await redis.ping();
    console.log("Redis connected successfully");
  } catch (error) {
    console.log(error.message);
    throw new Error("Error connecting Redis");
  }
}
