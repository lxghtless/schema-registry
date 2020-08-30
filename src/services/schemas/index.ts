import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'

export default function schemas(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    fastify.get<{Params: {id: number}}>(
        '/:id',
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

    next()
}
