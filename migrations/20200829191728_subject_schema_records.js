const SUBJECT_SCHEMA_RECORDS_TABLE_NAME = 'subject_schema_records'

exports.up = function (knex) {
    return knex.schema.createTable(SUBJECT_SCHEMA_RECORDS_TABLE_NAME, table => {
        table.integer('schema_id').notNullable()
        table.integer('subject_id').notNullable()
        table.integer('version').notNullable()
        table.bigInteger('created_at').notNullable()
        table.index(['schema_id', 'subject_id'])
        table.unique(['schema_id', 'subject_id'])
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable(SUBJECT_SCHEMA_RECORDS_TABLE_NAME)
}
