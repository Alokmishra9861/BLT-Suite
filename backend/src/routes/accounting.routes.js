const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/accounting.controller");

// ── Middleware resolution ─────────────────────────────────────────────────────
// Auto-adapts to different export patterns in your existing middleware files.

const authMW = require("../middlewares/auth.middleware");
const entityMW = require("../middlewares/entity.middleware");

// Auth — try common export names, then fall back to default function export
const authenticate =
  authMW.authenticate ||
  authMW.protect ||
  authMW.verifyToken ||
  authMW.authMiddleware ||
  (typeof authMW === "function" ? authMW : null);

if (!authenticate) {
  throw new Error(
    "[accounting.routes] Cannot resolve auth middleware. " +
      "Expected one of: authenticate, protect, verifyToken, or default function export in auth.middleware.js",
  );
}

// Entity — try common export names, then fall back to default function export
const attachEntity =
  entityMW.attachEntity ||
  entityMW.entityMiddleware ||
  entityMW.setEntity ||
  entityMW.loadEntity ||
  (typeof entityMW === "function" ? entityMW : null);

if (!attachEntity) {
  console.warn(
    "[accounting.routes] WARNING: Cannot resolve entity middleware. " +
      "req.entityId will not be set automatically. Check entity.middleware.js exports.",
  );
}

// ── Apply middleware to all accounting routes ─────────────────────────────────
router.use(authenticate);
if (attachEntity) router.use(attachEntity);

// ── Chart of Accounts ─────────────────────────────────────────────────────────
router.get("/accounts", ctrl.listAccounts);
router.post("/accounts", ctrl.createAccount);
router.patch("/accounts/:accountId", ctrl.updateAccount);
router.delete("/accounts/:accountId", ctrl.deleteAccount);

// ── Account Balance & Ledger ──────────────────────────────────────────────────
router.get("/accounts/:accountId/balance", ctrl.getAccountBalance);
router.get("/accounts/:accountId/ledger", ctrl.getAccountLedger);

// ── Journal Entries ───────────────────────────────────────────────────────────
router.get("/journals", ctrl.listJournals);
router.post("/journals", ctrl.createJournal);
router.get("/journals/:journalId", ctrl.getJournal);
router.patch("/journals/:journalId", ctrl.updateJournal);
router.post("/journals/:journalId/post", ctrl.postJournal);
router.post("/journals/:journalId/reverse", ctrl.reverseJournal);
router.post("/journals/:journalId/void", ctrl.voidJournal);

// ── Accounting Periods ────────────────────────────────────────────────────────
router.get("/periods", ctrl.listPeriods);
router.post("/periods", ctrl.createPeriod);
router.post("/periods/:period/close", ctrl.closePeriod);

// ── Reports ───────────────────────────────────────────────────────────────────
router.get("/reports/trial-balance", ctrl.getTrialBalance);

module.exports = router;
