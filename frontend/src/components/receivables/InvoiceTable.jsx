import React from "react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

export const InvoiceTable = ({ invoices, onEdit, onView, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Invoice #
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Customer
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Issue Date
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Due Date
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Total
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Balance Due
            </th>
            <th className="px-6 py-3 text-center font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices && invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr
                key={invoice._id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {invoice.customerId?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  ${invoice.totalAmount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  ${invoice.balanceDue?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-center">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="table-actions">
                    <button
                      onClick={() => onView(invoice._id)}
                      className="table-action table-action-view"
                    >
                      View
                    </button>
                    {invoice.status === "draft" && (
                      <button
                        onClick={() => onEdit(invoice._id)}
                        className="table-action table-action-edit"
                      >
                        Edit
                      </button>
                    )}
                    {invoice.status === "draft" && (
                      <button
                        onClick={() => onDelete(invoice._id)}
                        className="table-action table-action-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                No invoices found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
