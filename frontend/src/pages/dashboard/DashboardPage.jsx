import React, { useEffect, useState } from "react";
import KPICard from "../../components/common/KPICard.jsx";
import PageHeader from "../../components/common/PageHeader.jsx";
import LoadingSkeleton from "../../components/common/LoadingSkeleton.jsx";
import dashboardService from "../../services/dashboard.service.js";
import { formatCurrency } from "../../utils/formatters.js";
import { useEntity } from "../../hooks/useEntity.js";

const renderKpiValue = (kpi) => {
  if (kpi?.currency) {
    return formatCurrency(kpi.value, kpi.currency);
  }

  return String(kpi?.value ?? "-");
};

const DashboardPage = () => {
  const { currentEntity, loading: entityLoading } = useEntity();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (entityLoading || !currentEntity?._id) {
      if (isMounted) {
        setLoading(entityLoading);
      }
      return () => {
        isMounted = false;
      };
    }

    const loadSummary = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await dashboardService.getSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || "Failed to load dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [currentEntity?._id, entityLoading]);

  const kpis = summary?.kpis || [];

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Command Center"
        subtitle="Live setup snapshot from MongoDB"
      />
      {!loading && !error && summary?.entity && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <strong>{summary.entity.name}</strong>
          <p style={{ margin: "6px 0 0", color: "var(--ink-60)" }}>
            Code: {summary.entity.code} · Country:{" "}
            {summary.entity.country || "N/A"}
          </p>
        </div>
      )}
      {loading && (
        <div className="panel dashboard-loading">
          <LoadingSkeleton lines={4} />
        </div>
      )}
      {!loading && error && (
        <div className="panel dashboard-error">
          <strong>Unable to load dashboard</strong>
          <p className="form-error">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          <div className="kpi-grid">
            {kpis.map((kpi) => (
              <KPICard
                key={kpi.key}
                label={kpi.label}
                value={renderKpiValue(kpi)}
                trend={kpi.trend}
              />
            ))}
          </div>
          <div className="dashboard-panels">
            <section className="panel">
              <h3>Pending Actions</h3>
              {(summary?.pendingActions || []).length > 0 ? (
                <ul>
                  {(summary?.pendingActions || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No setup actions are required right now.</p>
              )}
            </section>
            <section className="panel">
              <h3>Alerts & Reminders</h3>
              {(summary?.alerts || []).length > 0 ? (
                <ul>
                  {(summary?.alerts || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>No alerts to show.</p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
