import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceService } from "../../services/invoiceService";
import { useEntity } from "../../hooks/useEntity";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import { InvoiceTable } from "../../components/receivables/InvoiceTable";
import { InvoiceSummaryCards } from "../../components/receivables/InvoiceSummaryCards";
import Button from "../../components/common/Button";

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const { entityId } = useEntity();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Fetch invoices and summary
  useEffect(() => {
    const fetchData = async () => {
      if (!entityId) return;
      setLoading(true);
      try {
        const [invoicesData, summaryData] = await Promise.all([
          invoiceService.getInvoices(entityId, {
            page,
            limit: 10,
            search,
            status,
          }),
          invoiceService.getInvoiceSummary(entityId),
        ]);
        setInvoices(invoicesData.invoices);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entityId, page, search, status]);

  const handleDelete = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoiceService.deleteInvoice(entityId, invoiceId);
        setInvoices(invoices.filter((inv) => inv._id !== invoiceId));
      } catch (err) {
        console.error("Error deleting invoice:", err);
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="Manage customer invoices"
        actions={
          <Button
            onClick={() => navigate("/receivables/invoices/new")}
            label="Add Invoice"
            variant="primary"
          />
        }
      />

      <InvoiceSummaryCards summary={summary} />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search invoices..."
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
            <option value="sent">Sent</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </div>
      </div>

      <InvoiceTable
        invoices={invoices}
        onEdit={(id) => navigate(`/receivables/invoices/${id}/edit`)}
        onView={(id) => navigate(`/receivables/invoices/${id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};
