const config = require("./config");
const logger = require("./infrastructure/logger");
const { waitForDatabase } = require("./infrastructure/database");
const { connectBroker, consume } = require("./infrastructure/broker");
const { createApp } = require("./http/app");

async function bootstrap() {
  await waitForDatabase();
  const channel = await connectBroker();
  let router;
  if (config.service === "orchestrator") {
    const repository = require("./modules/orchestrator/saga.repository");
    const { createSagaService } = require("./modules/orchestrator/saga.service");
    const { createSagaRouter } = require("./modules/orchestrator/saga.routes");
    await repository.migrate();
    const service = createSagaService(channel);
    router = createSagaRouter(service);
    await consume(
      channel,
      "orchestrator.events",
      ["evt.#"],
      service.handleEvent,
    );
  } else if (["order", "inventory", "payment"].includes(config.service)) {
    const repository = require(
      `./modules/${config.service}/${config.service}.repository`,
    );
    const { createHandler } = require(
      `./modules/${config.service}/${config.service}.handler`,
    );
    await repository.migrate();
    await consume(
      channel,
      `${config.service}.commands`,
      [`cmd.${config.service}.*`],
      createHandler(channel),
    );
  } else throw new Error(`Unknown service: ${config.service}`);
  const app = createApp(router);
  return app.listen(config.port, "0.0.0.0", () =>
    logger.info({ port: config.port }, "HTTP server started"),
  );
}

module.exports = { bootstrap };
