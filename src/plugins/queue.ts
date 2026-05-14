import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Queue } from "bullmq";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

const redisConnection = {
  host: new URL(env.REDIS_URL).hostname || "localhost",
  port: parseInt(new URL(env.REDIS_URL).port || "6379"),
};

export const documentQueue = new Queue("documents", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: env.MAX_RETRIES,
    backoff: {
      type: "exponential",
      delay: env.RETRY_BACKOFF,
    },
    removeOnComplete: true,
  },
});

export default fp(async (fastify: FastifyInstance) => {
  logger.info("BullMQ Queue initialized");

  fastify.decorate("queue", documentQueue);

  fastify.addHook("onClose", async () => {
    await documentQueue.close();
    logger.info("BullMQ Queue Closed");
  });
});
