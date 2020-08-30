import {FastifyInstance, HookHandlerDoneFunction} from 'fastify'
const rootResponse = {name: 'lxghtless-schema-registry', version: '1.0.0'}

function root(
    fastify: FastifyInstance,
    _: {[x: string]: string},
    next: HookHandlerDoneFunction
): void {
    fastify.get('/', {}, function (_request, reply): void {
        reply.send(rootResponse)
    })

    next()
}

export default root
