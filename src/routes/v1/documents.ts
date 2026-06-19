import type { FastifyInstance } from "fastify";

export default async function documentRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/documents/batch",
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
      const uniqueUserIds = [...new Set(userIds)];
      const batchId = crypto.randomUUID();

      const batch = {
        batchId,
        status: "processing",
        total: uniqueUserIds.length,
        createdAt: new Date().toISOString(),
      };

      await fastify.documentQueue.add("generate", {
        batchId,
        userIds: uniqueUserIds,
      });

      return reply.code(202).send({
        batchId,
        status: batch.status,
        total: batch.total,
      });
    },
  );
}
