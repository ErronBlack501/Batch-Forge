import type { Db } from "mongodb";
import type { Queue } from "bullmq";
import type { RedisClientType } from "redis";
import type { FastifyInstance } from "fastify";

import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import { batchRoutes } from "./modules/batch/index.js";
import { documentRoutes } from "./modules/documents/index.js";
import { healthRoutes } from "./modules/health/index.js";
import metricsPlugin from "./plugins/metrics.js";
import mongoPlugin from "./plugins/mongo.js";
import queuePlugin from "./plugins/queue.js";
import redisPlugin from "./plugins/redis.js";
import swaggerPlugin from "./plugins/swagger.js";
import { logger } from "./utils/logger.js";
import { envJsonSchema, type Env } from "./utils/env.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: Db;
    queue: Queue;
    redis: RedisClientType;
  }
}

export async function createApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: logger,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "req_id",
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register environment plugin FIRST
  await fastify.register(fastifyEnv, {
    schema: envJsonSchema,
  });

  // Register plugins
  await fastify.register(redisPlugin);
  await fastify.register(mongoPlugin);
  await fastify.register(queuePlugin);
  await fastify.register(metricsPlugin);
  await fastify.register(swaggerPlugin);

  // Register routes
  await fastify.register(
    async (fastify) => {
      await healthRoutes(fastify, fastify.db, fastify.redis);
    },
    { prefix: "/" },
  );

  await fastify.register(
    async (fastify) => {
      await batchRoutes(fastify, fastify.db, fastify.queue);
    },
    { prefix: "/" },
  );

  await fastify.register(
    async (fastify) => {
      await documentRoutes(fastify, fastify.db);
    },
    { prefix: "/" },
  );

  // Root route
  fastify.get("/", async (_request, _reply) => {
    return {
      message: "BatchForge API",
      version: "1.0.0",
      documentation: "/documentation",
      health: "/health",
      metrics: "/metrics",
    };
  });

  return fastify;
}
