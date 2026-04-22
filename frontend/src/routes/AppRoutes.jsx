import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AccountingPage from "../pages/accounting/AccountingPage";
import EmployeesPage from "../pages/hr/EmployeesPage";
import EmployeeDetailPage from "../pages/hr/EmployeeDetailPage";
import DepartmentsPage from "../pages/hr/DepartmentsPage";
import WorkPermitsPage from "../pages/hr/WorkPermitsPage";
import LeaveRequestsPage from "../pages/hr/LeaveRequestsPage";
import BenefitsPage from "../pages/hr/BenefitsPage";
import TerminationsPage from "../pages/hr/TerminationsPage";
import PayrollModule from "../pages/payroll/PayrollModule";
import { CustomersPage } from "../pages/receivables/CustomersPage";
import { CustomerDetailPage } from "../pages/receivables/CustomerDetailPage";
import { InvoicesPage } from "../pages/receivables/InvoicesPage";
import { InvoiceFormPage } from "../pages/receivables/InvoiceFormPage";
import { InvoiceDetailPage } from "../pages/receivables/InvoiceDetailPage";
import { InvoicePaymentsPage } from "../pages/receivables/InvoicePaymentsPage";
import { VendorsPage } from "../pages/payables/VendorsPage";
import { VendorDetailPage } from "../pages/payables/VendorDetailPage";
import { BillsPage } from "../pages/payables/BillsPage";
import { BillFormPage } from "../pages/payables/BillFormPage";
import { BillDetailPage } from "../pages/payables/BillDetailPage";
import { BillPaymentsPage } from "../pages/payables/BillPaymentsPage";
import { ReceivablesModule } from "../pages/receivables/ReceivablesModule";
import { PayablesModule } from "../pages/payables/PayablesModule";
import { useEntity } from "../hooks/useEntity";
import BankingPage from "../pages/accounting/BankingPage";
import ReportsPage from "../pages/reports/ReportsPage";
import AuditPage from "../pages/Audit/AuditPage";

function PayrollPage() {
  const { currentEntity } = useEntity();
  return <PayrollModule activeEntity={currentEntity?._id} />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="accounting" element={<AccountingPage />} />
        <Route path="hr/employees" element={<EmployeesPage />} />
        <Route path="hr/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="hr/departments" element={<DepartmentsPage />} />
        <Route path="hr/work-permits" element={<WorkPermitsPage />} />
        <Route path="hr/leave-requests" element={<LeaveRequestsPage />} />
        <Route path="hr/benefits" element={<BenefitsPage />} />
        <Route path="hr/terminations" element={<TerminationsPage />} />
        <Route path="payroll" element={<PayrollPage />} />

        {/* Receivables Module */}
        <Route path="receivables" element={<ReceivablesModule />}>
          <Route index element={<Navigate to="customers" replace />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route
            path="customers/:customerId"
            element={<CustomerDetailPage />}
          />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<InvoiceFormPage />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
          <Route
            path="invoices/:invoiceId/edit"
            element={<InvoiceFormPage />}
          />
          <Route path="invoice-payments" element={<InvoicePaymentsPage />} />
        </Route>

        {/* Payables Module */}
        <Route path="payables" element={<PayablesModule />}>
          <Route index element={<Navigate to="vendors" replace />} />
          <Route path="vendors" element={<VendorsPage />} />
          <Route path="vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="bills/new" element={<BillFormPage />} />
          <Route path="bills/:billId" element={<BillDetailPage />} />
          <Route path="bills/:billId/edit" element={<BillFormPage />} />
          <Route path="bill-payments" element={<BillPaymentsPage />} />

          {/* Banking Module */}
          <Route path="banking" element={<BankingPage />} />
        </Route>

        {/* Reports */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Audit */}
        <Route path="audit" element={<AuditPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
