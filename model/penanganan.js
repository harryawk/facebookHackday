var helper = require('./database.js');

Model = helper.bookshelf.Model.extend({
  tableName: 'penanganan'
});
model = helper.bookshelf.model('Penanganan', Model);

module.exports = {
  model
}
