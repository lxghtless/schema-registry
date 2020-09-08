import assert from 'assert'
import {Schema, Type} from 'avsc'
import Ajv from 'ajv'
import objectHash from 'object-hash'
import {Registration, SchemaType} from '../interfaces'

export const toRegistration = async (
    partial: Partial<Registration>
): Promise<Registration> => {
    const {schema, subject} = partial
    assert(schema, 'schema is required')
    assert(subject, 'subject is required')

    /*
        The goal is to dynamically detect which type of schema is being used.
        From the CP SR docs (of what I've read so far), it's not clear how they detect this.
    */
    try {
        const parsed = Type.forSchema(JSON.parse(schema) as Schema)
        const fingerprint = parsed.fingerprint().toString('base64')
        return {
            fingerprint,
            schema,
            subject,
            schemaType: SchemaType.AVRO
        }
    } catch {}

    try {
        const ajv = new Ajv()
        ajv.compile(Buffer.from(schema))

        // TODO: Look into whether this is an ideal or not so ideal way to do this for the given scenario
        const fingerprint = objectHash(JSON.parse(schema))
        return {
            fingerprint,
            schema,
            subject,
            schemaType: SchemaType.JSON
        }
    } catch {}

    throw new TypeError('Unsupported schema type')
}
