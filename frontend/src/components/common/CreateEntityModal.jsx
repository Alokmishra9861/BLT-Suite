import React, { useState } from "react";
import entityService from "../../services/entity.service.js";

const CreateEntityModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    code: "",
    country: "",
    currency: "",
    timezone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [credentials, setCredentials] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.code) {
      setError("Name and code are required");
      return;
    }

    setLoading(true);
    try {
      const data = await entityService.createEntity({
        name: form.name,
        code: form.code.toUpperCase(),
        country: form.country,
        currency: form.currency,
        timezone: form.timezone,
        active: true,
      });

      // data should contain entity and credentials
      if (data && data.credentials) {
        setCredentials(data.credentials);
      }

      // Auto-select and persist the entity if returned
      if (data && data.entity && data.entity._id) {
        localStorage.setItem("entityId", data.entity._id);
      }

      // Don't close immediately; show credentials and let user close
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create entity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-800">
            Create New Entity
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>
        </div>

        {!credentials ? (
          <form onSubmit={handleSubmit}>
            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">
                  Entity Name
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. CaySports"
                  value={form.name}
                  onChange={handleChange("name")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Code
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="CS"
                  value={form.code}
                  onChange={handleChange("code")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Country
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Cayman Islands"
                  value={form.country}
                  onChange={handleChange("country")}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Currency
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="KYD"
                  value={form.currency}
                  onChange={handleChange("currency")}
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">
                  Timezone
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="America/Cayman"
                  value={form.timezone}
                  onChange={handleChange("timezone")}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-18  flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Entity"}
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS UI */
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h4 className="text-green-700 font-semibold text-lg mb-2">
              ✅ Entity Created Successfully
            </h4>

            <p className="text-sm text-gray-600 mb-4">
              Save these credentials. They will not be shown again.
            </p>

            {/* Credentials Card */}
            <div className="bg-white border rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Email</span>
                <button
                  className="text-blue-500 text-xs"
                  onClick={() =>
                    navigator.clipboard.writeText(credentials.email)
                  }
                >
                  Copy
                </button>
              </div>
              <div className="font-mono text-sm">{credentials.email}</div>

              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-500 text-sm">Password</span>
                <button
                  className="text-blue-500 text-xs"
                  onClick={() =>
                    navigator.clipboard.writeText(credentials.password)
                  }
                >
                  Copy
                </button>
              </div>
              <div className="font-mono text-sm">{credentials.password}</div>
            </div>

            {/* Done Button */}
            <div className="mt-5 text-right">
              <button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEntityModal;
