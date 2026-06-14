const CATEGORY_VISUALS = {
  backend: {
    image: "/images/backend.png",
    label: "Backend server",
    icon: "server",
    emoji: "⚙️",
    aliases: ["api", "apis", "backend", "fast api", "fastapi", "java", "node", "server", "spring boot"],
  },
  database: {
    image: "/images/database.png",
    label: "Database",
    icon: "database",
    emoji: "🗄️",
    aliases: ["database", "dbe", "db", "mongo", "mongodb", "postgres", "postgresql", "sql"],
  },
  frontend: {
    image: "/images/frontend.png",
    label: "Frontend UI",
    icon: "code",
    emoji: "🎨",
    aliases: ["frontend", "front end", "react", "ui", "ux", "web"],
  },
  dashboard: {
    image: "/images/dashboard.png",
    label: "Dashboard analytics",
    icon: "chart",
    emoji: "📊",
    aliases: ["analytics", "chart", "dashboard", "dashboard widget", "dashboard widgets", "metric", "widget", "widgets"],
  },
  authentication: {
    image: "/images/component.png",
    label: "Authentication",
    icon: "components",
    emoji: "🔐",
    aliases: ["auth", "authentication", "authorization", "jwt", "login", "signup", "security"],
  },
  component: {
    image: "/images/component.png",
    label: "Reusable component",
    icon: "components",
    emoji: "🧩",
    aliases: ["component", "components", "generic", "general", "sample", "sample component", "sample components"],
  },
};

const CATEGORY_ALIAS_MAP = Object.values(CATEGORY_VISUALS).reduce((aliases, visual) => {
  visual.aliases.forEach((alias) => {
    aliases[normalizeCategory(alias)] = visual;
  });
  return aliases;
}, {});

function normalizeCategory(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getCategoryVisual(category, name = "") {
  const categoryKey = normalizeCategory(category);
  const nameKey = normalizeCategory(name);
  const combinedKey = `${categoryKey} ${nameKey}`.trim();

  if (CATEGORY_ALIAS_MAP[categoryKey]) {
    return CATEGORY_ALIAS_MAP[categoryKey];
  }

  const matchedAlias = Object.keys(CATEGORY_ALIAS_MAP).find((alias) =>
    combinedKey.split(" ").includes(alias) || combinedKey.includes(alias)
  );

  return matchedAlias ? CATEGORY_ALIAS_MAP[matchedAlias] : CATEGORY_VISUALS.component;
}
