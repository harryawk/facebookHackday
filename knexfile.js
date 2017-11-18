// Update with your config settings.
let config = require('./config');

let knexConfig = {};
connection = config.connection
knexConfig[config.db_environment] = {
  client: config.db_client,
  connection: connection,
  migrations: {
    tableName: 'knex_migrations'
  },
}

console.log(knexConfig);

module.exports = knexConfig;
