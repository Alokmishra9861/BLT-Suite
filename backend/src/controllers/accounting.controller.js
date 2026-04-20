const accountingService = require("../services/accounting.service");
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// ── Helper: resolve entity ID from the request ────────────────────────────────
// Supports req.entityId (set by entity middleware) OR req.user.entityId (JWT payload)
function resolveEntityId(req) {
  const id =
    req.entityId ||
    req.user?.entityId ||
    req.user?.entity ||
    req.headers["x-entity-id"];

  if (!id) {
    throw new ApiError(
      400,
      "Entity context is missing. Make sure x-entity-id header is sent, " +
        "or your entity middleware sets req.entityId.",
    );
  }
  return id;
}

// ── Chart of Accounts ─────────────────────────────────────────────────────────

const listAccounts = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const filters = {
    type: req.query.type,
    isActive:
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined,
    search: req.query.search,
  };
  const accounts = await accountingService.listAccounts(entityId, filters);
  res.json(new ApiResponse({ data: accounts, message: "Accounts fetched" }));
});

const createAccount = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const account = await accountingService.createAccount(
    entityId,
    req.body,
    req.user._id,
  );
  res
    .status(201)
    .json(new ApiResponse({ data: account, message: "Account created" }));
});

const updateAccount = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const account = await accountingService.updateAccount(
    entityId,
    req.params.accountId,
    req.body,
  );
  res.json(new ApiResponse({ data: account, message: "Account updated" }));
});

const deleteAccount = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  await accountingService.deleteAccount(entityId, req.params.accountId);
  res.json(new ApiResponse({ data: null, message: "Account deleted" }));
});

const getAccountBalance = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const result = await accountingService.getAccountBalance(
    entityId,
    req.params.accountId,
    {
      periodFrom: req.query.periodFrom,
      periodTo: req.query.periodTo,
    },
  );
  res.json(new ApiResponse({ data: result, message: "Balance fetched" }));
});

const getAccountLedger = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const result = await accountingService.getAccountLedger(
    entityId,
    req.params.accountId,
    {
      periodFrom: req.query.periodFrom,
      periodTo: req.query.periodTo,
    },
  );
  res.json(new ApiResponse({ data: result, message: "Ledger fetched" }));
});

// ── Journal Entries ───────────────────────────────────────────────────────────

const listJournals = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const result = await accountingService.listJournals(entityId, req.query);
  res.json(new ApiResponse({ data: result, message: "Journals fetched" }));
});

const getJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const journal = await accountingService.getJournal(
    entityId,
    req.params.journalId,
  );
  res.json(new ApiResponse({ data: journal, message: "Journal fetched" }));
});

const createJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const journal = await accountingService.createJournal(
    entityId,
    req.body,
    req.user._id,
  );
  res
    .status(201)
    .json(new ApiResponse({ data: journal, message: "Journal created" }));
});

const updateJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const journal = await accountingService.updateJournal(
    entityId,
    req.params.journalId,
    req.body,
  );
  res.json(new ApiResponse({ data: journal, message: "Journal updated" }));
});

const postJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const journal = await accountingService.postJournal(
    entityId,
    req.params.journalId,
    req.user._id,
  );
  res.json(new ApiResponse({ data: journal, message: "Journal posted" }));
});

const reverseJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const reversal = await accountingService.reverseJournal(
    entityId,
    req.params.journalId,
    req.user._id,
    req.body,
  );
  res.status(201).json(
    new ApiResponse({
      data: reversal,
      message: "Reversal journal created and posted",
    }),
  );
});

const voidJournal = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const journal = await accountingService.voidJournal(
    entityId,
    req.params.journalId,
    req.user._id,
  );
  res.json(new ApiResponse({ data: journal, message: "Journal voided" }));
});

// ── Periods ───────────────────────────────────────────────────────────────────

const listPeriods = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const periods = await accountingService.listPeriods(entityId);
  res.json(new ApiResponse({ data: periods, message: "Periods fetched" }));
});

const createPeriod = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const period = await accountingService.createPeriod(
    entityId,
    req.body,
    req.user._id,
  );
  res
    .status(201)
    .json(new ApiResponse({ data: period, message: "Period created" }));
});

const closePeriod = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const period = await accountingService.closePeriod(
    entityId,
    req.params.period,
    req.user._id,
  );
  res.json(new ApiResponse({ data: period, message: "Period closed" }));
});

// ── Reports ───────────────────────────────────────────────────────────────────

const getTrialBalance = catchAsync(async (req, res) => {
  const entityId = resolveEntityId(req);
  const result = await accountingService.getTrialBalance(
    entityId,
    req.query.periodFrom,
    req.query.periodTo,
  );
  res.json(new ApiResponse({ data: result, message: "Trial balance fetched" }));
});

module.exports = {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  getAccountLedger,
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  postJournal,
  reverseJournal,
  voidJournal,
  listPeriods,
  createPeriod,
  closePeriod,
  getTrialBalance,
};
