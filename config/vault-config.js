/**
 * This module will contain all of the configuration information for the database.
 * @module config-database
 */
module.exports = {
  // Refer to https://github.com/brianc/node-postgres
  // The connection to be used by logged in users.
  connection: {
    user: 'postgres', // env var: PGUSER
    database: 'full_vault', // env var: PGDATABASE
    password: 'abc123', // env var: PGPASSWORD
    host: 'localhost', // Server hosting the postgres database
    port: 27864, // env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  },
};
