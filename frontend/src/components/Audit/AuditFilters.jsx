export default function AuditFilters({ filters, setFilters, onLoad }) {
  return (
    <div className="p-4 border rounded-xl bg-white">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <select
          onChange={(e) => setFilters({ ...filters, module: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Modules</option>
          <option value="accounting">Accounting</option>
          <option value="banking">Banking</option>
          <option value="payables">Payables</option>
          <option value="receivables">Receivables</option>
          <option value="hr">HR</option>
          <option value="payroll">Payroll</option>
          <option value="auth">Auth</option>
          <option value="system">System</option>
        </select>

        <select
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="view">View</option>
          <option value="login">Login</option>
        </select>

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border p-2 rounded"
        />

        <button onClick={onLoad} className="bg-black text-white rounded p-2">
          Apply
        </button>
      </div>
    </div>
  );
}
