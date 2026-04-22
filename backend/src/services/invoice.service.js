const Invoice = require("../models/Invoice");
const ApiError = require("../utils/ApiError");

const calculateInvoiceTotals = (invoice) => {
  let subtotal = 0;

  if (invoice.lineItems && Array.isArray(invoice.lineItems)) {
    invoice.lineItems.forEach((item) => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      item.amount = amount;
      subtotal += amount;
    });
  }

  invoice.subtotal = subtotal;
  invoice.totalAmount = subtotal + (invoice.taxAmount || 0);
  invoice.balanceDue = invoice.totalAmount - (invoice.amountPaid || 0);

  return invoice;
};

const buildInvoicePayload = (body) => ({
  customerId: body.customerId,
  invoiceNumber: body.invoiceNumber?.trim(),
  issueDate: new Date(body.issueDate),
  dueDate: new Date(body.dueDate),
  currency: body.currency || "USD",
  status: body.status || "draft",
  notes: body.notes?.trim() || "",
  lineItems: body.lineItems || [],
  taxAmount: body.taxAmount || 0,
});

class InvoiceService {
  static async createInvoice(entityId, body, userId) {
    const payload = buildInvoicePayload(body);
    payload.entityId = entityId;
    payload.createdBy = userId;
    payload.amountPaid = 0;

    const invoice = new Invoice(payload);
    calculateInvoiceTotals(invoice);

    await invoice.save();
    return invoice.populate("customerId", "name email");
  }

  static async getInvoices(
    entityId,
    { page = 1, limit = 10, search, status, dateFrom, dateTo },
  ) {
    const query = { entityId };

    if (search) {
      query.$or = [{ invoiceNumber: { $regex: search, $options: "i" } }];
    }

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) {
        query.issueDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.issueDate.$lte = new Date(dateTo);
      }
    }

    const invoices = await Invoice.find(query)
      .populate("customerId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Invoice.countDocuments(query);

    return {
      invoices,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getInvoiceById(invoiceId, entityId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      entityId,
    }).populate("customerId", "name email phone address");

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    return invoice;
  }

  static async updateInvoice(invoiceId, entityId, body, userId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    // Only allow editing if in draft status
    if (invoice.status !== "draft") {
      throw new ApiError(400, "Can only edit invoices in draft status");
    }

    const payload = buildInvoicePayload(body);
    Object.assign(invoice, payload);
    calculateInvoiceTotals(invoice);

    await invoice.save();
    return invoice.populate("customerId", "name email");
  }

  static async deleteInvoice(invoiceId, entityId) {
    const invoice = await Invoice.findOneAndDelete({
      _id: invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    return invoice;
  }

  static async sendInvoice(invoiceId, entityId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    if (invoice.status !== "draft") {
      throw new ApiError(400, "Can only send draft invoices");
    }

    invoice.status = "sent";
    await invoice.save();

    return invoice.populate("customerId", "name email");
  }

  static async voidInvoice(invoiceId, entityId) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    invoice.status = "void";
    await invoice.save();

    return invoice.populate("customerId", "name email");
  }

  static async recordPayment(invoiceId, entityId, amount) {
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      entityId,
    });

    if (!invoice) {
      throw new ApiError(404, "Invoice not found");
    }

    if (amount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (amount > invoice.balanceDue) {
      throw new ApiError(
        400,
        `Payment amount cannot exceed balance due (${invoice.balanceDue})`,
      );
    }

    invoice.amountPaid = (invoice.amountPaid || 0) + amount;
    invoice.balanceDue = invoice.totalAmount - invoice.amountPaid;

    if (invoice.balanceDue === 0) {
      invoice.status = "paid";
    } else if (invoice.amountPaid > 0) {
      invoice.status = "partially_paid";
    }

    await invoice.save();
    return invoice;
  }

  static async getInvoiceSummary(entityId) {
    const invoices = await Invoice.find({
      entityId,
      status: { $ne: "void" },
    }).lean();

    const summary = {
      totalOutstanding: 0,
      totalPaid: 0,
      totalOverdue: 0,
      totalInvoiced: 0,
    };

    const now = new Date();

    invoices.forEach((invoice) => {
      summary.totalInvoiced += invoice.totalAmount || 0;
      summary.totalPaid += invoice.amountPaid || 0;

      if (invoice.status === "paid") {
        summary.totalPaid += invoice.totalAmount || 0;
      }

      if (invoice.balanceDue > 0) {
        summary.totalOutstanding += invoice.balanceDue;

        if (new Date(invoice.dueDate) < now && invoice.status !== "paid") {
          summary.totalOverdue += invoice.balanceDue;
        }
      }
    });

    return summary;
  }
}

module.exports = InvoiceService;
