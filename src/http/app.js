const express = require("express");
const { pool } = require("../infrastructure/database");
const { isBrokerReady } = require("../infrastructure/broker");
const { client } = require("../infrastructure/metrics");
const { service } = require("../config");

function createApp(router) {
  const app = express();
  app.use(express.json());
  app.get("/health/live", (_req, res) =>
    res.json({ status: "alive", service }),
  );
  app.get("/health/ready", async (_req, res) => {
    try {
      await pool.query("SELECT 1");
      if (!isBrokerReady()) throw new Error("RabbitMQ unavailable");
      res.json({ status: "ready" });
    } catch (error) {
      res.status(503).json({ status: "not_ready", error: error.message });
    }
  });
  app.get("/metrics", async (_req, res) => {
    res.type(client.register.contentType).send(await client.register.metrics());
  });
  if (router) app.use(router);
  return app;
}
module.exports = { createApp };
