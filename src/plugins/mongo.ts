import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { MongoClient, Db } from "mongodb";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    var mongoDb: Db | undefined;
  }
}

let mongoClient: MongoClient;

export default fp(async (fastify: FastifyInstance) => {
  mongoClient = new MongoClient(env.MONGODB_URI);

  await mongoClient.connect();
  const db = mongoClient.db(env.MONGODB_DB);

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
