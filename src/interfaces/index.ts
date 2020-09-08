export interface CompatibilityModeService {
    assertDefaultCompatibilityMode(): void
    assertCompatibilityMode(mode: string): void
    defaultCompatibilityMode(): string
    defaultCompatibilityModeAsNumber(): number
}

export interface Registration {
    subject: string
    schema: string
    schemaType: SchemaType
    fingerprint: string
}

export interface RegistrationResult {
    id: number
}

export enum SchemaType {
    AVRO = 1,
    JSON
}

export interface SubjectRecord {
    subject: string
    version: number
    id: number
    schema: string
    schemaType: SchemaType
}

export type NumericCountResult = {count: number}[]

export interface RegistryStore {
    saveSchema(registration: Registration): Promise<RegistrationResult>
    readSchemaBySubject(
        subject: string,
        version?: string
    ): Promise<SubjectRecord | undefined>
    readSubjectVersions(subject: string): Promise<number[] | undefined>
    readSubjects(): Promise<string[]>
    deleteSubject(subject: string): Promise<number[] | undefined>
    deleteSubjectVersion(
        subject: string,
        version: number
    ): Promise<number | undefined>
    readSchemaById(id: number): Promise<string | undefined>
    readSchemaBySubjectFingerprint(
        subject: string,
        fingerprint: string
    ): Promise<SubjectRecord | undefined>
    readRegisteredSchemaTypes(): Promise<string[]>
}
