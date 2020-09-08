import knex from 'knex'
import {comparator, head, isNil, map, prop, sort} from 'ramda'
import {
    NumericCountResult,
    Registration,
    RegistrationResult,
    RegistryStore,
    SchemaType,
    SubjectRecord
} from '../interfaces'

const SCHEMA_RECORDS_TABLE_NAME = 'schema_records'
const SUBJECT_RECORDS_TABLE_NAME = 'subject_records'
const SUBJECT_SCHEMA_RECORDS_TABLE_NAME = 'subject_schema_records'

const readBySubjectFields = [
    'subject_record.name as subject',
    'subject_schema_record.version as version',
    'subject_schema_record.schema_id as id',
    'schema_record.schema as schema',
    'schema_record.schema_type as schemaType'
]

const countResult = (count_result: NumericCountResult): number => {
    if (isNil(count_result)) {
        return 0
    }

    if (count_result.length === 0) {
        return 0
    }

    return count_result[0].count
}

const byVersion = comparator(
    (a: SubjectRecord, b: SubjectRecord) => a.version > b.version
)

export class KnexRegistryStore implements RegistryStore {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: knex<any, unknown[]>

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(database: knex<any, unknown[]>) {
        this.db = database
    }

    async saveSchema(registration: Registration): Promise<RegistrationResult> {
        const {fingerprint, schema, schemaType, subject} = registration

        let schemaRecord = await this.db(SCHEMA_RECORDS_TABLE_NAME)
            .first('id')
            .where('fingerprint', fingerprint)

        if (isNil(schemaRecord)) {
            schemaRecord = await this.db(SCHEMA_RECORDS_TABLE_NAME)
                .insert({
                    fingerprint,
                    schema,
                    schema_type: schemaType,
                    created_at: Date.now()
                })
                .then(() =>
                    this.db(SCHEMA_RECORDS_TABLE_NAME)
                        .first('id')
                        .where('fingerprint', fingerprint)
                )
        }

        let subjectRecord = await this.db(SUBJECT_RECORDS_TABLE_NAME)
            .first('id')
            .where('name', subject)

        if (isNil(subjectRecord)) {
            subjectRecord = await this.db(SUBJECT_RECORDS_TABLE_NAME)
                .insert({
                    name: subject,
                    created_at: Date.now()
                })
                .then(() =>
                    this.db(SUBJECT_RECORDS_TABLE_NAME)
                        .first('id')
                        .where('name', subject)
                )
        }

        // check if this exact schema + subject has already been saved
        const subjectSchema = await this.db(SUBJECT_SCHEMA_RECORDS_TABLE_NAME)
            .first('version')
            .where('subject_id', subjectRecord.id)
            .where('schema_id', schemaRecord.id)

        if (isNil(subjectSchema)) {
            const subject_schema_count = await this.db(
                SUBJECT_SCHEMA_RECORDS_TABLE_NAME
            )
                .count('version as count')
                .where('subject_id', subjectRecord.id)

            const versionCount = countResult(
                subject_schema_count as NumericCountResult
            )

            await this.db(SUBJECT_SCHEMA_RECORDS_TABLE_NAME).insert({
                subject_id: subjectRecord.id,
                schema_id: schemaRecord.id,
                version: versionCount + 1,
                created_at: Date.now()
            })
        }

        return {
            id: prop('id', schemaRecord)
        }
    }

    async readSchemaBySubject(
        subject: string,
        version?: string
    ): Promise<SubjectRecord | undefined> {
        if (isNil(version) || version === 'latest') {
            const subjectSchemas = await this.db(
                `${SUBJECT_RECORDS_TABLE_NAME} as subject_record`
            )
                .select<SubjectRecord[]>(...readBySubjectFields)
                .innerJoin(
                    `${SUBJECT_SCHEMA_RECORDS_TABLE_NAME} as subject_schema_record`,
                    function () {
                        this.on(
                            'subject_schema_record.subject_id',
                            '=',
                            'subject_record.id'
                        )
                    }
                )
                .innerJoin(
                    `${SCHEMA_RECORDS_TABLE_NAME} as schema_record`,
                    function () {
                        this.on(
                            'schema_record.id',
                            '=',
                            'subject_schema_record.schema_id'
                        )
                    }
                )
                .where('subject_record.name', subject)

            return head(sort(byVersion, subjectSchemas))
        }

        return this.db(`${SUBJECT_RECORDS_TABLE_NAME} as subject_record`)
            .first<SubjectRecord>(...readBySubjectFields)
            .innerJoin(
                `${SUBJECT_SCHEMA_RECORDS_TABLE_NAME} as subject_schema_record`,
                function () {
                    this.on(
                        'subject_schema_record.subject_id',
                        '=',
                        'subject_record.id'
                    )
                }
            )
            .innerJoin(
                `${SCHEMA_RECORDS_TABLE_NAME} as schema_record`,
                function () {
                    this.on(
                        'schema_record.id',
                        '=',
                        'subject_schema_record.schema_id'
                    )
                }
            )
            .where('subject_record.name', subject)
            .andWhere('subject_schema_record.version', Number.parseInt(version))
    }

    async readSubjectVersions(subject: string): Promise<number[] | undefined> {
        const subjectSchemas = await this.db(
            `${SUBJECT_RECORDS_TABLE_NAME} as subject_record`
        )
            .select<SubjectRecord[]>('subject_schema_record.version as version')
            .innerJoin(
                `${SUBJECT_SCHEMA_RECORDS_TABLE_NAME} as subject_schema_record`,
                function () {
                    this.on(
                        'subject_schema_record.subject_id',
                        '=',
                        'subject_record.id'
                    )
                }
            )
            .where('subject_record.name', subject)

        if (subjectSchemas.length === 0) {
            return
        }

        return map(prop('version'), subjectSchemas)
    }

    async readSubjects(): Promise<string[]> {
        const subjectNames = await this.db(SUBJECT_RECORDS_TABLE_NAME).select<
            {name: string}[]
        >('name')

        return map(prop('name'), subjectNames)
    }

    async deleteSubject(subject: string): Promise<number[] | undefined> {
        const subjectVersions = await this.readSubjectVersions(subject)

        if (!subjectVersions) {
            return
        }

        const subjectRecord = await this.db(SUBJECT_RECORDS_TABLE_NAME)
            .first('id')
            .where('name', subject)

        await this.db(SUBJECT_RECORDS_TABLE_NAME)
            .delete()
            .where('name', subject)
        await this.db(SUBJECT_SCHEMA_RECORDS_TABLE_NAME)
            .delete()
            .where('subject_id', subjectRecord.id)

        return subjectVersions
    }

    async deleteSubjectVersion(
        subject: string,
        version: number
    ): Promise<number | undefined> {
        const subjectVersions = await this.readSubjectVersions(subject)

        if (!subjectVersions) {
            return
        }

        if (!subjectVersions.includes(version)) {
            return
        }

        const subjectRecord = await this.db(SUBJECT_RECORDS_TABLE_NAME)
            .first('id')
            .where('name', subject)

        await this.db(SUBJECT_SCHEMA_RECORDS_TABLE_NAME)
            .delete()
            .where('subject_id', subjectRecord.id)
            .andWhere('version', version)

        return version
    }

    async readSchemaById(id: number): Promise<string | undefined> {
        const schemaRecord = await this.db(SCHEMA_RECORDS_TABLE_NAME)
            .first<{schema: string}>('schema')
            .where('id', id)

        return schemaRecord?.schema
    }

    async readSchemaBySubjectFingerprint(
        subject: string,
        fingerprint: string
    ): Promise<SubjectRecord | undefined> {
        return this.db(`${SUBJECT_RECORDS_TABLE_NAME} as subject_record`)
            .first<SubjectRecord>(...readBySubjectFields)
            .innerJoin(
                `${SUBJECT_SCHEMA_RECORDS_TABLE_NAME} as subject_schema_record`,
                function () {
                    this.on(
                        'subject_schema_record.subject_id',
                        '=',
                        'subject_record.id'
                    )
                }
            )
            .innerJoin(
                `${SCHEMA_RECORDS_TABLE_NAME} as schema_record`,
                function () {
                    this.on(
                        'schema_record.id',
                        '=',
                        'subject_schema_record.schema_id'
                    )
                }
            )
            .where('subject_record.name', subject)
            .andWhere('schema_record.fingerprint', fingerprint)
    }

    async readRegisteredSchemaTypes(): Promise<string[]> {
        const schemaTypes = await this.db(SCHEMA_RECORDS_TABLE_NAME).distinct<
            {
                schema_type: number
            }[]
        >('schema_type')

        const schemaTypeNumbers = new Set(
            schemaTypes.map(({schema_type}) => schema_type)
        )

        // NOTE: Consider using a generator yield instead of array collection
        const result: string[] = []

        if (schemaTypeNumbers.has(SchemaType.AVRO)) {
            result.push('AVRO')
        }

        if (schemaTypeNumbers.has(SchemaType.JSON)) {
            result.push('JSON')
        }

        return result
    }
}
