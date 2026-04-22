import { useEffect, useState } from "react";
import auditService from "../../services/Audit.service";
import AuditFilters from "../../components/Audit/AuditFilters";
import AuditTable from "../../components/Audit/AuditTable";
import AuditSummaryCards from "../../components/Audit/AuditSummaryCards";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await auditService.getLogs(filters);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <AuditSummaryCards logs={logs} />

      <AuditFilters
        filters={filters}
        setFilters={setFilters}
        onLoad={loadLogs}
      />

      <AuditTable logs={logs} loading={loading} />
    </div>
  );
}
