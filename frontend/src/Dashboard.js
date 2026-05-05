import { useEffect, useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        api
            .get("/auth/profile")
            .then((response) => {
                setUser(response.data.user);
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/login");
            });
    }, [navigate]);

    const handleLogout = () => {
        api.post("/auth/logout").then(() => {
            localStorage.removeItem("token");
            navigate("/login");
        }).catch(() => {
            localStorage.removeItem("token");
            navigate("/login");
        });
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "ETUDIANT": return "Student";
            case "ENCADRANT": return "Supervisor";
            case "ADMIN": return "Administrator";
            default: return role;
        }
    };

    const getQuickActions = () => {
        switch (user?.role) {
            case "ETUDIANT":
                return (
                    <div className="quick-actions-grid">
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-journal-plus"></i></div>
                            <span>Submit Weekly Report</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-upload"></i></div>
                            <span>Upload Documents</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-calendar-check"></i></div>
                            <span>Track Attendance</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-chat-dots"></i></div>
                            <span>Message Supervisor</span>
                        </button>
                    </div>
                );
            case "ENCADRANT":
                return (
                    <div className="quick-actions-grid">
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-eye"></i></div>
                            <span>Review Reports</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-patch-check"></i></div>
                            <span>Validate Progress</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-students"></i></div>
                            <span>View Students</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-clipboard-data"></i></div>
                            <span>Generate Report</span>
                        </button>
                    </div>
                );
            case "ADMIN":
                return (
                    <div className="quick-actions-grid">
                        <button className="qa-btn" onClick={() => navigate("/admin/users")}>
                            <div className="qa-icon"><i className="bi bi-people"></i></div>
                            <span>Manage Users</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-gear"></i></div>
                            <span>System Settings</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-bar-chart"></i></div>
                            <span>Analytics</span>
                        </button>
                        <button className="qa-btn">
                            <div className="qa-icon"><i className="bi bi-shield-check"></i></div>
                            <span>Security</span>
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    const getActivityItems = () => {
        const activities = [
            { icon: "bi-box-arrow-right", text: "Session started", time: "Just now", color: "blue" },
            { icon: "bi-shield-check", text: "JWT authentication verified", time: "Just now", color: "green" },
        ];

        if (user?.role === "ETUDIANT") {
            activities.push(
                { icon: "bi-journal-plus", text: "Weekly report due in 2 days", time: "2 days left", color: "orange" },
                { icon: "bi-upload", text: "Documents verified by supervisor", time: "Yesterday", color: "green" }
            );
        } else if (user?.role === "ENCADRANT") {
            activities.push(
                { icon: "bi-bell", text: "3 reports pending review", time: "3 pending", color: "orange" },
                { icon: "bi-people", text: "12 students under supervision", time: "Active", color: "blue" }
            );
        } else if (user?.role === "ADMIN") {
            activities.push(
                { icon: "bi-people", text: "5 new users registered today", time: "Today", color: "blue" },
                { icon: "bi-server", text: "System running normally", time: "Online", color: "green" }
            );
        }

        return activities;
    };

    if (!user) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
            </div>
        );
    }

    return (
        <div className="pro-dashboard">
            {/* Sidebar */}
            <aside className="pro-sidebar">
                <div className="pro-sidebar-header">
                    <div className="pro-logo">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <div className="pro-brand-text">
                        <span className="pro-brand-name">InternTrack</span>
                        <span className="pro-brand-sub">Academic Platform</span>
                    </div>
                </div>

                <nav className="pro-sidebar-nav">
                    <a href="#" className="pro-nav-item active">
                        <i className="bi bi-speedometer2"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="pro-nav-item">
                        <i className="bi bi-journal-text"></i>
                        <span>Reports</span>
                    </a>
                    <a href="#" className="pro-nav-item">
                        <i className="bi bi-folder2-open"></i>
                        <span>Documents</span>
                    </a>
                    <a href="#" className="pro-nav-item">
                        <i className="bi bi-calendar-event"></i>
                        <span>Calendar</span>
                    </a>
                    <a href="#" className="pro-nav-item">
                        <i className="bi bi-chat-dots"></i>
                        <span>Messages</span>
                    </a>
                    <a href="#" className="pro-nav-item">
                        <i className="bi bi-person-circle"></i>
                        <span>Profile</span>
                    </a>
                </nav>

                <div className="pro-sidebar-footer">
                    <div className="pro-user-mini">
                        <div className="pro-user-avatar">{user.nom.charAt(0)}</div>
                        <div className="pro-user-info">
                            <strong>{user.nom}</strong>
                            <span>{getRoleLabel(user.role)}</span>
                        </div>
                    </div>
                    <button className="pro-logout-btn" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="pro-main-wrapper">
                {/* Top Bar */}
                <header className="pro-topbar">
                    <div className="pro-topbar-left">
                        <h1 className="pro-page-title">Dashboard</h1>
                        <p className="pro-page-sub">Welcome back — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="pro-topbar-right">
                        <button className="pro-topbar-btn">
                            <i className="bi bi-bell"></i>
                        </button>
                        <button className="pro-topbar-btn">
                            <i className="bi bi-gear"></i>
                        </button>
                        <div className="pro-topbar-avatar">{user.nom.charAt(0)}</div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="pro-content">
                    {/* Welcome Banner */}
                    <section className="pro-welcome-banner">
                        <div className="pro-welcome-text">
                            <div className="pro-welcome-badge">
                                <i className="bi bi-stars"></i>
                                {getRoleLabel(user.role)} Panel
                            </div>
                            <h2>Hello, <span className="pro-name-highlight">{user.nom}</span></h2>
                            <p>Here's an overview of your academic internship activity. Stay on track with your weekly reports andsupervisor feedback.</p>
                        </div>
                        <div className="pro-welcome-graphic">
                            <div className="pro-circle-1"></div>
                            <div className="pro-circle-2"></div>
                            <i className="bi bi-mortarboard-fill pro-welcome-icon"></i>
                        </div>
                    </section>

                    {/* Stats Row */}
                    <section className="pro-stats-row">
                        <div className="pro-stat-card">
                            <div className="pro-stat-icon blue"><i className="bi bi-person-check-fill"></i></div>
                            <div className="pro-stat-info">
                                <span className="pro-stat-label">Account Status</span>
                                <h3 className="pro-stat-value green">Active</h3>
                            </div>
                        </div>
                        <div className="pro-stat-card">
                            <div className="pro-stat-icon purple"><i className="bi bi-shield-lock-fill"></i></div>
                            <div className="pro-stat-info">
                                <span className="pro-stat-label">Authentication</span>
                                <h3 className="pro-stat-value">JWT Secured</h3>
                            </div>
                        </div>
                        <div className="pro-stat-card">
                            <div className="pro-stat-icon green"><i className="bi bi-award-fill"></i></div>
                            <div className="pro-stat-info">
                                <span className="pro-stat-label">Role</span>
                                <h3 className="pro-stat-value">{getRoleLabel(user.role)}</h3>
                            </div>
                        </div>
                        <div className="pro-stat-card">
                            <div className="pro-stat-icon orange"><i className="bi bi-calendar3"></i></div>
                            <div className="pro-stat-info">
                                <span className="pro-stat-label">Academic Year</span>
                                <h3 className="pro-stat-value">2025 — 2026</h3>
                            </div>
                        </div>
                    </section>

                    {/* Two Column Grid */}
                    <div className="pro-content-grid">
                        {/* Quick Actions */}
                        <section className="pro-card">
                            <div className="pro-card-header">
                                <h3><i className="bi bi-lightning-fill"></i>Quick Actions</h3>
                            </div>
                            <div className="pro-card-body">
                                {getQuickActions()}
                            </div>
                        </section>

                        {/* Activity Feed */}
                        <section className="pro-card">
                            <div className="pro-card-header">
                                <h3><i className="bi bi-activity"></i>Recent Activity</h3>
                            </div>
                            <div className="pro-card-body">
                                <div className="pro-activity-list">
                                    {getActivityItems().map((item, idx) => (
                                        <div key={idx} className="pro-activity-item">
                                            <div className={`pro-activity-dot ${item.color}`}></div>
                                            <div className="pro-activity-content">
                                                <span className="pro-activity-text">{item.text}</span>
                                                <span className="pro-activity-time">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Profile Panel */}
                    <section className="pro-card pro-profile-card">
                        <div className="pro-card-header">
                            <h3><i className="bi bi-person-circle"></i>Profile Information</h3>
                            <span className="pro-role-tag">{getRoleLabel(user.role)}</span>
                        </div>
                        <div className="pro-card-body">
                            <div className="pro-profile-grid">
                                <div className="pro-profile-field">
                                    <span className="pro-field-label">Full Name</span>
                                    <span className="pro-field-value">{user.nom}</span>
                                </div>
                                <div className="pro-profile-field">
                                    <span className="pro-field-label">Email Address</span>
                                    <span className="pro-field-value">{user.email}</span>
                                </div>
                                <div className="pro-profile-field">
                                    <span className="pro-field-label">User Role</span>
                                    <span className="pro-field-value">{getRoleLabel(user.role)}</span>
                                </div>
                                <div className="pro-profile-field">
                                    <span className="pro-field-label">User ID</span>
                                    <span className="pro-field-value">#{user.id}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
