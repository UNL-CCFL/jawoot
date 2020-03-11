const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DBNAME,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'knex/migrations',
    },
    seeds: {
      directory: 'knex/seeds',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: process.env.DBNAME,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'knex/migrations',
    },
    seeds: {
      directory: 'knex/seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: process.env.DBNAME,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: 'knex/migrations',
    },
    seeds: {
      directory: 'knex/seeds',
    },
  }
};
