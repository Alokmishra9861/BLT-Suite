const invoiceService = require("../services/invoice.service");
const { auditWrap } = require("../utils/audit.util");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getEntityId = (req) =>
  req.entity?._id ||
  req.entityId ||
  req.params?.entityId ||
  req.user?.entity ||
  req.user?.entityId ||
  req.body.entity ||
  req.body.entityId ||
  req.query.entity ||
  req.query.entityId;

const getInvoices = catchAsync(async (req, res) => {
  const entityId = getEntityId(req);
  const result = await invoiceService.getInvoices(entityId, req.query);

  res.status(200).json(
    new ApiResponse({
      data: result,
      message: "Invoices retrieved successfully",
    }),
  );
});

const getInvoiceSummary = catchAsync(async (req, res) => {
  const entityId = getEntityId(req);
  const result = await invoiceService.getInvoiceSummary(entityId);

  res.status(200).json(
    new ApiResponse({
      data: result,
      message: "Invoice summary retrieved successfully",
    }),
  );
});

const getInvoice = catchAsync(async (req, res) => {
  const entityId = getEntityId(req);
  const result = await invoiceService.getInvoiceById(
    req.params.invoiceId,
    entityId,
  );

  res.status(200).json(
    new ApiResponse({
      data: result,
      message: "Invoice retrieved successfully",
    }),
  );
});

const createInvoiceHandler = async (req) => {
  const entityId = getEntityId(req);
  return await invoiceService.createInvoice(entityId, req.body, req.user?._id);
};

const updateInvoiceHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await invoiceService.getInvoiceById(
    req.params.invoiceId,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await invoiceService.updateInvoice(
    req.params.invoiceId,
    entityId,
    req.body,
    req.user?._id,
  );
};

const deleteInvoiceHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await invoiceService.getInvoiceById(
    req.params.invoiceId,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await invoiceService.deleteInvoice(
    req.params.invoiceId,
    entityId,
    req.user?._id,
  );
};

const sendInvoiceHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await invoiceService.getInvoiceById(
    req.params.invoiceId,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await invoiceService.sendInvoice(req.params.invoiceId, entityId);
};

const voidInvoiceHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await invoiceService.getInvoiceById(
    req.params.invoiceId,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await invoiceService.voidInvoice(req.params.invoiceId, entityId);
};

module.exports = {
  getInvoices,
  getInvoiceSummary,
  getInvoice,

  createInvoice: auditWrap(createInvoiceHandler, {
    module: "receivables",
    action: "create",
    resource: "Invoice",
    successStatus: 201,
    successMessage: "Invoice created successfully",
  }),

  updateInvoice: auditWrap(updateInvoiceHandler, {
    module: "receivables",
    action: "update",
    resource: "Invoice",
    successMessage: "Invoice updated successfully",
  }),

  deleteInvoice: auditWrap(deleteInvoiceHandler, {
    module: "receivables",
    action: "delete",
    resource: "Invoice",
    successMessage: "Invoice deleted successfully",
  }),

  sendInvoice: auditWrap(sendInvoiceHandler, {
    module: "receivables",
    action: "update",
    resource: "Invoice",
    successMessage: "Invoice sent successfully",
  }),

  voidInvoice: auditWrap(voidInvoiceHandler, {
    module: "receivables",
    action: "update",
    resource: "Invoice",
    successMessage: "Invoice voided successfully",
  }),
};
