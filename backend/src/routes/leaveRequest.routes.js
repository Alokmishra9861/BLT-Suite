const express = require("express");
const {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} = require("../controllers/leaveRequest.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateLeaveRequest } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getLeaveRequests)
  .post(validateLeaveRequest, createLeaveRequest);

router.route("/:id").put(validateLeaveRequest, updateLeaveRequest);

router.route("/:id/approve").patch(approveLeaveRequest);

router.route("/:id/reject").patch(rejectLeaveRequest);

module.exports = router;
