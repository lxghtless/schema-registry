/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/filename-case */
const SCHEMA_RECORDS_TABLE_NAME = 'schema_records'

exports.up = function (knex) {
    return knex.schema.createTable(SCHEMA_RECORDS_TABLE_NAME, table => {
        table.increments('id')
        table.string('fingerprint').notNullable()
        table.string('schema').notNullable()
        table.integer('schema_type').notNullable()
        table.bigInteger('created_at').notNullable()
        table.index(['id', 'fingerprint'])
        table.unique('fingerprint')
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable(SCHEMA_RECORDS_TABLE_NAME)
}
