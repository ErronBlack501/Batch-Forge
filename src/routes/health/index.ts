import type { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
  // Add your health routes here
  fastify.get("/health", async (_request, _reply) => {
    return { status: "healthy" };
  });
}
