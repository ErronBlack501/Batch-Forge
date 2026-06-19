import type { FastifyInstance } from "fastify";

export async function documentRoutes(fastify: FastifyInstance) {
  // POST batch generation
  fastify.post(
    "/api/documents/batch",
    {
      schema: {
        body: {
          type: "object",
          required: ["userIds"],
          properties: {
            userIds: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 1000,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { userIds } = request.body as { userIds: string[] };

      // 1. deduplicate (important)
      const uniqueUserIds = [...new Set(userIds)];

      // 2. create batchId
      const batchId = crypto.randomUUID();

      // 3. simulate saving batch (MongoDB later)
      const batch = {
        batchId,
        status: "processing",
        total: uniqueUserIds.length,
        createdAt: new Date().toISOString(),
      };

      // 4. simulate queue (BullMQ later)
      // fastify.queue.add(...) → plus tard

      return reply.code(202).send({
        batchId,
        status: batch.status,
        total: batch.total,
      });
    },
  );
}
