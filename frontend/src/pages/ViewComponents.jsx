import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChartIcon,
  CloseIcon,
  CodeIcon,
  ComponentsIcon,
  CopyIcon,
  DocsIcon,
  EyeIcon,
  SearchIcon,
  TrashIcon,
} from "../components/Icons";
import api from "../api/axios";
import { REAL_COMPONENTS_MAP } from "../components/RealComponents";
import { CodeHighlight } from "../components/CodeHighlight";

const inferTags = (component) =>
  [component.category, component.name]
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(",");

const normalizeComponent = (component) => {
  const realData = REAL_COMPONENTS_MAP[component.name] || {};
  return {
    ...component,
    tags: component.tags || inferTags(component),
    version: component.version || "1.0.0",
    status: component.status || "Published",
    codeSnippet: realData.code || component.codeSnippet || "<Component />",
    usageExample: realData.usage || component.usageExample || component.codeSnippet || "<Component />",
    previewImage:
      component.previewImage ||
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
    propsTable:
      component.propsTable ||
      "name | string | yes | Visible component label\nvariant | primary/secondary | no | Visual treatment\nonClick | function | no | Interaction handler",
    installationGuide:
      component.installationGuide ||
      "Install the design system package, import the component, and pass the documented props from your feature module.",
    accessibilityNotes:
      component.accessibilityNotes ||
      "Supports keyboard focus, visible focus states, semantic labels, and screen-reader friendly copy.",
    bestPractices:
      component.bestPractices ||
      "Keep variants limited, document required props, test empty/loading/error states, and reuse design tokens.",
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

function ViewComponents({ onToast }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";

  const [components, setComponents] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [status, setStatus] = useState("loading");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("componentFavorites") || "[]"));
  const [ratings, setRatings] = useState(() => JSON.parse(localStorage.getItem("componentRatings") || "{}"));
  const [comparisonIds, setComparisonIds] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => JSON.parse(localStorage.getItem("recentlyViewedComponents") || "[]"));
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewTheme, setPreviewTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("code");
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [editableProps, setEditableProps] = useState('{\n  "size": "md",\n  "variant": "primary"\n}');

  const loadData = useCallback(async () => {
    setStatus("loading");

    try {
      const componentsRes = await api.get("/components");
      const records = Array.isArray(componentsRes.data) ? componentsRes.data.map(normalizeComponent) : [];
      setComponents(records);
      setStatus("ready");
    } catch {
      setStatus("error");
      onToast?.({
        title: "Library unavailable",
        message: "Could not load component records.",
        type: "error",
      });
    }
  }, [onToast]);

  const runSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      await loadData();
      setSearchStatus("idle");
      return;
    }

    setSearchStatus("loading");

    try {
      const res = await api.get("/components/search", { params: { q: query } });
      setComponents(Array.isArray(res.data) ? res.data.map(normalizeComponent) : []);
      setSearchStatus("ready");
      setStatus("ready");
      onToast?.({
        title: "Search complete",
        message: `${Array.isArray(res.data) ? res.data.length : 0} matching components found.`,
        type: "success",
      });
    } catch {
      setSearchStatus("error");
      onToast?.({
        title: "Search failed",
        message: "Could not search backend component records.",
        type: "error",
      });
    }
  };

  const deleteComponent = async (id) => {
    try {
      await api.delete(`/components/${id}`);
      setComponents((current) => current.filter((component) => component.id !== id));
      setSelectedComponent(null);
      onToast?.({
        title: "Component deleted",
        message: "Removed from the registry and database.",
        type: "info",
      });
      await loadData();
    } catch {
      onToast?.({
        title: "Delete failed",
        message: "The component could not be removed from the database.",
        type: "error",
      });
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

  const handleUseComponent = async (component) => {
    const usage = component.usageExample || component.codeSnippet || `<${component.name?.replace(/\s+/g, "") || "Component"} />`;

    await navigator.clipboard.writeText(usage);
    onToast?.({
      title: "Usage copied",
      message: `${component.name} is ready to paste into your app.`,
      type: "success",
    });
  };

  const openPreview = (component) => {
    setSelectedComponent(component);
    setActiveTab("code");
    setPreviewDevice("desktop");
    setPreviewTheme("dark");
    const nextRecent = [component.id, ...recentlyViewed.filter((id) => id !== component.id)].slice(0, 6);
    setRecentlyViewed(nextRecent);
    localStorage.setItem("recentlyViewedComponents", JSON.stringify(nextRecent));
  };

  const toggleFavorite = (id) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];
    setFavorites(nextFavorites);
    localStorage.setItem("componentFavorites", JSON.stringify(nextFavorites));
  };

  const toggleCompare = (id) => {
    setComparisonIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      return [...current, id].slice(-3);
    });
  };

  const rateComponent = (id, rating) => {
    const nextRatings = { ...ratings, [id]: rating };
    setRatings(nextRatings);
    localStorage.setItem("componentRatings", JSON.stringify(nextRatings));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("All");
    }
  }, [location.search]);

  const categoryOptions = useMemo(() => {
    const componentDerived = components.map((item) => item.category).filter(Boolean);
    return ["All", ...new Set(componentDerived)];
  }, [components]);

  const tagOptions = useMemo(() => {
    const tags = components.flatMap((item) =>
      String(item.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    );
    return ["All", ...new Set(tags)];
  }, [components]);

  const statusOptions = useMemo(() => {
    const statuses = components.map((item) => item.status).filter(Boolean);
    return ["All", ...new Set(statuses)];
  }, [components]);

  const activeCategory = categoryOptions.includes(selectedCategory) ? selectedCategory : "All";

  const filteredComponents = useMemo(() => {
    const filtered = components.filter((item) => {
      const tags = String(item.tags || "").split(",").map((tag) => tag.trim());
      return (
        (activeCategory === "All" || item.category === activeCategory) &&
        (selectedTag === "All" || tags.includes(selectedTag)) &&
        (selectedStatus === "All" || item.status === selectedStatus)
      );
    });

    return filtered.sort((left, right) => {
      if (sortBy === "category") return String(left.category).localeCompare(String(right.category));
      if (sortBy === "rating") return (ratings[right.id] || 0) - (ratings[left.id] || 0);
      if (sortBy === "recent") return (new Date(right.createdAt || 0)) - (new Date(left.createdAt || 0));
      return String(left.name).localeCompare(String(right.name));
    });
  }, [activeCategory, components, ratings, selectedStatus, selectedTag, sortBy]);

  const mostUsedCategory = useMemo(() => {
    const counts = categoryOptions
      .filter((category) => category !== "All")
      .map((category) => ({
        name: category,
        count: components.filter((item) => item.category === category).length,
      }));

    return counts.reduce(
      (topCategory, category) => (category.count > topCategory.count ? category : topCategory),
      { name: "None", count: 0 }
    );
  }, [categoryOptions, components]);

  const recentUploads = components.slice(-3).length;
  const comparisonComponents = comparisonIds
    .map((id) => components.find((component) => component.id === id))
    .filter(Boolean);
  const recentComponents = recentlyViewed
    .map((id) => components.find((component) => component.id === id))
    .filter(Boolean);

  return (
    <main className="console-stage">
      <section className="console-window">
        <div className="console-main">
          <section className="stats-grid">
            <article className="stat-card">
              <ComponentsIcon />
              <span>Total Components</span>
              <strong className="counter-value">{components.length}</strong>
            </article>
            <article className="stat-card">
              <DocsIcon />
              <span>Categories</span>
              <strong className="counter-value">{categoryOptions.length - 1}</strong>
            </article>
            <article className="stat-card">
              <ChartIcon />
              <span>Most Used</span>
              <strong className="counter-value">{mostUsedCategory.name}</strong>
            </article>
            <article className="stat-card">
              <EyeIcon />
              <span>Recent Uploads</span>
              <strong className="counter-value">{recentUploads}</strong>
            </article>
          </section>

          <form className="console-panel component-search-panel" onSubmit={runSearch}>
            <div>
              <h2>Component Explorer</h2>
              <p>Search, filter, favorite, compare, rate, and preview reusable design system assets.</p>
            </div>
            <div className="component-search-grid">
              <label className="search-input-wrap compact">
                <SearchIcon />
                <input
                  placeholder="Component Name"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select value={activeCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categoryOptions.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </select>
              <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                {tagOptions.map((tag) => (
                  <option value={tag} key={tag}>{tag === "All" ? "All tags" : tag}</option>
                ))}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                {statusOptions.map((item) => (
                  <option value={item} key={item}>{item === "All" ? "All statuses" : item}</option>
                ))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by name</option>
                <option value="category">Sort by category</option>
                <option value="rating">Sort by rating</option>
                <option value="recent">Sort by newest</option>
              </select>
              <button type="submit" disabled={searchStatus === "loading"}>
                {searchStatus === "loading" ? "Searching..." : "Search"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("All");
                  setSelectedTag("All");
                  setSelectedStatus("All");
                  setSortBy("name");
                  loadData();
                }}
              >
                Reset
              </button>
            </div>
          </form>

          {(favorites.length > 0 || recentComponents.length > 0) && (
            <section className="console-panel explorer-insights">
              <div>
                <h2>Personal Workspace</h2>
                <p className="console-muted">
                  {favorites.length} favorites · {recentComponents.length} recently viewed · {comparisonIds.length} selected for comparison
                </p>
              </div>
              <div className="mini-chip-row">
                {recentComponents.map((item) => (
                  <button type="button" className="query-chip" key={item.id} onClick={() => openPreview(item)}>
                    {item.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="console-panel">
            <div className="section-title compact-title">
              <h2>Component Registry</h2>
              <span>{filteredComponents.length} records</span>
            </div>

            {status === "loading" && (
              <div className="component-registry">
                {[0, 1, 2].map((item) => (
                  <article className="registry-row skeleton-card" key={item}>
                    <div>
                      <span className="skeleton-line strong" />
                      <span className="skeleton-line" />
                    </div>
                    <span className="skeleton-line" />
                    <span className="skeleton-line" />
                    <span className="skeleton-line" />
                  </article>
                ))}
              </div>
            )}
            {status === "error" && <p className="console-alert">Unable to load components. Check gateway/backend services.</p>}
            {searchStatus === "error" && <p className="console-alert">Unable to search backend component records.</p>}
            {status === "ready" && filteredComponents.length === 0 && (
              <p className="console-muted">No components are available yet.</p>
            )}

            {status !== "loading" && <div className="component-registry">
              {filteredComponents.map((item) => (
                <article className="registry-row registry-row-pro" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.description}</p>
                    <div className="tag-row">
                      {String(item.tags || "").split(",").filter(Boolean).slice(0, 4).map((tag) => (
                        <small key={tag}>{tag.trim()}</small>
                      ))}
                    </div>
                  </div>
                  <span>{item.category || "Uncategorized"} · v{item.version}</span>
                  <div className="rating-row" aria-label={`${item.name} rating`}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        type="button"
                        className={ratings[item.id] >= rating ? "rating-active" : ""}
                        key={rating}
                        onClick={() => rateComponent(item.id, rating)}
                        aria-label={`Rate ${rating}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => toggleFavorite(item.id)} className="secondary-button">
                    {favorites.includes(item.id) ? "Favorited" : "Favorite"}
                  </button>
                  <button type="button" onClick={() => toggleCompare(item.id)} className="secondary-button">
                    {comparisonIds.includes(item.id) ? "Selected" : "Compare"}
                  </button>
                  <button type="button" onClick={() => openPreview(item)}>
                    <EyeIcon /> Open
                  </button>
                  {localStorage.getItem("role") === "ADMIN" && (
                    <button type="button" onClick={() => deleteComponent(item.id)}>
                      <TrashIcon /> Delete
                    </button>
                  )}
                </article>
              ))}
            </div>}
          </section>

          {comparisonComponents.length > 0 && (
            <section className="console-panel comparison-panel">
              <div className="section-title compact-title">
                <h2>Component Comparison</h2>
                <span>{comparisonComponents.length} selected</span>
              </div>
              <div className="comparison-grid">
                {comparisonComponents.map((item) => (
                  <article key={item.id}>
                    <strong>{item.name}</strong>
                    <span>{item.category} · {item.status}</span>
                    <p>{item.description}</p>
                    <small>Version {item.version} · Rating {ratings[item.id] || "Not rated"}</small>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {selectedComponent && (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedComponent(null)}>
          <section
            className={`preview-modal ${fullscreenPreview ? "preview-modal-fullscreen" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="preview-header">
              <div>
                <p className="eyebrow">{selectedComponent.category || "Uncategorized"}</p>
                <h2 id="preview-title">{selectedComponent.name}</h2>
                <p className="console-muted">v{selectedComponent.version} · {selectedComponent.status}</p>
              </div>
              <div className="preview-toolbar">
                <select value={previewTheme} onChange={(event) => setPreviewTheme(event.target.value)}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
                <select value={previewDevice} onChange={(event) => setPreviewDevice(event.target.value)}>
                  <option value="desktop">Desktop</option>
                  <option value="tablet">Tablet</option>
                  <option value="mobile">Mobile</option>
                </select>
                <button type="button" className="secondary-button" onClick={() => setFullscreenPreview((current) => !current)}>
                  {fullscreenPreview ? "Exit Fullscreen" : "Fullscreen"}
                </button>
                <button type="button" className="icon-button" onClick={() => setSelectedComponent(null)} aria-label="Close preview">
                  <CloseIcon />
                </button>
              </div>
            </header>

            <div className="preview-split-stage">
              <div className="preview-pane-left">
                <div className="pane-header-mini">
                  <h3><EyeIcon /> Interactive Stage</h3>
                  <div className="stage-theme-dot" />
                </div>
                <div className={`component-preview-box preview-device-${previewDevice} preview-theme-${previewTheme}`}>
                  {(() => {
                    const PreviewComp = REAL_COMPONENTS_MAP[selectedComponent.name]?.Preview;
                    return PreviewComp ? (
                      <PreviewComp />
                    ) : (
                      <div className="no-preview-placeholder">
                        {selectedComponent.previewImage && (
                          <img src={selectedComponent.previewImage} alt="" className="fallback-preview-img" />
                        )}
                        <strong>{selectedComponent.name}</strong>
                        <p>{selectedComponent.description}</p>
                        <button type="button" onClick={() => handleUseComponent(selectedComponent)} className="primary-action-btn">
                          Use Component
                        </button>
                      </div>
                    );
                  })()}
                </div>
                <label className="props-editor">
                  <span>Interactive Props Simulator (JSON)</span>
                  <textarea value={editableProps} onChange={(event) => setEditableProps(event.target.value)} />
                </label>
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
                        <button type="button" className="icon-text-button" onClick={() => copyCode(selectedComponent.codeSnippet)}>
                          <CopyIcon /> Copy Template
                        </button>
                      </div>
                      <CodeHighlight code={selectedComponent.codeSnippet} />
                    </div>
                  )}

                  {activeTab === "usage" && (
                    <div className="code-tab-panel">
                      <div className="code-panel-header">
                        <span>Integration example code</span>
                        <button type="button" className="icon-text-button" onClick={() => copyCode(selectedComponent.usageExample)}>
                          <CopyIcon /> Copy Usage
                        </button>
                      </div>
                      <CodeHighlight code={selectedComponent.usageExample} />
                    </div>
                  )}

                  {activeTab === "docs" && (
                    <div className="docs-tab-panel">
                      <div className="docs-section">
                        <h4>Functional Description</h4>
                        <p className="docs-desc-p">{selectedComponent.description || "No description provided."}</p>
                      </div>
                      
                      <div className="docs-section">
                        <h4>API References & Parameters</h4>
                        {renderPropsTable(selectedComponent.propsTable)}
                      </div>

                      <div className="docs-meta-grid">
                        <div>
                          <strong>Category:</strong>
                          <span>{selectedComponent.category || "General"}</span>
                        </div>
                        <div>
                          <strong>Clearance:</strong>
                          <span>{selectedComponent.status || "Published"}</span>
                        </div>
                        <div>
                          <strong>Version:</strong>
                          <span>v{selectedComponent.version || "1.0.0"}</span>
                        </div>
                        <div>
                          <strong>Author:</strong>
                          <span>{selectedComponent.createdBy || "Design System"}</span>
                        </div>
                      </div>

                      <div className="docs-section">
                        <h4>Installation Instructions</h4>
                        <div className="installation-block">
                          <code>npm install @design-system/{selectedComponent.name?.toLowerCase().replace(/\s+/g, "-")}</code>
                          <button type="button" className="copy-icon-btn" onClick={() => copyCode(`npm install @design-system/${selectedComponent.name?.toLowerCase().replace(/\s+/g, "-")}`)}>
                            <CopyIcon />
                          </button>
                        </div>
                        <p className="sub-install-notes">{selectedComponent.installationGuide}</p>
                      </div>

                      <div className="docs-section">
                        <h4>Accessibility Compliance (a11y)</h4>
                        <p className="sub-install-notes">{selectedComponent.accessibilityNotes}</p>
                      </div>

                      <div className="docs-section">
                        <h4>Design Best Practices</h4>
                        <p className="sub-install-notes">{selectedComponent.bestPractices}</p>
                      </div>

                      <div className="docs-footer-link">
                        <Link className="inline-detail-link" to={`/component/${selectedComponent.id}`}>
                          Open Dedicated Documentation Page →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ViewComponents;