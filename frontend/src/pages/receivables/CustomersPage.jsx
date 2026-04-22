import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerService } from "../../services/customerService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import { CustomerTable } from "../../components/receivables/CustomerTable";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";

export const CustomersPage = () => {
  const navigate = useNavigate();
  const { entityId } = useEntity();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    taxNumber: "",
    status: "active",
  });

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const data = await customerService.getCustomers(entityId, {
          page,
          limit: 10,
          search,
          status,
        });
        setCustomers(data.customers);
        setTotal(data.total);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [entityId, page, search, status]);

  const handleAdd = () => {
    setEditingId(null);
    setFormError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      taxNumber: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = async (customerId) => {
    try {
      setFormError("");
      const customer = await customerService.getCustomer(entityId, customerId);
      setFormData(customer);
      setEditingId(customerId);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading customer:", err);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await customerService.deleteCustomer(entityId, customerId);
        setCustomers(customers.filter((c) => c._id !== customerId));
      } catch (err) {
        console.error("Error deleting customer:", err);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setFormError("Customer name is required.");
      return;
    }
    if (!formData.email?.trim()) {
      setFormError("Customer email is required.");
      return;
    }

    try {
      if (editingId) {
        await customerService.updateCustomer(entityId, editingId, formData);
      } else {
        await customerService.createCustomer(entityId, formData);
      }
      setFormError("");
      setShowModal(false);
      // Refresh list
      const data = await customerService.getCustomers(entityId, {
        page,
        limit: 10,
        search,
        status,
      });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (err) {
      console.error("Error saving customer:", err);
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Error saving customer. Please check the form and try again.";
      setFormError(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer information"
        actions={
          <Button onClick={handleAdd} label="Add Customer" variant="primary" />
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search customers..."
            value={search}
            onChange={setSearch}
          />
        </div>
        <div style={{ flex: 1 }}>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            style={{ borderColor: "#d1d5db", minHeight: "40px" }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <CustomerTable
        customers={customers}
        onEdit={handleEdit}
        onView={(id) => navigate(`/receivables/customers/${id}`)}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Customer" : "Add Customer"}
      >
        <div className="space-y-4">
          {formError && <div className="text-sm text-red-600">{formError}</div>}
          <FormField
            label="Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
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
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
          />
          <FormField
            label="Address"
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
          />
          <FormField
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(value) =>
              setFormData({ ...formData, contactPerson: value })
            }
          />
          <FormField
            label="Tax Number"
            value={formData.taxNumber}
            onChange={(value) => setFormData({ ...formData, taxNumber: value })}
          />
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            style={{ borderColor: "#d1d5db", minHeight: "40px" }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div
            className="flex gap-2"
            style={{ marginTop: "20px", justifyContent: "flex-end" }}
          >
            <Button
              label={editingId ? "Update" : "Create"}
              onClick={handleSave}
              variant="primary"
              className="flex-1"
            />
            <Button
              label="Cancel"
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
