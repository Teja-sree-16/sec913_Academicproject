import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";
import "../styles/pages/Auth.css";
import { ComponentsIcon } from "../components/Icons";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      if (res.data?.token) {
        onLogin(res.data);
        navigate("/dashboard");
      } else {
        setError(getApiErrorMessage({ response: res }, "Invalid credentials provided."));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Authentication failed. Please verify your connection."));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setForm({ email, password });
    // Auto-fill and submit can be done by typing, or we just fill in the states.
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={login}>
        <ComponentsIcon className="auth-brand-svg" />
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to explore and deploy reusable design system assets.</p>

        {error && (
          <div className="auth-alert-banner">
            <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="auth-group">
          <label htmlFor="login-email">Work Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@company.com"
            required
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>

        <div className="auth-group">
          <label htmlFor="login-password">Security Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? "Authenticating..." : "Access Console"}
        </button>

        <div className="quick-access-box">
          <span>Quick Demo Access:</span>
          <div className="quick-actions-row">
            <button
              type="button"
              className="quick-chip-btn"
              onClick={() => handleQuickLogin("user@gmail.com", "user123")}
            >
              Standard Developer
            </button>
            <button
              type="button"
              className="quick-chip-btn"
              onClick={() => handleQuickLogin("admin@gmail.com", "admin123")}
            >
              System Administrator
            </button>
          </div>
        </div>

        <p className="auth-footer-prompt">
          New to the registry? <Link to="/signup">Register Account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;