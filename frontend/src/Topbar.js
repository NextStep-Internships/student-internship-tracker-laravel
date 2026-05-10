import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";

function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    api.get("/notifications")
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.est_lue).length;

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, est_lue: 1 } : n))
      );
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, est_lue: 1 })));
    } catch {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <header className="pro-topbar">
      <div className="pro-topbar-left">
        <h1 className="pro-page-title">{title}</h1>
        <p className="pro-page-sub">{subtitle}</p>
      </div>
      <div className="pro-topbar-right">
        {/* Bell Button */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            className="pro-topbar-btn"
            onClick={() => setShowNotifs((v) => !v)}
            style={{ position: "relative" }}
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <i className="bi bi-bell-slash"></i>
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.est_lue ? "unread" : ""}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="notif-icon">
                        <i className={
                          n.titre?.toLowerCase().includes("deadline") ? "bi bi-clock-fill" :
                          n.rapport_id ? "bi bi-file-earmark-text-fill" :
                          "bi bi-bell-fill"
                        }></i>
                      </div>
                      <div className="notif-content">
                        <span className="notif-title">{n.titre}</span>
                        <span className="notif-msg">{n.message}</span>
                        <span className="notif-time">{formatDate(n.date_envoi)}</span>
                      </div>
                      {!n.est_lue && <div className="notif-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gear → Profile */}
        <button
          className="pro-topbar-btn"
          onClick={() => navigate("/profile")}
          title="Settings / Profile"
        >
          <i className="bi bi-gear"></i>
        </button>

        {/* Avatar → Profile */}
        <div
          className="pro-topbar-avatar"
          onClick={() => navigate("/profile")}
          title="My Profile"
          style={{ cursor: "pointer" }}
        >
          {user.nom?.charAt(0) || "U"}
        </div>
      </div>

      <style>{`
        .notif-badge {
          position: absolute;
          top: -4px; right: -4px;
          background: #dc2626; color: white;
          font-size: 10px; font-weight: 900;
          width: 18px; height: 18px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
        }
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 10px); right: 0;
          width: 360px;
          background: white;
          border-radius: 18px;
          border: 1px solid var(--border);
          box-shadow: 0 20px 60px rgba(15,23,42,0.15);
          z-index: 200;
          overflow: hidden;
        }
        .notif-dropdown-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
          font-weight: 800; font-size: 14px;
        }
        .notif-mark-all {
          background: none; border: none; cursor: pointer;
          font-size: 12px; color: var(--primary); font-weight: 700;
          font-family: inherit;
        }
        .notif-mark-all:hover { text-decoration: underline; }
        .notif-list { max-height: 380px; overflow-y: auto; }
        .notif-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 36px; color: var(--muted);
        }
        .notif-empty i { font-size: 32px; opacity: 0.4; }
        .notif-empty p { margin: 0; font-size: 13px; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 18px; cursor: pointer;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.15s;
        }
        .notif-item:hover { background: var(--light-bg); }
        .notif-item.unread { background: #eff6ff; }
        .notif-item.unread:hover { background: #dbeafe; }
        .notif-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: var(--primary-soft); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .notif-content { flex: 1; min-width: 0; }
        .notif-title {
          display: block; font-size: 13px; font-weight: 700;
          color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .notif-msg {
          display: block; font-size: 12px; color: var(--muted);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 2px 0;
        }
        .notif-time { font-size: 11px; color: #94a3b8; font-weight: 600; }
        .notif-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--primary); flex-shrink: 0; margin-top: 4px;
        }
      `}</style>
    </header>
  );
}

export default Topbar;