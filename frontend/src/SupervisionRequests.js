import { useState, useEffect } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";

function SupervisionRequests() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [filter, setFilter] = useState("EN_ATTENTE");
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try { setCurrentUser(JSON.parse(userData)); } catch {}
        }
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        api.get("/supervision-requests")
            .then((res) => setRequests(res.data.requests))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case "ETUDIANT": return "Student";
            case "ENCADRANT": return "Supervisor";
            case "ADMIN": return "Administrator";
            default: return role;
        }
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case "EN_ATTENTE":
                return <span className="req-badge req-badge-pending"><i className="bi bi-clock"></i> Pending</span>;
            case "ACCEPTE":
                return <span className="req-badge req-badge-accepted"><i className="bi bi-check-circle"></i> Accepted</span>;
            case "REFUSE":
                return <span className="req-badge req-badge-rejected"><i className="bi bi-x-circle"></i> Rejected</span>;
            default:
                return <span className="req-badge">{statut}</span>;
        }
    };

    const handleRespond = async (id, action) => {
        setProcessingId(id);
        try {
            await api.put(`/supervision-requests/${id}`, { action });
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to respond.");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter((r) => {
        if (filter === "all") return true;
        return r.statut === filter;
    });

    const pendingCount = requests.filter(r => r.statut === "EN_ATTENTE").length;

    return (
        <div className="aum-page">
            <aside className="aum-sidebar">
                <div className="aum-sidebar-header">
                    <div className="aum-logo">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <div className="aum-brand-text">
                        <span className="aum-brand-name">InternTrack</span>
                        <span className="aum-brand-sub">Supervisor Panel</span>
                    </div>
                </div>

                <nav className="aum-sidebar-nav">
                    <a href="#" className="aum-nav-item" onClick={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
                        <i className="bi bi-speedometer2"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="aum-nav-item">
                        <i className="bi bi-journal-text"></i>
                        <span>Reports</span>
                    </a>
                    <a href="#" className="aum-nav-item">
                        <i className="bi bi-folder2-open"></i>
                        <span>Documents</span>
                    </a>
                    <a href="#" className="aum-nav-item">
                        <i className="bi bi-calendar-event"></i>
                        <span>Calendar</span>
                    </a>
                    <a href="#" className="aum-nav-item">
                        <i className="bi bi-chat-dots"></i>
                        <span>Messages</span>
                    </a>
                    <a href="#" className="aum-nav-item active">
                        <i className="bi bi-inbox-fill"></i>
                        <span>Requests</span>
                        {pendingCount > 0 && <span className="req-nav-badge">{pendingCount}</span>}
                    </a>
                    <a href="#" className="aum-nav-item">
                        <i className="bi bi-person-circle"></i>
                        <span>Profile</span>
                    </a>
                </nav>

                <div className="aum-sidebar-footer">
                    {currentUser && (
                        <div className="aum-user-mini">
                            <div className="aum-user-avatar">{currentUser.nom.charAt(0)}</div>
                            <div className="aum-user-info">
                                <strong>{currentUser.nom}</strong>
                                <span>{getRoleLabel(currentUser.role)}</span>
                            </div>
                        </div>
                    )}
                    <button className="aum-logout-btn" onClick={() => { localStorage.clear(); navigate("/login"); }}>
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <div className="aum-main-wrapper">
                <header className="aum-topbar">
                    <div className="aum-topbar-left">
                        <h1 className="aum-page-title">Student Requests</h1>
                        <p className="aum-page-sub">Review and manage student supervision requests</p>
                    </div>
                    <button className="pro-topbar-btn" onClick={() => navigate("/dashboard")}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                </header>

                <main className="aum-content">
                    {/* Filter Tabs */}
                    <div className="req-filter-tabs">
                        {[
                            { key: "EN_ATTENTE", label: "Pending", badge: pendingCount },
                            { key: "ACCEPTE", label: "Accepted", badge: null },
                            { key: "REFUSE", label: "Rejected", badge: null },
                            { key: "all", label: "All", badge: null },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                className={`req-filter-tab ${filter === tab.key ? "active" : ""}`}
                                onClick={() => setFilter(tab.key)}
                            >
                                {tab.label}
                                {tab.badge > 0 && <span className="req-tab-badge">{tab.badge}</span>}
                            </button>
                        ))}
                    </div>

                    {/* Requests List */}
                    <div className="req-list">
                        {loading ? (
                            <div className="req-loading">
                                <div className="aum-spinner-lg"></div>
                                <p>Loading requests...</p>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="req-empty">
                                <i className="bi bi-inbox"></i>
                                <p>No {filter !== "all" ? filter.toLowerCase().replace("_", " ") : ""} requests found.</p>
                            </div>
                        ) : (
                            filteredRequests.map((req) => (
                                <div key={req.id} className="req-card">
                                    <div className="req-card-header">
                                        <div className="req-student-info">
                                            <div className="req-student-avatar">
                                                {req.etudiant?.nom?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <h3 className="req-student-name">{req.etudiant?.nom || "Unknown"}</h3>
                                                <span className="req-student-email">{req.etudiant?.email || ""}</span>
                                            </div>
                                        </div>
                                        <div className="req-header-right">
                                            {getStatutBadge(req.statut)}
                                            <span className="req-date">
                                                {req.date_demande
                                                    ? new Date(req.date_demande).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {req.message && (
                                        <div className="req-message">
                                            <i className="bi bi-chat-left-text"></i>
                                            <p>"{req.message}"</p>
                                        </div>
                                    )}

                                    {req.statut === "EN_ATTENTE" && (
                                        <div className="req-actions">
                                            <button
                                                className="req-btn req-btn-accept"
                                                onClick={() => handleRespond(req.id, "ACCEPTE")}
                                                disabled={processingId === req.id}
                                            >
                                                {processingId === req.id ? (
                                                    <><span className="aum-spinner" style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "white" }}></span> Processing...</>
                                                ) : (
                                                    <><i className="bi bi-check-circle"></i> Accept</>
                                                )}
                                            </button>
                                            <button
                                                className="req-btn req-btn-reject"
                                                onClick={() => handleRespond(req.id, "REFUSE")}
                                                disabled={processingId === req.id}
                                            >
                                                <><i className="bi bi-x-circle"></i> Reject</>
                                            </button>
                                        </div>
                                    )}

                                    {req.statut !== "EN_ATTENTE" && (
                                        <div className="req-response-date">
                                            <i className={`bi ${req.statut === "ACCEPTE" ? "bi-check-circle" : "bi-x-circle"}`}></i>
                                            Responded on{" "}
                                            {req.date_reponse
                                                ? new Date(req.date_reponse).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                : "—"}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SupervisionRequests;