const InvoicePaymentService = require("../services/invoicePayment.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getPayments = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { page, limit, invoiceId, dateFrom, dateTo } = req.query;

  const data = await InvoicePaymentService.getPayments(entityId, {
    page,
    limit,
    invoiceId,
    dateFrom,
    dateTo,
  });

  res.status(200).json(
    new ApiResponse({
      data,
      message: "Invoice payments retrieved successfully",
    }),
  );
});

const createPayment = catchAsync(async (req, res) => {
  const { entityId } = req;
  const userId = req.user._id || req.user.id;

  const payment = await InvoicePaymentService.createPayment(
    entityId,
    req.body,
    userId,
  );

  res.status(201).json(
    new ApiResponse({
      data: payment,
      message: "Invoice payment recorded successfully",
    }),
  );
});

const getPayment = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { paymentId } = req.params;

  const payment = await InvoicePaymentService.getPaymentById(
    paymentId,
    entityId,
  );

  res.status(200).json(
    new ApiResponse({
      data: payment,
      message: "Invoice payment retrieved successfully",
    }),
  );
});

module.exports = {
  getPayments,
  createPayment,
  getPayment,
};
