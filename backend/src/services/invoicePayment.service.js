const InvoicePayment = require("../models/InvoicePayment");
const Invoice = require("../models/Invoice");
const ApiError = require("../utils/ApiError");
const InvoiceService = require("./invoice.service");

const buildInvoicePaymentPayload = (body) => ({
  paymentDate: new Date(body.paymentDate),
  amount: body.amount,
  paymentMethod: body.paymentMethod,
  referenceNumber: body.referenceNumber?.trim() || "",
  notes: body.notes?.trim() || "",
});

class InvoicePaymentService {
  static async createPayment(entityId, body, userId) {
    // Validate invoice exists and belongs to entity
    const invoice = await Invoice.findOne({
      _id: body.invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    if (body.amount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (body.amount > invoice.balanceDue) {
      throw new ApiError(
        400,
        `Payment amount cannot exceed balance due (${invoice.balanceDue})`,
      );
    }

    const payload = buildInvoicePaymentPayload(body);
    payload.entityId = entityId;
    payload.invoiceId = body.invoiceId;
    payload.customerId = invoice.customerId;
    payload.createdBy = userId;

    const payment = new InvoicePayment(payload);
    await payment.save();

    // Update invoice with payment
    await InvoiceService.recordPayment(body.invoiceId, entityId, body.amount);

    return payment.populate("customerId", "name");
  }

  static async getPayments(
    entityId,
    { page = 1, limit = 10, invoiceId, dateFrom, dateTo },
  ) {
    const query = { entityId };

    if (invoiceId) {
      query.invoiceId = invoiceId;
    }

    if (dateFrom || dateTo) {
      query.paymentDate = {};
      if (dateFrom) {
        query.paymentDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.paymentDate.$lte = new Date(dateTo);
      }
    }

    const payments = await InvoicePayment.find(query)
      .populate("customerId", "name")
      .populate("invoiceId", "invoiceNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await InvoicePayment.countDocuments(query);

    return {
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getPaymentById(paymentId, entityId) {
    const payment = await InvoicePayment.findOne({
      _id: paymentId,
      entityId,
    })
      .populate("customerId", "name email phone")
      .populate("invoiceId", "invoiceNumber totalAmount");

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    return payment;
  }
}

module.exports = InvoicePaymentService;
