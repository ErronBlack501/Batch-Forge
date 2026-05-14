import { Job } from "bullmq";
import { Db } from "mongodb";
import { logger } from "../utils/logger.js";
import { PdfGenerator } from "../utils/pdfGenerator.js";
import {
  batchProcessingDuration,
  documentsGenerated,
  documentGenerationErrors,
} from "../plugins/metrics.js";

export interface DocumentJobData {
  userId: string;
  batchId: string;
  documentId: string;
}

const pdfGenerator = new PdfGenerator();

export async function processDocumentJob(
  job: Job<DocumentJobData>,
  db: Db,
): Promise<void> {
  const { userId, batchId, documentId } = job.data;
  const startTime = Date.now();

  try {
    logger.info({ documentId, batchId, userId }, "Processing document job");

    // Generate PDF
    await pdfGenerator.generate({
      userId,
      batchId,
      documentId,
      timeout: 30000,
    });
    // In a real implementation, the PDF would be stored to GridFS here

    // In real implementation, store in GridFS
    // For now, just update the document record
    const documentCollection = db.collection("documents");

    await documentCollection.updateOne(
      { documentId },
      {
        $set: {
          status: "completed",
          pdfUrl: `gridfs://${documentId}.pdf`,
          updatedAt: new Date(),
        },
      },
    );

    // Update batch progress
    const batchCollection = db.collection("batches");
    await batchCollection.updateOne(
      { batchId },
      {
        $inc: { processedDocuments: 1 },
        $set: { updatedAt: new Date() },
      },
    );

    // Record metrics
    const duration = (Date.now() - startTime) / 1000;
    batchProcessingDuration.observe(duration);
    documentsGenerated.inc();

    logger.info({ documentId, batchId, duration }, "Document job completed");
  } catch (error) {
    logger.error({ documentId, batchId, userId, error }, "Document job failed");

    const documentCollection = db.collection("documents");
    await documentCollection.updateOne(
      { documentId },
      {
        $set: {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          updatedAt: new Date(),
        },
      },
    );

    // Update batch progress
    const batchCollection = db.collection("batches");
    await batchCollection.updateOne(
      { batchId },
      {
        $inc: { processedDocuments: 1, failedDocuments: 1 },
        $set: { updatedAt: new Date() },
      },
    );

    documentGenerationErrors.inc();

    throw error;
  }
}
