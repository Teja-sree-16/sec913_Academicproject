import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeIcon, DocsIcon, EyeIcon, SearchIcon } from "../components/Icons";
import api from "../api/axios";import "../styles/pages/SearchComponents.css";


const sampleQueries = [
  "Form validation components",
  "Reusable dashboard widgets",
  "Admin navigation sidebar",
  "Empty state for no results",
];

function SearchComponents({ onToast }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");

  const search = async (event, nextQuery = query) => {
    event?.preventDefault();
    const searchQuery = nextQuery.trim();

    if (!searchQuery) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setQuery(searchQuery);
    setStatus("loading");

    try {
      const res = await api.post("/search/semantic", {
        query: searchQuery,
        userEmail: localStorage.getItem("email"),
      });
      setResults(Array.isArray(res.data) ? res.data : []);
      setStatus("ready");
      onToast?.({
        title: "Search complete",
        message: `${Array.isArray(res.data) ? res.data.length : 0} matches returned.`,
        type: "success",
      });
    } catch {
      setResults([]);
      setStatus("error");
      onToast?.({
        title: "Search failed",
        message: "Search service is unavailable.",
        type: "error",
      });
    }
  };

  return (
    <main className="console-stage">
      <section className="console-window">
        <div className="console-main">
          <section className="role-hero search-hero">
            <div>
              <p className="eyebrow">Interactive Search</p>
              <h1>Query Central Design Assets by Intent or Use Case</h1>
              <p>
                Our smart search parses documentation, accessibility specifications, and pattern descriptions to match your developer intent.
              </p>
            </div>
          </section>

          <section className="console-panel semantic-panel">
            <div className="section-title compact-title">
              <div>
                <h2><SearchIcon /> Semantic Design Repository Search</h2>
                <p className="console-muted">
                  Describe what you want to build in plain English to discover matched components.
                </p>
              </div>
              <span>Intelligent Search Index</span>
            </div>

            <form className="semantic-search-box" onSubmit={search}>
              <label className="search-input-wrap">
                <SearchIcon />
                <input
                  placeholder="Describe what you want to build (e.g. form with validation checks, timeline audit)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="query-chip-row" aria-label="Example search queries">
              {sampleQueries.map((item) => (
                <button
                  className="query-chip"
                  type="button"
                  key={item}
                  onClick={() => search(null, item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          {status === "error" && <p className="notice error">Unable to perform search query. Please verify gateway services are online.</p>}
          {status === "loading" && (
            <section className="ai-search-animation">
              <div className="ai-orbit" />
              <div>
                <strong>Searching Component Catalog</strong>
                <span>Retrieving matched patterns from the registry...</span>
              </div>
            </section>
          )}
          {status === "ready" && results.length === 0 && <p className="notice">No matching design patterns found. Try a different query description.</p>}

          {status === "idle" && (
            <section className="semantic-empty-grid">
              <article>
                <DocsIcon />
                <strong>Documentation Aware</strong>
                <p>Matches component purpose, props interfaces, and usage documentation.</p>
              </article>
              <article>
                <EyeIcon />
                <strong>Interactive Stage Ready</strong>
                <p>Instantly explore components inside the live sandboxed interactive preview.</p>
              </article>
              <article>
                <CodeIcon />
                <strong>Production Snippets</strong>
                <p>Every component is preloaded with copy-pasteable React templates and integrations.</p>
              </article>
            </section>
          )}

          <div className="semantic-results">
            {status === "loading" &&
              [0, 1, 2].map((item) => (
                <article className="component-card skeleton-card" key={item}>
                  <span className="skeleton-line short" />
                  <span className="skeleton-line strong" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line" />
                </article>
              ))}
            {results.map((item, index) => (
              <article className="semantic-result-card" key={item.id}>
                <div className="result-rank">{index + 1}</div>
                <div className="result-details-content">
                  <p className="eyebrow">{item.category || "Uncategorized"}</p>
                  <h2>{item.name}</h2>
                  <p className="result-desc-p">{item.description}</p>
                  {item.semanticText && <small className="result-semantic-match">Matched intent: {item.semanticText}</small>}
                </div>
                <div className="result-actions">
                  {typeof item.semanticScore === "number" && (
                    <span className="score-pill">{(item.semanticScore * 100).toFixed(0)}% match</span>
                  )}
                  <Link to={`/component/${item.id}`} className="view-details-action-link">View Details</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default SearchComponents;