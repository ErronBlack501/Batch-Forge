import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import { logger } from "../utils/logger.js";

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "BatchForge API",
        description: "High-performance document generation API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      components: {
        schemas: {
          Batch: {
            type: "object",
            properties: {
              batchId: { type: "string" },
              status: {
                type: "string",
                enum: ["pending", "processing", "completed", "failed"],
              },
              progress: {
                type: "object",
                properties: {
                  total: { type: "number" },
                  done: { type: "number" },
                  failed: { type: "number" },
                },
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  });

  logger.info("Swagger/OpenAPI initialized");
});
