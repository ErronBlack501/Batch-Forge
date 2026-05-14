import { FastifyInstance } from "fastify";
import { Db, ObjectId } from "mongodb";
import { Queue } from "bullmq";
import { logger } from "../../utils/logger.js";

export interface BatchRequest {
  userIds: string[];
}

export interface BatchDocument {
  _id?: ObjectId;
  batchId: string;
  status: "pending" | "processing" | "completed" | "failed";
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function batchRoutes(
  fastify: FastifyInstance,
  db: Db,
  queue: Queue,
) {
  const batchCollection = db.collection<BatchDocument>("batches");

  // Create batch
  fastify.post<{ Body: BatchRequest }>(
    "/api/documents/batch",
    async (request, reply) => {
      const { userIds } = request.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return reply
          .code(400)
          .send({ error: "userIds must be a non-empty array" });
      }

      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const batch: BatchDocument = {
        batchId,
        status: "processing",
        totalDocuments: userIds.length,
        processedDocuments: 0,
        failedDocuments: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await batchCollection.insertOne(batch);

      // Add jobs to queue
      for (const userId of userIds) {
        await queue.add(
          "generate-pdf",
          {
            userId,
            batchId,
            documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
          {
            jobId: `${batchId}_${userId}`,
          },
        );
      }

      logger.info({ batchId, userIds: userIds.length }, "Batch created");

      reply.code(202).send({
        batchId,
        status: "processing",
        totalDocuments: userIds.length,
      });
    },
  );

  // Get batch status
  fastify.get<{ Params: { batchId: string } }>(
    "/api/documents/batch/:batchId",
    async (request, reply) => {
      const { batchId } = request.params;

      const batch = await batchCollection.findOne({ batchId });

      if (!batch) {
        return reply.code(404).send({ error: "Batch not found" });
      }

      reply.send({
        batchId: batch.batchId,
        status: batch.status,
        progress: {
          total: batch.totalDocuments,
          done: batch.processedDocuments,
          failed: batch.failedDocuments,
        },
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      });
    },
  );
}
