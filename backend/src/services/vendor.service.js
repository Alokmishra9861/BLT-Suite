const Vendor = require("../models/Vendor");
const ApiError = require("../utils/ApiError");

const buildVendorPayload = (body) => ({
  name: body.name?.trim(),
  email: body.email?.trim().toLowerCase(),
  phone: body.phone?.trim() || "",
  address: body.address?.trim() || "",
  contactPerson: body.contactPerson?.trim() || "",
  taxNumber: body.taxNumber?.trim() || "",
  notes: body.notes?.trim() || "",
  status: body.status || "active",
});

class VendorService {
  static async createVendor(entityId, body, userId) {
    const payload = buildVendorPayload(body);
    payload.entityId = entityId;
    payload.createdBy = userId;

    const vendor = new Vendor(payload);
    await vendor.save();
    return vendor;
  }

  static async getVendors(entityId, { page = 1, limit = 10, search, status }) {
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

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Vendor.countDocuments(query);

    return {
      vendors,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    };
  }

  static async getVendorById(vendorId, entityId) {
    const vendor = await Vendor.findOne({
      _id: vendorId,
      entityId,
    }).lean();

    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    return vendor;
  }

  static async updateVendor(vendorId, entityId, body, userId) {
    const vendor = await Vendor.findOne({
      _id: vendorId,
      entityId,
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    const payload = buildVendorPayload(body);
    Object.assign(vendor, payload);
    vendor.updatedAt = new Date();

    await vendor.save();
    return vendor;
  }

  static async deleteVendor(vendorId, entityId) {
    const vendor = await Vendor.findOneAndDelete({
      _id: vendorId,
      entityId,
    });

    if (!vendor) {
      throw new ApiError(404, "Vendor not found");
    }

    return vendor;
  }
}

module.exports = VendorService;
