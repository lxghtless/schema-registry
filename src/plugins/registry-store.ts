import knex from 'knex'
import {KnexRegistryStore} from '../stores/knex-store'
import fp from 'fastify-plugin'
import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'

const sqliteFilename = process.env.SQLITE3_FILENAME ?? 'registry.sqlite'

export type RegistryStoreOptions = {
    storeType: 'knex' | 'mongo'
}

function plugin(
    fastify: FastifyInstance,
    options: RegistryStoreOptions,
    next: HookHandlerDoneFunction
): void {
    if (options.storeType === 'knex') {
        // TODO: move this into a factory to support more client types
        const database = knex({
            client: 'sqlite3',
            useNullAsDefault: true,
            connection: {
                filename: `./${sqliteFilename}`
            }
        })

        const store = new KnexRegistryStore(database)
        fastify.decorate('registryStore', store)
    } else {
        throw new Error(`storeType ${options.storeType} not implemented`)
    }

    next()
}

export default fp(plugin)
