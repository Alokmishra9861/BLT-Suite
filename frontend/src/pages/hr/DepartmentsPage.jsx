import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { departmentService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

export default function DepartmentsPage() {
  const { currentEntity } = useEntity();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const loadDepartments = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await departmentService.getDepartments(
        currentEntity._id,
      );
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Error loading departments:", error);
    } finally {
      setLoading(false);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntity) return;

    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(
          currentEntity._id,
          editingDepartment._id,
          formData,
        );
      } else {
        await departmentService.createDepartment(currentEntity._id, formData);
      }
      setModalOpen(false);
      setEditingDepartment(null);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (department) => {
    if (
      !currentEntity ||
      !window.confirm("Are you sure you want to delete this department?")
    )
      return;
    try {
      await departmentService.deleteDepartment(
        currentEntity._id,
        department._id,
      );
      loadDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="hr-actions">
          <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="hr-departments-page">
      <PageHeader
        title="Departments"
        subtitle="Manage organizational departments"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
          >
            Add Department
          </Button>
        }
      />

      <Table columns={columns} data={departments} />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDepartment(null);
        }}
        title={editingDepartment ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSubmit} className="hr-form">
          <FormField
            label="Name"
            type="text"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            required
          />
          <FormField
            label="Description"
            type="textarea"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
          />
          <div className="hr-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingDepartment(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingDepartment ? "Update" : "Create"} Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
