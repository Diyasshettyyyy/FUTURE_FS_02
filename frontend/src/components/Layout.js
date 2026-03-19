import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  const initials = (name) => name ? name.slice(0, 2).toUpperCase() : "AD";

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 20 20" fill="#0a0a0c"><path d="M10 2L2 7v6l8 5 8-5V7L10 2zm0 2.4l5.6 3.5L10 11.4 4.4 7.9 10 4.4zM3.5 9.3l6 3.7v4.1l-6-3.7V9.3zm8.5 7.8v-4.1l6-3.7v4.1l-6 3.7z"/></svg>
          </div>
          <div className="brand-name">Lead<span>Flow</span></div>
        </div>
        <div className="nav-section-label">Menu</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/leads" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M6 8a3 3 0 100-6 3 3 0 000 6zM11 14H1a5 5 0 0110 0zM13 6a2 2 0 110-4 2 2 0 010 4zM15 14h-2a3 3 0 00-2.5-2.975A4 4 0 0115 14z"/></svg>
          All Leads
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M11 2a1 1 0 00-1 1v10h2V3a1 1 0 00-1-1zM7 6a1 1 0 00-1 1v6h2V7a1 1 0 00-1-1zM3 10a1 1 0 00-1 1v2h2v-2a1 1 0 00-1-1z"/></svg>
          Analytics
        </NavLink>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials(user?.username)}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:14,height:14}}><path d="M6 2H2v12h4v-1H3V3h3V2zM11 5l-1 1 2 2H6v1h6l-2 2 1 1 3-3-3-3z"/></svg>
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
