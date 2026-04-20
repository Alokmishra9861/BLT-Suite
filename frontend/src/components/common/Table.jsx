import React from "react";

const Table = ({ columns = [], data = [] }) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {safeColumns.map((column) => (
              <th key={column.key}>
                {column.header || column.label || column.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 && (
            <tr>
              <td colSpan={safeColumns.length} className="table-empty">
                No records
              </td>
            </tr>
          )}
          {safeData.map((row) => (
            <tr key={row.id || row._id}>
              {safeColumns.map((column) => (
                <td key={column.key}>
                  {typeof column.render === "function"
                    ? column.render(row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
