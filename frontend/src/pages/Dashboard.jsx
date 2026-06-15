import { useEffect, useMemo, useState } from "react";
import { ChartIcon, ClockIcon, ComponentsIcon, DocsIcon } from "../components/Icons";
import api from "../api/axios";import "../styles/pages/Dashboard.css";


function Dashboard({ onToast }) {
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  const [components, setComponents] = useState([]);
  const [status, setStatus] = useState("loading");

  const [form, setForm] = useState({
    name: "",
    category: "",
    documentation: "",
  });

  const [requestForm, setRequestForm] = useState({
    name: "",
    category: "",
    description: "",
    documentation: "",
  });

  const [requests, setRequests] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [requestStatus, setRequestStatus] = useState("idle");

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadDashboardData = async () => {
    setStatus("loading");

    try {
      const componentsRes = await api.get("/components", { headers: getAuthHeader() });

      setComponents(Array.isArray(componentsRes.data) ? componentsRes.data : []);
      setStatus("ready");
    } catch (error) {
      console.error("Dashboard load error:", error);
      setStatus("error");
      onToast?.({
        title: "Dashboard unavailable",
        message: "Could not load components and categories.",
        type: "error",
      });
    }
  };

  const loadRequests = async () => {
    try {
      const params = role === "ADMIN" ? undefined : { requestedBy: email };

      const res = await api.get("/components/requests", {
        params,
        headers: getAuthHeader(),
      });

      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Requests load error:", error);
      setRequests([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const requestParams = role === "ADMIN" ? undefined : { requestedBy: email };

    Promise.all([
      api.get("/components", { headers: getAuthHeader() }),
      api.get("/components/requests", {
        params: requestParams,
        headers: getAuthHeader(),
      }),
    ])
      .then(([componentsRes, requestsRes]) => {
        if (isMounted) {
          setComponents(Array.isArray(componentsRes.data) ? componentsRes.data : []);
          setRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
          setStatus("ready");
        }
      })
      .catch((error) => {
        console.error("Initial dashboard error:", error);
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [email, role]);

  const categoryNames = useMemo(() => {
    const componentDerived = components.map((item) => item.category).filter(Boolean);
    return [...new Set(componentDerived)];
  }, [components]);

  const categoryCounts = useMemo(
    () =>
      categoryNames.map((category) => ({
        name: category,
        count: components.filter((item) => item.category === category).length,
      })).filter((item) => item.count > 0),
    [categoryNames, components]
  );

  const latestComponents = components.slice(-5).reverse();
  const adminRequests = role === "ADMIN" ? requests : [];
  const pendingRequests = requests.filter((item) => item.status === "PENDING");
  const myRequests = requests.filter((item) => item.requestedBy === email);

  const documentedCount = components.filter(
    (item) => item.documentation || item.usageExample
  ).length;

  const maxCategoryCount = Math.max(
    1,
    ...categoryCounts.map((item) => item.count)
  );

  const mostUsedComponent = categoryCounts.reduce(
    (topCategory, category) =>
      category.count > topCategory.count ? category : topCategory,
    { name: "None", count: 0 }
  );

  const addComponent = async (event) => {
    event.preventDefault();

    if (role !== "ADMIN") {
      setSaveStatus("forbidden");
      return;
    }

    setSaveStatus("saving");

    try {
      await api.post(
        "/components",
        {
          name: form.name,
          category: form.category || categoryNames[0] || "General",
          description: `${form.name} reusable UI component.`,
          documentation:
            form.documentation || "Documentation uploaded from the dashboard console.",
          codeSnippet: `<${form.name.replace(/\s+/g, "")} />`,
          usageExample: `<${form.name.replace(/\s+/g, "")} />`,
          createdBy: email || "admin",
        },
        { headers: getAuthHeader() }
      );

      setForm({ name: "", category: "", documentation: "" });
      setSaveStatus("saved");
      onToast?.({
        title: "Component added",
        message: `${form.name} is now available in the registry.`,
        type: "success",
      });
      await loadDashboardData();
    } catch (error) {
      console.error("Add component error:", error);
      setSaveStatus("error");
      onToast?.({
        title: "Save failed",
        message: "The component could not be added.",
        type: "error",
      });
    }
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    setRequestStatus("saving");

    try {
      await api.post(
        "/components/requests",
        {
          ...requestForm,
          category: requestForm.category || "General",
          description:
            requestForm.description ||
            `${requestForm.name} reusable UI component.`,
          requestedBy: email,
        },
        {
          headers: getAuthHeader(),
        }
      );

      setRequestForm({
        name: "",
        category: "",
        description: "",
        documentation: "",
      });

      setRequestStatus("submitted");
      onToast?.({
        title: "Request sent",
        message: "Admin can now review your component request.",
        type: "success",
      });
      await loadRequests();
    } catch (error) {
      console.error("Submit request error:", error);
      setRequestStatus("error");
      onToast?.({
        title: "Request failed",
        message: "Could not send your component request.",
        type: "error",
      });
    }
  };

  const reviewRequest = async (request, decision) => {
    try {
      if (decision === "accept") {
        await api.post(
          `/components/requests/${request.id}/accept`,
          {},
          { headers: getAuthHeader() }
        );

        onToast?.({
          title: "Request accepted",
          message: `${request.name} was added to the registry.`,
          type: "success",
        });
        await loadRequests();
        await loadDashboardData();
        return;
      }

      await api.post(
        `/components/requests/${request.id}/reject`,
        {},
        { headers: getAuthHeader() }
      );

      onToast?.({
        title: "Request rejected",
        message: `${request.name} was marked as rejected.`,
        type: "info",
      });
      await loadRequests();
    } catch (error) {
      console.error("Review request error:", error);
      onToast?.({
        title: "Review failed",
        message: "Could not update the request status.",
        type: "error",
      });
      await loadRequests();
    }
  };

  return (
    <main className="console-stage">
      <section className="console-window">
        <div className="console-main">
          <section className="role-hero">
            <div>
              <p className="eyebrow">{role === "ADMIN" ? "Governance & Operations Console" : "Design System Developer Workspace"}</p>
              <h1>{role === "ADMIN" ? "Manage Central Component Registry" : "Explore Reusable Patterns & Request Extensions"}</h1>
            </div>
            <span className="role-indicator-badge">{role === "ADMIN" ? `${pendingRequests.length} proposals pending review` : `${myRequests.length} catalog submissions`}</span>
          </section>

          {status === "loading" ? (
            <section className="stats-grid">
              {[0, 1, 2, 3].map((item) => (
                <article className="stat-card skeleton-card" key={item}>
                  <span className="skeleton-line short" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line strong" />
                </article>
              ))}
            </section>
          ) : (
            <section className="stats-grid">
              <article className="stat-card">
                <ComponentsIcon />
                <span>Registered Components</span>
                <strong className="counter-value">{components.length} patterns</strong>
              </article>

              <article className="stat-card">
                <DocsIcon />
                <span>Component Groups</span>
                <strong className="counter-value">{categoryNames.length} categories</strong>
              </article>

              <article className="stat-card">
                <ChartIcon />
                <span>Top Core Pattern</span>
                <strong className="counter-value">{mostUsedComponent.name}</strong>
              </article>

              <article className="stat-card">
                <ClockIcon />
                <span>Newly Seeded Assets</span>
                <strong className="counter-value">{latestComponents.length} added</strong>
              </article>
            </section>
          )}

          {role === "ADMIN" ? (
            <>
              <form className="console-panel add-panel" onSubmit={addComponent}>
                <div>
                  <h2>Publish New Library Pattern</h2>
                  <p>Register a production-grade React element into the centralized design catalog.</p>
                </div>

                <div className="add-grid">
                  <input
                    placeholder="Component Name (e.g. Activity Table)"
                    value={form.name}
                    required
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    <option value="">Assign Component Group</option>
                    {categoryNames.map((category) => (
                      <option
                        value={category}
                        key={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    placeholder="Integration Manual & Docs URL"
                    value={form.documentation}
                    onChange={(event) =>
                      setForm({ ...form, documentation: event.target.value })
                    }
                  />

                  <button type="submit" disabled={saveStatus === "saving"}>
                    {saveStatus === "saving"
                      ? "Publishing..."
                      : "Publish to Catalog"}
                  </button>
                </div>

                {saveStatus === "error" && (
                  <p className="console-alert">Error: Unable to save pattern. Please check backend status.</p>
                )}

                {saveStatus === "saved" && (
                  <p className="console-success">
                    Success: Component successfully registered in database.
                  </p>
                )}
              </form>

              <section className="console-panel">
                <div className="section-title compact-title">
                  <div>
                    <h2>Submitted Component Design Proposals</h2>
                    <p className="console-muted">Requests submitted by development teams for new catalog patterns.</p>
                  </div>
                  <span>{pendingRequests.length} pending approval</span>
                </div>

                {adminRequests.length === 0 && (
                  <p className="console-muted">No custom component requests have been submitted yet.</p>
                )}

                {adminRequests.length > 0 && (
                  <div className="queue-table">
                    <div className="queue-row queue-head">
                      <span>Component Name</span>
                      <span>Design Group</span>
                      <span>Submitter Email</span>
                      <span>Review Control</span>
                    </div>

                    {adminRequests.map((item) => (
                      <div className="queue-row" key={item.id}>
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.description || "No description provided."}</small>
                        </span>
                        <span>{item.category || "General"}</span>
                        <span>{item.requestedBy || "User"}</span>
                        <span className="queue-actions">
                          {item.status === "PENDING" ? (
                            <>
                              <button
                                type="button"
                                className="accept-action-btn"
                                onClick={() => reviewRequest(item, "accept")}
                              >
                                Accept & Register
                              </button>

                              <button
                                type="button"
                                className="reject-action-btn"
                                onClick={() => reviewRequest(item, "reject")}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={item.status === "ACCEPTED" ? "accepted-dot" : "rejected-dot"}>
                              {item.status === "ACCEPTED" ? "ACCEPTED" : "REJECTED"}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              <form className="console-panel add-panel" onSubmit={submitRequest}>
                <div>
                  <h2>Propose a Component Pattern</h2>
                  <p>Submit a request for a new design component to be registered in the central system.</p>
                </div>

                <div className="request-grid">
                  <input
                    placeholder="Proposed Component Name"
                    value={requestForm.name}
                    required
                    onChange={(event) =>
                      setRequestForm({
                        ...requestForm,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Proposed Component Category"
                    value={requestForm.category}
                    onChange={(event) =>
                      setRequestForm({
                        ...requestForm,
                        category: event.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Intended Functional Description (How it behaves, user interactions...)"
                    value={requestForm.description}
                    onChange={(event) =>
                      setRequestForm({
                        ...requestForm,
                        description: event.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Integration Use Cases & Requirements (Required props, APIs to fetch...)"
                    value={requestForm.documentation}
                    onChange={(event) =>
                      setRequestForm({
                        ...requestForm,
                        documentation: event.target.value,
                      })
                    }
                  />

                  <button type="submit" disabled={requestStatus === "saving"}>
                    {requestStatus === "saving"
                      ? "Submitting Proposal..."
                      : "Submit Component Proposal"}
                  </button>
                </div>

                {requestStatus === "submitted" && (
                  <p className="console-success">Proposal successfully registered. The administrator has been notified.</p>
                )}

                {requestStatus === "error" && (
                  <p className="console-alert">Error: Unable to transmit proposal. Check gateway connection.</p>
                )}
              </form>

              <section className="console-panel">
                <h2>My Component Catalog Proposals</h2>

                {myRequests.length === 0 && (
                  <p className="console-muted">
                    You have not proposed any components to the registry yet.
                  </p>
                )}

                {myRequests.length > 0 && (
                  <div className="queue-table">
                    <div className="queue-row queue-head">
                      <span>Component Name</span>
                      <span>Design Group</span>
                      <span>Proposal Status</span>
                      <span>System Response</span>
                    </div>

                    {myRequests.map((item) => (
                      <div className="queue-row" key={item.id}>
                        <span>{item.name}</span>
                        <span>{item.category || "General"}</span>
                        <span
                          className={
                            item.status === "ACCEPTED" ? "accepted-dot" : "pending-text"
                          }
                        >
                          {item.status}
                        </span>
                        <span>{item.message || "Awaiting administrator review."}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <div className="console-bottom-grid">
            <section className="console-panel chart-panel">
              <h2>Category Distribution</h2>

              <div className="bar-chart">
                {categoryCounts.map((item) => (
                  <div className="bar-item" key={item.name}>
                    <span
                      style={{
                        height: `${Math.max(
                          18,
                          (item.count / maxCategoryCount) * 112
                        )}px`,
                      }}
                    />
                    <small>{item.name}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="console-panel activity-panel">
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
                  <dd className="clearance-level-badge">{role || "USER"}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;