const pino = require("pino");
const { service } = require("../config");

module.exports = pino({ base: { service } });
