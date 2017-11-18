var helper = require('./database.js');

Model = helper.bookshelf.Model.extend({
  tableName: 'tanaman'
});
model = helper.bookshelf.model('Tanaman', Model);

module.exports = {
  model
}
