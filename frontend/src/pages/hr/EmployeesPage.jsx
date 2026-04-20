import { useState, useEffect, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import { employeeService, departmentService } from "../../services/hr.service";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Select from "../../components/common/Select";
import StatusBadge from "../../components/common/StatusBadge";
import SearchBar from "../../components/common/SearchBar";
import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "terminated", label: "Terminated" },
];

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
];

const PAY_TYPES = [
  { value: "salary", label: "Salary" },
  { value: "hourly", label: "Hourly" },
];

export default function EmployeesPage() {
  const { currentEntity } = useEntity();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    jobTitle: "",
    employmentType: "full-time",
    salary: "",
    payType: "salary",
    hireDate: "",
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const departmentOptions = Array.isArray(departments) ? departments : [];

  const loadEmployees = useCallback(async () => {
    if (!currentEntity) {
      setLoading(false);
      return;
    }
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const response = await employeeService.getEmployees(
        currentEntity._id,
        params,
      );
      setEmployees(
        Array.isArray(response.data.data.employees)
          ? response.data.data.employees
          : [],
      );
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setLoading(false);
    }
  }, [currentEntity, search, statusFilter]);

  const loadDepartments = useCallback(async () => {
    if (!currentEntity) return;
    try {
      const response = await departmentService.getDepartments(
        currentEntity._id,
      );
      setDepartments(
        Array.isArray(response.data.data) ? response.data.data : [],
      );
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [loadEmployees, loadDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEntity) return;

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        departmentId: formData.departmentId,
        jobTitle: formData.jobTitle.trim(),
        employmentType: formData.employmentType,
        salary: Number(formData.salary),
        payType: formData.payType,
        hireDate: formData.hireDate,
      };

      if (!payload.departmentId) {
        throw new Error("Please select a department");
      }

      if (!payload.employmentType) {
        throw new Error("Please select an employment type");
      }

      if (!payload.payType) {
        throw new Error("Please select a pay type");
      }

      if (editingEmployee) {
        await employeeService.updateEmployee(
          currentEntity._id,
          editingEmployee._id,
          payload,
        );
      } else {
        await employeeService.createEmployee(currentEntity._id, payload);
      }
      setModalOpen(false);
      setEditingEmployee(null);
      resetForm();
      loadEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      setFormError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to save employee",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || "",
      departmentId: employee.departmentId?._id || "",
      jobTitle: employee.jobTitle,
      employmentType: employee.employmentType,
      salary: employee.salary,
      payType: employee.payType,
      hireDate: employee.hireDate.split("T")[0],
    });
    setModalOpen(true);
  };

  const handleDelete = async (employee) => {
    if (
      !currentEntity ||
      !window.confirm("Are you sure you want to deactivate this employee?")
    )
      return;
    try {
      await employeeService.deleteEmployee(currentEntity._id, employee._id);
      loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      departmentId: "",
      jobTitle: "",
      employmentType: "full-time",
      salary: "",
      payType: "salary",
      hireDate: "",
    });
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: "email", label: "Email" },
    {
      key: "department",
      label: "Department",
      render: (row) => row.departmentId?.name || "N/A",
    },
    { key: "jobTitle", label: "Job Title" },
    { key: "employmentType", label: "Type" },
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
          <Button variant="danger" size="sm" onClick={() => handleDelete(row)}>
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="hr-employees-page">
      <PageHeader
        title="Employees"
        subtitle="Manage your organization's employees"
        actions={
          <Button
            onClick={() => {
              resetForm();
              setFormError("");
              setModalOpen(true);
            }}
          >
            Add Employee
          </Button>
        }
      />

      <div className="hr-filters">
        <SearchBar
          placeholder="Search employees..."
          value={search}
          onChange={setSearch}
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
      </div>

      <Table
        columns={columns}
        data={employees}
        onRowClick={(row) =>
          (window.location.href = `/hr/employees/${row._id}`)
        }
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEmployee(null);
          setFormError("");
        }}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
      >
        <form onSubmit={handleSubmit} className="hr-form">
          {formError && <div className="form-error">{formError}</div>}
          <div className="hr-form-grid">
            <FormField
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(value) =>
                setFormData({ ...formData, firstName: value })
              }
              required
            />
            <FormField
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(value) =>
                setFormData({ ...formData, lastName: value })
              }
              required
            />
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              required
            />
            <FormField
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />
            <Select
              label="Department"
              options={departmentOptions.map((d) => ({
                value: d._id,
                label: d.name,
              }))}
              placeholder="Select department"
              value={formData.departmentId}
              onChange={(value) =>
                setFormData({ ...formData, departmentId: value })
              }
              required
            />
            <FormField
              label="Job Title"
              type="text"
              value={formData.jobTitle}
              onChange={(value) =>
                setFormData({ ...formData, jobTitle: value })
              }
              required
            />
            <Select
              label="Employment Type"
              options={EMPLOYMENT_TYPES}
              placeholder="Select employment type"
              value={formData.employmentType}
              onChange={(value) =>
                setFormData({ ...formData, employmentType: value })
              }
              required
            />
            <Select
              label="Pay Type"
              options={PAY_TYPES}
              placeholder="Select pay type"
              value={formData.payType}
              onChange={(value) => setFormData({ ...formData, payType: value })}
              required
            />
            <FormField
              label="Salary"
              type="number"
              value={formData.salary}
              onChange={(value) => setFormData({ ...formData, salary: value })}
              required
            />
            <FormField
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(value) =>
                setFormData({ ...formData, hireDate: value })
              }
              required
            />
          </div>
          <div className="hr-form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingEmployee(null);
                setFormError("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : `${editingEmployee ? "Update" : "Create"} Employee`}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
