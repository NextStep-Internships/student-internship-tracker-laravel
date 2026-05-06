import { useEffect, useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/auth/profile")
            .then((res) => {
                setUser(res.data.user);
                return api.get("/auth/dashboard-stats");
            })
            .then((res) => setStats(res.data.stats))
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            });
    }, [navigate]);

    const handleLogout = () => {
        api.post("/auth/logout").then(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }).catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
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
                        {/* Navigates to reports page */}
                        <button className="qa-btn" onClick={() => navigate("/reports")}>
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
                        {/* Navigates to reports page */}
                        <button className="qa-btn" onClick={() => navigate("/validation")}>
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
                        <button className="qa-btn">
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

    const getStatutLabel = (statut) => {
        switch (statut) {
            case "soumis": return "Submitted";
            case "en_revision": return "In Review";
            case "accepte": return "Accepted";
            case "refuse": return "Rejected";
            default: return statut;
        }
    };

    const getStatutColor = (statut) => {
        switch (statut) {
            case "soumis": return "#2563eb";
            case "en_revision": return "#f59e0b";
            case "accepte": return "#16a34a";
            case "refuse": return "#dc2626";
            default: return "#94a3b8";
        }
    };

    if (!user) {
        return (
            <div className="dash-loading">
                <div className="dash-spinner"></div>
            </div>
        );
    }

    const totalReports = stats
        ? Object.values(stats.reports_by_status || {}).reduce((a, b) => a + b, 0)
        : 0;

    const maxBarValue = stats?.monthly_submissions
        ? Math.max(...stats.monthly_submissions.map(m => m.count), 1)
        : 1;

    const role = stats?.role || user.role;

    // Stats cards per role
    const getStatsCards = () => {
        if (role === "ADMIN") {
            return [
                { icon: "bi-people-fill", iconClass: "blue", label: "Total Users", value: stats?.total_users ?? "—" },
                { icon: "bi-file-earmark-text-fill", iconClass: "green", label: "Total Reports", value: stats?.total_reports ?? "—" },
                { icon: "bi-check-circle-fill", iconClass: "purple", label: "Accepted", value: stats?.reports_by_status?.accepte ?? 0 },
                { icon: "bi-hourglass-split", iconClass: "orange", label: "Pending Review", value: ((stats?.reports_by_status?.soumis ?? 0) + (stats?.reports_by_status?.en_revision ?? 0)) },
            ];
        }
        if (role === "ENCADRANT") {
            return [
                { icon: "bi-mortarboard", iconClass: "blue", label: "My Students", value: stats?.total_students ?? 0 },
                { icon: "bi-file-earmark-text-fill", iconClass: "green", label: "Reports to Review", value: stats?.total_reports ?? 0 },
                { icon: "bi-check-circle-fill", iconClass: "purple", label: "Accepted", value: stats?.reports_by_status?.accepte ?? 0 },
                { icon: "bi-hourglass-split", iconClass: "orange", label: "Pending Review", value: ((stats?.reports_by_status?.soumis ?? 0) + (stats?.reports_by_status?.en_revision ?? 0)) },
            ];
        }
        // Student
        return [
            { icon: "bi-journal-text", iconClass: "blue", label: "My Reports", value: stats?.total_reports ?? 0 },
            { icon: "bi-check-circle-fill", iconClass: "green", label: "Accepted", value: stats?.reports_by_status?.accepte ?? 0 },
            { icon: "bi-arrow-repeat", iconClass: "purple", label: "In Review", value: stats?.reports_by_status?.en_revision ?? 0 },
            { icon: "bi-x-circle-fill", iconClass: "orange", label: "Rejected", value: stats?.reports_by_status?.refuse ?? 0 },
        ];
    };

    // Chart cards per role
    const showUsersByRole = role === "ADMIN";

    return (
        <div className="pro-dashboard">
            {/* Sidebar */}
            <Sidebar activePage="dashboard" />

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
                            <p>Here's an overview of your academic internship activity. Stay on track with your weekly reports and supervisor feedback.</p>
                        </div>
                        <div className="pro-welcome-graphic">
                            <div className="pro-circle-1"></div>
                            <div className="pro-circle-2"></div>
                            <i className="bi bi-mortarboard-fill pro-welcome-icon"></i>
                        </div>
                    </section>

                    {/* Stats Row */}
                    <section className="pro-stats-row">
                        {getStatsCards().map((card, idx) => (
                            <div key={idx} className="pro-stat-card">
                                <div className={`pro-stat-icon ${card.iconClass}`}>
                                    <i className={`bi ${card.icon}`}></i>
                                </div>
                                <div className="pro-stat-info">
                                    <span className="pro-stat-label">{card.label}</span>
                                    <h3 className="pro-stat-value">{card.value}</h3>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Quick Action Buttons */}
                    <section className="pro-actions-row">
                        {role === "ETUDIANT" && (
                            <>
                                <button className="pro-action-btn pro-action-primary" onClick={() => navigate("/supervision-request")}>
                                    <i className="bi bi-person-plus"></i>
                                    <div className="pro-action-text">
                                        <span className="pro-action-title">Request Supervision</span>
                                        <span className="pro-action-sub">Choose your supervisor</span>
                                    </div>
                                </button>
                                <button className="pro-action-btn pro-action-secondary" onClick={() => navigate("/submit-report")}>
                                    <i className="bi bi-file-earmark-plus"></i>
                                    <div className="pro-action-text">
                                        <span className="pro-action-title">Submit Report</span>
                                        <span className="pro-action-sub">Upload a weekly report</span>
                                    </div>
                                </button>
                            </>
                        )}
                        {role === "ENCADRANT" && (
                            <button className="pro-action-btn pro-action-primary" onClick={() => navigate("/supervision-requests")}>
                                <i className="bi bi-inbox-fill"></i>
                                <div className="pro-action-text">
                                    <span className="pro-action-title">Student Requests</span>
                                    <span className="pro-action-sub">Review supervision applications</span>
                                </div>
                            </button>
                        )}
                    </section>

                    {/* Charts Row */}
                    <div className="pro-content-grid pro-charts-grid">
                        {/* Monthly Submissions Bar Chart — shared by all */}
                        <section className="pro-card pro-chart-card">
                            <div className="pro-card-header">
                                <h3><i className="bi bi-bar-chart-fill"></i>
                                    {role === "ETUDIANT" ? "My Monthly Submissions" : role === "ENCADRANT" ? "Monthly Submissions" : "Monthly Report Submissions"}
                                </h3>
                            </div>
                            <div className="pro-card-body pro-chart-body">
                                {stats && stats.monthly_submissions && stats.monthly_submissions.length > 0 ? (
                                    <div className="bar-chart">
                                        {stats.monthly_submissions.map((item, idx) => (
                                            <div key={idx} className="bar-chart-col">
                                                <div className="bar-chart-bar-wrap">
                                                    <div
                                                        className="bar-chart-bar"
                                                        style={{ height: `${(item.count / maxBarValue) * 100}%` }}
                                                    >
                                                        <span className="bar-chart-value">{item.count}</span>
                                                    </div>
                                                </div>
                                                <span className="bar-chart-label">{item.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="pro-chart-empty">
                                        <i className="bi bi-bar-chart"></i>
                                        <p>No submission data yet</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Reports by Status Donut — shared by all */}
                        <section className="pro-card pro-chart-card">
                            <div className="pro-card-header">
                                <h3><i className="bi bi-pie-chart-fill"></i>Reports by Status</h3>
                            </div>
                            <div className="pro-card-body pro-chart-body">
                                {stats && totalReports > 0 ? (
                                    <div className="donut-chart-wrap">
                                        <div className="donut-chart"
                                            style={{
                                                background: `conic-gradient(
                                                    ${getStatutColor('soumis')} 0% ${(stats.reports_by_status.soumis / totalReports * 100).toFixed(1)}%,
                                                    ${getStatutColor('en_revision')} ${(stats.reports_by_status.soumis / totalReports * 100).toFixed(1)}% ${((stats.reports_by_status.soumis + stats.reports_by_status.en_revision) / totalReports * 100).toFixed(1)}%,
                                                    ${getStatutColor('accepte')} ${((stats.reports_by_status.soumis + stats.reports_by_status.en_revision) / totalReports * 100).toFixed(1)}% ${((stats.reports_by_status.soumis + stats.reports_by_status.en_revision + stats.reports_by_status.accepte) / totalReports * 100).toFixed(1)}%,
                                                    ${getStatutColor('refuse')} ${((stats.reports_by_status.soumis + stats.reports_by_status.en_revision + stats.reports_by_status.accepte) / totalReports * 100).toFixed(1)}% 100%
                                                )`
                                            }}
                                        >
                                            <div className="donut-center">
                                                <span className="donut-total">{totalReports}</span>
                                                <span className="donut-label">Reports</span>
                                            </div>
                                        </div>
                                        <div className="donut-legend">
                                            {Object.entries(stats.reports_by_status || {}).map(([key, count]) => (
                                                <div key={key} className="donut-legend-item">
                                                    <span className="donut-legend-dot" style={{ background: getStatutColor(key) }}></span>
                                                    <span className="donut-legend-label">{getStatutLabel(key)}</span>
                                                    <span className="donut-legend-count">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pro-chart-empty">
                                        <i className="bi bi-pie-chart"></i>
                                        <p>No report data yet</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Student: Supervision Status Card */}
                        {role === "ETUDIANT" && (
                            <section className="pro-card pro-chart-card">
                                <div className="pro-card-header">
                                    <h3><i className="bi bi-person-badge-fill"></i>Supervision Status</h3>
                                </div>
                                <div className="pro-card-body pro-chart-body">
                                    {stats?.supervision_status === "ACCEPTE" ? (
                                        <div className="sup-status-card sup-status-accepted">
                                            <div className="sup-status-icon">
                                                <i className="bi bi-check-circle-fill"></i>
                                            </div>
                                            <div className="sup-status-text">
                                                <h4>Supervisor Assigned</h4>
                                                <p>You have an active supervisor. You can submit reports for review.</p>
                                            </div>
                                            <button className="sup-status-action" onClick={() => navigate("/supervision-request")}>
                                                <i className="bi bi-arrow-right-circle"></i>
                                            </button>
                                        </div>
                                    ) : stats?.supervision_status === "EN_ATTENTE" ? (
                                        <div className="sup-status-card sup-status-pending">
                                            <div className="sup-status-icon">
                                                <i className="bi bi-clock-fill"></i>
                                            </div>
                                            <div className="sup-status-text">
                                                <h4>Request Pending</h4>
                                                <p>Your supervision request is waiting for review.</p>
                                            </div>
                                            <button className="sup-status-action" onClick={() => navigate("/supervision-request")}>
                                                <i className="bi bi-eye"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="sup-status-card sup-status-none">
                                            <div className="sup-status-icon">
                                                <i className="bi bi-person-dash-fill"></i>
                                            </div>
                                            <div className="sup-status-text">
                                                <h4>No Supervisor</h4>
                                                <p>You need to request a supervisor before submitting reports.</p>
                                            </div>
                                            <button className="sup-status-action" onClick={() => navigate("/supervision-request")}>
                                                <i className="bi bi-plus-circle-fill"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Supervisor: Quick Overview Card */}
                        {role === "ENCADRANT" && (
                            <section className="pro-card pro-chart-card">
                                <div className="pro-card-header">
                                    <h3><i className="bi bi-lightning-fill"></i>Quick Actions</h3>
                                </div>
                                <div className="pro-card-body pro-chart-body">
                                    <div className="quick-actions-vertical">
                                        <button className="qa-vertical-btn" onClick={() => navigate("/supervision-requests")}>
                                            <i className="bi bi-inbox-fill"></i>
                                            <div>
                                                <strong>Review Requests</strong>
                                                <span>Accept or reject student applications</span>
                                            </div>
                                        </button>
                                        <button className="qa-vertical-btn" onClick={() => navigate("/validation")}>
                                            <i className="bi bi-eye-fill"></i>
                                            <div>
                                                <strong>View Student Reports</strong>
                                                <span>Check and validate submissions</span>
                                            </div>
                                        </button>
                                        <button className="qa-vertical-btn" onClick={() => navigate("/reports")}>
                                            <i className="bi bi-chat-left-text-fill"></i>
                                            <div>
                                                <strong>Give Feedback</strong>
                                                <span>Comment on submitted reports</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Users by Role — Admin only */}
                        {showUsersByRole && (
                            <section className="pro-card pro-chart-card">
                                <div className="pro-card-header">
                                    <h3><i className="bi bi-people-fill"></i>Users by Role</h3>
                                </div>
                                <div className="pro-card-body pro-chart-body">
                                    {stats ? (
                                        <div className="role-dist-wrap">
                                            {[
                                                { role: "Admin", count: stats.users_by_role?.admins ?? 0, color: "#7c3aed", icon: "bi-shield-fill" },
                                                { role: "Supervisor", count: stats.users_by_role?.supervisors ?? 0, color: "#2563eb", icon: "bi-person-badge-fill" },
                                                { role: "Student", count: stats.users_by_role?.students ?? 0, color: "#16a34a", icon: "bi-mortarboard-fill" },
                                            ].map((item) => {
                                                const pct = stats.total_users > 0 ? (item.count / stats.total_users * 100) : 0;
                                                return (
                                                    <div key={item.role} className="role-dist-item">
                                                        <div className="role-dist-header">
                                                            <div className="role-dist-icon" style={{ background: item.color + "20", color: item.color }}>
                                                                <i className={`bi ${item.icon}`}></i>
                                                            </div>
                                                            <div className="role-dist-meta">
                                                                <span className="role-dist-name">{item.role}</span>
                                                                <span className="role-dist-count">{item.count} users</span>
                                                            </div>
                                                            <span className="role-dist-pct">{pct.toFixed(0)}%</span>
                                                        </div>
                                                        <div className="role-dist-bar">
                                                            <div
                                                                className="role-dist-fill"
                                                                style={{ width: `${pct}%`, background: item.color }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="pro-chart-empty">
                                            <i className="bi bi-people"></i>
                                            <p>Loading...</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Supervised Students List — Supervisor only */}
                        {role === "ENCADRANT" && stats?.supervised_students && (
                            <section className="pro-card pro-chart-card">
                                <div className="pro-card-header">
                                    <h3><i className="bi bi-mortarboard"></i>My Supervised Students</h3>
                                </div>
                                <div className="pro-card-body pro-chart-body">
                                    {stats.supervised_students.length > 0 ? (
                                        <div className="supervised-students-list">
                                            {stats.supervised_students.map((student) => (
                                                <div key={student.id} className="supervised-student-item">
                                                    <div className="supervised-student-avatar">
                                                        {student.nom.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="supervised-student-name">{student.nom}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="pro-chart-empty">
                                            <i className="bi bi-person-dash"></i>
                                            <p>No students assigned yet</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Recent Reports Table */}
                    <section className="pro-card">
                        <div className="pro-card-header">
                            <h3>
                                <i className="bi bi-clock-history"></i>
                                {role === "ETUDIANT" ? "My Recent Reports" : role === "ENCADRANT" ? "Recent Student Reports" : "Recent Report Submissions"}
                            </h3>
                        </div>
                        <div className="pro-card-body" style={{ padding: "0" }}>
                            {stats && stats.recent_reports && stats.recent_reports.length > 0 ? (
                                <table className="pro-reports-table">
                                    <thead>
                                        <tr>
                                            <th>Report Title</th>
                                            {role !== "ETUDIANT" && <th>Author</th>}
                                            <th>Status</th>
                                            <th>Submitted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_reports.map((r) => (
                                            <tr key={r.id}>
                                                <td className="pro-report-title">
                                                    <i className="bi bi-file-earmark-text"></i>
                                                    {r.titre || `Report #${r.id}`}
                                                </td>
                                                {role !== "ETUDIANT" && <td>{r.auteur}</td>}
                                                <td>
                                                    <span
                                                        className="pro-status-badge"
                                                        style={{
                                                            background: getStatutColor(r.statut) + "20",
                                                            color: getStatutColor(r.statut),
                                                        }}
                                                    >
                                                        {getStatutLabel(r.statut)}
                                                    </span>
                                                </td>
                                                <td className="pro-report-date">
                                                    {r.date ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="pro-reports-empty">
                                    <i className="bi bi-inbox"></i>
                                    <p>No reports submitted yet</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;