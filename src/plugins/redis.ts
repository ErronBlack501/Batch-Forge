import fastifyRedis from '@fastify/redis'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Env } from '../utils/env.js'

const redisPlugin: FastifyPluginAsync<Env> = async (fastify, options) => {
  await fastify.register(fastifyRedis, {
    url: options.REDIS_URL,
  })
}

export default fp(redisPlugin, {
  name: 'redis',
})
