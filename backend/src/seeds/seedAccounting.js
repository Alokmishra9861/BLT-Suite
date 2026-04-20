/**
 * Seed: Accounting — Chart of Accounts + first accounting period
 * Run: node src/seeds/seedAccounting.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Account = require("../models/Account");
const AccountingPeriod = require("../models/AccountingPeriod");
const Entity = require("../models/Entity");
const Role = require("../models/Role");
const User = require("../models/User");
const { ROLES } = require("../config/constants");

const BLT_ACCOUNTS = [
  // ── Assets ──
  {
    code: "1010",
    name: "Operating Cash — CI$",
    type: "Asset",
    subType: "Bank Account",
  },
  {
    code: "1020",
    name: "Operating Cash — US$",
    type: "Asset",
    subType: "Bank Account",
  },
  { code: "1030", name: "Petty Cash", type: "Asset", subType: "Current Asset" },
  {
    code: "1100",
    name: "Accounts Receivable",
    type: "Asset",
    subType: "Accounts Receivable",
  },
  {
    code: "1200",
    name: "Prepaid Expenses",
    type: "Asset",
    subType: "Current Asset",
  },
  {
    code: "1300",
    name: "Computer Equipment",
    type: "Asset",
    subType: "Fixed Asset",
  },
  {
    code: "1310",
    name: "Office Equipment",
    type: "Asset",
    subType: "Fixed Asset",
  },
  {
    code: "1320",
    name: "Accumulated Depreciation",
    type: "Asset",
    subType: "Fixed Asset",
  },
  // ── Liabilities ──
  {
    code: "2010",
    name: "Accounts Payable",
    type: "Liability",
    subType: "Accounts Payable",
  },
  {
    code: "2100",
    name: "Accrued Salaries Payable",
    type: "Liability",
    subType: "Payroll Liability",
  },
  {
    code: "2110",
    name: "Pension Payable — Employee",
    type: "Liability",
    subType: "Payroll Liability",
  },
  {
    code: "2120",
    name: "Pension Payable — Employer",
    type: "Liability",
    subType: "Payroll Liability",
  },
  {
    code: "2130",
    name: "Health Insurance Payable",
    type: "Liability",
    subType: "Payroll Liability",
  },
  // ── Equity ──
  {
    code: "3010",
    name: "Member Capital",
    type: "Equity",
    subType: "Owner Equity",
  },
  {
    code: "3020",
    name: "Retained Earnings",
    type: "Equity",
    subType: "Retained Earnings",
  },
  // ── Income ──
  {
    code: "4010",
    name: "Mall of Cayman — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4020",
    name: "CayEats — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4030",
    name: "CaySearch — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4040",
    name: "Cayman Home Page — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4050",
    name: "Discount Club Cayman — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4060",
    name: "CayBookMe — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4070",
    name: "CayVids — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4080",
    name: "CayMaintenance — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  {
    code: "4090",
    name: "CayAuctions — Revenue",
    type: "Income",
    subType: "Platform Revenue",
  },
  // ── Expenses ──
  {
    code: "5010",
    name: "Salaries & Wages",
    type: "Expense",
    subType: "Payroll Expense",
  },
  {
    code: "5020",
    name: "Pension Expense — Employer",
    type: "Expense",
    subType: "Payroll Expense",
  },
  {
    code: "5030",
    name: "Health Insurance Expense",
    type: "Expense",
    subType: "Payroll Expense",
  },
  {
    code: "5040",
    name: "Severance Expense",
    type: "Expense",
    subType: "Payroll Expense",
  },
  {
    code: "5100",
    name: "Rent & Occupancy",
    type: "Expense",
    subType: "Operating Expense",
  },
  {
    code: "5120",
    name: "Internet & Communications",
    type: "Expense",
    subType: "Operating Expense",
  },
  {
    code: "5150",
    name: "Marketing & Advertising",
    type: "Expense",
    subType: "Operating Expense",
  },
  {
    code: "5160",
    name: "Professional Fees",
    type: "Expense",
    subType: "Administrative",
  },
  {
    code: "5170",
    name: "Work Permit Fees",
    type: "Expense",
    subType: "Administrative",
  },
  {
    code: "5200",
    name: "Depreciation Expense",
    type: "Expense",
    subType: "Depreciation",
  },
];

const PERIODS_2026 = [
  {
    period: "2026-01",
    name: "January 2026",
    start: "2026-01-01",
    end: "2026-01-31",
  },
  {
    period: "2026-02",
    name: "February 2026",
    start: "2026-02-01",
    end: "2026-02-28",
  },
  {
    period: "2026-03",
    name: "March 2026",
    start: "2026-03-01",
    end: "2026-03-31",
  },
  {
    period: "2026-04",
    name: "April 2026",
    start: "2026-04-01",
    end: "2026-04-30",
  },
  {
    period: "2026-05",
    name: "May 2026",
    start: "2026-05-01",
    end: "2026-05-31",
  },
  {
    period: "2026-06",
    name: "June 2026",
    start: "2026-06-01",
    end: "2026-06-30",
  },
  {
    period: "2026-07",
    name: "July 2026",
    start: "2026-07-01",
    end: "2026-07-31",
  },
  {
    period: "2026-08",
    name: "August 2026",
    start: "2026-08-01",
    end: "2026-08-31",
  },
  {
    period: "2026-09",
    name: "September 2026",
    start: "2026-09-01",
    end: "2026-09-30",
  },
  {
    period: "2026-10",
    name: "October 2026",
    start: "2026-10-01",
    end: "2026-10-31",
  },
  {
    period: "2026-11",
    name: "November 2026",
    start: "2026-11-01",
    end: "2026-11-30",
  },
  {
    period: "2026-12",
    name: "December 2026",
    start: "2026-12-01",
    end: "2026-12-31",
  },
];

async function seed() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/blt-suite",
  );
  console.log("✅ Connected to MongoDB");

  // Find the first entity (BLT-HQ)
  const entity =
    (await Entity.findOne({ code: "BLT-HQ" })) || (await Entity.findOne());
  if (!entity) {
    console.error("❌ No entity found. Run the main seed first.");
    process.exit(1);
  }
  console.log(`📌 Using entity: ${entity.name} (${entity._id})`);

  const adminRole = await Role.findOne({ name: ROLES.SUPER_ADMIN });
  const adminUser = adminRole
    ? await User.findOne({ role: adminRole._id })
    : await User.findOne();
  if (!adminUser) {
    console.error("❌ No user found. Run the main seed first.");
    process.exit(1);
  }

  // ── Seed accounts ─────────────────────────────────────────────────────────
  let created = 0;
  let skipped = 0;
  for (const acct of BLT_ACCOUNTS) {
    const exists = await Account.findOne({
      entityId: entity._id,
      code: acct.code,
    });
    if (exists) {
      skipped++;
      continue;
    }
    await Account.create({
      entityId: entity._id,
      code: acct.code,
      name: acct.name,
      type: acct.type,
      subType: acct.subType,
      isActive: true,
      createdBy: adminUser._id,
    });
    created++;
  }
  console.log(`✅ Accounts: ${created} created, ${skipped} already existed`);

  // ── Seed 2026 periods ──────────────────────────────────────────────────────
  let pCreated = 0;
  let pSkipped = 0;
  for (const p of PERIODS_2026) {
    const exists = await AccountingPeriod.findOne({
      entityId: entity._id,
      period: p.period,
    });
    if (exists) {
      pSkipped++;
      continue;
    }
    await AccountingPeriod.create({
      entityId: entity._id,
      period: p.period,
      name: p.name,
      startDate: new Date(p.start),
      endDate: new Date(p.end),
      status: "open",
    });
    pCreated++;
  }
  console.log(`✅ Periods: ${pCreated} created, ${pSkipped} already existed`);

  await mongoose.disconnect();
  console.log("🎉 Accounting seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
