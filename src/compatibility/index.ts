import {buildMaskFactory} from 'mode-mask'
import {Schema, Type, schema} from 'avsc'
import Ajv from 'ajv'
import genData from '@ovotech/avro-mock-generator'
import jsf from '../../json-schema-faker'
import {defaultCompatibilityMode} from '../config'
import {CompatibilityModeService, SchemaType} from '../interfaces'
import assert from 'assert'

export const CompatibilityMode = {
    BACKWARD: 1,
    FORWARD: 2,
    FULL: 4,
    NONE: 8
}

export const compatibilityMask = buildMaskFactory({
    values: Object.keys(CompatibilityMode)
})()

export const compatibilityModeService: CompatibilityModeService = {
    assertCompatibilityMode(mode: string): void {
        assert(
            compatibilityMask.fromValues([mode]),
            `invalid compatibility mode: ${mode}.`
        )
    },
    assertDefaultCompatibilityMode(): void {
        assert(
            compatibilityMask.fromValues([defaultCompatibilityMode]),
            `invalid compatibility mode: ${defaultCompatibilityMode}`
        )
    },
    defaultCompatibilityMode(): string {
        const maskDatum = compatibilityMask.fromValues([
            defaultCompatibilityMode
        ])

        if (!maskDatum) {
            throw new Error(
                `Unexpected default compatibility mode: ${defaultCompatibilityMode}`
            )
        }

        return maskDatum.values[0]
    },
    defaultCompatibilityModeAsNumber(): number {
        const maskDatum = compatibilityMask.fromValues([
            defaultCompatibilityMode
        ])

        if (!maskDatum) {
            throw new Error(
                `Unexpected default compatibility mode: ${defaultCompatibilityMode}`
            )
        }

        return maskDatum.nums[0]
    }
}

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
    latestSchema: string,
    nextSchema: string,
    schemaType: SchemaType,
    compatibilityMode: number
): boolean => {
    switch (schemaType) {
        case SchemaType.AVRO:
            return isCompatibleAvro(
                Type.forSchema(JSON.parse(latestSchema) as Schema),
                Type.forSchema(JSON.parse(nextSchema) as Schema),
                compatibilityMode
            )
        case SchemaType.JSON:
            return isCompatibleJson(latestSchema, nextSchema, compatibilityMode)
        default:
            throw new Error(`Unsupported schemaType: ${schemaType}`)
    }
}

export const isCompatibleAvro = (
    latestType: Type,
    nextType: Type,
    compatibilityMode: number
): boolean => {
    switch (compatibilityMode) {
        case CompatibilityMode.BACKWARD:
            return nextType.isValid(
                genData(latestType.toJSON() as schema.AvroSchema, {
                    pickUnion: AVRO_PRIMITIVES
                }),
                {noUndeclaredFields: true}
            )
        case CompatibilityMode.FORWARD:
            return latestType.isValid(
                genData(nextType.toJSON() as schema.AvroSchema, {
                    pickUnion: AVRO_PRIMITIVES
                }),
                {noUndeclaredFields: true}
            )
        case CompatibilityMode.NONE:
            return true
        default:
            throw new Error(
                `Unsupported compatibilityMode: ${compatibilityMode}`
            )
    }
}

export const isCompatibleJson = (
    latestSchema: string,
    nextSchema: string,
    compatibilityMode: number
): boolean => {
    const ajv = new Ajv({$data: true})
    switch (compatibilityMode) {
        case CompatibilityMode.BACKWARD:
            return ajv.validate(
                JSON.parse(nextSchema),
                jsf.generate(JSON.parse(latestSchema))
            ) as boolean
        case CompatibilityMode.FORWARD:
            return ajv.validate(
                JSON.parse(latestSchema),
                jsf.generate(JSON.parse(nextSchema))
            ) as boolean
        case CompatibilityMode.NONE:
            return true
        default:
            throw new Error(
                `Unsupported compatibilityMode: ${compatibilityMode}`
            )
    }
}
