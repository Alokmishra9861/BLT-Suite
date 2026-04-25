const BillService = require("../services/bill.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const {
  getSelectedEntityId,
  ensureCanCreateOperationalRecord,
} = require("../utils/entityScope.util");

const getBills = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { page, limit, search, status, dateFrom, dateTo } = req.query;

  const data = await BillService.getBills(entityId, {
    page,
    limit,
    search,
    status,
    dateFrom,
    dateTo,
  });

  res.status(200).json(
    new ApiResponse({
      data,
      message: "Bills retrieved successfully",
    }),
  );
});

const createBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  ensureCanCreateOperationalRecord(req);
  const userId = req.user._id || req.user.id;

  const bill = await BillService.createBill(entityId, req.body, userId);

  res.status(201).json(
    new ApiResponse({
      data: bill,
      message: "Bill created successfully",
    }),
  );
});

const getBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { billId } = req.params;

  const bill = await BillService.getBillById(billId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: bill,
      message: "Bill retrieved successfully",
    }),
  );
});

const updateBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { billId } = req.params;
  const userId = req.user._id || req.user.id;

  const bill = await BillService.updateBill(billId, entityId, req.body, userId);

  res.status(200).json(
    new ApiResponse({
      data: bill,
      message: "Bill updated successfully",
    }),
  );
});

const deleteBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { billId } = req.params;

  await BillService.deleteBill(billId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: null,
      message: "Bill deleted successfully",
    }),
  );
});

const approveBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { billId } = req.params;

  const bill = await BillService.approveBill(billId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: bill,
      message: "Bill approved successfully",
    }),
  );
});

const voidBill = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { billId } = req.params;

  const bill = await BillService.voidBill(billId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: bill,
      message: "Bill voided successfully",
    }),
  );
});

const getBillSummary = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);

  const summary = await BillService.getBillSummary(entityId);

  res.status(200).json(
    new ApiResponse({
      data: summary,
      message: "Bill summary retrieved successfully",
    }),
  );
});

module.exports = {
  getBills,
  createBill,
  getBill,
  updateBill,
  deleteBill,
  approveBill,
  voidBill,
  getBillSummary,
};
