// Update with your config settings.

const sqliteFilename = process.env.SQLITE3_FILENAME || 'registry.sqlite'

module.exports = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: `./${sqliteFilename}`
    }
}
