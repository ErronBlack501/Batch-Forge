import type { FastifyInstance } from "fastify";
import { createClient } from "redis";
import fp from "fastify-plugin";
import { logger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    var redis: ReturnType<typeof createClient> | undefined;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const { REDIS_URL } = fastify.config;

  const redisClient = createClient({
    url: REDIS_URL,
  });

  redisClient.on("error", (err) => {
    logger.error({ error: err }, "Redis Client Error");
  });

  redisClient.on("connect", () => {
    logger.info("Redis Client Connected");
  });

  await redisClient.connect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fastify.decorate("redis", redisClient);
  globalThis.redis = redisClient;

  fastify.addHook("onClose", async () => {
    await redisClient.destroy();
    logger.info("Redis Client Disconnected");
  });
});
