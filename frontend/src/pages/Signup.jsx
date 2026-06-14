import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const signup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions to proceed.");
      return;
    }

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

  const pwdStrength = getPasswordStrength(form.password);
  const emailValid = isEmailValid(form.email);
  const pwdsMatch = form.password && confirmPassword && form.password === confirmPassword;

  return (
    <div className="auth-page">
      {/* Left side benefits panel (60%) */}
      <div className="login-hero-pane">
        <div className="login-hero-header">
          <span className="registry-badge">JOIN SMARTDB REGISTRY</span>
          <h1 className="login-hero-title">
            Become a <span>Component Contributor</span>
          </h1>
          <p className="login-hero-subtitle">
            Create your account to explore reusable components, submit new patterns, and access intelligent search.
          </p>
        </div>

        <div className="signup-features-grid">
          <div className="login-feature-card">
            <span>🔍</span>
            <strong>Semantic Search</strong>
            <p>Discover reusable components by intent.</p>
          </div>
          <div className="login-feature-card">
            <span>📦</span>
            <strong>Component Registry</strong>
            <p>Browse and contribute modular assets.</p>
          </div>
          <div className="login-feature-card">
            <span>📊</span>
            <strong>Analytics Access</strong>
            <p>Track usage and component performance.</p>
          </div>
          <div className="login-feature-card">
            <span>🛡️</span>
            <strong>Role-Based Access</strong>
            <p>Secure developer and admin permissions.</p>
          </div>
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

      {/* Right side signup form (40%) */}
      <div className="login-form-pane signup-pane">
        <form className="login-glass-card signup-glass-card" onSubmit={signup}>
          <div className="login-title-wrap">
            <h2>Create Account</h2>
            <p>Join the component library workspace.</p>
          </div>

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
            {form.email && (
              <span className={`email-validation-note ${emailValid ? "valid" : "invalid"}`}>
                {emailValid ? "✓ Work email format is valid" : "✗ Please enter a valid email address"}
              </span>
            )}
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
            {form.password && (
              <div className="pwd-strength-container">
                <div className="pwd-strength-bars">
                  <div className={`pwd-strength-bar ${pwdStrength >= 1 ? (pwdStrength <= 2 ? "weak" : pwdStrength <= 3 ? "medium" : "strong") : ""}`} />
                  <div className={`pwd-strength-bar ${pwdStrength >= 3 ? (pwdStrength <= 3 ? "medium" : "strong") : ""}`} />
                  <div className={`pwd-strength-bar ${pwdStrength >= 4 ? "strong" : ""}`} />
                </div>
                <span className="pwd-strength-label">
                  {pwdStrength <= 2 ? "Weak" : pwdStrength <= 3 ? "Medium" : "Strong"}
                </span>
              </div>
            )}
          </div>

          <div className="auth-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
            />
            {confirmPassword && (
              <span className={`pwd-match-note ${pwdsMatch ? "valid" : "invalid"}`}>
                {pwdsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            )}
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

          <div className="login-options-row">
            <label className="signup-terms-label">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              I accept the Terms and Conditions
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-login-gradient">
            {loading ? "Registering..." : "Create Account"}
          </button>

          <p className="signup-footer-prompt-modern">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
