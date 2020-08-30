import {Schema, Type} from 'avsc'
import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'

export default function subjects(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    fastify.get(
        '/',
        {
            schema: {
                response: {
                    200: {
                        type: 'array',
                        items: {type: 'string', minLength: 1}
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            try {
                const result = await this.registryStore.readSubjects()
                return reply.status(200).send(result)
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.get<{
        Params: {
            subject: string
            version: string
        }
    }>(
        '/:subject/versions/:version',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['subject', 'version'],
                    properties: {
                        subject: {type: 'string', minLength: 1},
                        version: {type: 'string', minLength: 1}
                    }
                },
                response: {
                    200: {
                        type: 'object',
                        required: ['subject', 'version', 'id', 'schema'],
                        properties: {
                            subject: {type: 'string', minLength: 1},
                            version: {type: 'integer'},
                            id: {type: 'integer'},
                            schema: {type: 'string', minLength: 3}
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {subject, version} = request.params

            try {
                const result = await this.registryStore.readSchemaBySubject(
                    subject,
                    version
                )
                if (result) {
                    return reply.status(200).send(result)
                }

                return reply.notFound()
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.get<{Params: {subject: string}}>(
        '/:subject/versions',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['subject'],
                    properties: {
                        subject: {type: 'string', minLength: 1}
                    }
                },
                response: {
                    200: {
                        type: 'array',
                        items: {type: 'integer'}
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {subject} = request.params

            try {
                const result = await this.registryStore.readSubjectVersions(
                    subject
                )
                if (result) {
                    return reply.status(200).send(result)
                }

                return reply.notFound()
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.post<{Body: {schema: string}; Params: {subject: string}}>(
        '/:subject/versions',
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
                        required: ['id'],
                        properties: {
                            id: {type: 'integer'}
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {schema} = request.body
            const {subject} = request.params

            let parsed: Type

            try {
                parsed = Type.forSchema(JSON.parse(schema) as Schema)
            } catch (error) {
                request.log.error(error)
                return reply.badRequest(error.message)
            }

            const fingerprint = parsed.fingerprint().toString('base64')

            try {
                const result = await this.registryStore.saveSchema({
                    subject,
                    schema,
                    fingerprint
                })

                return reply.status(200).send(result)
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.post<{Body: {schema: string}; Params: {subject: string}}>(
        '/:subject',
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
                        required: ['subject', 'version', 'id', 'schema'],
                        properties: {
                            subject: {type: 'string', minLength: 1},
                            version: {type: 'integer'},
                            id: {type: 'integer'},
                            schema: {type: 'string', minLength: 3}
                        }
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {schema} = request.body
            const {subject} = request.params

            let parsed: Type

            try {
                parsed = Type.forSchema(JSON.parse(schema) as Schema)
            } catch (error) {
                request.log.error(error)
                return reply.badRequest(error.message)
            }

            const fingerprint = parsed.fingerprint().toString('base64')

            try {
                const result = await this.registryStore.readSchemaBySubjectFingerprint(
                    subject,
                    fingerprint
                )

                if (result) {
                    return reply.status(200).send(result)
                }

                return reply.notFound()
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.delete<{Params: {subject: string}}>(
        '/:subject',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['subject'],
                    properties: {
                        subject: {type: 'string', minLength: 1}
                    }
                },
                response: {
                    200: {
                        type: 'array',
                        items: {type: 'integer'}
                    }
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {subject} = request.params

            try {
                const result = await this.registryStore.deleteSubject(subject)

                if (result) {
                    return reply.status(200).send(result)
                }

                return reply.notFound()
            } catch (error) {
                request.log.error(error)
                return reply.internalServerError(error.message)
            }
        }
    )

    fastify.delete<{
        Params: {
            subject: string
            version: number
        }
    }>(
        '/:subject/versions/:version',
        {
            schema: {
                params: {
                    type: 'object',
                    required: ['subject'],
                    properties: {
                        subject: {type: 'string', minLength: 1},
                        version: {type: 'integer'}
                    }
                },
                response: {
                    200: {type: 'integer'}
                }
            }
        },
        async function (request, reply): Promise<void> {
            const {subject, version} = request.params

            try {
                const result = await this.registryStore.deleteSubjectVersion(
                    subject,
                    version
                )

                if (result) {
                    return reply.status(200).send(result)
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
