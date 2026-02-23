import { Worker } from "bullmq";

import { sendEmail } from "../controllers/email.controller.js";
import { connection } from "./queue.js";

const worker = new Worker(
  "email",
  async (job) => {
    const { email, userName, streak } = job.data;
    console.log(`[worker] Sending email to ${email}`);
    const result = await sendEmail(email, userName, streak);
    if (!result.success) {
      throw new Error(
        `Failed to send email to ${email}: ${JSON.stringify(result.error)}`
      );
    }
    console.log(`[worker] Email sent to ${email}`);
  },
  { connection, limiter: { max: 2, duration: 1000 } }
);

worker.on("failed", (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err.message);
});
