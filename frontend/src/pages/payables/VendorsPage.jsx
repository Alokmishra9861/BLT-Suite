import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../../services/vendorService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import { VendorTable } from "../../components/payables/VendorTable";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";

export const VendorsPage = () => {
  const navigate = useNavigate();
  const { entityId } = useEntity();
  const [vendors, setVendors] = useState([]);
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

  useEffect(() => {
    const fetchVendors = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const data = await vendorService.getVendors(entityId, {
          page,
          limit: 10,
          search,
          status,
        });
        setVendors(data.vendors);
        setTotal(data.total);
      } catch (err) {
        console.error("Error fetching vendors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
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

  const handleEdit = async (vendorId) => {
    try {
      setFormError("");
      const vendor = await vendorService.getVendor(entityId, vendorId);
      setFormData(vendor);
      setEditingId(vendorId);
      setShowModal(true);
    } catch (err) {
      console.error("Error loading vendor:", err);
    }
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await vendorService.deleteVendor(entityId, vendorId);
        setVendors(vendors.filter((v) => v._id !== vendorId));
      } catch (err) {
        console.error("Error deleting vendor:", err);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setFormError("Vendor name is required.");
      return;
    }
    if (!formData.email?.trim()) {
      setFormError("Vendor email is required.");
      return;
    }

    try {
      if (editingId) {
        await vendorService.updateVendor(entityId, editingId, formData);
      } else {
        await vendorService.createVendor(entityId, formData);
      }
      setFormError("");
      setShowModal(false);
      const data = await vendorService.getVendors(entityId, {
        page,
        limit: 10,
        search,
        status,
      });
      setVendors(data.vendors);
      setTotal(data.total);
    } catch (err) {
      console.error("Error saving vendor:", err);
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Error saving vendor. Please check the form and try again.";
      setFormError(message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Manage your vendor information"
        actions={
          <Button onClick={handleAdd} label="Add Vendor" variant="primary" />
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search vendors..."
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

      <VendorTable
        vendors={vendors}
        onEdit={handleEdit}
        onView={(id) => navigate(`/payables/vendors/${id}`)}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Vendor" : "Add Vendor"}
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
          <div className="flex gap-2 pt-4">
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
