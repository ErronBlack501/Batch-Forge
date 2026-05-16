import type { FastifyInstance } from "fastify";
import type { Env } from "./utils/env.js";
import fastifyEnv from "@fastify/env";
import Fastify from "fastify";
import { batchRoutes } from "./modules/batch/index.js";
import { documentRoutes } from "./modules/documents/index.js";
import { healthRoutes } from "./modules/health/index.js";
import { envJsonSchema } from "./utils/env.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
  }
}

export async function createApp(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: true,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "req_id",
    disableRequestLogging: false,
    trustProxy: true,
  });

  // Register environment plugin FIRST
  await fastify.register(fastifyEnv, {
    schema: envJsonSchema,
  });

  // Register routes
  await fastify.register(batchRoutes);
  await fastify.register(documentRoutes);
  await fastify.register(healthRoutes);

  // Root route
  fastify.get("/", async (_request, _reply) => {
    return {
      message: "BatchForge API",
      version: "1.0.0",
      status: "ok",
    };
  });

  return fastify;
}
