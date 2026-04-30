// ✍️ TODO 1: Import dotenv and run config()
require('dotenv').config()
const { Pool } = require('pg');

// ✍️ TODO 2: Replace hard-coded values with process.env

// 2. Replace hard-coded values with `process.env`
const devConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
};

// 3. Create this separate config for production environments where we'll have a connection string
const prodConfig = {
  connectionString: process.env.PG_CONNECTION_STRING,
}

// 4. Use PG_CONNECTION_STRING if available, otherwise use individual credentials.
const pool = new Pool(process.env.PG_CONNECTION_STRING ? prodConfig : devConfig);

module.exports = pool;
