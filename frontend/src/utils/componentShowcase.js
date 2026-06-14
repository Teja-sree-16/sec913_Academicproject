import { getCategoryVisual } from "./categoryVisuals";

export const showcaseBadges = ["Production Ready", "Reusable", "Verified", "Open Source"];
export const technologyStack = ["⚛ React", "⚡ FastAPI", "☕ Spring Boot", "🐘 PostgreSQL", "🍃 MongoDB"];

export function getCategoryBadge(category, name) {
  const label = category || getCategoryVisual(category, name).label;
  return String(label).toUpperCase();
}

export function getComponentStats(component = {}) {
  const seed = Number(component.id || String(component.name || "").length || 1);
  const usage = 360 + seed * 12;

  return [
    { label: "Popularity Score", value: "95/100", icon: "⭐" },
    { label: "Adoption Rate", value: `${usage.toLocaleString()} Projects`, icon: "📦" },
    { label: "Production Health", value: "92%", icon: "🚀" },
    { label: "Last Update", value: "June 2026", icon: "🔄" },
  ];
}

export function getComponentQuickStats(component = {}) {
  const seed = Number(component.id || String(component.name || "").length || 1);
  const uses = 360 + seed * 12;

  return [
    { label: "Popularity Score", value: "95/100", icon: "⭐" },
    { label: "Adoption Rate", value: `${uses.toLocaleString()} Projects`, icon: "📦" },
    { label: "Last Update", value: "June 2026", icon: "🔄" },
  ];
}

export function getComponentFeatures(component = {}) {
  const text = `${component.category || ""} ${component.name || ""}`.toLowerCase();

  if (text.includes("api") || text.includes("backend") || text.includes("fast")) {
    return ["API Integration", "Authentication Support", "Error Handling", "Reusable Architecture"];
  }

  if (text.includes("database") || text.includes("dbe") || text.includes("db")) {
    return ["Schema Design", "Query Optimization", "Data Validation", "Reusable Architecture"];
  }

  if (text.includes("dashboard") || text.includes("widget")) {
    return ["Metric Tracking", "Responsive Layout", "Insight Cards", "Reusable Architecture"];
  }

  return ["Reusable Architecture", "Responsive States", "Documentation Ready", "Verified Pattern"];
}

export function getComponentSummary(component = {}) {
  const text = `${component.category || ""} ${component.name || ""}`.toLowerCase();

  if (text.includes("api") || text.includes("backend") || text.includes("fast")) {
    return "Reusable backend service component for API integration, request handling, authentication and business logic.";
  }

  if (text.includes("database") || text.includes("dbe") || text.includes("db")) {
    return "Reusable database component for schema management, persistence workflows, query access and data governance.";
  }

  if (text.includes("frontend") || text.includes("ui") || text.includes("react")) {
    return "Reusable frontend component for interface composition, interaction states, accessibility and responsive UI delivery.";
  }

  if (text.includes("dashboard") || text.includes("widget")) {
    return "Reusable dashboard component for metrics, analytics, operational insights and production reporting workflows.";
  }

  return "Reusable design-system component for consistent product delivery, documentation, implementation and team adoption.";
}

export function getComponentOwner() {
  return "Design Systems Team";
}

export function getComponentHealth() {
  return {
    score: "92%",
    metrics: [
      { label: "Performance", value: 94 },
      { label: "Documentation", value: 90 },
      { label: "Reusability", value: 96 },
      { label: "Maintainability", value: 88 },
    ],
  };
}

export function getTabCounts(component = {}) {
  const codeLines = String(component.codeSnippet || "<Component />").split("\n").filter(Boolean).length;
  const usageLines = String(component.usageExample || component.codeSnippet || "<Component />").split("\n").filter(Boolean).length;

  return {
    preview: 4,
    code: Math.max(codeLines, 12),
    usage: Math.max(usageLines, 5),
    api: 8,
  };
}
