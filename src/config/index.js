module.exports = Object.freeze({
  service: process.env.SERVICE || "orchestrator",
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  rabbitUrl: process.env.RABBITMQ_URL,
  exchange: "saga",
});
