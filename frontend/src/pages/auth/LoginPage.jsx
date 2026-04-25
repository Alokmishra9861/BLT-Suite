import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import { getEntitiesPublic } from "../../services/entity.service.js";
import CreateEntityModal from "../../components/common/CreateEntityModal.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(
    localStorage.getItem("entityId") || "",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getEntitiesPublic();
        setEntities(list || []);
        // ensure saved selection exists in list
        const saved = localStorage.getItem("entityId");
        if (saved && list.find((e) => e._id === saved)) {
          setSelectedEntity(saved);
        }
      } catch (err) {
        // ignore
      }
    };
    load();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, selectedEntity);
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span>BLT Suite</span>
          <small>Multi-Entity ERP Admin</small>
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to manage entities, finance, and people operations.</p>
        <form onSubmit={handleSubmit}>
          <FormField label="Entity">
            <select
              value={selectedEntity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__create__") {
                  setShowCreateModal(true);
                  return;
                }
                setSelectedEntity(val);
                if (val) localStorage.setItem("entityId", val);
                else localStorage.removeItem("entityId");
              }}
            >
              <option value="">Select entity</option>
              {entities.map((ent) => (
                <option key={ent._id} value={ent._id}>
                  {ent.name || ent.name}
                </option>
              ))}
              {/* <option value="__create__">+ Create New Entity</option> */}
            </select>
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </FormField>
          {error && <div className="form-error">{error}</div>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="auth-hint">
          {selectedEntity ? (
            (() => {
              const ent = entities.find((e) => e._id === selectedEntity);
              if (ent) {
                const code =
                  ent.code ||
                  (ent.name || "").replace(/\s+/g, "-").toLowerCase();
                const email = `admin+${code}@blt.com`;
                const password = "Admin123!";
                return (
                  <div>
                    <strong>Seed admin:</strong>
                    <div>
                      {email} / {password}
                    </div>
                  </div>
                );
              }
              return <span>Select an entity to view seeded credentials</span>;
            })()
          ) : (
            <span>Select an entity to view seeded credentials</span>
          )}
        </div>
        {showCreateModal && (
          <CreateEntityModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
