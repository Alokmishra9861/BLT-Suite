const Customer = require("../models/Customer");
const ApiError = require("../utils/ApiError");

const buildCustomerPayload = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim().toLowerCase(),
  phone: body.phone?.trim() || "",
  address: body.address?.trim() || "",
  contactPerson: body.contactPerson?.trim() || "",
  taxNumber: body.taxNumber?.trim() || "",
  notes: body.notes?.trim() || "",
  status: body.status || "active",
});

class CustomerService {
  static async createCustomer(entityId, body, userId) {
    const payload = buildCustomerPayload(body);
    payload.entityId = entityId;
    payload.createdBy = userId;

    const customer = new Customer(payload);
    await customer.save();
    return customer;
  }

  static async getCustomers(
    entityId,
    { page = 1, limit = 10, search, status },
  ) {
    const query = { entityId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Customer.countDocuments(query);

    return {
      customers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getCustomerById(customerId, entityId) {
    const customer = await Customer.findOne({
      _id: customerId,
      entityId,
    }).lean();

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    return customer;
  }

  static async updateCustomer(customerId, entityId, body, userId) {
    const customer = await Customer.findOne({
      _id: customerId,
      entityId,
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    const payload = buildCustomerPayload(body);
    Object.assign(customer, payload);
    customer.updatedAt = new Date();

    await customer.save();
    return customer;
  }

  static async deleteCustomer(customerId, entityId) {
    const customer = await Customer.findOneAndDelete({
      _id: customerId,
      entityId,
    });

    if (!customer) {
      throw new ApiError(404, "Customer not found");
    }

    return customer;
  }
}

module.exports = CustomerService;
