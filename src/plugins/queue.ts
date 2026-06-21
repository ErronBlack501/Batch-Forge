import { Queue } from "bullmq";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import type { Env } from "../utils/env.js";

declare module "fastify" {
  interface FastifyInstance {
    documentQueue: Queue;
  }
}

const queuePlugin: FastifyPluginAsync<Env> = async (fastify, options) => {
  const documentQueue = new Queue("documents", {
    connection: {
      url: options.REDIS_URL,
    },
    defaultJobOptions: {
      attempts: options.MAX_RETRIES,
      backoff: {
        type: "exponential",
        delay: options.RETRY_BACKOFF,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  fastify.decorate("documentQueue", documentQueue);

  fastify.addHook("onClose", async () => {
    await documentQueue.close();
  });
};

export default fp(queuePlugin, {
  name: "queue",
});
