import type { FastifyInstance } from "fastify";
import healthRoutes from "./health.js";
import metricsRoutes from "./metrics.js";
import documentsRoutes from "./documents.js";

export default async function v1Routes(fastify: FastifyInstance) {
  await fastify.register(healthRoutes);
  await fastify.register(metricsRoutes);
  await fastify.register(documentsRoutes);
}
