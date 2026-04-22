const router = require("express").Router();
const ctrl = require("../controllers/payrollRun.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const PayrollRun = require("../models/PayrollRun");

router.use(authMiddleware, entityMiddleware);

router.get("/", ctrl.getAll);
router.post(
  "/",
  autoAudit({ module: "payroll", resource: "PayrollRun", model: PayrollRun }),
  ctrl.create,
);
router.get("/:id", ctrl.getOne);
router.put(
  "/:id",
  autoAudit({
    module: "payroll",
    resource: "PayrollRun",
    model: PayrollRun,
    idParam: "id",
  }),
  ctrl.update,
);
router.delete(
  "/:id",
  autoAudit({
    module: "payroll",
    resource: "PayrollRun",
    model: PayrollRun,
    idParam: "id",
  }),
  ctrl.remove,
);
router.post(
  "/:id/process",
  autoAudit({
    module: "payroll",
    action: "update",
    resource: "PayrollRun",
    model: PayrollRun,
    idParam: "id",
    description: "process PayrollRun",
  }),
  ctrl.process,
);
router.post(
  "/:id/post",
  autoAudit({
    module: "payroll",
    action: "update",
    resource: "PayrollRun",
    model: PayrollRun,
    idParam: "id",
    description: "post PayrollRun",
  }),
  ctrl.post,
);
router.get("/:id/lines", ctrl.getLines);
router.get("/:id/summary", ctrl.getSummary);

module.exports = router;
