import { useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [mot_de_passe, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                mot_de_passe,
            });

            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-premium-page">
            <section className="auth-showcase">
                <div className="showcase-content">
                    <div className="product-badge">
                        <i className="bi bi-stars"></i>
                        Academic Internship Platform
                    </div>

                    <h1 className="showcase-title">
                        Manage internship progress with clarity.
                    </h1>

                    <p className="showcase-text">
                        A centralized platform for students, academic supervisors, and
                        administrators to track weekly reports, documents, validations, and
                        internship progress.
                    </p>

                    <div className="showcase-grid">
                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-journal-text"></i>
                            <h4>Weekly Reports</h4>
                            <p>Submit structured progress reports every week.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-patch-check"></i>
                            <h4>Validation</h4>
                            <p>Supervisors can review, comment, validate or reject.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-folder2-open"></i>
                            <h4>Documents</h4>
                            <p>Upload conventions, attestations and final reports.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-graph-up-arrow"></i>
                            <h4>Dashboards</h4>
                            <p>Visualize progress and academic internship status.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="auth-form-zone">
                <div className="auth-card-ultra">
                    <div className="auth-logo">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>

                    <h2>Welcome back</h2>
                    <p className="auth-description">
                        Sign in to continue to your internship dashboard.
                    </p>

                    {error && (
                        <div className="premium-alert" style={{ backgroundColor: 'rgba(220, 38, 38, 0.12)', color: 'var(--danger)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                            {error}
                        </div>
                    )}

                    <div className="premium-form-group">
                        <label>Email address</label>
                        <div className="premium-input-wrap">
                            <i className="bi bi-envelope premium-input-icon"></i>
                            <input
                                className="premium-input"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="premium-form-group">
                        <label>Password</label>
                        <div className="premium-input-wrap">
                            <i className="bi bi-lock premium-input-icon"></i>
                            <input
                                className="premium-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={mot_de_passe}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                            </button>
                        </div>
                    </div>

                    <button className="premium-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" style={{ width: '1rem', height: '1rem' }}></span>
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <div className="auth-bottom-text">
                        New to the platform?{" "}
                        <span onClick={() => navigate("/register")}>Create account</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
