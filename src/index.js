const { bootstrap } = require("./bootstrap");
const logger = require("./infrastructure/logger");
bootstrap().catch((error) => {
  logger.fatal({ error }, "Startup failed");
  process.exit(1);
});
