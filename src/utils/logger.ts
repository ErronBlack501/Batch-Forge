import pino from "pino";
import { getEnv } from "./env.js";

const env = getEnv();

export const logger = pino({
  level: env.LOG_LEVEL || "info",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: false,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  serializers: {
    req: (request) => ({
      id: request.id,
      method: request.method,
      url: request.url,
      remoteAddress: request.ip,
      userAgent: request.headers["user-agent"],
    }),
    res: (response) => ({
      statusCode: response.statusCode,
    }),
  },
});

export default logger;
