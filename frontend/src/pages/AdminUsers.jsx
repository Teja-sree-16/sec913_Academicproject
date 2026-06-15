import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/pages/Admin.css";

function AdminUsers({ onToast }) {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        setUsers(Array.isArray(res.data) ? res.data : []);
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        onToast?.({
          title: "Access Denied",
          message: err.response?.data?.error || "Could not load users.",
          type: "error",
        });
      }
    };
    fetchUsers();
  }, [onToast]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>User Management</h1>
          <p>
            View all registered developers and administrators in the system. 
            Currently tracking {users.length} active users.
          </p>
        </div>
      </div>

      <section className="detail-panel" style={{ padding: "0" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ margin: 0 }}>Registered Users</h2>
        </div>

        {status === "loading" && (
          <div style={{ padding: "24px" }}>
            <p className="console-muted">Loading user data...</p>
          </div>
        )}
        
        {status === "error" && (
          <div style={{ padding: "24px" }}>
            <div className="notice error">
              Failed to fetch users. You might not have administrator privileges.
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="props-table-wrapper" style={{ margin: 0, border: "none" }}>
            <table className="premium-props-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role Clearance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><code className="type-code">{user.id}</code></td>
                    <td><strong>{user.name}</strong></td>
                    <td style={{ color: "var(--muted)" }}>{user.email}</td>
                    <td>
                      <span className="status-badge-clearance" style={{ 
                        background: user.role === 'ADMIN' ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--glass)',
                        color: user.role === 'ADMIN' ? 'var(--primary-strong)' : 'var(--text)',
                        border: user.role === 'ADMIN' ? '1px solid color-mix(in srgb, var(--primary) 30%, transparent)' : '1px solid var(--border)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "40px" }}>
                      <span className="console-muted">No users found.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsers;