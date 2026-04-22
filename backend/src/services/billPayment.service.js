const BillPayment = require("../models/BillPayment");
const Bill = require("../models/Bill");
const ApiError = require("../utils/ApiError");
const BillService = require("./bill.service");

const buildBillPaymentPayload = (body) => ({
  paymentDate: new Date(body.paymentDate),
  amount: body.amount,
  paymentMethod: body.paymentMethod,
  referenceNumber: body.referenceNumber?.trim() || "",
  notes: body.notes?.trim() || "",
});

class BillPaymentService {
  static async createPayment(entityId, body, userId) {
    // Validate bill exists and belongs to entity
    const bill = await Bill.findOne({
      _id: body.billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    if (body.amount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (body.amount > bill.balanceDue) {
      throw new ApiError(
        400,
        `Payment amount cannot exceed balance due (${bill.balanceDue})`,
      );
    }

    const payload = buildBillPaymentPayload(body);
    payload.entityId = entityId;
    payload.billId = body.billId;
    payload.vendorId = bill.vendorId;
    payload.createdBy = userId;

    const payment = new BillPayment(payload);
    await payment.save();

    // Update bill with payment
    await BillService.recordPayment(body.billId, entityId, body.amount);

    return payment.populate("vendorId", "name");
  }

  static async getPayments(
    entityId,
    { page = 1, limit = 10, billId, dateFrom, dateTo },
  ) {
    const query = { entityId };

    if (billId) {
      query.billId = billId;
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

    const payments = await BillPayment.find(query)
      .populate("vendorId", "name")
      .populate("billId", "billNumber")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await BillPayment.countDocuments(query);

    return {
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getPaymentById(paymentId, entityId) {
    const payment = await BillPayment.findOne({
      _id: paymentId,
      entityId,
    })
      .populate("vendorId", "name email phone")
      .populate("billId", "billNumber totalAmount");

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    return payment;
  }
}

module.exports = BillPaymentService;
