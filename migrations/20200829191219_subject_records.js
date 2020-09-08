/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable unicorn/filename-case */
const SUBJECT_RECORDS_TABLE_NAME = 'subject_records'

exports.up = function (knex) {
    return knex.schema.createTable(SUBJECT_RECORDS_TABLE_NAME, table => {
        table.increments('id')
        table.string('name').notNullable()
        table.bigInteger('created_at').notNullable()
        table.index(['id', 'name'])
        table.unique('name')
    })
}

exports.down = function (knex) {
    return knex.schema.dropTable(SUBJECT_RECORDS_TABLE_NAME)
}
