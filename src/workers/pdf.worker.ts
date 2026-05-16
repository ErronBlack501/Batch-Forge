import type { DocumentJobData } from "../jobs/document.job.js";

import { Worker } from "bullmq";
import { MongoClient } from "mongodb";

import { getEnv } from "../utils/env.js";
import { logger } from "../utils/logger.js";
import { processDocumentJob } from "../jobs/document.job.js";

const env = getEnv();

const redisConnection = {
  host: new URL(env.REDIS_URL).hostname || "localhost",
  port: Number.parseInt(new URL(env.REDIS_URL).port || "6379", 10),
};

export class DocumentWorker {
  private worker!: Worker<DocumentJobData>;
  private mongoClient!: MongoClient;

  async start() {
    logger.info("Starting Document Worker");

    // Connect to MongoDB
    this.mongoClient = new MongoClient(env.MONGODB_URI);
    await this.mongoClient.connect();
    const db = this.mongoClient.db(env.MONGODB_DB);

    // Create worker
    this.worker = new Worker<DocumentJobData>(
      "documents",
      async (job) => {
        try {
          await processDocumentJob(job, db);
          return { success: true };
        } catch (error) {
          logger.error({ error }, "Job processing failed");
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: env.CONCURRENCY,
      },
    );

    this.worker.on("completed", (job) => {
      logger.info({ jobId: job.id }, "Job completed");
    });

    this.worker.on("failed", (job, err) => {
      logger.error({ jobId: job?.id, error: err }, "Job failed");
    });

    this.worker.on("error", (err) => {
      logger.error({ error: err }, "Worker error");
    });

    logger.info("Document Worker started");
  }

  async stop() {
    logger.info("Stopping Document Worker");
    await this.worker.close();
    await this.mongoClient.close();
    logger.info("Document Worker stopped");
  }
}

// Run worker if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const worker = new DocumentWorker();
  worker.start().catch((error) => {
    logger.error({ error }, "Failed to start worker");
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    await worker.stop();
    process.exit(0);
  });
}

export default DocumentWorker;
