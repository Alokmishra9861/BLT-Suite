import { NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Main",
    items: [{ path: "/dashboard", icon: "⊞", text: "Dashboard", live: true }],
  },
  {
    label: "Finance",
    items: [
      { path: "/accounting", icon: "📒", text: "Accounting", live: true },
      {
        path: "/receivables",
        icon: "📄",
        text: "Receivables",
        live: false,
        phase: "Phase 6",
      },
      {
        path: "/payables",
        icon: "💳",
        text: "Payables",
        live: false,
        phase: "Phase 6",
      },
      {
        path: "/banking",
        icon: "🏦",
        text: "Banking",
        live: false,
        phase: "Phase 7",
      },
      {
        path: "/reports",
        icon: "📊",
        text: "Reports",
        live: false,
        phase: "Phase 8",
      },
    ],
  },
  {
    label: "People",
    items: [
      { path: "/hr/employees", icon: "👥", text: "Employees", live: true },
      { path: "/hr/departments", icon: "🏢", text: "Departments", live: true },
      {
        path: "/hr/work-permits",
        icon: "🪪",
        text: "Work Permits",
        live: true,
      },
      {
        path: "/hr/leave-requests",
        icon: "🏖️",
        text: "Leave Requests",
        live: true,
      },
      { path: "/hr/benefits", icon: "🎁", text: "Benefits", live: true },
      {
        path: "/hr/terminations",
        icon: "🚪",
        text: "Terminations",
        live: true,
      },
      {
        path: "/payroll",
        icon: "💰",
        text: "Payroll",
        live: false,
        phase: "Phase 5",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        path: "/audit",
        icon: "🔍",
        text: "Audit",
        live: false,
        phase: "Phase 9",
      },
    ],
  },
];

export default function Sidebar({ isOpen, onCloseSidebar }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <span>BLT Suite</span>
        <small>Business Management</small>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.label} className="sidebar-section">
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              if (!item.live) {
                return (
                  <div
                    key={item.path}
                    className="sidebar-link disabled"
                    title={`Coming soon — ${item.phase}`}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    <span className="sidebar-link-text">{item.text}</span>
                    {item.phase && (
                      <span className="sidebar-badge">{item.phase}</span>
                    )}
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                  onClick={onCloseSidebar}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-text">{item.text}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">BLT Suite v1.0</div>
    </aside>
  );
}
