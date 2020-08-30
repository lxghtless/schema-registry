import ms from 'ms'
import {CompatibilityMode} from './interfaces'

const {
    COMPATIBILITY_MODE,
    PINO_PRETTY_PRINT,
    PINO_LOG_LEVEL,
    SCHEMA_REGISTRY_HOST,
    SCHEMA_REGISTRY_PORT
} = process.env

export const loggingConfig = {
    prettyPrint: PINO_PRETTY_PRINT === 'true',
    level: PINO_LOG_LEVEL ?? 'info'
}

export const serverConfig = {
    name: 'lxghtless-schema-registry',
    host: SCHEMA_REGISTRY_HOST ?? '::',
    port: SCHEMA_REGISTRY_PORT ? Number(SCHEMA_REGISTRY_PORT) : 8081
}

export const rateLimitConfig = {
    max: 1000,
    timeWindow: ms('1s')
}

export const healthcheckConfig = {
    exposeUptime: true
}

export const compatibilityMode: CompatibilityMode = COMPATIBILITY_MODE
    ? (COMPATIBILITY_MODE.toUpperCase() as CompatibilityMode)
    : 'BACKWARD'
