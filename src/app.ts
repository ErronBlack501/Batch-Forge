import Fastify from "fastify";
import { logger } from "./utils/logger.js";

// Import plugins
import redisPlugin from "./plugins/redis.js";
import mongoPlugin from "./plugins/mongo.js";
import queuePlugin from "./plugins/queue.js";
import metricsPlugin from "./plugins/metrics.js";
import swaggerPlugin from "./plugins/swagger.js";

// Import routes
import { healthRoutes } from "./modules/health/index.js";
import { batchRoutes } from "./modules/batch/index.js";
import { documentRoutes } from "./modules/documents/index.js";

declare module "fastify" {
  interface FastifyInstance {
    redis: any;
    db: any;
    queue: any;
  }
}

export async function createApp() {
  const fastify = Fastify({
    logger: logger,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "req_id",
    disableRequestLogging: false,
    trustProxy: true,
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
  fastify.get("/", async (request, reply) => {
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
