import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
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
          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
            />
          </FormField>
          <FormField label="Password">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </FormField>
          {error && <div className="form-error">{error}</div>}
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="auth-hint">
          <span>Seed admin: admin@blt-suite.local / Admin123!@#</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
