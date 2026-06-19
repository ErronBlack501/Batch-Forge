import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import fastifyAutoload from "@fastify/autoload";
import fastifyEnv from "@fastify/env";
import Fastify, { type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { envJsonSchema } from "./utils/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  await fastify.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "BatchForge API",
        version: "1.0.0",
      },
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: "/docs",
  });

  await fastify.register(fastifyAutoload, {
    dir: join(__dirname, "plugins"),
    encapsulate: false,
    forceESM: true,
    options: fastify.config,
  });

  // Register routes
  // Mount all application routes under a versioned API root.
  // Use path-based versioning: register `routes/` under the `/api/v1` prefix.
  await fastify.register(fastifyAutoload, {
    dir: join(__dirname, "routes", "v1"),
    dirNameRoutePrefix: false,
    forceESM: true,
    options: fastify.config,
    prefix: "/api/v1",
  });

  // API root / health (mounted under versioned prefix)
  fastify.get(
    "/api/v1",
    {
      schema: {
        summary: "BatchForge API Health",
        description: "Get API info and health status",
        tags: ["Health"],
        response: {
          200: {
            description: "Success",
            type: "object",
            properties: {
              message: { type: "string" },
              version: { type: "string" },
              status: { type: "string" },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      return {
        message: "BatchForge API",
        version: "1.0.0",
        status: "ok",
      };
    },
  );

  return fastify;
}
