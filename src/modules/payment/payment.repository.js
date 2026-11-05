const { pool } = require("../../infrastructure/database");
async function migrate() {
  await pool.query(`CREATE TABLE IF NOT EXISTS payments(
  id TEXT PRIMARY KEY, status TEXT NOT NULL, amount NUMERIC NOT NULL)`);
}
async function save(id, status, amount) {
  await pool.query(
    "INSERT INTO payments(id,status,amount) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING",
    [id, status, amount],
  );
}
module.exports = { migrate, save };
