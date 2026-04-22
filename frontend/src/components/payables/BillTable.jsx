import React from "react";
import { BillStatusBadge } from "./BillStatusBadge";

export const BillTable = ({ bills, onEdit, onView, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Bill #
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Vendor
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Bill Date
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
          {bills && bills.length > 0 ? (
            bills.map((bill) => (
              <tr
                key={bill._id}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {bill.billNumber}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {bill.vendorId?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(bill.billDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(bill.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  ${bill.totalAmount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-right font-medium text-gray-900">
                  ${bill.balanceDue?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-center">
                  <BillStatusBadge status={bill.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="table-actions">
                    <button
                      onClick={() => onView(bill._id)}
                      className="table-action table-action-view"
                    >
                      View
                    </button>
                    {bill.status === "draft" && (
                      <button
                        onClick={() => onEdit(bill._id)}
                        className="table-action table-action-edit"
                      >
                        Edit
                      </button>
                    )}
                    {bill.status === "draft" && (
                      <button
                        onClick={() => onDelete(bill._id)}
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
                No bills found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
