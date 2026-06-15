import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, HeartIcon, TrashIcon } from "../components/Icons";
import api from "../api/axios";
import "../styles/pages/Favorites.css";

function Favorites({ onToast }) {
  const [favorites, setFavorites] = useState([]);
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  const loadFavorites = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await api.get("/favorites");
      setFavorites(Array.isArray(res.data) ? res.data : []);
      setStatus("ready");
    } catch {
      setStatus("error");
      onToast?.({
        title: "Favorites unavailable",
        message: "Could not load your favorite components.",
        type: "error",
      });
    }
  }, [onToast]);

  const removeFavorite = async (componentId) => {
    try {
      await api.delete(`/favorites/component/${componentId}`);
      setFavorites((current) => current.filter((item) => item.id !== componentId));
      onToast?.({
        title: "Removed",
        message: "Removed from favorites.",
        type: "info",
      });
    } catch {
      onToast?.({
        title: "Error",
        message: "Failed to remove favorite.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Personal Dashboard</p>
          <h1><HeartIcon fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px" }} /> Your Favorites</h1>
          <p>
            Quickly access your bookmarked components. 
            You currently have {favorites.length} saved items.
          </p>
        </div>
        <Link className="button-link" to="/components">
          Browse Library
        </Link>
      </div>

      <section className="detail-panel" style={{ padding: "0" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ margin: 0 }}>Saved Components</h2>
        </div>

        {status === "loading" && (
          <div className="component-registry" style={{ padding: "24px" }}>
            {[0, 1].map((item) => (
              <article className="registry-row skeleton-card" key={item}>
                <div>
                  <span className="skeleton-line strong" />
                  <span className="skeleton-line" />
                </div>
                <span className="skeleton-line" />
              </article>
            ))}
          </div>
        )}

        {status === "error" && (
          <div style={{ padding: "24px" }}>
            <div className="notice error">Unable to load favorites. Check backend services.</div>
          </div>
        )}
        
        {status === "ready" && favorites.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p className="console-muted">You have no favorited components yet. Browse the registry to add some!</p>
          </div>
        )}

        {status === "ready" && favorites.length > 0 && (
          <div className="component-registry" style={{ padding: "24px" }}>
            {favorites.map((item) => (
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
                <span>{item.category || "Uncategorized"} · v{item.version || "1.0.0"}</span>
                <button type="button" onClick={() => navigate(`/component/${item.id}`)} className="primary-action-btn">
                  <EyeIcon /> View Details
                </button>
                <button type="button" onClick={() => removeFavorite(item.id)} className="secondary-button" style={{ color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 30%, transparent)" }}>
                  <TrashIcon /> Unfavorite
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Favorites;