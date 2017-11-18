
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('penyakit', (table) => {
      table.increments().unsigned()
      table.integer('tanaman_id').unsigned()
      table.foreign('tanaman_id').references('id').inTable('tanaman').onUpdate('restrict').onDelete('cascade')
      table.text('nama_penyakit')
      table.binary('gejala_penyakit')
      table.text('penyebab_penyakit')
      table.binary('komentar_penyebab')
      table.binary('penanganan_penyakit')
    })
  ])
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('penyakit')
  ])
};
