import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { terminationService, employeeService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

export default function TerminationsPage() {
  const { currentEntity } = useEntity();
  const [terminations, setTerminations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    terminationDate: "",
    reason: "",
    severanceAmount: 0,
    status: "active",
  });
  const employeeOptions = Array.isArray(employees) ? employees : [];

  const loadTerminations = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await terminationService.getTerminations(
        currentEntity._id,
      );
      setTerminations(
        Array.isArray(response.data.data.terminations)
          ? response.data.data.terminations
          : [],
      );
    } catch (error) {
      console.error("Error loading terminations:", error);
    } finally {
      setLoading(false);
    }
  }, [currentEntity]);

  const loadEmployees = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await employeeService.getEmployees(currentEntity._id, {
        status: "active",
      });
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
    loadTerminations();
    loadEmployees();
  }, [loadTerminations, loadEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntity) return;

    try {
      await terminationService.createTermination(currentEntity._id, formData);
      setModalOpen(false);
      resetForm();
      loadTerminations();
      loadEmployees(); // Refresh employee list
    } catch (error) {
      console.error("Error creating termination:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      terminationDate: "",
      reason: "",
      severanceAmount: 0,
      status: "active",
    });
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => `${row.employeeId.firstName} ${row.employeeId.lastName}`,
    },
    {
      key: "terminationDate",
      label: "Termination Date",
      render: (row) => new Date(row.terminationDate).toLocaleDateString(),
    },
    { key: "reason", label: "Reason" },
    {
      key: "severanceAmount",
      label: "Severance",
      render: (row) => `$${row.severanceAmount.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="hr-terminations-page">
      <PageHeader
        title="Terminations"
        subtitle="Manage employee terminations"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Terminate Employee
          </Button>
        }
      />

      <Table columns={columns} data={terminations} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Terminate Employee"
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
            label="Termination Date"
            type="date"
            value={formData.terminationDate}
            onChange={(value) =>
              setFormData({ ...formData, terminationDate: value })
            }
            required
          />
          <FormField
            label="Reason"
            type="textarea"
            value={formData.reason}
            onChange={(value) => setFormData({ ...formData, reason: value })}
            required
          />
          <FormField
            label="Severance Amount"
            type="number"
            value={formData.severanceAmount}
            onChange={(value) =>
              setFormData({ ...formData, severanceAmount: value })
            }
          />
          <div className="hr-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Terminate Employee</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
