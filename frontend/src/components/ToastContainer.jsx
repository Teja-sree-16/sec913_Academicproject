const toDisplayText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toDisplayText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return toDisplayText(value.message) || toDisplayText(value.error) || toDisplayText(value.detail) || JSON.stringify(value);
  }
  return String(value);
};

function ToastContainer({ toasts }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type || "info"}`} key={toast.id}>
          <strong>{toDisplayText(toast.title)}</strong>
          {toast.message && <span>{toDisplayText(toast.message)}</span>}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;