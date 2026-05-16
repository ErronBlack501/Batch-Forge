import type { FastifyInstance }  from "fastify";
import type { Db } from "mongodb";
import { MongoClient } from "mongodb";

import fp from "fastify-plugin";
import { logger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    var mongoDb: Db | undefined;
  }
}

let mongoClient: MongoClient;

export default fp(async (fastify: FastifyInstance) => {
  const { MONGODB_URI, MONGODB_DB } = fastify.config;

  mongoClient = new MongoClient(MONGODB_URI);

  await mongoClient.connect();
  const db = mongoClient.db(MONGODB_DB);

  // Verify connection
  await db.admin().ping();
  logger.info("MongoDB Connected");

  // Create indexes
  const batches = db.collection("batches");
  const documents = db.collection("documents");

  await batches.createIndex({ createdAt: 1 });
  await batches.createIndex({ status: 1 });
  await documents.createIndex({ batchId: 1 });
  await documents.createIndex({ status: 1 });

  fastify.decorate("db", db);
  globalThis.mongoDb = db;

  fastify.addHook("onClose", async () => {
    await mongoClient.close();
    logger.info("MongoDB Disconnected");
  });
});
