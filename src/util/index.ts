import {Type, schema} from 'avsc'
import genData from '@ovotech/avro-mock-generator'
import {CompatibilityMode} from '../interfaces'

const AVRO_PRIMITIVES = [
    'string',
    'bytes',
    'double',
    'float',
    'long',
    'int',
    'boolean'
]

// NOTE: Consider making this a separate module for use with other types of tooling
export const isCompatible = (
    latestType: Type,
    nextType: Type,
    compatibilityMode: CompatibilityMode
): boolean => {
    switch (compatibilityMode) {
        case 'BACKWARD':
            return nextType.isValid(
                genData(latestType.toJSON() as schema.AvroSchema, {
                    pickUnion: AVRO_PRIMITIVES
                }),
                {noUndeclaredFields: true}
            )
            break
        case 'FORWARD':
            return latestType.isValid(
                genData(nextType.toJSON() as schema.AvroSchema, {
                    pickUnion: AVRO_PRIMITIVES
                }),
                {noUndeclaredFields: true}
            )
            break
        case 'NONE':
            return true
            break
        default:
            throw new Error(
                `Unsupported compatibilityMode: ${compatibilityMode}`
            )
            break
    }
}
