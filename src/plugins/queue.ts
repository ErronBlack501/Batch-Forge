import { FastifyInstance } from "fastify";

import { Queue } from "bullmq";
import fp from "fastify-plugin";
import { logger } from "../utils/logger.js";

let documentQueue: Queue;

export default fp(async (fastify: FastifyInstance) => {
  const { MAX_RETRIES, REDIS_URL, RETRY_BACKOFF } = fastify.config;

  const redisConnection = {
    host: new URL(REDIS_URL).hostname || "localhost",
    port: Number.parseInt(new URL(REDIS_URL).port || "6379", 10),
  };

  documentQueue = new Queue("documents", {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: MAX_RETRIES,
      backoff: {
        type: "exponential",
        delay: RETRY_BACKOFF,
      },
      removeOnComplete: true,
    },
  });

  logger.info("BullMQ Queue initialized");

  fastify.decorate("queue", documentQueue);

  fastify.addHook("onClose", async () => {
    await documentQueue.close();
    logger.info("BullMQ Queue Closed");
  });
});

export { documentQueue };
