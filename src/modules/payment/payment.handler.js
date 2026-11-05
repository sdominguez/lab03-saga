const repository = require("./payment.repository");
const { publish } = require("../../infrastructure/broker");
function createHandler(channel) {
  return async function handle(event) {
    if (event.type !== "cmd.payment.charge")
      throw new Error(`Unknown command: ${event.type}`);
    const status = event.failPayment ? "REJECTED" : "APPROVED";
    await repository.save(event.sagaId, status, event.amount);
    await publish(
      channel,
      event.failPayment ? "evt.payment.failed" : "evt.payment.approved",
      { sagaId: event.sagaId },
    );
  };
}
module.exports = { createHandler };
