import { useState, useEffect } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function SupervisionRequest() {
    const navigate = useNavigate();
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try { setCurrentUser(JSON.parse(userData)); } catch {}
        }
        api.get("/supervisors")
            .then((res) => setSupervisors(res.data.supervisors))
            .catch(() => setError("Failed to load supervisors."));
    }, []);

    const getRoleLabel = (role) => {
        switch (role) {
            case "ETUDIANT": return "Student";
            case "ENCADRANT": return "Supervisor";
            case "ADMIN": return "Administrator";
            default: return role;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!selectedId) { setError("Please select a supervisor."); return; }

        setLoading(true);
        try {
            await api.post("/supervision-requests", {
                encadrant_id: parseInt(selectedId),
                message,
            });
            setSuccess("Request sent! Your supervisor will review it shortly.");
            setSelectedId("");
            setMessage("");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pro-dashboard">
            <Sidebar activePage="supervision" />

            <div className="pro-main-wrapper">
                <header className="pro-topbar">
                    <div className="pro-topbar-left">
                        <h1 className="pro-page-title">Supervision Request</h1>
                        <p className="pro-page-sub">Choose a supervisor to guide you during your internship</p>
                    </div>
                    <div className="pro-topbar-right">
                        <button className="pro-topbar-btn" onClick={() => navigate("/dashboard")}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                    </div>
                </header>

                <main className="pro-content">
                    <div className="sr-layout">
                        {/* Info Card */}
                        <div className="sr-info-card">
                            <div className="sr-info-icon">
                                <i className="bi bi-lightning-charge-fill"></i>
                            </div>
                            <h2>How it works</h2>
                            <ul>
                                <li>
                                    <i className="bi bi-check2"></i>
                                    <span>Select a supervisor from the list</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2"></i>
                                    <span>Write an optional message to introduce yourself</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2"></i>
                                    <span>Your request will be reviewed and accepted or rejected</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2"></i>
                                    <span>You can only have <strong>one supervisor</strong> at a time</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2"></i>
                                    <span>Once accepted, you can submit reports for review</span>
                                </li>
                            </ul>
                        </div>

                        {/* Request Form */}
                        <div className="aum-card sr-form-card">
                            <div className="aum-card-header">
                                <h2><i className="bi bi-send-fill"></i>Send a Request</h2>
                            </div>
                            <div className="aum-card-body">
                                {error && (
                                    <div className="aum-alert aum-alert-error">
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="aum-alert aum-alert-success">
                                        <i className="bi bi-check-circle-fill"></i>
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="aum-form-group">
                                        <label>Select Supervisor <span className="required-star">*</span></label>
                                        <div className="aum-input-wrap aum-select-wrap">
                                            <i className="bi bi-person-badge"></i>
                                            <select
                                                value={selectedId}
                                                onChange={(e) => setSelectedId(e.target.value)}
                                                required
                                            >
                                                <option value="">— Choose a supervisor —</option>
                                                {supervisors.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.nom} ({s.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="aum-form-group">
                                        <label>Message <span className="sr-optional">(optional)</span></label>
                                        <div className="aum-input-wrap aum-textarea-wrap">
                                            <i className="bi bi-chat-left-text" style={{ alignSelf: "flex-start", marginTop: "12px" }}></i>
                                            <textarea
                                                placeholder="Introduce yourself, explain your internship topic, goals..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows="5"
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="aum-btn aum-btn-create" disabled={loading || !selectedId}>
                                        {loading ? (
                                            <><span className="aum-spinner"></span> Sending...</>
                                        ) : (
                                            <><i className="bi bi-send"></i> Send Request</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SupervisionRequest;