import type { FastifyInstance } from "fastify";

export async function documentRoutes(fastify: FastifyInstance) {
  // Add your document routes here
  fastify.get("/api/documents", async (_request, _reply) => {
    return { message: "Documents endpoint" };
  });
}
