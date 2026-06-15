import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddComponent from "./pages/AddComponent";
import ViewComponents from "./pages/ViewComponents";
import Categories from "./pages/Categories";
import SearchComponents from "./pages/SearchComponents";
import ComponentDetails from "./pages/ComponentDetails";
import Favorites from "./pages/Favorites";
import AdminUsers from "./pages/AdminUsers";
import Unauthorized from "./pages/Unauthorized";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/ToastContainer";

function App() {
  const [auth, setAuth] = useState(() => {
    const hasActiveSession = sessionStorage.getItem("activeSession") === "true";

    return {
      token: hasActiveSession ? localStorage.getItem("token") : null,
      role: hasActiveSession ? localStorage.getItem("role") : null,
    };
  });
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");

    if (sessionStorage.getItem("activeSession") !== "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    }
  }, []);

  const showToast = useCallback(({ title, message = "", type = "info" }) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, title, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const handleLogin = (loginData) => {
    sessionStorage.setItem("activeSession", "true");
    localStorage.setItem("token", loginData.token);
    localStorage.setItem("email", loginData.email);
    localStorage.setItem("role", loginData.role);
    localStorage.setItem("name", loginData.name);
    setAuth({ token: loginData.token, role: loginData.role });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("activeSession");
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setAuth({ token: null, role: null });
  };

  const requireAuth = (element) =>
    auth.token ? element : <Navigate to="/login" replace />;

  const requireAdmin = (element) =>
    auth.token && auth.role === "ADMIN"
      ? element
      : <Navigate to={auth.token ? "/unauthorized" : "/login"} replace />;

  return (
    <BrowserRouter>
      <Navbar
        token={auth.token}
        role={auth.role}
        onLogout={handleLogout}
      />
      <ToastContainer toasts={toasts} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={requireAuth(<Dashboard onToast={showToast} />)} />
        <Route path="/add-component" element={requireAdmin(<AddComponent />)} />
        <Route path="/components" element={requireAuth(<ViewComponents onToast={showToast} />)} />
        <Route path="/categories" element={requireAuth(<Categories onToast={showToast} />)} />
        <Route path="/search" element={requireAuth(<SearchComponents onToast={showToast} />)} />
        <Route path="/favorites" element={requireAuth(<Favorites onToast={showToast} />)} />
        <Route path="/component/:id" element={requireAuth(<ComponentDetails onToast={showToast} />)} />
        <Route path="/admin/users" element={requireAuth(<AdminUsers onToast={showToast} />)} />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;