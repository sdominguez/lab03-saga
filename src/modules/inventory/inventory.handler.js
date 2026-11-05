const repository = require("./inventory.repository");
const { publish } = require("../../infrastructure/broker");
function createHandler(channel) {
  return async function handle(event) {
    if (event.type === "cmd.inventory.reserve") {
      await repository.execute(
        "INSERT INTO reservations(id,status) VALUES($1,'RESERVED') ON CONFLICT(id) DO NOTHING",
        [event.sagaId],
      );
      await publish(channel, "evt.inventory.reserved", {
        sagaId: event.sagaId,
      });
      return;
    }
    if (event.type === "cmd.inventory.release") {
      await repository.execute(
        "UPDATE reservations SET status='RELEASED' WHERE id=$1",
        [event.sagaId],
      );
      await publish(channel, "evt.inventory.released", {
        sagaId: event.sagaId,
      });
      return;
    }
    throw new Error(`Unknown command: ${event.type}`);
  };
}
module.exports = { createHandler };
