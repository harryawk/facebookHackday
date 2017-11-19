var helper = require('./database.js');
require('./tanaman.js')

Model = helper.bookshelf.Model.extend({
  tableName: 'penyakit',
  tanaman: function() {
    return this.belongsTo('Tanaman', 'tanaman_id')
  }
});
model = helper.bookshelf.model('Penyakit', Model);

module.exports = {
  model
}
