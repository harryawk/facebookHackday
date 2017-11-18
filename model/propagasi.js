var helper = require('./database.js');

Model = helper.bookshelf.Model.extend({
  tableName: 'propagasi'
});
model = helper.bookshelf.model('Propagasi', Model);

module.exports = {
  model
}
