import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEntity } from "../../context/EntityContext";
import {
  employeeService,
  workPermitService,
  leaveRequestService,
  benefitService,
} from "../../services/hr.service";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import Table from "../../components/common/Table";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { currentEntity } = useEntity();
  const [employee, setEmployee] = useState(null);
  const [workPermits, setWorkPermits] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const safeWorkPermits = Array.isArray(workPermits) ? workPermits : [];
  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];
  const safeBenefits = Array.isArray(benefits) ? benefits : [];

  useEffect(() => {
    if (!currentEntity || !id) return;
    loadData();
  }, [currentEntity, id]);

  const loadData = async () => {
    try {
      const [employeeRes, permitsRes, leavesRes, benefitsRes] =
        await Promise.all([
          employeeService.getEmployee(currentEntity._id, id),
          workPermitService.getWorkPermits(currentEntity._id, {
            employeeId: id,
          }),
          leaveRequestService.getLeaveRequests(currentEntity._id, {
            employeeId: id,
          }),
          benefitService.getBenefits(currentEntity._id, { employeeId: id }),
        ]);

      setEmployee(employeeRes.data.data);
      setWorkPermits(
        Array.isArray(permitsRes.data.data.workPermits)
          ? permitsRes.data.data.workPermits
          : [],
      );
      setLeaveRequests(
        Array.isArray(leavesRes.data.data.leaveRequests)
          ? leavesRes.data.data.leaveRequests
          : [],
      );
      setBenefits(
        Array.isArray(benefitsRes.data.data.benefits)
          ? benefitsRes.data.data.benefits
          : [],
      );
    } catch (error) {
      console.error("Error loading employee details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (!employee) return <div>Employee not found</div>;

  const permitColumns = [
    { key: "permitNumber", label: "Permit Number" },
    {
      key: "issueDate",
      label: "Issue Date",
      render: (row) => new Date(row.issueDate).toLocaleDateString(),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (row) => new Date(row.expiryDate).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const leaveColumns = [
    { key: "type", label: "Type" },
    {
      key: "startDate",
      label: "Start Date",
      render: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (row) => new Date(row.endDate).toLocaleDateString(),
    },
    { key: "days", label: "Days" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const benefitColumns = [
    { key: "type", label: "Type" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => `$${row.amount.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="hr-employee-detail-page">
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        subtitle="Employee Details"
      />

      <div className="hr-detail-grid">
        <div className="hr-detail-card">
          <h3>Personal Information</h3>
          <div className="hr-info-grid">
            <div>
              <strong>Name:</strong> {employee.firstName} {employee.lastName}
            </div>
            <div>
              <strong>Email:</strong> {employee.email}
            </div>
            <div>
              <strong>Phone:</strong> {employee.phone || "N/A"}
            </div>
            <div>
              <strong>Status:</strong> <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>

        <div className="hr-detail-card">
          <h3>Job Information</h3>
          <div className="hr-info-grid">
            <div>
              <strong>Department:</strong> {employee.departmentId?.name}
            </div>
            <div>
              <strong>Job Title:</strong> {employee.jobTitle}
            </div>
            <div>
              <strong>Employment Type:</strong> {employee.employmentType}
            </div>
            <div>
              <strong>Pay Type:</strong> {employee.payType}
            </div>
            <div>
              <strong>Salary:</strong> ${employee.salary.toLocaleString()}
            </div>
            <div>
              <strong>Hire Date:</strong>{" "}
              {new Date(employee.hireDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="hr-detail-card">
          <h3>Work Permits</h3>
          <Table columns={permitColumns} data={safeWorkPermits} />
        </div>

        <div className="hr-detail-card">
          <h3>Leave History</h3>
          <Table columns={leaveColumns} data={safeLeaveRequests} />
        </div>

        <div className="hr-detail-card">
          <h3>Benefits</h3>
          <Table columns={benefitColumns} data={safeBenefits} />
        </div>
      </div>
    </div>
  );
}
