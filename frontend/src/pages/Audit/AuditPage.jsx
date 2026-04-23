import { useEffect, useMemo, useState } from "react";
import auditService from "../../services/Audit.service";
import AuditHeader from "../../components/audit/AuditHeader";
import AuditSummaryCards from "../../components/audit/AuditSummaryCards";
import AuditFilters from "../../components/audit/AuditFilters";
import AuditTable from "../../components/audit/AuditTable";
import AuditTimeline from "../../components/audit/AuditTimeline";
import AuditDetailsModal from "../../components/audit/AuditDetailsModal";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    module: "",
    action: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState("");

  const loadLogs = async (activeFilters = filters) => {
    try {
      setLoading(true);
      setError("");
      const res = await auditService.getLogs(activeFilters);
      setLogs(res?.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const summary = useMemo(() => {
    const total = logs.length;
    const creates = logs.filter((l) => l.action === "create").length;
    const updates = logs.filter((l) => l.action === "update").length;
    const deletes = logs.filter((l) => l.action === "delete").length;
    const views = logs.filter((l) => l.action === "view").length;

    return {
      total,
      creates,
      updates,
      deletes,
      views,
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      <AuditHeader viewMode={viewMode} setViewMode={setViewMode} />

      <AuditSummaryCards summary={summary} />

      <AuditFilters
        filters={filters}
        setFilters={setFilters}
        onApply={() => loadLogs(filters)}
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {viewMode === "table" ? (
        <AuditTable
          logs={logs}
          loading={loading}
          onViewDetails={setSelectedLog}
        />
      ) : (
        <AuditTimeline
          logs={logs}
          loading={loading}
          onViewDetails={setSelectedLog}
        />
      )}

      <AuditDetailsModal
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
