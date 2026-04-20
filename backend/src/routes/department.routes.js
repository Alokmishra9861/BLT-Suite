const express = require("express");
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateDepartment } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getDepartments)
  .post(validateDepartment, createDepartment);

router
  .route("/:id")
  .put(validateDepartment, updateDepartment)
  .delete(deleteDepartment);

module.exports = router;
