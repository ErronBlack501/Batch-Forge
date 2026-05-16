import type { FastifyInstance } from "fastify";
import type { Db, ObjectId } from "mongodb";

import { logger } from "../../utils/logger.js";

export interface DocumentData {
  _id?: ObjectId;
  documentId: string;
  batchId: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  pdfUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function documentRoutes(fastify: FastifyInstance, db: Db) {
  const documentCollection = db.collection<DocumentData>("documents");

  // Download PDF
  fastify.get<{ Params: { documentId: string } }>(
    "/api/documents/:documentId",
    async (request, reply) => {
      const { documentId } = request.params;

      const document = await documentCollection.findOne({ documentId });

      if (!document) {
        return reply.code(404).send({ error: "Document not found" });
      }

      if (document.status !== "completed") {
        return reply.code(400).send({
          error: "Document is not ready for download",
          status: document.status,
        });
      }

      // In a real implementation, this would stream the PDF from GridFS
      logger.info({ documentId }, "Document downloaded");

      reply.type("application/pdf");
      reply.send(Buffer.from("PDF content here"));
    },
  );

  // Get document status
  fastify.get<{ Params: { documentId: string } }>(
    "/api/documents/:documentId/status",
    async (request, reply) => {
      const { documentId } = request.params;

      const document = await documentCollection.findOne({ documentId });

      if (!document) {
        return reply.code(404).send({ error: "Document not found" });
      }

      reply.send({
        documentId: document.documentId,
        batchId: document.batchId,
        userId: document.userId,
        status: document.status,
        errorMessage: document.errorMessage,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      });
    },
  );
}
