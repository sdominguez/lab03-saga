const amqp = require("amqplib");
const config = require("../config");
const logger = require("./logger");
const { messages } = require("./metrics");

let ready = false;
let connection;

async function connectBroker() {
  for (let attempt = 1; attempt <= 50; attempt++) {
    try {
      connection = await amqp.connect(config.rabbitUrl);
      connection.on("error", (error) =>
        logger.error({ error: error.message }, "RabbitMQ error"),
      );
      connection.on("close", () => {
        ready = false;
        logger.error("RabbitMQ disconnected");
        process.exit(1);
      });
      const channel = await connection.createConfirmChannel();
      await channel.assertExchange(config.exchange, "topic", { durable: true });
      ready = true;
      return channel;
    } catch (error) {
      logger.warn({ attempt, error: error.message }, "Waiting for RabbitMQ");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error("RabbitMQ unavailable");
}
function isBrokerReady() {
  return ready;
}
async function publish(channel, type, payload) {
  const event = { type, ...payload, at: new Date().toISOString() };
  channel.publish(config.exchange, type, Buffer.from(JSON.stringify(event)), {
    persistent: true,
    contentType: "application/json",
    messageId: `${payload.sagaId}:${type}`,
  });
  await channel.waitForConfirms();
  logger.info({ type, sagaId: payload.sagaId }, "Message published");
}

async function consume(channel, queue, patterns, handler) {
  await channel.assertQueue(queue, { durable: true });
  for (const pattern of patterns)
    await channel.bindQueue(queue, config.exchange, pattern);

  await channel.prefetch(1);

  await channel.consume(
    queue,
    async (message) => {
      if (!message) return;
      let event;
      try {
        event = JSON.parse(message.content.toString());
        await handler(event);
        messages.inc({
          service: config.service,
          type: event.type,
          result: "ok",
        });
        channel.ack(message);
      } catch (error) {
        logger.error(
          { error: error.message, type: event?.type },
          "Message failed",
        );
        messages.inc({
          service: config.service,
          type: event?.type || "invalid",
          result: "error",
        });
        channel.nack(message, false, false);
      }
    },
    { noAck: false },
  );
}

module.exports = { connectBroker, isBrokerReady, publish, consume };
