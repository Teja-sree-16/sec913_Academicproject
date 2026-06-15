import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";
import "../styles/pages/Auth.css";
import { ComponentsIcon } from "../components/Icons";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await api.post("/auth/signup", form);
      setSuccess("Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={signup}>
        <ComponentsIcon className="auth-brand-svg" />
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join our team of developers cataloging design components.</p>

        {error && (
          <div className="auth-alert-banner">
            <svg className="alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success-banner">
            <svg className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="auth-group">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            placeholder="Alex Morgan"
            required
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>

        <div className="auth-group">
          <label htmlFor="signup-email">Work Email</label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="•••••••• (Min. 6 chars)"
            required
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (error) setError(null);
            }}
          />
        </div>

        <div className="auth-group">
          <label htmlFor="signup-role">Access Clearance</label>
          <select
            id="signup-role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="USER">Standard Developer Access</option>
            <option value="ADMIN">System Administrator Access</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="auth-submit-btn">
          {loading ? "Registering..." : "Create Account"}
        </button>

        <p className="auth-footer-prompt">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;