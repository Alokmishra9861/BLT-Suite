const Entity = require("../models/Entity");
const Role = require("../models/Role");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const InvoicePayment = require("../models/InvoicePayment");
const Vendor = require("../models/Vendor");
const Bill = require("../models/Bill");
const BillPayment = require("../models/BillPayment");
const { ROLES } = require("../config/constants");

const DEMO_ENTITY_CODE = "BLT-HQ";
const DEMO_ADMIN_EMAIL = "admin@blt-suite.local";

const sumLineItems = (lineItems = []) =>
  lineItems.reduce((total, item) => total + Number(item.amount || 0), 0);

const buildTotals = (lineItems, taxAmount = 0, amountPaid = 0) => {
  const subtotal = sumLineItems(lineItems);
  const totalAmount = subtotal + Number(taxAmount || 0);
  const balanceDue = Math.max(totalAmount - Number(amountPaid || 0), 0);

  return {
    subtotal,
    totalAmount,
    amountPaid: Number(amountPaid || 0),
    balanceDue,
  };
};

const getOrCreateAdminUser = async (entityId) => {
  const role =
    (await Role.findOneAndUpdate(
      { name: ROLES.SUPER_ADMIN },
      {
        name: ROLES.SUPER_ADMIN,
        description: "Super admin role",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )) || (await Role.findOne({ name: ROLES.SUPER_ADMIN }));

  let adminUser = await User.findOne({ email: DEMO_ADMIN_EMAIL });

  if (!adminUser) {
    adminUser = new User({
      name: "BLT Super Admin",
      email: DEMO_ADMIN_EMAIL,
      password: "Admin123!@#",
      role: role._id,
      entityIds: [entityId],
      isActive: true,
    });
    await adminUser.save();
    return adminUser;
  }

  adminUser.role = role._id;
  adminUser.entityIds = Array.from(
    new Set([...(adminUser.entityIds || []).map(String), String(entityId)]),
  );
  adminUser.isActive = true;
  await adminUser.save();

  return adminUser;
};

const seedDemoData = async () => {
  const entity = await Entity.findOneAndUpdate(
    { code: DEMO_ENTITY_CODE },
    {
      name: "BLT International Group HQ",
      code: DEMO_ENTITY_CODE,
      country: "AE",
      currency: "AED",
      timezone: "Asia/Dubai",
      active: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const adminUser = await getOrCreateAdminUser(entity._id);

  const customers = [
    {
      name: "Acme Trading LLC",
      email: "accounts@acmetrading.ae",
      phone: "+971555100001",
      address: "Dubai Investment Park, Dubai, UAE",
      contactPerson: "Sara Hassan",
      taxNumber: "AE100200300",
      notes: "Primary wholesale customer",
      status: "active",
    },
    {
      name: "Global Logistics FZE",
      email: "billing@globallogistics.ae",
      phone: "+971555100002",
      address: "JAFZA, Dubai, UAE",
      contactPerson: "Ahmed Khan",
      taxNumber: "AE400500600",
      notes: "Receivables partner for freight services",
      status: "active",
    },
  ];

  for (const customer of customers) {
    await Customer.findOneAndUpdate(
      { entityId: entity._id, email: customer.email },
      {
        ...customer,
        entityId: entity._id,
        createdBy: adminUser._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const seededCustomers = await Customer.find({ entityId: entity._id }).lean();
  const acmeCustomer = seededCustomers.find(
    (customer) => customer.email === "accounts@acmetrading.ae",
  );
  const globalCustomer = seededCustomers.find(
    (customer) => customer.email === "billing@globallogistics.ae",
  );

  const invoices = [
    {
      invoiceNumber: "INV-2026-001",
      customerId: acmeCustomer?._id,
      issueDate: new Date("2026-04-01"),
      dueDate: new Date("2026-04-15"),
      currency: "AED",
      status: "sent",
      notes: "Office supplies and onboarding services",
      lineItems: [
        {
          description: "Office supplies",
          quantity: 20,
          unitPrice: 120,
          amount: 2400,
        },
        {
          description: "Setup services",
          quantity: 1,
          unitPrice: 1600,
          amount: 1600,
        },
      ],
      taxAmount: 200,
      amountPaid: 1200,
    },
    {
      invoiceNumber: "INV-2026-002",
      customerId: globalCustomer?._id,
      issueDate: new Date("2026-03-10"),
      dueDate: new Date("2026-03-25"),
      currency: "AED",
      status: "paid",
      notes: "Monthly logistics and support services",
      lineItems: [
        {
          description: "Logistics management",
          quantity: 5,
          unitPrice: 1300,
          amount: 6500,
        },
        {
          description: "Support retainer",
          quantity: 1,
          unitPrice: 2000,
          amount: 2000,
        },
      ],
      taxAmount: 425,
      amountPaid: 8925,
    },
    {
      invoiceNumber: "INV-2026-003",
      customerId: acmeCustomer?._id,
      issueDate: new Date("2026-04-05"),
      dueDate: new Date("2026-04-20"),
      currency: "AED",
      status: "overdue",
      notes: "Advisory engagement",
      lineItems: [
        {
          description: "Advisory hours",
          quantity: 15,
          unitPrice: 180,
          amount: 2700,
        },
      ],
      taxAmount: 450,
      amountPaid: 0,
    },
  ];

  for (const invoice of invoices) {
    if (!invoice.customerId) continue;

    const totals = buildTotals(
      invoice.lineItems,
      invoice.taxAmount,
      invoice.amountPaid,
    );

    const savedInvoice = await Invoice.findOneAndUpdate(
      { entityId: entity._id, invoiceNumber: invoice.invoiceNumber },
      {
        entityId: entity._id,
        customerId: invoice.customerId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        status: invoice.status,
        notes: invoice.notes,
        lineItems: invoice.lineItems,
        taxAmount: invoice.taxAmount,
        createdBy: adminUser._id,
        ...totals,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (savedInvoice.invoiceNumber === "INV-2026-001") {
      await InvoicePayment.findOneAndUpdate(
        {
          entityId: entity._id,
          invoiceId: savedInvoice._id,
          referenceNumber: "PAY-INV-001",
        },
        {
          entityId: entity._id,
          invoiceId: savedInvoice._id,
          customerId: savedInvoice.customerId,
          paymentDate: new Date("2026-04-10"),
          amount: 1200,
          paymentMethod: "bank_transfer",
          referenceNumber: "PAY-INV-001",
          notes: "Partial settlement received",
          createdBy: adminUser._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    if (savedInvoice.invoiceNumber === "INV-2026-002") {
      await InvoicePayment.findOneAndUpdate(
        {
          entityId: entity._id,
          invoiceId: savedInvoice._id,
          referenceNumber: "PAY-INV-002",
        },
        {
          entityId: entity._id,
          invoiceId: savedInvoice._id,
          customerId: savedInvoice.customerId,
          paymentDate: new Date("2026-03-18"),
          amount: 8925,
          paymentMethod: "bank_transfer",
          referenceNumber: "PAY-INV-002",
          notes: "Full settlement received",
          createdBy: adminUser._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }

  const vendors = [
    {
      name: "Alpha Office Supplies",
      email: "procurement@alphaoffice.ae",
      phone: "+971555200001",
      address: "Business Bay, Dubai, UAE",
      contactPerson: "Mona Ali",
      taxNumber: "AE700800900",
      notes: "Stationery and office consumables",
      status: "active",
    },
    {
      name: "Atlas Cloud Services",
      email: "billing@atlascloud.ae",
      phone: "+971555200002",
      address: "Dubai Internet City, Dubai, UAE",
      contactPerson: "Faisal Rahman",
      taxNumber: "AE110220330",
      notes: "Infrastructure and hosting partner",
      status: "active",
    },
  ];

  for (const vendor of vendors) {
    await Vendor.findOneAndUpdate(
      { entityId: entity._id, email: vendor.email },
      {
        ...vendor,
        entityId: entity._id,
        createdBy: adminUser._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const seededVendors = await Vendor.find({ entityId: entity._id }).lean();
  const alphaVendor = seededVendors.find(
    (vendor) => vendor.email === "procurement@alphaoffice.ae",
  );
  const atlasVendor = seededVendors.find(
    (vendor) => vendor.email === "billing@atlascloud.ae",
  );

  const bills = [
    {
      billNumber: "BILL-2026-001",
      vendorId: alphaVendor?._id,
      billDate: new Date("2026-04-02"),
      dueDate: new Date("2026-04-16"),
      currency: "AED",
      status: "approved",
      notes: "Monthly office supply procurement",
      category: "Operations",
      lineItems: [
        {
          description: "Office stationery",
          quantity: 30,
          unitPrice: 45,
          amount: 1350,
        },
        {
          description: "Printer cartridges",
          quantity: 8,
          unitPrice: 145,
          amount: 1160,
        },
      ],
      taxAmount: 30,
      amountPaid: 540,
    },
    {
      billNumber: "BILL-2026-002",
      vendorId: atlasVendor?._id,
      billDate: new Date("2026-03-12"),
      dueDate: new Date("2026-03-27"),
      currency: "AED",
      status: "paid",
      notes: "Cloud hosting and maintenance",
      category: "IT Services",
      lineItems: [
        {
          description: "Cloud hosting",
          quantity: 1,
          unitPrice: 900,
          amount: 900,
        },
        {
          description: "Support package",
          quantity: 1,
          unitPrice: 250,
          amount: 250,
        },
      ],
      taxAmount: 50,
      amountPaid: 1200,
    },
    {
      billNumber: "BILL-2026-003",
      vendorId: alphaVendor?._id,
      billDate: new Date("2026-04-06"),
      dueDate: new Date("2026-04-18"),
      currency: "AED",
      status: "overdue",
      notes: "Rush procurement for expansion team",
      category: "Operations",
      lineItems: [
        {
          description: "Meeting supplies",
          quantity: 15,
          unitPrice: 35,
          amount: 525,
        },
        {
          description: "Delivery surcharge",
          quantity: 1,
          unitPrice: 180,
          amount: 180,
        },
      ],
      taxAmount: 60,
      amountPaid: 0,
    },
  ];

  for (const bill of bills) {
    if (!bill.vendorId) continue;

    const totals = buildTotals(bill.lineItems, bill.taxAmount, bill.amountPaid);

    const savedBill = await Bill.findOneAndUpdate(
      { entityId: entity._id, billNumber: bill.billNumber },
      {
        entityId: entity._id,
        vendorId: bill.vendorId,
        billNumber: bill.billNumber,
        billDate: bill.billDate,
        dueDate: bill.dueDate,
        currency: bill.currency,
        status: bill.status,
        notes: bill.notes,
        category: bill.category,
        lineItems: bill.lineItems,
        taxAmount: bill.taxAmount,
        createdBy: adminUser._id,
        ...totals,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (savedBill.billNumber === "BILL-2026-001") {
      await BillPayment.findOneAndUpdate(
        {
          entityId: entity._id,
          billId: savedBill._id,
          referenceNumber: "PAY-BILL-001",
        },
        {
          entityId: entity._id,
          billId: savedBill._id,
          vendorId: savedBill.vendorId,
          paymentDate: new Date("2026-04-12"),
          amount: 540,
          paymentMethod: "bank_transfer",
          referenceNumber: "PAY-BILL-001",
          notes: "Partial payment made",
          createdBy: adminUser._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }

    if (savedBill.billNumber === "BILL-2026-002") {
      await BillPayment.findOneAndUpdate(
        {
          entityId: entity._id,
          billId: savedBill._id,
          referenceNumber: "PAY-BILL-002",
        },
        {
          entityId: entity._id,
          billId: savedBill._id,
          vendorId: savedBill.vendorId,
          paymentDate: new Date("2026-03-20"),
          amount: 1200,
          paymentMethod: "bank_transfer",
          referenceNumber: "PAY-BILL-002",
          notes: "Full settlement made",
          createdBy: adminUser._id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }
  }

  console.log("Demo receivables and payables data ensured");
};

module.exports = seedDemoData;
