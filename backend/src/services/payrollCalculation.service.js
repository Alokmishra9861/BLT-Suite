/**
 * payrollCalculation.service.js
 * All payroll math is centralised here. Controllers/routes never do arithmetic.
 */

const PERIOD_DIVISORS = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};
const HEALTH_FREQ = {
  weekly: 4.33,
  biweekly: 2.17,
  semimonthly: 2,
  monthly: 1,
};

/**
 * Calculate gross pay for one employee in one period.
 * @param {Object} employee  - Mongoose Employee doc (plain object ok)
 * @param {string} periodType - weekly | biweekly | semimonthly | monthly
 */
function calcGrossPay(employee, periodType) {
  if (employee.paytype === "hourly") {
    return (employee.hourlyRate || 0) * (employee.hoursWorked || 0);
  }
  const divisor = PERIOD_DIVISORS[periodType] || 24;
  return (employee.salary || 0) / divisor;
}

/**
 * Calculate pension eligibility date (Cayman rules):
 *  - Employee must be 18+ AND have 9+ months of Cayman residency
 */
function calcPensionEligibleDate(dob, arrival) {
  const age18 = new Date(
    new Date(dob).setFullYear(new Date(dob).getFullYear() + 18),
  );
  const nineMonths = new Date(
    new Date(arrival).setMonth(new Date(arrival).getMonth() + 9),
  );
  return new Date(Math.max(age18, nineMonths));
}

/**
 * Compute all deductions for one employee in one payroll period.
 * Returns an array of { deductionTypeId, name, amount } and a totalDeductions number.
 *
 * @param {number} grossPay
 * @param {Object} employee
 * @param {string} periodType
 * @param {Array}  activeDeductions - EmployeeDeduction docs (populated with deductionTypeId)
 * @param {Date}   payDate          - pay date of this run (used for pension eligibility check)
 */
function calcDeductions(
  grossPay,
  employee,
  periodType,
  activeDeductions,
  payDate,
) {
  const lines = [];

  // ── Pension (Cayman mandatory) ─────────────────────────────────────────
  const pensionDate = calcPensionEligibleDate(employee.dob, employee.arrival);
  const pensionActive = pensionDate <= new Date(payDate);

  if (pensionActive) {
    const empPct = 5; // employee always 5 %
    const empAmt = grossPay * (empPct / 100);
    lines.push({
      deductionTypeId: null,
      name: "Pension — Employee (5%)",
      amount: round2(empAmt),
    });
  }

  // ── Health Insurance (employee share) ─────────────────────────────────
  if (employee.healthprem && employee.healther !== undefined) {
    const employeeSharePct = (100 - employee.healther) / 100;
    const monthlyEmpShare = employee.healthprem * employeeSharePct;
    const freq = HEALTH_FREQ[periodType] || 2;
    const empHealthAmt = monthlyEmpShare / freq;
    lines.push({
      deductionTypeId: null,
      name: "Health Insurance — Employee",
      amount: round2(empHealthAmt),
    });
  }

  // ── Custom / additional deductions from EmployeeDeduction records ─────
  for (const ed of activeDeductions) {
    const dt = ed.deductionTypeId; // populated doc
    if (!dt || dt.status !== "active") continue;

    // Resolve amount — custom overrides override the type defaults
    let amount = 0;
    if (ed.customAmount !== null && ed.customAmount !== undefined) {
      amount = ed.customAmount;
    } else if (ed.customPct !== null && ed.customPct !== undefined) {
      amount = grossPay * (ed.customPct / 100);
    } else if (dt.calcType === "fixed") {
      amount = dt.value;
    } else if (dt.calcType === "percentage") {
      amount = grossPay * (dt.value / 100);
    }

    if (amount > 0) {
      lines.push({
        deductionTypeId: dt._id,
        name: dt.name,
        amount: round2(amount),
      });
    }
  }

  const totalDeductions = round2(lines.reduce((s, l) => s + l.amount, 0));
  return { lines, totalDeductions };
}

/**
 * Build a complete PayrollLine payload for one employee.
 */
function buildPayrollLine(
  employee,
  periodType,
  payDate,
  activeDeductions,
  payrollRunId,
) {
  const grossPay = round2(calcGrossPay(employee, periodType));
  const { lines, totalDeductions } = calcDeductions(
    grossPay,
    employee,
    periodType,
    activeDeductions,
    payDate,
  );
  const netPay = round2(grossPay - totalDeductions);

  return {
    payrollRunId,
    employeeId: employee._id,
    employeeName: `${employee.first} ${employee.last}`,
    payType: employee.paytype || "salary",
    baseSalary: employee.salary || 0,
    hourlyRate: employee.hourlyRate || 0,
    hoursWorked: employee.hoursWorked || 0,
    grossPay,
    deductions: lines,
    totalDeductions,
    netPay,
    entityId: employee.entity,
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = { buildPayrollLine, calcGrossPay, calcDeductions, round2 };
