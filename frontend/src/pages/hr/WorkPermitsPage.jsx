import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { workPermitService, employeeService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

export default function WorkPermitsPage() {
  const { currentEntity } = useEntity();
  const [workPermits, setWorkPermits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    permitNumber: "",
    issueDate: "",
    expiryDate: "",
    status: "active",
  });
  const employeeOptions = Array.isArray(employees) ? employees : [];

  const loadWorkPermits = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await workPermitService.getWorkPermits(
        currentEntity._id,
      );
      setWorkPermits(
        Array.isArray(response.data.data.workPermits)
          ? response.data.data.workPermits
          : [],
      );
    } catch (error) {
      console.error("Error loading work permits:", error);
    } finally {
      setLoading(false);
    }
  }, [currentEntity]);

  const loadEmployees = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await employeeService.getEmployees(currentEntity._id);
      setEmployees(
        Array.isArray(response.data.data.employees)
          ? response.data.data.employees
          : [],
      );
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadWorkPermits();
    loadEmployees();
  }, [loadWorkPermits, loadEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntity) return;

    try {
      if (editingPermit) {
        await workPermitService.updateWorkPermit(
          currentEntity._id,
          editingPermit._id,
          formData,
        );
      } else {
        await workPermitService.createWorkPermit(currentEntity._id, formData);
      }
      setModalOpen(false);
      setEditingPermit(null);
      resetForm();
      loadWorkPermits();
    } catch (error) {
      console.error("Error saving work permit:", error);
    }
  };

  const handleEdit = (permit) => {
    setEditingPermit(permit);
    setFormData({
      employeeId: permit.employeeId?._id || "",
      permitNumber: permit.permitNumber,
      issueDate: permit.issueDate.split("T")[0],
      expiryDate: permit.expiryDate.split("T")[0],
      status: permit.status,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      permitNumber: "",
      issueDate: "",
      expiryDate: "",
      status: "active",
    });
  };

  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => `${row.employeeId.firstName} ${row.employeeId.lastName}`,
    },
    { key: "permitNumber", label: "Permit Number" },
    {
      key: "issueDate",
      label: "Issue Date",
      render: (row) => new Date(row.issueDate).toLocaleDateString(),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (row) => {
        const date = new Date(row.expiryDate).toLocaleDateString();
        const expiring = isExpiringSoon(row.expiryDate);
        return (
          <span className={expiring ? "hr-expiring-soon" : ""}>{date}</span>
        );
      },
    },
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
          <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="hr-work-permits-page">
      <PageHeader
        title="Work Permits"
        subtitle="Manage employee work permits and track expiry"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Add Work Permit
          </Button>
        }
      />

      <Table columns={columns} data={workPermits} />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPermit(null);
        }}
        title={editingPermit ? "Edit Work Permit" : "Add Work Permit"}
      >
        <form onSubmit={handleSubmit} className="hr-form">
          <Select
            label="Employee"
            options={employeeOptions.map((e) => ({
              value: e._id,
              label: `${e.firstName} ${e.lastName}`,
            }))}
            value={formData.employeeId}
            onChange={(value) =>
              setFormData({ ...formData, employeeId: value })
            }
            required
          />
          <FormField
            label="Permit Number"
            type="text"
            value={formData.permitNumber}
            onChange={(value) =>
              setFormData({ ...formData, permitNumber: value })
            }
            required
          />
          <FormField
            label="Issue Date"
            type="date"
            value={formData.issueDate}
            onChange={(value) => setFormData({ ...formData, issueDate: value })}
            required
          />
          <FormField
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(value) =>
              setFormData({ ...formData, expiryDate: value })
            }
            required
          />
          <Select
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
            ]}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value })}
          />
          <div className="hr-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingPermit(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingPermit ? "Update" : "Create"} Work Permit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
