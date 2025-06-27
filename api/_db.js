const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    // Parse the DATABASE_URL for individual components
    const connectionString = process.env.DATABASE_URL;
    
    pool = new Pool({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false },
      // Serverless-friendly settings
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 0, // Disable timeout
      connectionTimeoutMillis: 10000, // 10 second timeout
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }
  return pool;
}

module.exports = { getPool };
