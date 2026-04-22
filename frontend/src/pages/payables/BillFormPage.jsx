import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { billService } from "../../services/billService";
import { vendorService } from "../../services/vendorService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";

export const BillFormPage = () => {
  const navigate = useNavigate();
  const { billId } = useParams();
  const { entityId } = useEntity();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(!billId);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    vendorId: "",
    billNumber: "",
    billDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    currency: "USD",
    category: "",
    lineItems: [{ description: "", quantity: 0, unitPrice: 0 }],
    taxAmount: 0,
    notes: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const vendorsData = await vendorService.getVendors(entityId, {
          limit: 999,
        });
        setVendors(vendorsData.vendors);

        if (billId && billId !== "new") {
          const bill = await billService.getBill(entityId, billId);
          setFormData(bill);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityId, billId]);

  const calculateTotals = (items, taxAmount) => {
    let subtotal = 0;
    items.forEach((item) => {
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;
    });
    return {
      subtotal,
      totalAmount: subtotal + taxAmount,
    };
  };

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: "", quantity: 0, unitPrice: 0 },
      ],
    });
  };

  const handleRemoveLineItem = (index) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...formData.lineItems];
    newItems[index][field] =
      field === "description" ? value : parseFloat(value) || 0;
    setFormData({ ...formData, lineItems: newItems });
  };

  const handleSave = async () => {
    if (!formData.vendorId) {
      setFormError("Please select a vendor.");
      return;
    }
    if (!formData.billNumber?.trim()) {
      setFormError("Bill number is required.");
      return;
    }
    if (!formData.lineItems?.length) {
      setFormError("At least one line item is required.");
      return;
    }
    const hasEmptyDescription = formData.lineItems.some(
      (item) => !item.description?.trim(),
    );
    if (hasEmptyDescription) {
      setFormError("Line item description is required.");
      return;
    }

    try {
      if (billId && billId !== "new") {
        await billService.updateBill(entityId, billId, formData);
      } else {
        await billService.createBill(entityId, formData);
      }
      setFormError("");
      navigate("/payables/bills");
    } catch (err) {
      console.error("Error saving bill:", err);
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Error saving bill. Please check the form and try again.";
      setFormError(message);
    }
  };

  const totals = calculateTotals(formData.lineItems, formData.taxAmount);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <PageHeader title={billId ? "Edit Bill" : "Create Bill"} />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {formError && (
          <div className="text-sm text-red-600 mb-4">{formError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor *
            </label>
            <select
              value={formData.vendorId}
              onChange={(e) =>
                setFormData({ ...formData, vendorId: e.target.value })
              }
              disabled={!!billId}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "#d1d5db", minHeight: "40px" }}
            >
              <option value="">Select vendor...</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Bill Number"
            value={formData.billNumber}
            onChange={(value) =>
              setFormData({ ...formData, billNumber: value })
            }
            required
            disabled={!!billId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FormField
            label="Bill Date"
            type="date"
            value={formData.billDate}
            onChange={(value) => setFormData({ ...formData, billDate: value })}
            required
          />
          <FormField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(value) => setFormData({ ...formData, dueDate: value })}
            required
          />
          <FormField
            label="Currency"
            value={formData.currency}
            onChange={(value) => setFormData({ ...formData, currency: value })}
          />
        </div>

        <FormField
          label="Category"
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
        />

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Line Items
          </h3>
          <div className="space-y-4">
            {formData.lineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <FormField
                  label={index === 0 ? "Description" : ""}
                  value={item.description}
                  onChange={(value) =>
                    handleLineItemChange(index, "description", value)
                  }
                  placeholder="Description"
                />
                <FormField
                  label={index === 0 ? "Qty" : ""}
                  type="number"
                  value={item.quantity}
                  onChange={(value) =>
                    handleLineItemChange(index, "quantity", value)
                  }
                  placeholder="Quantity"
                />
                <FormField
                  label={index === 0 ? "Unit Price" : ""}
                  type="number"
                  value={item.unitPrice}
                  onChange={(value) =>
                    handleLineItemChange(index, "unitPrice", value)
                  }
                  placeholder="Unit Price"
                />
                <div className="flex items-end">
                  {formData.lineItems.length > 1 && (
                    <button
                      onClick={() => handleRemoveLineItem(index)}
                      className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={handleAddLineItem}
            label="Add Line Item"
            variant="secondary"
            className="mt-4"
          />
        </div>

        <div className="mb-6">
          <FormField
            label="Tax Amount"
            type="number"
            value={formData.taxAmount}
            onChange={(value) =>
              setFormData({ ...formData, taxAmount: parseFloat(value) || 0 })
            }
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium">
              ${formData.taxAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-gray-300">
            <span className="text-gray-900 font-semibold">Total:</span>
            <span className="text-gray-900 font-bold text-lg">
              ${totals.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => setFormData({ ...formData, notes: value })}
          rows="4"
        />

        <div className="flex gap-4 pt-6">
          <Button
            onClick={handleSave}
            label={billId ? "Update Bill" : "Create Bill"}
            variant="primary"
          />
          <Button
            onClick={() => navigate("/payables/bills")}
            label="Cancel"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
};
