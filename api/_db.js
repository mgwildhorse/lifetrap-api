const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

module.exports = { getPool };
