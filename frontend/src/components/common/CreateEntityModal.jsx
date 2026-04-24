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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Create New Entity</h3>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Name</label>
              <input
                className="mt-1 w-full"
                value={form.name}
                onChange={handleChange("name")}
              />
            </div>
            <div>
              <label className="block text-sm">Code</label>
              <input
                className="mt-1 w-full"
                value={form.code}
                onChange={handleChange("code")}
              />
            </div>
            <div>
              <label className="block text-sm">Country</label>
              <input
                className="mt-1 w-full"
                value={form.country}
                onChange={handleChange("country")}
              />
            </div>
            <div>
              <label className="block text-sm">Currency</label>
              <input
                className="mt-1 w-full"
                value={form.currency}
                onChange={handleChange("currency")}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Timezone</label>
              <input
                className="mt-1 w-full"
                value={form.timezone}
                onChange={handleChange("timezone")}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

          <div className="mt-4 flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>

        {credentials && (
          <div className="bg-green-50 border border-green-200 p-4 rounded mt-4">
            <p className="font-medium">Generated credentials (shown once)</p>
            <p className="mt-2">
              <strong>Email:</strong> {credentials.email}
            </p>
            <p>
              <strong>Password:</strong> {credentials.password}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Save these credentials now — they will not be shown again.
            </p>
            <div className="mt-3 text-right">
              <button
                onClick={() => {
                  onClose();
                  // reload so new entity appears and is selected
                  window.location.reload();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
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
