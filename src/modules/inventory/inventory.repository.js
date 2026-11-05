const { pool } = require("../../infrastructure/database");
async function migrate() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS reservations(id TEXT PRIMARY KEY,status TEXT NOT NULL)`,
  );
}
async function execute(sql, params) {
  return pool.query(sql, params);
}
module.exports = { migrate, execute };
