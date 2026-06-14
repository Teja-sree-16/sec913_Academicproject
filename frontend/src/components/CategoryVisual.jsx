import { ChartIcon, CodeIcon, ComponentsIcon } from "./Icons";
import { getCategoryVisual } from "../utils/categoryVisuals";

function CategoryVisual({
  category,
  name,
  description,
  quickStats = [],
  actions,
  compact = false,
}) {
  const visual = getCategoryVisual(category, name);
  const Icon = VISUAL_ICONS[visual.icon] || ComponentsIcon;

  return (
    <div className={`category-preview-card ${compact ? "category-preview-card-compact" : ""}`}>
      <div className="category-preview-orb">
        <Icon />
      </div>

      <div className="category-preview-content">
        <div className="category-preview-badges">
          <span>{category || visual.label}</span>
          <span>Published</span>
          <span>v1.0.0</span>
        </div>

        <h2>{name || visual.label}</h2>

        {description && <p>{description}</p>}

        {quickStats.length > 0 && (
          <div className="category-preview-stats">
            {quickStats.map((item) => (
              <article key={item.label}>
                <span>{item.icon}</span>
                <strong>{item.value}</strong>
                <small>{item.label}</small>
              </article>
            ))}
          </div>
        )}

        {actions && <div className="category-preview-actions">{actions}</div>}
      </div>
    </div>
  );
}

const VISUAL_ICONS = {
  chart: ChartIcon,
  code: CodeIcon,
  components: ComponentsIcon,
  database: DatabaseVisualIcon,
  server: ServerVisualIcon,
};

function ServerVisualIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01" />
      <path d="M7 17h.01" />
      <path d="M11 7h6" />
      <path d="M11 17h6" />
    </svg>
  );
}

function DatabaseVisualIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

export default CategoryVisual;