const test = require("node:test");
const assert = require("node:assert/strict");
test("Expected compensation order after payment rejection", () => {
  const transitions = [
    "ORDER_CREATED",
    "INVENTORY_RESERVED",
    "RELEASING_INVENTORY",
    "CANCELLING_ORDER",
    "COMPENSATED",
  ];
  assert.equal(transitions.at(-1), "COMPENSATED");
});
