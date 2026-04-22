const express = require("express");
const {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require("../controllers/leaveRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const LeaveRequest = require("../models/LeaveRequest");

const { validateLeaveRequest } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getLeaveRequests)
  .post(
    autoAudit({ module: "hr", resource: "LeaveRequest", model: LeaveRequest }),
    validateLeaveRequest,
    createLeaveRequest,
  );

router.route("/:id").put(
  autoAudit({
    module: "hr",
    resource: "LeaveRequest",
    model: LeaveRequest,
    idParam: "id",
  }),
  validateLeaveRequest,
  updateLeaveRequest,
);

router.route("/:id/approve").patch(
  autoAudit({
    module: "hr",
    resource: "LeaveRequest",
    model: LeaveRequest,
    idParam: "id",
    description: "approve LeaveRequest",
  }),
  approveLeaveRequest,
);

router.route("/:id/reject").patch(
  autoAudit({
    module: "hr",
    resource: "LeaveRequest",
    model: LeaveRequest,
    idParam: "id",
    description: "reject LeaveRequest",
  }),
  rejectLeaveRequest,
);

module.exports = router;
