import { useState } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [mot_de_passe, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/auth/register", {
                nom,
                email,
                mot_de_passe,
            });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/dashboard");
        } catch (error) {
            if (error.response?.data?.errors) {
                const messages = Object.values(error.response.data.errors).flat();
                setError(messages[0] || "Validation failed.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Registration failed. Please try again.");
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
                        Start your internship journey.
                    </h1>

                    <p className="showcase-text">
                        Join thousands of students tracking their academic internships with real-time progress, supervisor feedback, and comprehensive reporting.
                    </p>

                    <div className="showcase-grid">
                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-person-plus"></i>
                            <h4>Create Profile</h4>
                            <p>Complete your information in seconds.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-check-circle"></i>
                            <h4>Verified Account</h4>
                            <p>Get instant access to dashboard.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-graph-up"></i>
                            <h4>Track Progress</h4>
                            <p>Monitor your internship journey.</p>
                        </div>

                        <div className="showcase-feature fade-in-up">
                            <i className="bi bi-shield-check"></i>
                            <h4>Secure Platform</h4>
                            <p>Your data is protected.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="auth-form-zone">
                <div className="auth-card-ultra fade-in-up">
                    <div className="auth-logo">
                        <i className="bi bi-person-plus-fill"></i>
                    </div>

                    <h2>Create Account</h2>
                    <p className="auth-description">
                        Join the Internship Tracker platform.
                    </p>

                    {error && (
                        <div className="premium-alert" style={{ backgroundColor: 'rgba(220, 38, 38, 0.12)', color: 'var(--danger)', border: '1px solid rgba(220, 38, 38, 0.2)' }}>{error}</div>
                    )}

                    <div className="premium-form-group">
                        <label>Full Name</label>
                        <div className="premium-input-wrap">
                            <i className="bi bi-person premium-input-icon"></i>
                            <input
                                className="premium-input"
                                type="text"
                                placeholder="Enter your full name"
                                value={nom}
                                onChange={(e) => setNom(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="premium-form-group">
                        <label>Email Address</label>
                        <div className="premium-input-wrap">
                            <i className="bi bi-envelope premium-input-icon"></i>
                            <input
                                className="premium-input"
                                type="email"
                                placeholder="Enter your email"
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
                                placeholder="Create a password"
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

                    
                    <button className="premium-btn" onClick={handleRegister} disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" style={{ width: '1rem', height: '1rem' }}></span>
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <div className="auth-bottom-text">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/login")}>Sign in</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Register;
