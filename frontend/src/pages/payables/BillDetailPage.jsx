import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { billService } from "../../services/billService";
import { billPaymentService } from "../../services/billPaymentService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import { BillStatusBadge } from "../../components/payables/BillStatusBadge";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import FormField from "../../components/common/FormField";

export const BillDetailPage = () => {
  const navigate = useNavigate();
  const { billId } = useParams();
  const { entityId } = useEntity();
  const [bill, setBill] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: 0,
    paymentMethod: "bank_transfer",
    referenceNumber: "",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const billData = await billService.getBill(entityId, billId);
        setBill(billData);

        const paymentsData = await billPaymentService.getPayments(entityId, {
          billId,
          limit: 999,
        });
        setPayments(paymentsData.payments);
      } catch (err) {
        console.error("Error loading bill:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [entityId, billId]);

  const handleApproveBill = async () => {
    try {
      const updated = await billService.approveBill(entityId, billId);
      setBill(updated);
    } catch (err) {
      console.error("Error approving bill:", err);
    }
  };

  const handleVoidBill = async () => {
    if (window.confirm("Are you sure you want to void this bill?")) {
      try {
        const updated = await billService.voidBill(entityId, billId);
        setBill(updated);
      } catch (err) {
        console.error("Error voiding bill:", err);
      }
    }
  };

  const handleRecordPayment = async () => {
    try {
      await billPaymentService.createPayment(entityId, {
        billId,
        ...paymentData,
      });

      const billData = await billService.getBill(entityId, billId);
      setBill(billData);

      const paymentsData = await billPaymentService.getPayments(entityId, {
        billId,
        limit: 999,
      });
      setPayments(paymentsData.payments);

      setShowPaymentModal(false);
      setPaymentData({
        paymentDate: new Date().toISOString().split("T")[0],
        amount: 0,
        paymentMethod: "bank_transfer",
        referenceNumber: "",
        notes: "",
      });
    } catch (err) {
      console.error("Error recording payment:", err);
      alert("Error recording payment. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!bill) return <div>Bill not found</div>;

  return (
    <div>
      <PageHeader
        title={`Bill ${bill.billNumber}`}
        action={
          bill.status === "draft" && (
            <Button
              onClick={handleApproveBill}
              label="Approve Bill"
              variant="primary"
            />
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bill Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <BillStatusBadge status={bill.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vendor:</span>
              <span className="font-medium">
                {bill.vendorId?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Date:</span>
              <span>{new Date(bill.billDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span>{new Date(bill.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span>{bill.currency}</span>
            </div>
            {bill.category && (
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span>{bill.category}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Totals</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                ${bill.subtotal?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">
                ${bill.taxAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-900 font-semibold">Total Amount:</span>
              <span className="font-bold">
                ${bill.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-medium">
                ${bill.amountPaid?.toFixed(2) || "0.00"}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="text-gray-900 font-semibold">Balance Due:</span>
              <span className="font-bold text-red-600">
                ${bill.balanceDue?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-right py-2 px-4 font-semibold text-gray-700">
                  Qty
                </th>
                <th className="text-right py-2 px-4 font-semibold text-gray-700">
                  Unit Price
                </th>
                <th className="text-right py-2 px-4 font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="text-right py-3 px-4">{item.quantity}</td>
                  <td className="text-right py-3 px-4">
                    ${item.unitPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="text-right py-3 px-4 font-medium">
                    ${item.amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment History
          </h3>
          {bill.balanceDue > 0 && bill.status !== "void" && (
            <Button
              onClick={() => setShowPaymentModal(true)}
              label="Record Payment"
              variant="primary"
            />
          )}
        </div>
        {payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-right py-2 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-200">
                    <td className="py-3 px-4">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      ${payment.amount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="py-3 px-4">{payment.paymentMethod}</td>
                    <td className="py-3 px-4">{payment.referenceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No payments recorded</p>
        )}
      </div>

      <div className="flex gap-4">
        {bill.status === "draft" && (
          <Button
            onClick={() => navigate(`/payables/bills/${billId}/edit`)}
            label="Edit Bill"
            variant="secondary"
          />
        )}
        {bill.status !== "void" && (
          <Button onClick={handleVoidBill} label="Void Bill" variant="danger" />
        )}
        <Button
          onClick={() => navigate("/payables/bills")}
          label="Back to List"
          variant="secondary"
        />
      </div>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Bill Payment"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Balance Due:</p>
            <p className="text-2xl font-bold text-blue-600">
              ${bill.balanceDue?.toFixed(2) || "0.00"}
            </p>
          </div>
          <FormField
            label="Payment Date"
            type="date"
            value={paymentData.paymentDate}
            onChange={(value) =>
              setPaymentData({ ...paymentData, paymentDate: value })
            }
            required
          />
          <FormField
            label="Amount"
            type="number"
            value={paymentData.amount}
            onChange={(value) =>
              setPaymentData({ ...paymentData, amount: parseFloat(value) || 0 })
            }
            required
          />
          <select
            value={paymentData.paymentMethod}
            onChange={(e) =>
              setPaymentData({ ...paymentData, paymentMethod: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            style={{ borderColor: "#d1d5db", minHeight: "40px" }}
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="other">Other</option>
          </select>
          <FormField
            label="Reference Number"
            value={paymentData.referenceNumber}
            onChange={(value) =>
              setPaymentData({ ...paymentData, referenceNumber: value })
            }
          />
          <FormField
            label="Notes"
            value={paymentData.notes}
            onChange={(value) =>
              setPaymentData({ ...paymentData, notes: value })
            }
          />
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleRecordPayment}
              label="Record Payment"
              variant="primary"
              className="flex-1"
            />
            <Button
              onClick={() => setShowPaymentModal(false)}
              label="Cancel"
              variant="secondary"
              className="flex-1"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
