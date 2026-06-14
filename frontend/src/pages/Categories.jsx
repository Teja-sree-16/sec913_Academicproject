import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ComponentsIcon, DocsIcon, EyeIcon } from "../components/Icons";
import api from "../api/axios";

function Categories({ onToast }) {
  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    Promise.all([api.get("/categories"), api.get("/components")])
      .then(([categoriesRes, componentsRes]) => {
        if (isMounted) {
          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
          setComponents(Array.isArray(componentsRes.data) ? componentsRes.data : []);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
          onToast?.({
            title: "Categories unavailable",
            message: "Could not load category records.",
            type: "error",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onToast]);

  const CATEGORY_DESCRIPTIONS = {
    "Fast API": "Reusable backend APIs and authentication services.",
    "Dashboard Widgets": "Analytics cards and KPI visualizations.",
    "DBE": "Database and persistence components.",
    "Sample": "Sample components for demonstration."
  };

  const getCategoryIcon = (name) => {
    const lowercaseName = String(name || "").toLowerCase();
    if (lowercaseName.includes("fast api") || lowercaseName.includes("backend")) return "⚙️";
    if (lowercaseName.includes("frontend")) return "🎨";
    if (lowercaseName.includes("dbe") || lowercaseName.includes("database")) return "🗄️";
    if (lowercaseName.includes("dashboard")) return "📊";
    if (lowercaseName.includes("auth")) return "🔐";
    return "🧩";
  };

  const getCategoryColorClass = (name) => {
    const lowercaseName = String(name || "").toLowerCase();
    if (lowercaseName.includes("fast api") || lowercaseName.includes("backend")) return "cat-cyan";
    if (lowercaseName.includes("dashboard")) return "cat-purple";
    if (lowercaseName.includes("dbe") || lowercaseName.includes("database")) return "cat-green";
    if (lowercaseName.includes("sample")) return "cat-orange";
    return "cat-cyan";
  };

  const categoryCards = useMemo(() => {
    const liveCategoryNames = [...new Set(components.map((component) => component.category).filter(Boolean))];

    return liveCategoryNames.map((categoryName) => {
      const savedCategory = categories.find((category) => category.name === categoryName);
      const count = components.filter((component) => component.category === categoryName).length;
      const savedDesc = savedCategory?.description;
      const desc = savedDesc && savedDesc !== "No description added yet" && savedDesc !== "No description added yet."
        ? savedDesc
        : (CATEGORY_DESCRIPTIONS[categoryName] || "Curated component collections and design system presets for quick assembly.");

      return {
        id: savedCategory?.id || categoryName,
        name: categoryName,
        description: desc,
        count,
      };
    });
  }, [categories, components]);

  return (
    <main className="console-stage">
      <section className="console-window">
        <div className="console-main">
          <section className="role-hero">
            <div>
              <p className="eyebrow">Categories</p>
              <h1>Explore Component Groups</h1>
            </div>
            <span>{categoryCards.length} design groups</span>
          </section>

          <section className="console-panel">
            <div className="section-title compact-title">
              <h2><DocsIcon /> Categories</h2>
              <span>{components.length} live components</span>
            </div>

            {status === "loading" && (
              <div className="category-card-grid">
                {[0, 1, 2, 3].map((item) => (
                  <article className="category-card skeleton-card" key={item}>
                    <span className="skeleton-line strong" />
                    <span className="skeleton-line" />
                    <span className="skeleton-line short" />
                  </article>
                ))}
              </div>
            )}

            {status === "error" && (
              <p className="console-alert">Unable to load categories. Check gateway/backend services.</p>
            )}

            {status === "ready" && categoryCards.length === 0 && (
              <p className="console-muted">No categories are available yet.</p>
            )}

            {status === "ready" && categoryCards.length > 0 && (
              <div className="category-card-grid">
                {categoryCards.map((category) => (
                  <article className={`category-card-modern ${getCategoryColorClass(category.name)}`} key={category.id || category.name}>
                    <div>
                      <div className="category-card-icon">{getCategoryIcon(category.name)}</div>
                      <h3 className="category-card-title">{category.name}</h3>
                      <p className="category-card-desc">{category.description}</p>
                    </div>
                    <div className="category-card-meta">
                      <span className="category-card-count"><ComponentsIcon /> {category.count} components</span>
                      {category.count > 0 && (
                        <Link to="/components" className="category-card-btn">Explore →</Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default Categories;