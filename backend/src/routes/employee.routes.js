const express = require("express");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employee.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateEmployee } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.route("/").get(getEmployees).post(validateEmployee, createEmployee);

router
  .route("/:id")
  .get(getEmployee)
  .put(validateEmployee, updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
