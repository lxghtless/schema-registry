import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import {compatibilityModeService, isCompatible} from '../../compatibility'

export default function compatibility(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    // NOTE: this will throw an error if the COMPATIBILITY_MODE env var is set to an unexpected mode
    compatibilityModeService.assertDefaultCompatibilityMode()

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

                const is_compatible = isCompatible(
                    result.schema,
                    schema,
                    result.schemaType,
                    // TODO: get configured compatibility mode if it exists
                    compatibilityModeService.defaultCompatibilityModeAsNumber()
                )

                console.log(is_compatible)

                return reply.status(200).send({is_compatible})
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    next()
}
