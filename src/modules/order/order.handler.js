const repository = require("./order.repository");
const { publish } = require("../../infrastructure/broker");
function createHandler(channel) {
  return async function handle(event) {
    if (event.type === "cmd.order.create") {
      await repository.execute(
        "INSERT INTO orders(id,status,amount) VALUES($1,'PENDING',$2) ON CONFLICT(id) DO NOTHING",
        [event.sagaId, event.amount],
      );
      await publish(channel, "evt.order.created", { sagaId: event.sagaId });
      return;
    }
    if (event.type === "cmd.order.cancel") {
      await repository.execute(
        "UPDATE orders SET status='CANCELLED' WHERE id=$1",
        [event.sagaId],
      );
      await publish(channel, "evt.order.cancelled", { sagaId: event.sagaId });
      return;
    }
    throw new Error(`Unknown command: ${event.type}`);
  };
}
module.exports = { createHandler };
