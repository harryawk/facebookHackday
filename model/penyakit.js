var helper = require('./database.js');

Model = helper.bookshelf.Model.extend({
  tableName: 'penyakit'
});
model = helper.bookshelf.model('Penyakit', Model);

module.exports = {
  model
}
