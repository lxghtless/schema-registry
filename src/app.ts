import fastify, {FastifyInstance} from 'fastify'
import pino from 'pino'
import {healthcheckConfig, loggingConfig, rateLimitConfig} from './config'

import {PluginOptions} from 'fastify-plugin'
import autoload from 'fastify-autoload'
import fastifySensible from 'fastify-sensible'
import fp from 'fastify-plugin'
import healthcheck from 'fastify-healthcheck'
import {join} from 'path'
import ratelimit from 'fastify-rate-limit'

const log = pino(loggingConfig)

export default (): FastifyInstance => {
    const app = fp(
        async (fastify: FastifyInstance): Promise<void> => {
            fastify.register(fastifySensible)
            fastify.register(ratelimit, rateLimitConfig)
            fastify.register(healthcheck, healthcheckConfig)

            fastify.register(autoload, {
                dir: join(__dirname, 'plugins'),
                options: {
                    storeType: 'knex'
                }
            })

            fastify.register(autoload, {
                dir: join(__dirname, 'services'),
                options: {}
            })
        },
        {
            name: 'app',
            fastify: '3.x'
        } as PluginOptions
    )

    const server: FastifyInstance = fastify({
        // NOTE: since all routes are lowercase, this seems fine.
        caseSensitive: true,
        maxParamLength: 200,
        trustProxy: true,
        logger: log,
        pluginTimeout: 10000
    })

    server.register(app)

    return server
}
