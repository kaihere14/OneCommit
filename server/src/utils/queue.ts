import { Queue } from "bullmq";

export const connection = {
  host: process.env.REDIS_HOST,
  user: "default",
  port: 19877,
  password: process.env.REDIS_PASSWORD,
};
export const myQueue = new Queue("email", { connection });
