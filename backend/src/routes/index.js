const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const entityRoutes = require("./entity.routes");
const accountingRoutes = require("./accounting.routes");
const employeeRoutes = require("./employee.routes");
const departmentRoutes = require("./department.routes");
const workPermitRoutes = require("./workPermit.routes");
const leaveRequestRoutes = require("./leaveRequest.routes");
const benefitRoutes = require("./benefit.routes");
const terminationRoutes = require("./termination.routes");

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/entities", entityRoutes);
router.use("/accounting", accountingRoutes);
router.use("/entities/:entityId/employees", employeeRoutes);
router.use("/entities/:entityId/departments", departmentRoutes);
router.use("/entities/:entityId/work-permits", workPermitRoutes);
router.use("/entities/:entityId/leave-requests", leaveRequestRoutes);
router.use("/entities/:entityId/benefits", benefitRoutes);
router.use("/entities/:entityId/terminations", terminationRoutes);

module.exports = router;
