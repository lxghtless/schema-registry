import {Type} from 'avsc'
import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import {isCompatible} from '../../util'
import {compatibilityMode} from '../../config'

export default function compatibility(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    fastify.post<{Body: {schema: string}; Params: {subject: string}}>(
        '/subjects/:subject/versions/latest',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['subject'],
                    properties: {
                        subject: {type: 'string', minLength: 1}
                    }
                },
                body: {
                    type: 'object',
                    required: ['schema'],
                    properties: {
                        schema: {type: 'string', minLength: 3}
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        required: ['is_compatible'],
                        properties: {
                            is_compatible: {type: 'boolean'}
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {subject} = request.params
            const {schema} = request.body

            try {
                const result = await this.registryStore.readSchemaBySubject(
                    subject,
                    'latest'
                )

                if (!result) {
                    return reply.notFound()
                }

                const latestType = Type.forSchema(JSON.parse(result.schema))
                const nextType = Type.forSchema(JSON.parse(schema))

                const is_compatible = isCompatible(
                    latestType,
                    nextType,
                    compatibilityMode
                )

                return reply.status(200).send({is_compatible})
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    next()
}
