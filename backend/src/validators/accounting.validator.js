const { body, param, query } = require("express-validator");

// ── Chart of Accounts ────────────────────────────────────────────────────────
exports.validateCreateAccount = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Account code is required")
    .isLength({ max: 20 })
    .withMessage("Code cannot exceed 20 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Account name is required")
    .isLength({ max: 120 })
    .withMessage("Name cannot exceed 120 characters"),
  body("type")
    .isIn(["Asset", "Liability", "Equity", "Income", "Expense"])
    .withMessage("Type must be Asset, Liability, Equity, Income, or Expense"),
  body("subType").optional().isString(),
  body("description").optional().isString(),
];

exports.validateUpdateAccount = [
  body("code").optional().trim().isLength({ max: 20 }),
  body("name").optional().trim().isLength({ max: 120 }),
  body("type")
    .optional()
    .isIn(["Asset", "Liability", "Equity", "Income", "Expense"]),
  body("isActive").optional().isBoolean(),
];

// ── Journal Entries ───────────────────────────────────────────────────────────
exports.validateCreateJournal = [
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO date"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 }),
  body("reference").optional().isString().isLength({ max: 100 }),
  body("source")
    .optional()
    .isIn(["manual", "payroll", "ar", "ap", "banking", "system"]),
  body("lines")
    .isArray({ min: 2 })
    .withMessage("Journal must have at least 2 lines"),
  body("lines.*.accountId")
    .notEmpty()
    .withMessage("Each line must have an accountId"),
  body("lines.*.debit")
    .isFloat({ min: 0 })
    .withMessage("Debit must be a non-negative number"),
  body("lines.*.credit")
    .isFloat({ min: 0 })
    .withMessage("Credit must be a non-negative number"),
];

exports.validateUpdateJournal = [
  body("date").optional().isISO8601(),
  body("description").optional().trim().isLength({ max: 500 }),
  body("reference").optional().isString().isLength({ max: 100 }),
  body("lines").optional().isArray({ min: 2 }),
];

exports.validateReverseJournal = [
  body("date").optional().isISO8601(),
  body("description").optional().isString().isLength({ max: 500 }),
];

// ── Periods ───────────────────────────────────────────────────────────────────
exports.validateCreatePeriod = [
  body("period")
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Period must be in YYYY-MM format"),
  body("name").trim().notEmpty().withMessage("Period name is required"),
  body("startDate").isISO8601().withMessage("startDate must be a valid date"),
  body("endDate").isISO8601().withMessage("endDate must be a valid date"),
];
