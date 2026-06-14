import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";

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
  };

  return (
    <div className="auth-page">
      {/* Left side hero content (60%) */}
      <div className="login-hero-pane">
        <div className="login-hero-header">
          <span className="registry-badge">SMART COMPONENT ACCESS</span>
          <h1 className="login-hero-title">
            Welcome Back to <span>SmartDB</span>
          </h1>
          <p className="login-hero-subtitle">
            Access reusable components, semantic search, analytics dashboard, and design system workspace.
          </p>
        </div>

        <div className="login-stats-row">
          <div className="login-stat-card">
            <strong>120+</strong>
            <span>Components</span>
          </div>
          <div className="login-stat-card">
            <strong>85+</strong>
            <span>Users</span>
          </div>
          <div className="login-stat-card">
            <strong>2.5K+</strong>
            <span>Searches</span>
          </div>
        </div>
      </div>

      {/* Right side login form (40%) */}
      <div className="login-form-pane">
        <form className="login-glass-card" onSubmit={login}>
          <div className="login-logo-wrap">
            <div className="login-glowing-logo" />
          </div>

          <div className="login-title-wrap">
            <h2>Welcome Back</h2>
            <p>Access reusable components and analytics.</p>
          </div>

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
            <label htmlFor="login-password">Password</label>
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

          <div className="login-options-row">
            <label>
              <input type="checkbox" defaultChecked />
              Remember me
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset functionality is handled by your administrator."); }}>
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={loading} className="btn-login-gradient">
            {loading ? "Authenticating..." : "Access Console"}
          </button>

          <div className="login-quick-demo">
            <span>Quick Access:</span>
            <div className="login-quick-row">
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickLogin("user@gmail.com", "user123")}
              >
                Developer
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickLogin("admin@gmail.com", "admin123")}
              >
                Administrator
              </button>
            </div>
          </div>

          <p className="login-footer-prompt">
            Don't have an account? <Link to="/signup">Sign Up →</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
