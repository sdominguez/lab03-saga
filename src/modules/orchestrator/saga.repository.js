const { pool } = require("../../infrastructure/database");

async function migrate() {
  await pool.query(`CREATE TABLE IF NOT EXISTS sagas(
 id TEXT PRIMARY KEY, status TEXT NOT NULL, amount NUMERIC NOT NULL,
 fail_payment BOOLEAN NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW())`);
}
async function create({ id, amount, failPayment }) {
  return pool.query(
    "INSERT INTO sagas(id,status,amount,fail_payment) VALUES($1,$2,$3,$4)",
    [id, "STARTED", amount, failPayment],
  );
}
async function findById(id) {
  const result = await pool.query("SELECT * FROM sagas WHERE id=$1", [id]);
  return result.rows[0] || null;
}
async function transition(id, expected, next) {
  const result = await pool.query(
    "UPDATE sagas SET status=$1,updated_at=NOW() WHERE id=$2 AND status=$3 RETURNING *",
    [next, id, expected],
  );
  return result.rows[0] || null;
}
module.exports = { migrate, create, findById, transition };
