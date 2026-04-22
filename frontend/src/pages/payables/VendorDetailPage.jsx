import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vendorService } from "../../services/vendorService";
import { billService } from "../../services/billService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

export const VendorDetailPage = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { entityId } = useEntity();
  const [vendor, setVendor] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const vendorData = await vendorService.getVendor(entityId, vendorId);
        setVendor(vendorData);

        const billsData = await billService.getBills(entityId, {
          vendorId,
          limit: 999,
        });
        setBills(billsData.bills);
      } catch (err) {
        console.error("Error loading vendor:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [entityId, vendorId]);

  if (loading) return <div>Loading...</div>;
  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div>
      <PageHeader title={vendor.name} subtitle="Vendor Details" />

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
              <p className="text-gray-900">{vendor.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Phone
              </p>
              <p className="text-gray-900">{vendor.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Address
              </p>
              <p className="text-gray-900">{vendor.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Contact Person
              </p>
              <p className="text-gray-900">{vendor.contactPerson || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Tax Number
              </p>
              <p className="text-gray-900">{vendor.taxNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Status
              </p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                  vendor.status === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {vendor.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bill Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Bills:</span>
              <span className="font-bold">{bills.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding Payable:</span>
              <span className="font-bold text-red-600">
                $
                {bills
                  .reduce((sum, bill) => sum + (bill.balanceDue || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Billed:</span>
              <span className="font-bold">
                $
                {bills
                  .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-green-600">
                $
                {bills
                  .reduce((sum, bill) => sum + (bill.amountPaid || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Bill History
        </h3>
        {bills && bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Bill #
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
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-b border-gray-200">
                    <td className="py-3 px-4 font-medium">{bill.billNumber}</td>
                    <td className="py-3 px-4">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${bill.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="text-right py-3 px-4">
                      ${bill.balanceDue?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          bill.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : bill.status === "partially_paid"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => navigate(`/payables/bills/${bill._id}`)}
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
          <p className="text-gray-600 text-sm">No bills for this vendor</p>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={() => navigate("/payables/vendors")}
          label="Back to Vendors"
          variant="secondary"
        />
      </div>
    </div>
  );
};
