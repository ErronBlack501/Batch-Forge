import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { FastifyAdapter } from "@bull-board/fastify";

const bullBoardPlugin: FastifyPluginAsync = async (fastify) => {
  const serverAdapter = new FastifyAdapter();

  // Register the dashboard for the existing BullMQ queue registered on the fastify instance
  createBullBoard({
    queues: [new BullMQAdapter(fastify.documentQueue)],
    serverAdapter,
  });

  serverAdapter.setBasePath("/ui");
  fastify.register(serverAdapter.registerPlugin(), { prefix: "/ui" });
};

export default fp(bullBoardPlugin, {
  name: "bull-board",
  dependencies: ["queue"], // Ensures queue plugin loads first
});
