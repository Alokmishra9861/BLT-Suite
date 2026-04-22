const Bill = require("../models/Bill");
const ApiError = require("../utils/ApiError");

const calculateBillTotals = (bill) => {
  let subtotal = 0;

  if (bill.lineItems && Array.isArray(bill.lineItems)) {
    bill.lineItems.forEach((item) => {
      const amount = (item.quantity || 0) * (item.unitPrice || 0);
      item.amount = amount;
      subtotal += amount;
    });
  }

  bill.subtotal = subtotal;
  bill.totalAmount = subtotal + (bill.taxAmount || 0);
  bill.balanceDue = bill.totalAmount - (bill.amountPaid || 0);

  return bill;
};

const buildBillPayload = (body) => ({
  vendorId: body.vendorId,
  billNumber: body.billNumber?.trim(),
  billDate: new Date(body.billDate),
  dueDate: new Date(body.dueDate),
  currency: body.currency || "USD",
  status: body.status || "draft",
  notes: body.notes?.trim() || "",
  category: body.category?.trim() || "",
  lineItems: body.lineItems || [],
  taxAmount: body.taxAmount || 0,
});

class BillService {
  static async createBill(entityId, body, userId) {
    const payload = buildBillPayload(body);
    payload.entityId = entityId;
    payload.createdBy = userId;
    payload.amountPaid = 0;

    const bill = new Bill(payload);
    calculateBillTotals(bill);

    await bill.save();
    return bill.populate("vendorId", "name email");
  }

  static async getBills(
    entityId,
    { page = 1, limit = 10, search, status, dateFrom, dateTo },
  ) {
    const query = { entityId };

    if (search) {
      query.$or = [{ billNumber: { $regex: search, $options: "i" } }];
    }

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.billDate = {};
      if (dateFrom) {
        query.billDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.billDate.$lte = new Date(dateTo);
      }
    }

    const bills = await Bill.find(query)
      .populate("vendorId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Bill.countDocuments(query);

    return {
      bills,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getBillById(billId, entityId) {
    const bill = await Bill.findOne({
      _id: billId,
      entityId,
    }).populate("vendorId", "name email phone address");

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    return bill;
  }

  static async updateBill(billId, entityId, body, userId) {
    const bill = await Bill.findOne({
      _id: billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    // Only allow editing if in draft status
    if (bill.status !== "draft") {
      throw new ApiError(400, "Can only edit bills in draft status");
    }

    const payload = buildBillPayload(body);
    Object.assign(bill, payload);
    calculateBillTotals(bill);

    await bill.save();
    return bill.populate("vendorId", "name email");
  }

  static async deleteBill(billId, entityId) {
    const bill = await Bill.findOneAndDelete({
      _id: billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    return bill;
  }

  static async approveBill(billId, entityId) {
    const bill = await Bill.findOne({
      _id: billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    if (bill.status !== "draft") {
      throw new ApiError(400, "Can only approve draft bills");
    }

    bill.status = "approved";
    await bill.save();

    return bill.populate("vendorId", "name email");
  }

  static async voidBill(billId, entityId) {
    const bill = await Bill.findOne({
      _id: billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    bill.status = "void";
    await bill.save();

    return bill.populate("vendorId", "name email");
  }

  static async recordPayment(billId, entityId, amount) {
    const bill = await Bill.findOne({
      _id: billId,
      entityId,
    });

    if (!bill) {
      throw new ApiError(404, "Bill not found");
    }

    if (amount <= 0) {
      throw new ApiError(400, "Payment amount must be greater than 0");
    }

    if (amount > bill.balanceDue) {
      throw new ApiError(
        400,
        `Payment amount cannot exceed balance due (${bill.balanceDue})`,
      );
    }

    bill.amountPaid = (bill.amountPaid || 0) + amount;
    bill.balanceDue = bill.totalAmount - bill.amountPaid;

    if (bill.balanceDue === 0) {
      bill.status = "paid";
    } else if (bill.amountPaid > 0) {
      bill.status = "partially_paid";
    }

    await bill.save();
    return bill;
  }

  static async getBillSummary(entityId) {
    const bills = await Bill.find({
      entityId,
      status: { $ne: "void" },
    }).lean();

    const summary = {
      totalPayable: 0,
      totalPaid: 0,
      totalOverdue: 0,
      totalBilled: 0,
    };

    const now = new Date();

    bills.forEach((bill) => {
      summary.totalBilled += bill.totalAmount || 0;

      if (bill.status === "paid") {
        summary.totalPaid += bill.totalAmount || 0;
      }

      if (bill.balanceDue > 0) {
        summary.totalPayable += bill.balanceDue;

        if (new Date(bill.dueDate) < now && bill.status !== "paid") {
          summary.totalOverdue += bill.balanceDue;
        }
      }
    });

    return summary;
  }
}

module.exports = BillService;
