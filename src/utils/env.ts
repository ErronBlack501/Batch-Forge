import { z } from "zod";

export const envSchema = z.object({
  CONCURRENCY: z.coerce.number().int().positive().default(5),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  MAX_RETRIES: z.coerce.number().int().nonnegative().default(3),
  MONGODB_DB: z.string().default("batch-forge"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/batch-forge"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  RETRY_BACKOFF: z.coerce.number().int().positive().default(2000),
});

export type Env = z.infer<typeof envSchema>;

// Helper to get env from fastify instance or fallback to process.env
export function getEnv(fastify?: { config?: Env }): Env {
  if (fastify?.config) {
    return fastify.config;
  }
  // Fallback for cases where fastify is not available yet (e.g., logger initialization)
  return envSchema.parse(process.env);
}

// Export zod schema as JSON schema for @fastify/env compatibility
export const envJsonSchema = {
  type: "object",
  required: [],
  properties: {
    CONCURRENCY: { type: "number", default: 5 },
    LOG_LEVEL: { type: "string", default: "info" },
    MAX_RETRIES: { type: "number", default: 3 },
    MONGODB_DB: { type: "string", default: "batch-forge" },
    MONGODB_URI: {
      type: "string",
      default: "mongodb://localhost:27017/batch-forge",
    },
    NODE_ENV: { type: "string", default: "development" },
    PORT: { type: "number", default: 3000 },
    REDIS_URL: { type: "string", default: "redis://localhost:6379" },
    RETRY_BACKOFF: { type: "number", default: 2000 },
  },
} as const;
