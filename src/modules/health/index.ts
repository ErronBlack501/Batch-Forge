import { FastifyInstance } from "fastify";
import { Db } from "mongodb";

export async function healthRoutes(
  fastify: FastifyInstance,
  db: Db,
  redis: any,
) {
  fastify.get("/health", async (request, reply) => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      checks: {
        mongodb: "unknown",
        redis: "unknown",
        queue: "unknown",
      },
    };

    try {
      // Check MongoDB
      await db.admin().ping();
      health.checks.mongodb = "ok";
    } catch (error) {
      health.checks.mongodb = "error";
      health.status = "degraded";
    }

    try {
      // Check Redis
      await redis.ping();
      health.checks.redis = "ok";
    } catch (error) {
      health.checks.redis = "error";
      health.status = "degraded";
    }

    // Check queue
    if (fastify.queue) {
      health.checks.queue = "ok";
    }

    reply.code(health.status === "ok" ? 200 : 503).send(health);
  });
}
