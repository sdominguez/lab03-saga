const client = require("prom-client");
const { service } = require("../config");

client.collectDefaultMetrics({ prefix: `${service.replace(/-/g, "_")}_` });

const messages = new client.Counter({
  name: "saga_messages_total",
  help: "Processed messages",
  labelNames: ["service", "type", "result"],
});

module.exports = { client, messages };
