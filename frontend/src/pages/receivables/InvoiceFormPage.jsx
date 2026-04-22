import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoiceService } from "../../services/invoiceService";
import { customerService } from "../../services/customerService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import FormField from "../../components/common/FormField";

export const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { entityId } = useEntity();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(!invoiceId);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    currency: "USD",
    lineItems: [{ description: "", quantity: 0, unitPrice: 0 }],
    taxAmount: 0,
    notes: "",
  });

  // Load customers and invoice if editing
  useEffect(() => {
    const load = async () => {
      try {
        const customersData = await customerService.getCustomers(entityId, {
          limit: 999,
        });
        setCustomers(customersData.customers);

        if (invoiceId && invoiceId !== "new") {
          const invoice = await invoiceService.getInvoice(entityId, invoiceId);
          setFormData(invoice);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [entityId, invoiceId]);

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
    if (!formData.customerId) {
      setFormError("Please select a customer.");
      return;
    }
    if (!formData.invoiceNumber?.trim()) {
      setFormError("Invoice number is required.");
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
      if (invoiceId && invoiceId !== "new") {
        await invoiceService.updateInvoice(entityId, invoiceId, formData);
      } else {
        await invoiceService.createInvoice(entityId, formData);
      }
      setFormError("");
      navigate("/receivables/invoices");
    } catch (err) {
      console.error("Error saving invoice:", err);
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Error saving invoice. Please check the form and try again.";
      setFormError(message);
    }
  };

  const totals = calculateTotals(formData.lineItems, formData.taxAmount);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <PageHeader title={invoiceId ? "Edit Invoice" : "Create Invoice"} />

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {formError && (
          <div className="text-sm text-red-600 mb-4">{formError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) =>
                setFormData({ ...formData, customerId: e.target.value })
              }
              disabled={!!invoiceId}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: "#d1d5db", minHeight: "40px" }}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <FormField
            label="Invoice Number"
            value={formData.invoiceNumber}
            onChange={(value) =>
              setFormData({ ...formData, invoiceNumber: value })
            }
            required
            disabled={!!invoiceId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <FormField
            label="Issue Date"
            type="date"
            value={formData.issueDate}
            onChange={(value) => setFormData({ ...formData, issueDate: value })}
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
            label={invoiceId ? "Update Invoice" : "Create Invoice"}
            variant="primary"
          />
          <Button
            onClick={() => navigate("/receivables/invoices")}
            label="Cancel"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
};
