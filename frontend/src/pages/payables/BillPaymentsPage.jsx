import React, { useState, useEffect } from "react";
import { billPaymentService } from "../../services/billPaymentService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";

export const BillPaymentsPage = () => {
  const { entityId } = useEntity();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const data = await billPaymentService.getPayments(entityId, {
          page,
          limit: 10,
        });
        setPayments(data.payments);
        setTotal(data.total);
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [entityId, page]);

  return (
    <div>
      <PageHeader
        title="Bill Payments"
        subtitle="Payment history and records"
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
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
                  Payment Date
                </th>
                <th className="px-6 py-3 text-right font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Method
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody>
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {payment.billId?.billNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.vendorId?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ${payment.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.referenceNumber}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
