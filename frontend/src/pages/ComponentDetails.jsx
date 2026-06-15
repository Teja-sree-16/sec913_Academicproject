import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CodeIcon, CopyIcon, EyeIcon, DocsIcon, HeartIcon, StarIcon, TrashIcon } from "../components/Icons";
import api from "../api/axios";
import { REAL_COMPONENTS_MAP } from "../components/RealComponents";
import { CodeHighlight } from "../components/CodeHighlight";
import "../styles/pages/ComponentDetails.css";

const withDocumentationDefaults = (component) => {
  const realData = REAL_COMPONENTS_MAP[component.name] || {};
  return {
    ...component,
    tags: component.tags || [component.category, component.name].join(", "),
    version: component.version || "1.0.0",
    status: component.status || "Published",
    codeSnippet: realData.code || component.codeSnippet || "<Component />",
    usageExample: realData.usage || component.usageExample || component.codeSnippet || "<Component />",
    propsTable:
      component.propsTable ||
      "prop | type | required | description\nname | string | yes | Component label\nvariant | string | no | Visual style\nonClick | function | no | Event callback",
    installationGuide:
      component.installationGuide ||
      "Install the internal design system package, import the component, then pass the documented props from your feature module.",
    accessibilityNotes:
      component.accessibilityNotes ||
      "Verify keyboard navigation, focus visibility, color contrast, semantic labels, and screen-reader announcements.",
    bestPractices:
      component.bestPractices ||
      "Use design tokens, document edge cases, avoid unnecessary variants, and test loading, empty, error, and success states.",
  };
};

function renderPropsTable(propsText) {
  if (!propsText) return <p className="console-muted">No parameters documented.</p>;
  const lines = propsText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return <p className="console-muted">No parameters documented.</p>;

  const rows = lines.map((line) => line.split("|").map((cell) => cell.trim()));
  const hasHeader = rows[0].some((cell) =>
    ["name", "prop", "type", "required", "description"].includes(cell.toLowerCase())
  );
  const headerRow = hasHeader ? rows[0] : ["Prop Name", "Type", "Required", "Description"];
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return (
    <div className="props-table-wrapper">
      <table className="premium-props-table">
        <thead>
          <tr>
            {headerRow.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                if (ci === 2) {
                  const isReq = cell.toLowerCase() === "yes" || cell.toLowerCase() === "true" || cell.toLowerCase() === "required";
                  return (
                    <td key={ci}>
                      <span className={`req-badge ${isReq ? "req-yes" : "req-no"}`}>
                        {cell}
                      </span>
                    </td>
                  );
                }
                if (ci === 1) {
                  return (
                    <td key={ci}>
                      <code className="type-code">{cell}</code>
                    </td>
                  );
                }
                return <td key={ci}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComponentDetails({ onToast }) {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("code");
  
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const userEmail = localStorage.getItem("email");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [compRes, favRes, revRes] = await Promise.all([
          api.get("/components"),
          api.get("/favorites"),
          api.get(`/reviews?componentId=${id}`)
        ]);

        if (isMounted) {
          const records = Array.isArray(compRes.data) ? compRes.data : [];
          const selectedRecord = records.find((item) => String(item.id) === String(id));
          setComponent(selectedRecord ? withDocumentationDefaults(selectedRecord) : null);
          setStatus(selectedRecord ? "ready" : "missing");

          const favs = Array.isArray(favRes.data) ? favRes.data : [];
          // Note: Node.js API returns favorite_id as well, but the component data is spread in it.
          // favs has the actual component objects including `id`.
          setIsFavorite(favs.some(f => String(f.id) === String(id)));

          setReviews(Array.isArray(revRes.data) ? revRes.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/favorites/component/${id}`);
        setIsFavorite(false);
        onToast?.({ title: "Removed from Favorites", type: "info" });
      } else {
        await api.post("/favorites", { componentId: id });
        setIsFavorite(true);
        onToast?.({ title: "Added to Favorites", type: "success" });
      }
    } catch {
      onToast?.({ title: "Action Failed", type: "error" });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/reviews", { componentId: id, rating, comment: reviewText });
      setReviews([res.data, ...reviews]);
      setReviewText("");
      setRating(5);
      onToast?.({ title: "Review Added", type: "success" });
    } catch (err) {
      onToast?.({ 
        title: "Review Failed", 
        message: err.response?.data?.error || "Could not submit review", 
        type: "error" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
      onToast?.({ title: "Review Deleted", type: "info" });
    } catch {
      onToast?.({ title: "Delete Failed", type: "error" });
    }
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code || "<Component />");
    onToast?.({
      title: "Code copied",
      message: "Snippet copied to clipboard.",
      type: "success",
    });
  };

  const handleUseComponent = async () => {
    const usage = component.usageExample || component.codeSnippet || `<${component.name?.replace(/\s+/g, "") || "Component"} />`;

    await navigator.clipboard.writeText(usage);
    onToast?.({
      title: "Usage copied",
      message: `${component.name} is ready to paste into your app.`,
      type: "success",
    });
  };

  if (status === "loading") {
    return (
      <div className="page">
        <div className="skeleton-detail">
          <span className="skeleton-line short" />
          <span className="skeleton-line title" />
          <span className="skeleton-line" />
          <span className="skeleton-line" />
          <span className="skeleton-line tall" />
        </div>
      </div>
    );
  }
  if (status === "missing" || status === "error") {
    return (
      <div className="page component-empty-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Component Showcase</p>
            <h1>Reusable UI Component Registry</h1>
            <p>
              A curated library of production-ready interface patterns for forms, navigation,
              dashboards, and feedback states. Each entry includes a purpose, implementation
              snippet, usage example, category, and ownership details.
            </p>
          </div>
          <Link className="button-link" to="/components">
            Back to Library
          </Link>
        </div>

        <section className="detail-panel">
          <h2>About This Showcase</h2>
          <p>
            The showcase helps teams discover reusable components before building the same UI
            again. Users can browse available components after login, inspect documentation,
            copy ready-to-use examples, and search by name or description. Admin users can add
            new components so the registry grows with the application.
          </p>
        </section>

        <section className="detail-panel detail-meta-panel">
          <h2>Library Specifications</h2>
          <dl className="component-meta-list detail-meta-list">
            <div>
              <dt>Storage</dt>
              <dd>Relational Database Catalog</dd>
            </div>
            <div>
              <dt>Access</dt>
              <dd>Authenticated Developers Only</dd>
            </div>
            <div>
              <dt>Governance</dt>
              <dd>Admin Reviewed & Managed</dd>
            </div>
            <div>
              <dt>Core Library</dt>
              <dd>10 production components</dd>
            </div>
          </dl>
        </section>

        <section className="detail-panel">
          <h2>Included Component Areas</h2>
          <div className="showcase-detail-grid">
            <article>
              <h3>Forms</h3>
              <p>Email validation, multi-step signup flows, and guided data entry patterns.</p>
            </article>
            <article>
              <h3>Navigation</h3>
              <p>Role-aware sidebars, breadcrumbs, and helpers for moving through nested views.</p>
            </article>
            <article>
              <h3>Dashboards</h3>
              <p>Metric cards, activity timelines, and table toolbars for operational screens.</p>
            </article>
            <article>
              <h3>Feedback</h3>
              <p>Toast centers, confirmation dialogs, and empty states for clear user guidance.</p>
            </article>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{component.category || "Uncategorized"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h1>{component.name}</h1>
            <button 
              type="button" 
              className={`icon-button ${isFavorite ? "active-favorite" : ""}`}
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              style={{ color: isFavorite ? "#e74c3c" : "inherit" }}
            >
              <HeartIcon fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          <p>Created by {component.createdBy || "unknown"} · v{component.version} · {component.status}</p>
        </div>
        <Link className="button-link" to="/components">
          Back to Library
        </Link>
      </div>

      <div className="preview-split-stage">
        <div className="preview-pane-left">
          <div className="pane-header-mini">
            <h3><EyeIcon /> Interactive Stage</h3>
            <div className="stage-theme-dot" />
          </div>
          <div className="component-preview-box preview-device-desktop preview-theme-dark">
            {(() => {
              const PreviewComp = REAL_COMPONENTS_MAP[component.name]?.Preview;
              return PreviewComp ? (
                <PreviewComp />
              ) : (
                <div className="no-preview-placeholder">
                  {component.previewImage && (
                    <img src={component.previewImage} alt="" className="fallback-preview-img" />
                  )}
                  <strong>{component.name}</strong>
                  <p>{component.description}</p>
                  <button type="button" onClick={handleUseComponent} className="primary-action-btn">
                    Use Component
                  </button>
                </div>
              );
            })()}
          </div>
          
          <div className="detail-meta-box">
            <h4>Component Identifier</h4>
            <code>{component.id}</code>
            
            <h4 style={{ marginTop: "12px" }}>Access Clearance</h4>
            <span className="status-badge-clearance">{component.status}</span>
          </div>

          <div className="reviews-section" style={{ marginTop: "24px", padding: "16px", backgroundColor: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <h3 style={{ marginBottom: "16px" }}><StarIcon fill="currentColor" /> Component Reviews</h3>
            
            <form onSubmit={submitReview} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Rating:</span>
                {[1, 2, 3, 4, 5].map(r => (
                  <button 
                    key={r} 
                    type="button" 
                    onClick={() => setRating(r)}
                    style={{ background: "none", border: "none", color: r <= rating ? "#f1c40f" : "#555", cursor: "pointer", fontSize: "1.2rem" }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Share your experience using this component..." 
                value={reviewText} 
                onChange={(e) => setReviewText(e.target.value)}
                style={{ width: "100%", padding: "12px", minHeight: "80px", borderRadius: "4px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-color)", resize: "vertical" }}
              />
              <button type="submit" disabled={submitting || !reviewText.trim()} className="primary-button" style={{ alignSelf: "flex-end" }}>
                {submitting ? "Submitting..." : "Post Review"}
              </button>
            </form>

            <div className="reviews-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.length === 0 ? (
                <p className="console-muted">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {review.user_email}
                        <span style={{ color: "#f1c40f" }}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
                      </strong>
                      {(userEmail === review.user_email || userRole === "ADMIN") && (
                        <button type="button" onClick={() => deleteReview(review.id)} className="icon-text-button" style={{ color: "var(--text-muted)" }}>
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.95rem" }}>{review.comment}</p>
                    <small className="console-muted">{new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="preview-pane-right">
          <div className="tab-switcher-row">
            <button
              type="button"
              className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              <CodeIcon /> React Component Code
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "usage" ? "active" : ""}`}
              onClick={() => setActiveTab("usage")}
            >
              <CodeIcon /> Usage Example
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "docs" ? "active" : ""}`}
              onClick={() => setActiveTab("docs")}
            >
              <DocsIcon /> Specs & API
            </button>
          </div>

          <div className="tab-stage-content">
            {activeTab === "code" && (
              <div className="code-tab-panel">
                <div className="code-panel-header">
                  <span>JSX Template source</span>
                  <button type="button" className="icon-text-button" onClick={() => copyCode(component.codeSnippet)}>
                    <CopyIcon /> Copy Template
                  </button>
                </div>
                <CodeHighlight code={component.codeSnippet} />
              </div>
            )}

            {activeTab === "usage" && (
              <div className="code-tab-panel">
                <div className="code-panel-header">
                  <span>Integration example code</span>
                  <button type="button" className="icon-text-button" onClick={() => copyCode(component.usageExample)}>
                    <CopyIcon /> Copy Usage
                  </button>
                </div>
                <CodeHighlight code={component.usageExample} />
              </div>
            )}

            {activeTab === "docs" && (
              <div className="docs-tab-panel">
                <div className="docs-section">
                  <h4>Functional Description</h4>
                  <p className="docs-desc-p">{component.description || "No description provided."}</p>
                </div>

                <div className="docs-section">
                  <h4>API References & Parameters</h4>
                  {renderPropsTable(component.propsTable)}
                </div>

                <div className="docs-meta-grid">
                  <div>
                    <strong>Category:</strong>
                    <span>{component.category || "General"}</span>
                  </div>
                  <div>
                    <strong>Clearance:</strong>
                    <span>{component.status || "Published"}</span>
                  </div>
                  <div>
                    <strong>Version:</strong>
                    <span>v{component.version || "1.0.0"}</span>
                  </div>
                  <div>
                    <strong>Author:</strong>
                    <span>{component.createdBy || "Design System"}</span>
                  </div>
                </div>

                <div className="docs-section">
                  <h4>Installation Instructions</h4>
                  <div className="installation-block">
                    <code>npm install @design-system/{component.name?.toLowerCase().replace(/\s+/g, "-")}</code>
                    <button type="button" className="copy-icon-btn" onClick={() => copyCode(`npm install @design-system/${component.name?.toLowerCase().replace(/\s+/g, "-")}`)}>
                      <CopyIcon />
                    </button>
                  </div>
                  <p className="sub-install-notes">{component.installationGuide}</p>
                </div>

                <div className="docs-section">
                  <h4>Accessibility Compliance (a11y)</h4>
                  <p className="sub-install-notes">{component.accessibilityNotes}</p>
                </div>

                <div className="docs-section">
                  <h4>Design Best Practices</h4>
                  <p className="sub-install-notes">{component.bestPractices}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentDetails;