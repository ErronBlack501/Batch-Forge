import type { FastifyInstance } from "fastify";

export async function batchRoutes(fastify: FastifyInstance) {
  // Add your batch routes here
  fastify.get("/api/batch", async (_request, _reply) => {
    return { message: "Batch endpoint" };
  });
}
