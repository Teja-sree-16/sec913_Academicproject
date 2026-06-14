import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";

const categoryIcons = {
  Generic: "🧩",
  Frontend: "🎨",
  Backend: "⚙️",
  Database: "🗄️",
  Dashboard: "📊",
  Authentication: "🔐",
};

function AddComponent() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    tags: "",
    version: "1.0.0",
    status: "Published",
    previewImage: "Generic",
    description: "",
    documentation: "",
    codeSnippet: "",
    usageExample: "",
    propsTable: "",
    installationGuide: "",
    accessibilityNotes: "",
    bestPractices: "",
    createdBy: localStorage.getItem("email"),
  });

  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [activeTab, setActiveTab] = useState("description");


  if (role !== "ADMIN") {
    return <h2 className="page">Only ADMIN can add components</h2>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Saving component to PostgreSQL..." });

    try {
      const res = await api.post("/components", form);
      setStatus({ type: "success", message: "Component saved successfully." });
      navigate(`/component/${res.data.id}`);
    } catch (error) {
      setStatus({
        type: "error",
        message: getApiErrorMessage(error, "Unable to save component. Check gateway/backend services."),
      });
    }
  };

  const getTagsArray = () => {
    if (!form.tags) return [];
    return form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  const selectedIcon = categoryIcons[form.previewImage] || "🧩";
  
  const isFormReady = 
    form.name.trim() !== "" && 
    form.category.trim() !== "" && 
    form.description.trim() !== "" && 
    form.documentation.trim() !== "" && 
    form.usageExample.trim() !== "" && 
    form.codeSnippet.trim() !== "";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Add Component</h1>
          <p>Create a reusable component record. The submitted data is persisted through the gateway into PostgreSQL.</p>
        </div>
      </div>

      <form className="add-component-layout" onSubmit={submit}>
        {/* LEFT COLUMN: Forms */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Card 1: Basic Information */}
          <div className="form-section-card">
            <h3 style={{ margin: "0 0 16px 0", color: "#22d3ee", borderBottom: "1px solid rgba(34, 211, 238, 0.15)", paddingBottom: "8px", fontSize: "1.1rem" }}>
              Basic Information
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="admin-group">
                <label htmlFor="comp-name">Component Name</label>
                <input
                  id="comp-name"
                  placeholder="Component Name"
                  value={form.name}
                  required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="admin-group">
                <label htmlFor="comp-category">Category</label>
                <input
                  id="comp-category"
                  placeholder="Category"
                  value={form.category}
                  required
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>

              <div className="admin-group">
                <label htmlFor="comp-type">Component Type</label>
                <select
                  id="comp-type"
                  value={form.previewImage}
                  onChange={(e) => setForm({ ...form, previewImage: e.target.value })}
                >
                  <option value="Generic">Generic</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Database">Database</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Authentication">Authentication</option>
                </select>
              </div>

              <div className="admin-group">
                <label htmlFor="comp-status">Status</label>
                <select
                  id="comp-status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Published">Published</option>
                  <option value="Deprecated">Deprecated</option>
                </select>
              </div>

              <div className="admin-group">
                <label htmlFor="comp-version">Version</label>
                <input
                  id="comp-version"
                  placeholder="1.0.0"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>

              <div className="admin-group">
                <label htmlFor="comp-tags">Tags (comma separated)</label>
                <input
                  id="comp-tags"
                  placeholder="Tags (comma separated)"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Documentation Tabs */}
          <div className="form-section-card">
            <div className="doc-tabs-row">
              <button
                type="button"
                className={`doc-tab-btn ${activeTab === "description" ? "active" : ""}`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                type="button"
                className={`doc-tab-btn ${activeTab === "documentation" ? "active" : ""}`}
                onClick={() => setActiveTab("documentation")}
              >
                Documentation
              </button>
              <button
                type="button"
                className={`doc-tab-btn ${activeTab === "usage" ? "active" : ""}`}
                onClick={() => setActiveTab("usage")}
              >
                Usage
              </button>
              <button
                type="button"
                className={`doc-tab-btn ${activeTab === "code" ? "active" : ""}`}
                onClick={() => setActiveTab("code")}
              >
                Code
              </button>
            </div>

            {activeTab === "description" && (
              <div className="admin-group">
                <label htmlFor="comp-description">Short Description *</label>
                <textarea
                  id="comp-description"
                  placeholder="Describe the component's functionality and scope..."
                  value={form.description}
                  required
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: "100%", minHeight: "140px" }}
                />
              </div>
            )}

            {activeTab === "documentation" && (
              <div className="admin-group">
                <label htmlFor="comp-documentation">Full Documentation *</label>
                <textarea
                  id="comp-documentation"
                  placeholder="Detailed Markdown manuals, architecture guidelines..."
                  value={form.documentation}
                  required
                  onChange={(e) => setForm({ ...form, documentation: e.target.value })}
                  style={{ width: "100%", minHeight: "140px" }}
                />
              </div>
            )}

            {activeTab === "usage" && (
              <div className="admin-group">
                <label htmlFor="comp-usage">Usage Example *</label>
                <textarea
                  id="comp-usage"
                  placeholder="import { MyComponent } from 'registry';\n\n..."
                  value={form.usageExample}
                  required
                  onChange={(e) => setForm({ ...form, usageExample: e.target.value })}
                  style={{ width: "100%", minHeight: "140px", fontFamily: "monospace" }}
                />
              </div>
            )}

            {activeTab === "code" && (
              <div className="admin-group">
                <label htmlFor="comp-code">Source Code Snippet *</label>
                <textarea
                  id="comp-code"
                  placeholder="const MyComponent = () => {\n  return <div>Source Code</div>;\n};"
                  value={form.codeSnippet}
                  required
                  onChange={(e) => setForm({ ...form, codeSnippet: e.target.value })}
                  style={{ width: "100%", minHeight: "140px", fontFamily: "monospace" }}
                />
              </div>
            )}
          </div>

          {status.message && (
            <p className={`notice ${status.type === "error" ? "error" : "success"}`} style={{ padding: "10px", borderRadius: "8px", marginBottom: "16px" }}>
              {status.message}
            </p>
          )}

          {/* Action buttons at the bottom */}
          <div className="admin-actions-row">
            <button
              type="button"
              className="btn-admin-cancel"
              disabled={status.type === "loading"}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-admin-draft"
              disabled={status.type === "loading"}
              onClick={() => { form.status = "Draft"; }}
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="btn-admin-primary"
              disabled={status.type === "loading"}
              onClick={() => { if (form.status === "Draft") form.status = "Published"; }}
            >
              {status.type === "loading" ? "Saving..." : "Add Component"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Component Summary Sticky Card */}
        <div>
          <div className="component-live-preview">
            <h4 style={{ margin: "0 0 16px 0", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em", color: "#64748b", fontWeight: "700" }}>
              Component Summary
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <span style={{ fontSize: "2.2rem", display: "flex", alignItems: "center", gap: "10px", fontWeight: "700", color: "#ffffff" }}>
                {selectedIcon} {form.previewImage}
              </span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(36, 178, 255, 0.15)", paddingTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "#8fa7c7" }}>Category :</span>
                  <span style={{ color: "#ffffff", fontWeight: "600" }}>{form.category || "General"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "#8fa7c7" }}>Status   :</span>
                  <span style={{ color: "#ffffff", fontWeight: "600" }}>{form.status}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "#8fa7c7" }}>Version  :</span>
                  <span style={{ color: "#ffffff", fontWeight: "600" }}>v{form.version || "1.0.0"}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(36, 178, 255, 0.15)", paddingTop: "12px" }}>
                <span style={{ fontSize: "0.8rem", color: "#8fa7c7", display: "block", marginBottom: "6px" }}>Tags</span>
                {getTagsArray().length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {getTagsArray().map((tag, idx) => (
                      <span key={idx} className="admin-preview-tag-pill" style={{ color: "#24b2ff" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic" }}>No tags defined</span>
                )}
              </div>

              <div style={{ borderTop: "1px solid rgba(36, 178, 255, 0.15)", paddingTop: "12px", marginTop: "4px" }}>
                {isFormReady ? (
                  <span style={{ color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                    ✓ Ready to Submit
                  </span>
                ) : (
                  <span style={{ color: "#f59e0b", fontWeight: "600", fontSize: "0.85rem" }}>
                    ⚠️ Missing required fields
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddComponent;
