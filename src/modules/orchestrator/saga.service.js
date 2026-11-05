const repository = require("./saga.repository");
const { publish } = require("../../infrastructure/broker");
const logger = require("../../infrastructure/logger");
function createSagaService(channel) {
  async function start(input) {
    await repository.create(input);
    await publish(channel, "cmd.order.create", {
      sagaId: input.id,
      amount: input.amount,
    });
  }
  async function advance(event, expected, next, command) {
    const saga = await repository.transition(event.sagaId, expected, next);
    if (!saga) {
      logger.warn(
        { sagaId: event.sagaId, type: event.type },
        "Duplicate or unexpected event",
      );
      return;
    }
    if (command)
      await publish(channel, command, {
        sagaId: saga.id,
        amount: Number(saga.amount),
        failPayment: saga.fail_payment,
      });
  }
  const transitions = {
    "evt.order.created": ["STARTED", "ORDER_CREATED", "cmd.inventory.reserve"],
    "evt.inventory.reserved": [
      "ORDER_CREATED",
      "INVENTORY_RESERVED",
      "cmd.payment.charge",
    ],
    "evt.inventory.failed": [
      "ORDER_CREATED",
      "CANCELLING_ORDER",
      "cmd.order.cancel",
    ],
    "evt.payment.approved": ["INVENTORY_RESERVED", "COMPLETED", null],
    "evt.payment.failed": [
      "INVENTORY_RESERVED",
      "RELEASING_INVENTORY",
      "cmd.inventory.release",
    ],
    "evt.inventory.released": [
      "RELEASING_INVENTORY",
      "CANCELLING_ORDER",
      "cmd.order.cancel",
    ],
    "evt.order.cancelled": ["CANCELLING_ORDER", "COMPENSATED", null],
  };
  async function handleEvent(event) {
    const transition = transitions[event.type];
    if (!transition) {
      logger.warn({ type: event.type }, "Unknown event");
      return;
    }
    await advance(event, ...transition);
  }
  return { start, handleEvent, findById: repository.findById };
}
module.exports = { createSagaService };
