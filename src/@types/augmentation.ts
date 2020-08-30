import {RegistryStore} from '../interfaces'

declare module 'fastify' {
    export interface FastifyInstance {
        registryStore: RegistryStore
    }
}
