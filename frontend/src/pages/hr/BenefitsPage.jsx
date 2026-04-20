import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { benefitService, employeeService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

const BENEFIT_TYPES = [
  { value: "insurance", label: "Insurance" },
  { value: "pension", label: "Pension" },
];

export default function BenefitsPage() {
  const { currentEntity } = useEntity();
  const [benefits, setBenefits] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "insurance",
    amount: "",
    status: "active",
  });
  const employeeOptions = Array.isArray(employees) ? employees : [];

  const loadBenefits = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await benefitService.getBenefits(currentEntity._id);
      setBenefits(
        Array.isArray(response.data.data.benefits)
          ? response.data.data.benefits
          : [],
      );
    } catch (error) {
      console.error("Error loading benefits:", error);
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
    loadBenefits();
    loadEmployees();
  }, [loadBenefits, loadEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntity) return;

    try {
      if (editingBenefit) {
        await benefitService.updateBenefit(
          currentEntity._id,
          editingBenefit._id,
          formData,
        );
      } else {
        await benefitService.createBenefit(currentEntity._id, formData);
      }
      setModalOpen(false);
      setEditingBenefit(null);
      resetForm();
      loadBenefits();
    } catch (error) {
      console.error("Error saving benefit:", error);
    }
  };

  const handleEdit = (benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      employeeId: benefit.employeeId?._id || "",
      type: benefit.type,
      amount: benefit.amount,
      status: benefit.status,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      type: "insurance",
      amount: "",
      status: "active",
    });
  };

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (row) => `${row.employeeId.firstName} ${row.employeeId.lastName}`,
    },
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
    <div className="hr-benefits-page">
      <PageHeader
        title="Benefits"
        subtitle="Manage employee benefits and compensation"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Add Benefit
          </Button>
        }
      />

      <Table columns={columns} data={benefits} />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBenefit(null);
        }}
        title={editingBenefit ? "Edit Benefit" : "Add Benefit"}
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
          <Select
            label="Type"
            options={BENEFIT_TYPES}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value })}
            required
          />
          <FormField
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(value) => setFormData({ ...formData, amount: value })}
            required
          />
          <Select
            label="Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
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
                setEditingBenefit(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingBenefit ? "Update" : "Create"} Benefit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
