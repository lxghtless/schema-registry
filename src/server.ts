#!/usr/bin/env node
import pino from 'pino'
import {loggingConfig, serverConfig} from './config'

import app from './app'

const log = pino(loggingConfig)

const server = app()

const {host, port} = serverConfig

server.listen(port, host, (error: Error): void => {
    if (error) {
        log.error(error)
        process.exit(1)
    }

    log.info(`router radix tree\n${server.printRoutes()}`)
})
