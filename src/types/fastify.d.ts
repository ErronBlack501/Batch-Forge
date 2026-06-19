import type { Env } from '../utils/env.js'

declare module 'fastify' {
  interface FastifyInstance {
    config: Env
  }
}
