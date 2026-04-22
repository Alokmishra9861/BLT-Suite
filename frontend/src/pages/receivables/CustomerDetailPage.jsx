import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../services/customerService";
import { invoiceService } from "../../services/invoiceService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

export const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const { entityId } = useEntity();
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const customerData = await customerService.getCustomer(
          entityId,
          customerId,
        );
        setCustomer(customerData);

        const invoicesData = await invoiceService.getInvoices(entityId, {
          customerId,
          limit: 999,
        });
        setInvoices(invoicesData.invoices);
      } catch (err) {
        console.error("Error loading customer:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [entityId, customerId]);

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div>
      <PageHeader title={customer.name} subtitle="Customer Details" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Email
              </p>
              <p className="text-gray-900">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Phone
              </p>
              <p className="text-gray-900">{customer.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Address
              </p>
              <p className="text-gray-900">{customer.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Contact Person
              </p>
              <p className="text-gray-900">{customer.contactPerson || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Tax Number
              </p>
              <p className="text-gray-900">{customer.taxNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                  customer.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {customer.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Invoice Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Invoices:</span>
              <span className="font-bold">{invoices.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Balance:</span>
              <span className="font-bold text-red-600">
                $
                {invoices
                  .reduce((sum, inv) => sum + (inv.balanceDue || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Invoiced:</span>
              <span className="font-bold">
                $
                {invoices
                  .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-green-600">
                $
                {invoices
                  .reduce((sum, inv) => sum + (inv.amountPaid || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Invoice History
        </h3>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Invoice #
                  </th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">
                    Balance
                  </th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${invoice.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${invoice.balanceDue?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : invoice.status === "partially_paid"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() =>
                          navigate(`/receivables/invoices/${invoice._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No invoices for this customer</p>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => navigate("/receivables/customers")}
          label="Back to Customers"
          variant="secondary"
        />
      </div>
    </div>
  );
};
