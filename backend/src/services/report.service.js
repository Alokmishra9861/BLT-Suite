const Journal = require("../models/Journal");
const Account = require("../models/Account");
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");
const PayrollRun = require("../models/PayrollRun");
const entityService = require("./entity.service");

const normalizeDateRange = (from, to) => {
  const start = from ? new Date(from) : new Date("2000-01-01");
  const end = to ? new Date(to) : new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Resolve a single entityId (or array) into an array usable
 * in a `{ $in: [...] }` MongoDB query. When the caller passes
 * a single ID we still wrap it in an array for consistent code.
 */
const toEntityArray = (entityIdOrIds) => {
  if (Array.isArray(entityIdOrIds)) return entityIdOrIds;
  return [entityIdOrIds];
};

const resolveScopedEntityIds = async (entityIdOrIds) => {
  if (Array.isArray(entityIdOrIds)) {
    return entityIdOrIds;
  }

  return entityService.getDescendantEntityIds(entityIdOrIds);
};

const getPostedJournals = async (entityIds, from, to) => {
  const { start, end } = normalizeDateRange(from, to);
  const ids = toEntityArray(entityIds);

  const journals = await Journal.find({
    entity: { $in: ids },
    status: { $in: ["posted", "Posted", "POSTED"] },
    date: { $gte: start, $lte: end },
  }).lean();

  return journals;
};

const buildAccountMap = async (entityIds) => {
  const ids = toEntityArray(entityIds);

  const accounts = await Account.find({ entity: { $in: ids } }).lean();

  const map = new Map();
  accounts.forEach((acc) => {
    map.set(String(acc._id), acc);
  });

  return {
    accounts,
    accountMap: map,
  };
};

const calculateTrialBalance = async (entityIds, from, to) => {
  const scopedEntityIds = await resolveScopedEntityIds(entityIds);
  const journals = await getPostedJournals(scopedEntityIds, from, to);
  const { accounts, accountMap } = await buildAccountMap(scopedEntityIds);

  const balances = {};

  for (const account of accounts) {
    balances[String(account._id)] = {
      accountId: account._id,
      code: account.code || "",
      name: account.name || "",
      type: account.type || "",
      debit: 0,
      credit: 0,
      balance: 0,
    };
  }

  for (const journal of journals) {
    for (const line of journal.lines || []) {
      const key = String(line.account);
      const account = accountMap.get(key);
      if (!account || !balances[key]) continue;

      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      balances[key].debit += debit;
      balances[key].credit += credit;
    }
  }

  Object.values(balances).forEach((row) => {
    row.balance = Number((row.debit - row.credit).toFixed(2));
    row.debit = Number(row.debit.toFixed(2));
    row.credit = Number(row.credit.toFixed(2));
  });

  const rows = Object.values(balances).sort((a, b) =>
    String(a.code).localeCompare(String(b.code)),
  );

  const totals = rows.reduce(
    (acc, row) => {
      acc.debit += row.debit;
      acc.credit += row.credit;
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  totals.debit = Number(totals.debit.toFixed(2));
  totals.credit = Number(totals.credit.toFixed(2));

  return {
    rows,
    totals,
  };
};

const calculateProfitAndLoss = async (entityIds, from, to) => {
  const scopedEntityIds = await resolveScopedEntityIds(entityIds);
  const journals = await getPostedJournals(scopedEntityIds, from, to);
  const { accounts, accountMap } = await buildAccountMap(scopedEntityIds);

  const incomeRows = [];
  const expenseRows = [];

  const balances = {};

  for (const account of accounts) {
    balances[String(account._id)] = 0;
  }

  for (const journal of journals) {
    for (const line of journal.lines || []) {
      const accId = String(line.account);
      const account = accountMap.get(accId);
      if (!account) continue;

      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);

      if (String(account.type).toLowerCase() === "income") {
        balances[accId] += credit - debit;
      }

      if (String(account.type).toLowerCase() === "expense") {
        balances[accId] += debit - credit;
      }
    }
  }

  for (const account of accounts) {
    const type = String(account.type || "").toLowerCase();
    const value = Number((balances[String(account._id)] || 0).toFixed(2));

    if (type === "income" && value !== 0) {
      incomeRows.push({
        accountId: account._id,
        code: account.code || "",
        name: account.name || "",
        amount: value,
      });
    }

    if (type === "expense" && value !== 0) {
      expenseRows.push({
        accountId: account._id,
        code: account.code || "",
        name: account.name || "",
        amount: value,
      });
    }
  }

  incomeRows.sort((a, b) => String(a.code).localeCompare(String(b.code)));
  expenseRows.sort((a, b) => String(a.code).localeCompare(String(b.code)));

  const totalIncome = incomeRows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + row.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return {
    income: incomeRows,
    expenses: expenseRows,
    totals: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
    },
  };
};

const calculateBalanceSheet = async (entityIds, to) => {
  const scopedEntityIds = await resolveScopedEntityIds(entityIds);
  const { start, end } = normalizeDateRange(null, to);
  const ids = toEntityArray(scopedEntityIds);

  const journals = await Journal.find({
    entity: { $in: ids },
    status: { $in: ["posted", "Posted", "POSTED"] },
    date: { $lte: end },
  }).lean();

  const { accounts, accountMap } = await buildAccountMap(scopedEntityIds);

  const sections = {
    assets: [],
    liabilities: [],
    equity: [],
  };

  const balances = {};

  for (const account of accounts) {
    balances[String(account._id)] = 0;
  }

  for (const journal of journals) {
    for (const line of journal.lines || []) {
      const accId = String(line.account);
      const account = accountMap.get(accId);
      if (!account) continue;

      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);
      const type = String(account.type || "").toLowerCase();

      if (type === "asset" || type === "expense") {
        balances[accId] += debit - credit;
      } else {
        balances[accId] += credit - debit;
      }
    }
  }

  for (const account of accounts) {
    const type = String(account.type || "").toLowerCase();
    const value = Number((balances[String(account._id)] || 0).toFixed(2));

    if (type === "asset" && value !== 0) {
      sections.assets.push({
        accountId: account._id,
        code: account.code || "",
        name: account.name || "",
        amount: value,
      });
    }

    if (type === "liability" && value !== 0) {
      sections.liabilities.push({
        accountId: account._id,
        code: account.code || "",
        name: account.name || "",
        amount: value,
      });
    }

    if (type === "equity" && value !== 0) {
      sections.equity.push({
        accountId: account._id,
        code: account.code || "",
        name: account.name || "",
        amount: value,
      });
    }
  }

  sections.assets.sort((a, b) => String(a.code).localeCompare(String(b.code)));
  sections.liabilities.sort((a, b) =>
    String(a.code).localeCompare(String(b.code)),
  );
  sections.equity.sort((a, b) => String(a.code).localeCompare(String(b.code)));

  const totalAssets = sections.assets.reduce((sum, row) => sum + row.amount, 0);
  const totalLiabilities = sections.liabilities.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const totalEquity = sections.equity.reduce((sum, row) => sum + row.amount, 0);

  return {
    assets: sections.assets,
    liabilities: sections.liabilities,
    equity: sections.equity,
    totals: {
      totalAssets: Number(totalAssets.toFixed(2)),
      totalLiabilities: Number(totalLiabilities.toFixed(2)),
      totalEquity: Number(totalEquity.toFixed(2)),
      totalLiabilitiesAndEquity: Number(
        (totalLiabilities + totalEquity).toFixed(2),
      ),
    },
  };
};

const calculateCashFlowSummary = async (entityIds, from, to) => {
  const scopedEntityIds = await resolveScopedEntityIds(entityIds);
  const journals = await getPostedJournals(scopedEntityIds, from, to);
  const { accountMap } = await buildAccountMap(scopedEntityIds);

  let operating = 0;
  let investing = 0;
  let financing = 0;

  for (const journal of journals) {
    for (const line of journal.lines || []) {
      const account = accountMap.get(String(line.account));
      if (!account) continue;

      const amount = Number(line.debit || 0) - Number(line.credit || 0);
      const name = String(account.name || "").toLowerCase();
      const type = String(account.type || "").toLowerCase();

      if (type === "asset" && name.includes("cash")) {
        operating += amount;
      } else if (
        type === "asset" &&
        (name.includes("equipment") || name.includes("fixed"))
      ) {
        investing += amount;
      } else if (type === "equity" || type === "liability") {
        financing += amount;
      }
    }
  }

  return {
    operating: Number(operating.toFixed(2)),
    investing: Number(investing.toFixed(2)),
    financing: Number(financing.toFixed(2)),
    netCashMovement: Number((operating + investing + financing).toFixed(2)),
  };
};

const getHrSummary = async (entityIds, from, to) => {
  const scopedEntityIds = await resolveScopedEntityIds(entityIds);
  const { start, end } = normalizeDateRange(from, to);
  const ids = toEntityArray(scopedEntityIds);

  const [employees, leaveRequests, payrollRuns] = await Promise.all([
    Employee.find({ entity: { $in: ids } }).lean(),
    LeaveRequest.find({
      entity: { $in: ids },
      createdAt: { $gte: start, $lte: end },
    }).lean(),
    PayrollRun.find({
      entity: { $in: ids },
      createdAt: { $gte: start, $lte: end },
    }).lean(),
  ]);

  const activeEmployees = employees.filter(
    (emp) =>
      String(emp.status || "").toLowerCase() === "active" ||
      emp.isActive === true,
  ).length;

  const pendingLeave = leaveRequests.filter(
    (item) => String(item.status || "").toLowerCase() === "pending",
  ).length;

  const approvedLeave = leaveRequests.filter(
    (item) => String(item.status || "").toLowerCase() === "approved",
  ).length;

  const processedPayrollRuns = payrollRuns.filter(
    (item) =>
      String(item.status || "").toLowerCase() === "processed" ||
      String(item.status || "").toLowerCase() === "completed",
  ).length;

  return {
    totals: {
      employees: employees.length,
      activeEmployees,
      leaveRequests: leaveRequests.length,
      pendingLeave,
      approvedLeave,
      payrollRuns: payrollRuns.length,
      processedPayrollRuns,
    },
    employees: employees.map((emp) => ({
      id: emp._id,
      name:
        [emp.firstName, emp.lastName].filter(Boolean).join(" ") ||
        [emp.first, emp.last].filter(Boolean).join(" ") ||
        emp.name ||
        "Unnamed Employee",
      department: emp.departmentName || emp.department || "-",
      title: emp.jobTitle || emp.title || "-",
      status: emp.status || (emp.isActive ? "active" : "inactive"),
    })),
  };
};

module.exports = {
  calculateTrialBalance,
  calculateProfitAndLoss,
  calculateBalanceSheet,
  calculateCashFlowSummary,
  getHrSummary,
};
