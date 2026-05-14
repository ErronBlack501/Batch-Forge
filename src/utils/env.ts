import "dotenv/config";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/batch-forge",
  MONGODB_DB: process.env.MONGODB_DB || "batch-forge",
  PORT: parseInt(process.env.PORT || "3000", 10),
  CONCURRENCY: parseInt(process.env.CONCURRENCY || "5", 10),
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES || "3", 10),
  RETRY_BACKOFF: parseInt(process.env.RETRY_BACKOFF || "2000", 10),
};
