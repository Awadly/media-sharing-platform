require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.join(__dirname, 'src/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, 'src/seeds'),
    },
  },
};