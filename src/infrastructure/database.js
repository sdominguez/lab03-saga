const { Pool } = require("pg");
const config = require("../config");
const logger = require("./logger");

const pool = new Pool({ connectionString: config.databaseUrl });

async function waitForDatabase() {
  for (let attempt = 1; attempt <= 50; attempt++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      logger.warn({ attempt, error: error.message }, "Waiting for database");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("Database unavailable");
}

module.exports = { pool, waitForDatabase };
