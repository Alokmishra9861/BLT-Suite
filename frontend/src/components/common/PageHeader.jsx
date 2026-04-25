import React from "react";
import { useEntity } from "../../hooks/useEntity.js";

const PageHeader = ({ title, subtitle, actions }) => {
  const { selectedEntity } = useEntity();
  const scopeText = selectedEntity?.entityType
    ? "Showing records for selected entity only."
    : "Showing records for selected entity only.";

  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        <p className="mt-1 text-xs font-medium text-slate-500">{scopeText}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
