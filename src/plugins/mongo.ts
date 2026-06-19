import fastifyMongo from '@fastify/mongodb'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Env } from '../utils/env.js'

const mongoPlugin: FastifyPluginAsync<Env> = async (fastify, options) => {
  await fastify.register(fastifyMongo, {
    forceClose: true,
    database: options.MONGODB_DB,
    url: options.MONGODB_URI,
  })
}

export default fp(mongoPlugin, {
  name: 'mongo',
})
