const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const entityRoutes = require("./entity.routes");
const accountingRoutes = require("./accounting.routes");
const employeeRoutes = require("./employee.routes");
const departmentRoutes = require("./department.routes");
const workPermitRoutes = require("./workPermit.routes");
const leaveRequestRoutes = require("./leaveRequest.routes");
const benefitRoutes = require("./benefit.routes");
const terminationRoutes = require("./termination.routes");
const payrollRunRoutes = require("./payrollRun.routes");
const deductionTypeRoutes = require("./deductionType.routes");
const employeeDeductionRoutes = require("./employeeDeduction.routes");
const customerRoutes = require("./customer.routes");
const invoiceRoutes = require("./invoice.routes");
const invoicePaymentRoutes = require("./invoicePayment.routes");
const vendorRoutes = require("./vendor.routes");
const billRoutes = require("./bill.routes");
const billPaymentRoutes = require("./billPayment.routes");
const bankAccountRoutes = require("./bankAccount.routes");
const bankTransactionRoutes = require("./bankTransaction.routes");
const bankReconciliationRoutes = require("./bankReconciliation.routes");
const reportRoutes = require("./report.routes");
const auditRoutes = require("./audit.routes");

router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/entities", entityRoutes);
router.use("/accounting", accountingRoutes);
router.use("/entities/:entityId/employees", employeeRoutes);
router.use("/entities/:entityId/departments", departmentRoutes);
router.use("/entities/:entityId/work-permits", workPermitRoutes);
router.use("/entities/:entityId/leave-requests", leaveRequestRoutes);
router.use("/entities/:entityId/benefits", benefitRoutes);
router.use("/entities/:entityId/terminations", terminationRoutes);
router.use("/entities/:entityId/customers", customerRoutes);
router.use("/entities/:entityId/invoices", invoiceRoutes);
router.use("/entities/:entityId/invoice-payments", invoicePaymentRoutes);
router.use("/entities/:entityId/vendors", vendorRoutes);
router.use("/entities/:entityId/bills", billRoutes);
router.use("/entities/:entityId/bill-payments", billPaymentRoutes);
router.use("/payroll-runs", payrollRunRoutes);
router.use("/deduction-types", deductionTypeRoutes);
router.use("/employee-deductions", employeeDeductionRoutes);

// Bank routes
router.use("/bank-accounts", bankAccountRoutes);
router.use("/bank-transactions", bankTransactionRoutes);
router.use("/bank-reconciliations", bankReconciliationRoutes);

// Report routes
router.use("/reports", reportRoutes);

// Audit routes
router.use("/audit", auditRoutes);

module.exports = router;
