import { Routes, Route, Navigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStoredMember, clearAuth, setStoredMember } from "./api/client";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chatbot from "./pages/Chatbot";
import Symptoms from "./pages/Symptoms";
import PhcSearch from "./pages/PhcSearch";
import HealthTips from "./pages/HealthTips";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

function ProtectedRoute({ children, adminOnly = false }) {
  const member = getStoredMember();

  if (!member || !member._id) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && member.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function BrandLink() {
  return (
    <RouterLink to="/" className="navbar-brand">
      <span className="brand-logo">🩺</span>
      <span>
        <strong>Arogya Innovators</strong>
        <span className="brand-tagline">Health in your language</span>
      </span>
    </RouterLink>
  );
}

function Layout({ children }) {
  const [member, setMember] = useState(getStoredMember());
  const location = useLocation();

  // Refresh member state when route changes (e.g., after login/register)
  useEffect(() => {
    setMember(getStoredMember());
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    setMember(null);
    window.location.href = "/";
  };

  const isAdmin = member?.role === "ADMIN";
  const hasAuth = Boolean(member && member._id);
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) {
    return <main className="auth-layout">{children}</main>;
  }

  return (
    <div className="app-shell">
      {/* ===== Top bar: brand + location/search + login ===== */}
      <div className="topbar">
        <BrandLink />
        <div className="topbar-right">
          <span className="topbar-location">📍 Rural Health Programme</span>
          <RouterLink to="/phcs" className="topbar-search">
            🔍 Find PHC
          </RouterLink>
          {hasAuth ? (
            <button onClick={handleLogout} className="btn btn-small btn-outline-sm">
              Logout
            </button>
          ) : (
            <RouterLink to="/login" className="btn btn-small btn-login">
              Login 👤
            </RouterLink>
          )}
        </div>
      </div>

      {/* ===== Nav links ===== */}
      <nav className="top-nav">
        <RouterLink to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
          Home
        </RouterLink>
        <RouterLink
          to="/chat"
          className={location.pathname === "/chat" ? "nav-link active" : "nav-link"}
        >
          AI Health
        </RouterLink>
        <RouterLink
          to="/symptoms"
          className={location.pathname === "/symptoms" ? "nav-link active" : "nav-link"}
        >
          Symptoms
        </RouterLink>
        <RouterLink
          to="/phcs"
          className={location.pathname === "/phcs" ? "nav-link active" : "nav-link"}
        >
          PHC
        </RouterLink>
        <RouterLink
          to="/health-tips"
          className={location.pathname === "/health-tips" ? "nav-link active" : "nav-link"}
        >
          Health Tips
        </RouterLink>
        {isAdmin && (
          <RouterLink
            to="/admin"
            className={location.pathname === "/admin" ? "nav-link active" : "nav-link"}
          >
            Admin
          </RouterLink>
        )}
        <RouterLink
          to="/profile"
          className={location.pathname === "/profile" ? "nav-link active" : "nav-link"}
        >
          My Records
        </RouterLink>
      </nav>

      <main className="main-content">{children}</main>

      {/* ===== Footer ===== */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <strong>Arogya Innovators</strong>
            <p className="muted small-text">
              AI-powered health guidance for rural communities — English & తెలుగు.
            </p>
          </div>
          <div className="footer-links">
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/health-tips">Health Tips</RouterLink>
            <RouterLink to="/phcs">Find PHC</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </div>
          <div className="footer-note">
            <p className="muted small-text">
              ⚠️ This app provides guidance only and is not a substitute for professional medical
              care. For emergencies, call <strong>108</strong>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const stored = getStoredMember();
    if (stored) setStoredMember(stored);
  }, []);

  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/health-tips" element={<HealthTips />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <Symptoms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/phcs"
          element={
            <ProtectedRoute>
              <PhcSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}