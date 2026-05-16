import { FastifyInstance } from "fastify";
import * as promClient from "prom-client";

import fp from "fastify-plugin";
import { logger } from "../utils/logger.js";

export const metricsRegistry = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register: metricsRegistry });

// Custom metrics
export const documentsGenerated = new promClient.Counter({
  name: "documents_generated_total",
  help: "Total number of documents generated",
  registers: [metricsRegistry],
});

export const batchProcessingDuration = new promClient.Histogram({
  name: "batch_processing_duration_seconds",
  help: "Batch processing duration in seconds",
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
  registers: [metricsRegistry],
});

export const queueSize = new promClient.Gauge({
  name: "queue_size",
  help: "Current queue size",
  registers: [metricsRegistry],
});

export const documentGenerationErrors = new promClient.Counter({
  name: "document_generation_errors_total",
  help: "Total number of document generation errors",
  registers: [metricsRegistry],
});

export default fp(async (fastify: FastifyInstance) => {
  logger.info("Prometheus metrics initialized");

  fastify.get("/metrics", async (_request, reply) => {
    reply.type("text/plain");
    return metricsRegistry.metrics();
  });
});
