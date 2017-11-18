
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('propagasi', (table) => {
      table.increments().unsigned()
      table.integer('tanaman_id').unsigned()
      table.foreign('tanaman_id').references('id').inTable('tanaman').onUpdate('restrict').onDelete('cascade')
      table.binary('data_propagasi')
    })
  ])
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('propagasi')
  ])
};
