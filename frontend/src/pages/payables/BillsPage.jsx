import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { billService } from "../../services/billService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import { BillTable } from "../../components/payables/BillTable";
import { BillSummaryCards } from "../../components/payables/BillSummaryCards";
import Button from "../../components/common/Button";

export const BillsPage = () => {
  const navigate = useNavigate();
  const { entityId } = useEntity();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const [billsData, summaryData] = await Promise.all([
          billService.getBills(entityId, {
            page,
            limit: 10,
            search,
            status,
          }),
          billService.getBillSummary(entityId),
        ]);
        setBills(billsData.bills);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error fetching bills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId, page, search, status]);

  const handleDelete = async (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await billService.deleteBill(entityId, billId);
        setBills(bills.filter((b) => b._id !== billId));
      } catch (err) {
        console.error("Error deleting bill:", err);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Bills"
        subtitle="Manage vendor bills"
        actions={
          <Button
            onClick={() => navigate("/payables/bills/new")}
            label="Enter Bill"
            variant="primary"
          />
        }
      />

      <BillSummaryCards summary={summary} />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search bills..."
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
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </div>
      </div>

      <BillTable
        bills={bills}
        onEdit={(id) => navigate(`/payables/bills/${id}/edit`)}
        onView={(id) => navigate(`/payables/bills/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};
