import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./services/api";

const getRoleLabel = (role) => {
  switch (role) {
    case "ETUDIANT":  return "Student";
    case "ENCADRANT": return "Supervisor";
    case "ADMIN":     return "Administrator";
    default:          return role || "";
  }
};

/**
 * Shared sidebar — identical to the Dashboard sidebar.
 * Pass `activePage` to highlight the correct nav item.
 * Possible values: "dashboard" | "reports" | "validation" |
 *                  "supervision" | "requests" | "admin-users"
 */
function Sidebar({ activePage = "" }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  // Auto-detect active page from route if not explicitly provided
  const path = location.pathname;
  const active = activePage ||
    (path.startsWith("/dashboard")          ? "dashboard"   :
     path.startsWith("/reports")            ? "reports"     :
     path.startsWith("/validation")         ? "validation"  :
     path.startsWith("/supervision-request") && user.role === "ETUDIANT"
                                             ? "supervision" :
     path.startsWith("/supervision-request") ? "requests"   :
     path.startsWith("/admin")              ? "admin-users" :
     "");

  const handleLogout = () => {
    api.post("/auth/logout").finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  const NavItem = ({ to, icon, label, page }) => (
    <a
      href="#!"
      className={`pro-nav-item${active === page ? " active" : ""}`}
      onClick={(e) => { e.preventDefault(); navigate(to); }}
    >
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </a>
  );

  return (
    <aside className="pro-sidebar">
      {/* Brand */}
      <div className="pro-sidebar-header">
        <div className="pro-logo">
          <i className="bi bi-mortarboard-fill"></i>
        </div>
        <div className="pro-brand-text">
          <span className="pro-brand-name">InternTrack</span>
          <span className="pro-brand-sub">Academic Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="pro-sidebar-nav">
        <NavItem to="/dashboard" icon="bi-speedometer2"    label="Dashboard"  page="dashboard" />
        <NavItem to="/reports"   icon="bi-journal-text"    label="Reports"    page="reports"   />

        {/* Supervisor-only */}
        {user.role === "ENCADRANT" && (
          <>
            <NavItem to="/validation"          icon="bi-check2-square" label="Validation" page="validation" />
            <NavItem to="/supervision-requests" icon="bi-inbox-fill"   label="Requests"   page="requests"   />
          </>
        )}

        {/* Student-only */}
        {user.role === "ETUDIANT" && (
          <NavItem to="/supervision-request" icon="bi-person-plus" label="Supervision" page="supervision" />
        )}

        {/* Admin-only */}
        {user.role === "ADMIN" && (
          <NavItem to="/admin/users" icon="bi-people-fill" label="Manage Users" page="admin-users" />
        )}

        {/* Common */}
        <a href="#!" className="pro-nav-item" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-folder2-open"></i><span>Documents</span>
        </a>
        <a href="#!" className="pro-nav-item" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-calendar-event"></i><span>Calendar</span>
        </a>
        <a href="#!" className="pro-nav-item" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-chat-dots"></i><span>Messages</span>
        </a>
        <a href="#!" className="pro-nav-item" onClick={(e) => e.preventDefault()}>
          <i className="bi bi-person-circle"></i><span>Profile</span>
        </a>
      </nav>

      {/* Footer */}
      <div className="pro-sidebar-footer">
        <div className="pro-user-mini">
          <div className="pro-user-avatar">{user.nom?.charAt(0) || "U"}</div>
          <div className="pro-user-info">
            <strong>{user.nom || "Utilisateur"}</strong>
            <span>{getRoleLabel(user.role)}</span>
          </div>
        </div>
        <button className="pro-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
