export interface Registration {
    subject: string
    schema: string
    fingerprint: string
}

export interface RegistrationResult {
    id: number
}

export interface SubjectRecord {
    subject: string
    version: number
    id: number
    schema: string
}

export type NumericCountResult = {count: number}[]

export type CompatibilityMode = 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE'

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
}
