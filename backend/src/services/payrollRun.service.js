/**
 * payrollRun.service.js
 * Orchestrates payroll processing and posting.
 * Controllers call this; this calls the calculation service.
 */

const PayrollRun = require("../models/PayrollRun");
const PayrollLine = require("../models/PayrollLine");
const Employee = require("../models/Employee");
const EmployeeDeduction = require("../models/EmployeeDeduction");
const { buildPayrollLine, round2 } = require("./payrollCalculation.service");

/**
 * Process a payroll run:
 *  1. Validate run is in draft status
 *  2. Find eligible employees for the entity
 *  3. Load active employee deductions
 *  4. Build payroll lines
 *  5. Save lines + update run totals + set status = 'processed'
 */
async function processPayrollRun(runId) {
  const run = await PayrollRun.findById(runId);
  if (!run)
    throw Object.assign(new Error("Payroll run not found"), {
      statusCode: 404,
    });
  if (run.status !== "draft") {
    throw Object.assign(
      new Error(
        `Cannot process a run with status "${run.status}". Only draft runs can be processed.`,
      ),
      { statusCode: 400 },
    );
  }

  // Eligible employees: same entity, active, same pay period type
  const employees = await Employee.find({
    entity: run.entityId,
    status: "active",
    payperiod: run.periodType,
  });

  if (!employees.length) {
    throw Object.assign(
      new Error("No active employees found for this entity and period type."),
      { statusCode: 400 },
    );
  }

  // Delete any pre-existing lines for this run (re-process safety)
  await PayrollLine.deleteMany({ payrollRunId: run._id });

  const lineDocuments = [];
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  for (const emp of employees) {
    // Load active employee-level deductions (with deductionType populated)
    const activeDeductions = await EmployeeDeduction.find({
      employeeId: emp._id,
      entityId: run.entityId,
      status: "active",
      $or: [{ endDate: null }, { endDate: { $gte: run.payDate } }],
    }).populate("deductionTypeId");

    const lineData = buildPayrollLine(
      emp,
      run.periodType,
      run.payDate,
      activeDeductions,
      run._id,
    );
    lineDocuments.push(lineData);

    totalGross += lineData.grossPay;
    totalDeductions += lineData.totalDeductions;
    totalNet += lineData.netPay;
  }

  await PayrollLine.insertMany(lineDocuments);

  run.totalGrossPay = round2(totalGross);
  run.totalDeductions = round2(totalDeductions);
  run.totalNetPay = round2(totalNet);
  run.status = "processed";
  run.processedAt = new Date();
  await run.save();

  return run;
}

/**
 * Post a payroll run:
 *  1. Validate run is processed
 *  2. Optionally create a journal entry stub (plug-in point for accounting module)
 *  3. Lock the run as posted
 */
async function postPayrollRun(runId) {
  const run = await PayrollRun.findById(runId);
  if (!run)
    throw Object.assign(new Error("Payroll run not found"), {
      statusCode: 404,
    });
  if (run.status !== "processed") {
    throw Object.assign(
      new Error(
        `Cannot post a run with status "${run.status}". Only processed runs can be posted.`,
      ),
      { statusCode: 400 },
    );
  }

  // ── Accounting integration plug-in point ──────────────────────────────
  // When your Journal Entry module is ready, call it here:
  //
  // const je = await JournalService.createPayrollJournal({
  //   entityId:    run.entityId,
  //   description: `Payroll Run — ${run.periodType} ${run.periodStart} to ${run.periodEnd}`,
  //   grossPay:    run.totalGrossPay,
  //   deductions:  run.totalDeductions,
  //   netPay:      run.totalNetPay,
  // });
  // run.jeRef = je.referenceNumber;
  //
  // For now we assign a placeholder reference:
  const jeRef = `JE-PAY-${Date.now()}`;
  run.jeRef = jeRef;
  // ─────────────────────────────────────────────────────────────────────

  run.status = "posted";
  run.postedAt = new Date();
  await run.save();

  return run;
}

module.exports = { processPayrollRun, postPayrollRun };
