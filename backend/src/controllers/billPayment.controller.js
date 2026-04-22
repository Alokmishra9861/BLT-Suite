const BillPaymentService = require("../services/billPayment.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getPayments = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { page, limit, billId, dateFrom, dateTo } = req.query;

  const data = await BillPaymentService.getPayments(entityId, {
    page,
    limit,
    billId,
    dateFrom,
    dateTo,
  });

  res.status(200).json(
    new ApiResponse({
      data,
      message: "Bill payments retrieved successfully",
    }),
  );
});

const createPayment = catchAsync(async (req, res) => {
  const { entityId } = req;
  const userId = req.user._id || req.user.id;

  const payment = await BillPaymentService.createPayment(
    entityId,
    req.body,
    userId,
  );

  res.status(201).json(
    new ApiResponse({
      data: payment,
      message: "Bill payment recorded successfully",
    }),
  );
});

const getPayment = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { paymentId } = req.params;

  const payment = await BillPaymentService.getPaymentById(paymentId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: payment,
      message: "Bill payment retrieved successfully",
    }),
  );
});

module.exports = {
  getPayments,
  createPayment,
  getPayment,
};
