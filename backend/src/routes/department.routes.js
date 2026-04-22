const express = require("express");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const Department = require("../models/Department");

const { validateDepartment } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getDepartments)
  .post(
    autoAudit({ module: "hr", resource: "Department", model: Department }),
    validateDepartment,
    createDepartment,
  );

router
  .route("/:id")
  .put(
    autoAudit({
      module: "hr",
      resource: "Department",
      model: Department,
      idParam: "id",
    }),
    validateDepartment,
    updateDepartment,
  )
  .delete(
    autoAudit({
      module: "hr",
      resource: "Department",
      model: Department,
      idParam: "id",
    }),
    deleteDepartment,
  );

module.exports = router;
