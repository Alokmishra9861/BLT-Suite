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
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
