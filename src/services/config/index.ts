import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
import {compatibilityModeService} from '../../compatibility'

export default function config(
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
                        type: 'object',
                        required: ['compatibility'],
                        properties: {
                            compatibility: {type: 'string'}
                        }
                    }
                }
            }
        },
        async function (_, reply): Promise<void> {
            return reply.status(200).send({
                // TODO: get configured compatibility mode if it exists
                compatibility: compatibilityModeService.defaultCompatibilityMode()
            })
        }
    )

    next()
}
