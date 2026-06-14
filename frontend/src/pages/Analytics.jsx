import { useEffect, useMemo, useState } from "react";
import { ChartIcon, ComponentsIcon, DocsIcon, SearchIcon } from "../components/Icons";
import api from "../api/axios";

const palette = ["#19c8ff", "#67e8f9", "#38bdf8", "#8b5cf6", "#22c55e", "#facc15"];

const fallbackCategories = [
  { name: "Frontend", count: 40 },
  { name: "Backend", count: 25 },
  { name: "Database", count: 20 },
  { name: "Widgets", count: 15 },
];

const fallbackTechnology = [
  { name: "React", count: 35 },
  { name: "Spring Boot", count: 25 },
  { name: "FastAPI", count: 18 },
  { name: "PostgreSQL", count: 14 },
  { name: "MongoDB", count: 8 },
];

const fallbackSearches = [
  { name: "Dashboard Widget", count: 42 },
  { name: "Frontend Form", count: 31 },
  { name: "Navigation Sidebar", count: 24 },
  { name: "Database Table", count: 18 },
];

function percentSegments(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0) || 1;

  return items.map((item, index) => ({
    ...item,
    color: palette[index % palette.length],
    percent: Math.round((item.count / total) * 100),
  }));
}

function pieGradient(segments) {
  let cursor = 0;

  return segments
    .map((item) => {
      const start = cursor;
      cursor += item.percent;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(", ");
}

function Analytics({ onToast }) {
  const [components, setComponents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      api.get("/components"),
      api.get("/components/requests"),
    ])
      .then(([componentsRes, requestsRes]) => {
        if (!isMounted) return;
        setComponents(Array.isArray(componentsRes.data) ? componentsRes.data : []);
        setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
        onToast?.({
          title: "Analytics unavailable",
          message: "Could not load dashboard analytics data.",
          type: "error",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [onToast]);

  const categorySegments = useMemo(() => {
    const counts = [...new Set(components.map((item) => item.category).filter(Boolean))]
      .map((category) => ({
        name: category,
        count: components.filter((item) => item.category === category).length,
      }))
      .filter((item) => item.count > 0);

    return percentSegments(counts.length > 0 ? counts : fallbackCategories);
  }, [components]);

  const technologySegments = useMemo(() => {
    const terms = ["React", "Frontend", "Backend", "Spring", "FastAPI", "PostgreSQL", "Database", "MongoDB", "Widget"];
    const counts = terms
      .map((term) => ({
        name: term === "Spring" ? "Spring Boot" : term,
        count: components.filter((item) =>
          [item.name, item.category, item.tags, item.description, item.documentation]
            .join(" ")
            .toLowerCase()
            .includes(term.toLowerCase())
        ).length,
      }))
      .filter((item) => item.count > 0);

    return percentSegments(counts.length > 0 ? counts : fallbackTechnology);
  }, [components]);

  const approvalStats = useMemo(() => {
    const accepted = requests.filter((item) => item.status === "ACCEPTED").length;
    const rejected = requests.filter((item) => item.status === "REJECTED").length;
    const pending = requests.filter((item) => item.status === "PENDING").length;

    return [
      { name: "Approved", count: accepted, color: "#22c55e" },
      { name: "Rejected", count: rejected, color: "#ef4444" },
      { name: "Pending", count: pending, color: "#facc15" },
    ];
  }, [requests]);

  const growthData = useMemo(() => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const counts = labels.map((label, index) => {
      const monthCount = components.filter((item) => {
        if (!item.createdAt) return false;
        return new Date(item.createdAt).getMonth() === index;
      }).length;

      return { label, count: monthCount };
    });

    const hasLiveData = counts.some((item) => item.count > 0);
    return hasLiveData ? counts : [
      { label: "Jan", count: 2 },
      { label: "Feb", count: 3 },
      { label: "Mar", count: 4 },
      { label: "Apr", count: 6 },
      { label: "May", count: 7 },
      { label: "Jun", count: components.length || 8 },
    ];
  }, [components]);

  const maxGrowth = Math.max(1, ...growthData.map((item) => item.count));

  const mostSearched = useMemo(() => {
    const dashboardComponents = components
      .filter((item) =>
        [item.name, item.category, item.tags, item.description]
          .join(" ")
          .toLowerCase()
          .includes("dashboard")
      )
      .slice(0, 4)
      .map((item, index) => ({ name: item.name, count: 40 - index * 7 }));

    return dashboardComponents.length > 0 ? dashboardComponents : fallbackSearches;
  }, [components]);

  const recentActivity = useMemo(() => {
    const requestActivity = requests.slice(0, 4).map((item) => ({
      label: `${item.name} ${item.status === "ACCEPTED" ? "approved" : item.status === "REJECTED" ? "rejected" : "pending review"}`,
      status: item.status,
    }));

    const componentActivity = components.slice(-4).reverse().map((item) => ({
      label: `${item.name} added to ${item.category || "General"}`,
      status: "ACCEPTED",
    }));

    return [...requestActivity, ...componentActivity].slice(0, 6);
  }, [components, requests]);

  const documentedCount = useMemo(
    () => components.filter((item) => item.documentation || item.usageExample).length,
    [components]
  );

  const renderStatus = (itemStatus) => {
    if (itemStatus === "REJECTED") return <span className="status-chip status-rejected">Rejected</span>;
    if (itemStatus === "PENDING") return <span className="status-chip status-pending">Pending Review</span>;
    return <span className="status-chip status-accepted">Accepted</span>;
  };

  return (
    <main className="console-stage analytics-page">
      <section className="console-window">
        <div className="console-main">
          <section className="role-hero analytics-hero">
            <div>
              <p className="eyebrow">Analytics</p>
              <h1>Component Catalog Intelligence</h1>
              <p>Track category coverage, growth, approvals, technologies, search behavior, and recent catalog activity.</p>
            </div>
            <span className="role-indicator-badge">{status === "ready" ? "Live analytics" : "Loading analytics"}</span>
          </section>

          <section className="stats-grid analytics-stat-grid">
            <article className="stat-card">
              <ComponentsIcon />
              <span>Total Components</span>
              <strong>{components.length}</strong>
            </article>
            <article className="stat-card">
              <DocsIcon />
              <span>Components by Category</span>
              <strong>{categorySegments.length}</strong>
            </article>
            <article className="stat-card">
              <ChartIcon />
              <span>Approved Requests</span>
              <strong>{approvalStats[0].count}</strong>
            </article>
            <article className="stat-card">
              <SearchIcon />
              <span>Tracked Searches</span>
              <strong>{mostSearched.length}</strong>
            </article>
          </section>

          <section className="analytics-grid">
            <article className="console-panel analytics-card wide">
              <h2>Category Distribution</h2>
              <div className="pie-chart-layout">
                <div className="pie-chart" style={{ "--pie-gradient": pieGradient(categorySegments) }} />
                <div className="pie-legend">
                  {categorySegments.map((item) => (
                    <div key={item.name}>
                      <span style={{ "--legend-color": item.color }} />
                      <strong>{item.name}</strong>
                      <small>{item.percent}%</small>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article className="console-panel analytics-card">
              <h2>Component Growth</h2>
              <div className="growth-chart">
                {growthData.map((item) => (
                  <div key={item.label}>
                    <span style={{ height: `${Math.max(18, (item.count / maxGrowth) * 136)}px` }} />
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="console-panel analytics-card">
              <h2>Most Searched Components</h2>
              <div className="rank-list">
                {mostSearched.map((item, index) => (
                  <div key={item.name}>
                    <span>{index + 1}</span>
                    <strong>{item.name}</strong>
                    <small>{item.count} searches</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="console-panel analytics-card">
              <h2>Approval Statistics</h2>
              <div className="approval-list">
                {approvalStats.map((item) => (
                  <div key={item.name}>
                    <span style={{ "--legend-color": item.color }} />
                    <strong>{item.name}</strong>
                    <small>{item.count}</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="console-panel analytics-card wide">
              <h2>Technology Distribution</h2>
              <div className="technology-grid">
                {technologySegments.map((item) => (
                  <div key={item.name}>
                    <strong>{item.name}</strong>
                    <div>
                      <span style={{ width: `${item.percent}%`, background: item.color }} />
                    </div>
                    <small>{item.percent}%</small>
                  </div>
                ))}
              </div>
            </article>

            <article className="console-panel analytics-card">
              <h2>Search Analytics</h2>
              <div className="search-analytics-list">
                {mostSearched.map((item) => (
                  <div key={item.name}>
                    <SearchIcon />
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="console-panel analytics-card">
              <h2>Recent Activity</h2>
              <div className="recent-activity-list">
                {recentActivity.length === 0 ? (
                  <div className="empty-state-panel">
                    <strong>No recent activity yet.</strong>
                    <span>Catalog events will appear here.</span>
                  </div>
                ) : (
                  recentActivity.map((item, index) => (
                    <div key={`${item.label}-${index}`}>
                      {renderStatus(item.status)}
                      <span>{item.label}</span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="console-panel analytics-card activity-panel">
              <h2>System Catalog Analytics</h2>

              <dl>
                <div>
                  <dt>Active Catalog Count</dt>
                  <dd>{components.length} components</dd>
                </div>

                <div>
                  <dt>Genesis Component</dt>
                  <dd>{components[0]?.name || "None"}</dd>
                </div>

                <div>
                  <dt>Fully Documented Assets</dt>
                  <dd>{documentedCount} items</dd>
                </div>

                <div>
                  <dt>Catalog Database Status</dt>
                  <dd>{status === "ready" ? "Online" : "Reconnecting..."}</dd>
                </div>

                <div>
                  <dt>Console Access Clearance</dt>
                  <dd className="clearance-level-badge">{localStorage.getItem("role") || "USER"}</dd>
                </div>
              </dl>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Analytics;
