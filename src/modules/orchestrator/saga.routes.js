const { Router } = require("express");
function createSagaRouter(service) {
  const router = Router();
  router.post("/orders", async (req, res) => {
    const { id, amount = 100, failPayment = false } = req.body || {};
    if (
      typeof id !== "string" ||
      !/^[-a-zA-Z0-9]{1,64}$/.test(id) ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      typeof failPayment !== "boolean"
    ) {
      return res
        .status(400)
        .json({
          error: "Provide id, positive numeric amount and boolean failPayment",
        });
    }
    try {
      await service.start({ id, amount, failPayment });
      return res
        .status(202)
        .json({ sagaId: id, status: "STARTED", statusUrl: `/sagas/${id}` });
    } catch (error) {
      if (error.code === "23505")
        return res.status(409).json({ error: "Duplicate saga id" });
      return res
        .status(500)
        .json({ error: "Could not start saga", detail: error.message });
    }
  });
  router.get("/sagas/:id", async (req, res) => {
    try {
      const saga = await service.findById(req.params.id);
      return saga
        ? res.json(saga)
        : res.status(404).json({ error: "Not found" });
    } catch (_error) {
      return res.status(500).json({ error: "Query failed" });
    }
  });
  return router;
}
module.exports = { createSagaRouter };
