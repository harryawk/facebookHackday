let config = {};

/**
 * Load environment file.
 *
 * @return {void}
 */
function loadEnv() {
  try {
    let env;
    if (process.env.NODE_ENV == 'test') {
      config['db_client'] = 'mysql'
      config['db_environment'] = 'test'
      config['connection'] = {
        host: 'localhost',
        user: 'root',
        password: process.env.MYSQL_PASS ? process.env.MYSQL_PASS : '',
        port: 3306,
        database: 'fbhackday_db',
        charset: 'utf8'
      }
      // console.log('Config : ' + config);
    } else {
      config['db_client'] = 'postgresql';
      config['db_environment'] = 'production';

      var db_url = process.env.DATABASE_URL;
      var user_pass = db_url.split('@')[0];
      var host_db = db_url.split('@')[1];

      var db_name = host_db.split('/')[1];
      var db_host = host_db.split(':')[0];

      var only_creds = user_pass.split('://')[1];

      var db_user = only_creds.split(':')[0];
      var db_pass = only_creds.split(':')[1];

      config['connection'] = {
        host: db_host,
        port: 5432,
        user: db_user,
        password: db_pass,
        database: db_name
      }

      // console.log('Config : ' + config);
    }
  } catch (ex) {
    console.error('Error: ' + ex);
  }
}

loadEnv();

module.exports = config;
