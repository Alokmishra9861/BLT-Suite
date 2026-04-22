import React from "react";

export const VendorTable = ({ vendors, onEdit, onView, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Email
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Phone
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              City
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700">
              Status
            </th>
            <th className="px-6 py-3 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {vendors && vendors.length > 0 ? (
            vendors.map((vendor) => (
              <tr
                key={vendor._id}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => onView(vendor._id)}
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {vendor.name}
                </td>
                <td className="px-6 py-4 text-gray-600">{vendor.email}</td>
                <td className="px-6 py-4 text-gray-600">{vendor.phone}</td>
                <td className="px-6 py-4 text-gray-600">{vendor.address}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      vendor.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div
                    className="table-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onEdit(vendor._id)}
                      className="table-action table-action-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(vendor._id)}
                      className="table-action table-action-delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                No vendors found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
