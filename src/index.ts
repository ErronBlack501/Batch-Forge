import { createApp } from "./app.js";
import { getEnv } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import DocumentWorker from "./workers/pdf.worker.js";

async function start() {
  try {
    const env = getEnv();
    logger.info(`Starting BatchForge API in ${env.NODE_ENV} mode`);

    // Create and start the Fastify app
    const fastify = await createApp();

    // Start the worker
    const worker = new DocumentWorker();
    await worker.start();

    // Start server
    await fastify.listen({ port: env.PORT, host: "0.0.0.0" });

    logger.info(`🚀 Server running at http://0.0.0.0:${env.PORT}`);
    logger.info(`📘 Documentation at http://0.0.0.0:${env.PORT}/documentation`);
    logger.info(`📊 Metrics at http://0.0.0.0:${env.PORT}/metrics`);

    // Graceful shutdown
    const signals = ["SIGINT", "SIGTERM"];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.info(`${signal} received, gracefully shutting down...`);
        await fastify.close();
        await worker.stop();
        process.exit(0);
      });
    }
  } catch (err) {
    logger.error({ error: err }, "Failed to start server");
    process.exit(1);
  }
}

start();
