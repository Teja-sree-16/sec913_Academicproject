import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ComponentsIcon, DocsIcon, EyeIcon } from "../components/Icons";
import api from "../api/axios";import "../styles/pages/Admin.css";


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

  const categoryCards = useMemo(() => {
    const liveCategoryNames = [...new Set(components.map((component) => component.category).filter(Boolean))];

    return liveCategoryNames.map((categoryName) => {
      const savedCategory = categories.find((category) => category.name === categoryName);
      const count = components.filter((component) => component.category === categoryName).length;

      return {
        id: savedCategory?.id || categoryName,
        name: categoryName,
        description: savedCategory?.description || "",
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
                  <article className="category-card" key={category.id || category.name}>
                    <DocsIcon />
                    <div>
                      <h3>{category.name}</h3>
                      <p>{category.description || "No description added yet."}</p>
                    </div>
                    <span><ComponentsIcon /> {category.count} components</span>
                    {category.count > 0 && (
                      <Link to={`/components?category=${category.name}`}><EyeIcon /> View Components</Link>
                    )}
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