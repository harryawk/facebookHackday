'use strict'

let config = require('../config');
require('knex')
var knex = connectDb();
var bookshelf = require('bookshelf')(knex);
var promise = require('bluebird');
bookshelf.plugin('registry');
bookshelf.plugin('pagination');

//======================================================================================
function connectDb() {
  let connection = config.connection;
  let knex = require('knex')({
    client: config.db_client,
    connection: connection,
  });
  console.log("----- DB Ready -----");
  return knex;
}
//======================================================================================
var emptyTable = function (tableName) {
  return knex(tableName).del().then(function (c) { console.log('delete ' + tableName) })
}

module.exports = {
  bookshelf,
  promise,
  emptyTable
}