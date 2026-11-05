const { pool } = require("../../infrastructure/database");
async function migrate() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,status TEXT NOT NULL,amount NUMERIC NOT NULL)`,
  );
}
async function execute(sql, params) {
  return pool.query(sql, params);
}
module.exports = { migrate, execute };
