import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { leaveRequestService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

const LEAVE_TYPES = [
  { value: "vacation", label: "Vacation" },
  { value: "sick", label: "Sick Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function LeaveRequestsPage() {
  const { currentEntity } = useEntity();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const loadLeaveRequests = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await leaveRequestService.getLeaveRequests(
        currentEntity._id,
        params,
      );
      setLeaveRequests(response.data.data.leaveRequests);
    } catch (error) {
      console.error("Error loading leave requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentEntity, statusFilter]);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  const handleApprove = async (id) => {
    if (
      !currentEntity ||
      !window.confirm("Are you sure you want to approve this leave request?")
    )
      return;
    try {
      await leaveRequestService.approveLeaveRequest(currentEntity._id, id);
      loadLeaveRequests();
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };

  const handleReject = async (id) => {
    if (
      !currentEntity ||
      !window.confirm("Are you sure you want to reject this leave request?")
    )
      return;
    try {
      await leaveRequestService.rejectLeaveRequest(currentEntity._id, id);
      loadLeaveRequests();
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => `${row.employeeId.firstName} ${row.employeeId.lastName}`,
    },
    { key: "type", label: "Leave Type" },
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
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="hr-actions">
          {row.status === "pending" && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(row._id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(row._id)}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="hr-leave-requests-page">
      <PageHeader
        title="Leave Requests"
        subtitle="Manage employee leave requests"
      />

      <div className="hr-filters">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      <Table columns={columns} data={leaveRequests} />
    </div>
  );
}
