import { Worker } from "bullmq";
import { getEnv } from "../utils/env.js";

const env = getEnv();

const connection = { url: env.REDIS_URL };

const worker = new Worker(
  "documents",
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);

    const data = job.data as any;

    if (data?.userIds && Array.isArray(data.userIds)) {
      for (const [i, userId] of data.userIds.entries()) {
        // simulate per-user work
        await new Promise((r) => setTimeout(r, 100));
        const progress = Math.round(((i + 1) / data.userIds.length) * 100);
        await job.updateProgress(progress);
      }
    } else {
      // generic simulated work
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 100));
        await job.updateProgress(i);
      }
    }

    return { ok: true };
  },
  { connection },
);

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job?.id} failed:`, err));
worker.on("error", (err) => console.error("Worker error", err));

console.log("Document worker started and listening on queue: documents");
