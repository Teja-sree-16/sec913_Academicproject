import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CodeIcon, CopyIcon, EyeIcon, DocsIcon } from "../components/Icons";
import api from "../api/axios";
import { REAL_COMPONENTS_MAP } from "../components/RealComponents";
import { CodeHighlight } from "../components/CodeHighlight";

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

const getCategoryIcon = (category) => {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("backend")) return "⚙️";
  if (cat.includes("frontend")) return "🎨";
  if (cat.includes("database") || cat.includes("dbe")) return "🗄️";
  if (cat.includes("dashboard")) return "📊";
  if (cat.includes("auth") || cat.includes("authentication")) return "🔐";
  if (cat.includes("api") || cat.includes("fast api")) return "🚀";
  return "🧩";
};

function ComponentDetails({ onToast }) {
  const { id } = useParams();
  const [component, setComponent] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeTab, setActiveTab] = useState("preview");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/components")
      .then((res) => {
        const records = Array.isArray(res.data) ? res.data : [];
        const selectedRecord = records.find((item) => String(item.id) === String(id));

        if (isMounted) {
          setComponent(selectedRecord ? withDocumentationDefaults(selectedRecord) : null);
          setStatus(selectedRecord ? "ready" : "missing");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

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
    <div className="page page-details-modern">
      {/* Particles */}
      <div className="preview-particles">
        <div className="preview-particle" />
        <div className="preview-particle" />
        <div className="preview-particle" />
        <div className="preview-particle" />
        <div className="preview-particle" />
      </div>

      <div className="preview-split-stage">
        {/* Left Column: Component Preview Card */}
        <div className="preview-pane-left-card">
          <div className="preview-card-top">
            <span className="preview-card-category-icon">
              {getCategoryIcon(component.category)}
            </span>
            <h2 className="preview-card-name">{component.name}</h2>
            <p className="preview-card-description">{component.description}</p>
          </div>

          <div className="preview-card-badges">
            <span className="preview-card-badge">{component.category || "General"}</span>
            <span className="preview-card-badge">{component.status || "Published"}</span>
            <span className="preview-card-badge">v{component.version || "1.0.0"}</span>
          </div>

          {/* Statistics Row */}
          <div className="preview-card-stats-row">
            <div className="preview-stat-item">
              <span className="preview-stat-value">⭐ {85 + (component.name.length * 3) % 15}/100</span>
              <span className="preview-stat-label">Popularity Score</span>
            </div>
            <div className="preview-stat-item">
              <span className="preview-stat-value">📦 {100 + (component.name.length * 17) % 350} Projects</span>
              <span className="preview-stat-label">Adoption Rate</span>
            </div>
            <div className="preview-stat-item">
              <span className="preview-stat-value">🚀 {90 + (component.name.length * 2) % 10}%</span>
              <span className="preview-stat-label">Production Health</span>
            </div>
            <div className="preview-stat-item">
              <span className="preview-stat-value">📅 June 2026</span>
              <span className="preview-stat-label">Last Updated</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="preview-card-actions">
            <button
              type="button"
              className={`btn-preview-card ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              className="btn-preview-card"
              onClick={() => copyCode(component.codeSnippet)}
            >
              Copy Code
            </button>
            <button
              type="button"
              className="btn-preview-card btn-preview-card-primary"
              onClick={handleUseComponent}
            >
              Add Project
            </button>
            
            <Link className="btn-preview-card" style={{ marginTop: "10px", textDecoration: "none", background: "rgba(255, 255, 255, 0.03)" }} to="/components">
              Back to Library
            </Link>
          </div>
        </div>

        {/* Right Column: Tabbed Preview & Specs */}
        <div className="preview-pane-right-panel">
          <div className="tab-switcher-row-modern">
            <button
              type="button"
              className={`tab-btn-modern ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
            <button
              type="button"
              className={`tab-btn-modern ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              Code
            </button>
            <button
              type="button"
              className={`tab-btn-modern ${activeTab === "usage" ? "active" : ""}`}
              onClick={() => setActiveTab("usage")}
            >
              Usage
            </button>
            <button
              type="button"
              className={`tab-btn-modern ${activeTab === "docs" ? "active" : ""}`}
              onClick={() => setActiveTab("docs")}
            >
              API Docs
            </button>
          </div>

          <div className="tab-stage-content-modern">
            {activeTab === "preview" && (
              <div className="preview-tab-panel-modern">
                <div className="component-preview-box-modern">
                  {(() => {
                    const PreviewComp = REAL_COMPONENTS_MAP[component.name]?.Preview;
                    return PreviewComp ? (
                      <PreviewComp />
                    ) : (
                      <div className="no-preview-placeholder-modern">
                        <span className="fallback-category-icon-large">
                          {getCategoryIcon(component.category)}
                        </span>
                        <strong>{component.name}</strong>
                        <p>{component.description}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="code-tab-panel-modern">
                <CodeHighlight code={component.codeSnippet} />
              </div>
            )}

            {activeTab === "usage" && (
              <div className="code-tab-panel-modern">
                <CodeHighlight code={component.usageExample} />
              </div>
            )}

            {activeTab === "docs" && (
              <div className="docs-clean-reader-container">
                {component.documentation && component.documentation.trim() ? (
                  <div className="docs-clean-reader">
                    {component.documentation}
                  </div>
                ) : (
                  <div className="docs-clean-reader empty">
                    No documentation available.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentDetails;