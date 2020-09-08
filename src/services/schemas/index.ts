import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'

export default function schemas(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    fastify.get<{Params: {id: number}}>(
        '/ids/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: {type: 'integer'}
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        required: ['schema'],
                        properties: {
                            schema: {type: 'string', minLength: 3}
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {id} = request.params

            try {
                const schema = await this.registryStore.readSchemaById(id)
                if (schema) {
                    return reply.status(200).send({
                        schema
                    })
                }

                return reply.notFound()
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.get(
        '/types',
        {
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            try {
                const schemaTypes = await this.registryStore.readRegisteredSchemaTypes()

                return reply.status(200).send(schemaTypes)
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )
    next()
}
