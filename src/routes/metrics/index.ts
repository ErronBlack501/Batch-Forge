import type { FastifyInstance } from "fastify";

export async function metricsRoutes(fastify: FastifyInstance) {
    // Add your health routes here
    fastify.get("/metrics", async (_request, _reply) => {
        return { status: "metrics" };
    });
}
