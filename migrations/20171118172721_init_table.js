
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('tanaman', (table) => {
      table.increments().unsigned()
      table.string('nama_tanaman')
      table.binary('deskripsi_tanaman')
      table.binary('manfaat_tanaman')
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('tanaman')
  ])
};
