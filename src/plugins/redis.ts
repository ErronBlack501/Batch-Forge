import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createClient } from "redis";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    var redis: ReturnType<typeof createClient> | undefined;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  const redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on("error", (err) => {
    logger.error({ error: err }, "Redis Client Error");
  });

  redisClient.on("connect", () => {
    logger.info("Redis Client Connected");
  });

  await redisClient.connect();

  fastify.decorate("redis", redisClient);
  globalThis.redis = redisClient;

  fastify.addHook("onClose", async () => {
    await redisClient.disconnect();
    logger.info("Redis Client Disconnected");
  });
});
