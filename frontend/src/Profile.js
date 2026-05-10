import { useEffect, useState } from "react";
import api from "./services/api";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    api.get("/auth/profile")
      .then((res) => {
        setUser(res.data.user);
        setForm({
          nom: res.data.user.nom || "",
          email: res.data.user.email || "",
        });
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await api.put("/auth/profile", form);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwForm.password !== pwForm.password_confirmation) {
      setPwError("Passwords do not match."); return;
    }
    setSavingPw(true); setPwError(""); setPwSuccess("");
    try {
      await api.put("/auth/password", pwForm);
      setPwSuccess("Password changed successfully.");
      setPwForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPw(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ETUDIANT": return "Student";
      case "ENCADRANT": return "Supervisor";
      case "ADMIN": return "Administrator";
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ETUDIANT": return { bg: "#dbeafe", color: "#2563eb" };
      case "ENCADRANT": return { bg: "#f3e8ff", color: "#7c3aed" };
      case "ADMIN": return { bg: "#fef3c7", color: "#d97706" };
      default: return { bg: "#f1f5f9", color: "#64748b" };
    }
  };

  if (loading) return (
    <div className="pro-dashboard">
      <Sidebar activePage="profile" />
      <div className="pro-main-wrapper">
        <div className="dash-loading"><div className="dash-spinner"></div></div>
      </div>
    </div>
  );

  const roleStyle = getRoleColor(user?.role);

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="profile" />
      <div className="pro-main-wrapper">
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Profile</h1>
            <p className="pro-page-sub">Manage your personal information</p>
          </div>
          <div className="pro-topbar-right">
            <button className="pro-topbar-btn"><i className="bi bi-bell"></i></button>
            <button className="pro-topbar-btn"><i className="bi bi-gear"></i></button>
            <div className="pro-topbar-avatar">{user?.nom?.charAt(0) || "U"}</div>
          </div>
        </header>

        <main className="pro-content">
          {success && (
            <div className="pf-alert pf-alert-success">
              <i className="bi bi-check-circle-fill"></i> {success}
              <button onClick={() => setSuccess("")}><i className="bi bi-x"></i></button>
            </div>
          )}
          {error && (
            <div className="pf-alert pf-alert-error">
              <i className="bi bi-exclamation-circle-fill"></i> {error}
              <button onClick={() => setError("")}><i className="bi bi-x"></i></button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
            {/* Profile Card */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <section className="pro-card">
                <div className="pro-card-body" style={{ textAlign: "center", padding: "32px 24px" }}>
                  <div className="pf-avatar">{user?.nom?.charAt(0) || "U"}</div>
                  <h2 className="pf-name">{user?.nom}</h2>
                  <span className="pf-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                    {getRoleLabel(user?.role)}
                  </span>
                  <p className="pf-email"><i className="bi bi-envelope"></i> {user?.email}</p>
                  <div className="pf-divider"></div>
                  <div className="pf-meta">
                    <div className="pf-meta-item">
                      <span className="pf-meta-label">Member since</span>
                      <span className="pf-meta-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Stats */}
              <section className="pro-card">
                <div className="pro-card-header">
                  <h3><i className="bi bi-bar-chart-line-fill"></i> Activity</h3>
                </div>
                <div className="pro-card-body">
                  <div className="pf-stats">
                    <div className="pf-stat-item">
                      <i className="bi bi-journal-text" style={{ color: "var(--primary)" }}></i>
                      <div>
                        <span className="pf-stat-label">Reports</span>
                        <span className="pf-stat-value">—</span>
                      </div>
                    </div>
                    <div className="pf-stat-item">
                      <i className="bi bi-folder2-open" style={{ color: "var(--secondary)" }}></i>
                      <div>
                        <span className="pf-stat-label">Documents</span>
                        <span className="pf-stat-value">—</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Edit Forms */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Personal Info */}
              <section className="pro-card">
                <div className="pro-card-header">
                  <h3><i className="bi bi-person-fill"></i> Personal Information</h3>
                  {!editing && (
                    <button className="pf-edit-btn" onClick={() => setEditing(true)}>
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                  )}
                </div>
                <div className="pro-card-body">
                  <div className="pf-form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      {editing
                        ? <input className="form-input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
                        : <div className="pf-field-value">{user?.nom || "—"}</div>
                      }
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      {editing
                        ? <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        : <div className="pf-field-value">{user?.email || "—"}</div>
                      }
                    </div>

                  </div>
                  {editing && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                      <button className="modal-btn-cancel" onClick={() => { setEditing(false); setError(""); }}>Cancel</button>
                      <button className="modal-btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Change Password */}
              <section className="pro-card">
                <div className="pro-card-header">
                  <h3><i className="bi bi-shield-lock-fill"></i> Change Password</h3>
                </div>
                <div className="pro-card-body">
                  {pwSuccess && (
                    <div className="pf-alert pf-alert-success" style={{ marginBottom: 16 }}>
                      <i className="bi bi-check-circle-fill"></i> {pwSuccess}
                      <button onClick={() => setPwSuccess("")}><i className="bi bi-x"></i></button>
                    </div>
                  )}
                  {pwError && (
                    <div className="pf-alert pf-alert-error" style={{ marginBottom: 16 }}>
                      <i className="bi bi-exclamation-circle-fill"></i> {pwError}
                      <button onClick={() => setPwError("")}><i className="bi bi-x"></i></button>
                    </div>
                  )}
                  <div className="pf-form-grid">
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Current Password</label>
                      <input className="form-input" type="password" value={pwForm.current_password}
                        onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input className="form-input" type="password" value={pwForm.password}
                        onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input className="form-input" type="password" value={pwForm.password_confirmation}
                        onChange={(e) => setPwForm({ ...pwForm, password_confirmation: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <button className="modal-btn-save" onClick={handlePasswordChange} disabled={savingPw}>
                      {savingPw ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .pf-avatar {
          width: 90px; height: 90px; border-radius: 50%; margin: 0 auto 16px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white; font-size: 36px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .pf-name { margin: 0 0 10px; font-size: 20px; font-weight: 800; }
        .pf-role-badge { padding: 4px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; }
        .pf-email { margin: 12px 0 0; font-size: 13px; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 6px; }
        .pf-bio { margin: 12px 0 0; font-size: 13px; color: var(--muted); line-height: 1.5; }
        .pf-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        .pf-meta-item { display: flex; flex-direction: column; gap: 2px; }
        .pf-meta-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .pf-meta-value { font-size: 14px; font-weight: 600; }
        .pf-stats { display: flex; flex-direction: column; gap: 12px; }
        .pf-stat-item { display: flex; align-items: center; gap: 12px; }
        .pf-stat-item i { font-size: 20px; }
        .pf-stat-label { display: block; font-size: 12px; color: var(--muted); }
        .pf-stat-value { display: block; font-size: 16px; font-weight: 700; }
        .pf-edit-btn {
          padding: 7px 16px; border-radius: 8px; border: 1.5px solid var(--primary);
          background: white; color: var(--primary); cursor: pointer; font-size: 13px;
          font-weight: 600; display: flex; align-items: center; gap: 6px;
        }
        .pf-edit-btn:hover { background: var(--primary); color: white; }
        .pf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pf-field-value { padding: 10px 14px; background: var(--light-bg); border-radius: 10px; font-size: 14px; color: var(--dark); border: 1.5px solid var(--border); }
        .pf-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
        .pf-alert button { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.7; font-size: 16px; }
        .pf-alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .pf-alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 13px; font-weight: 600; color: var(--dark); }
        .form-input {
          padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 10px;
          font-size: 14px; font-family: inherit; outline: none; transition: border 0.15s;
          background: var(--light-bg);
        }
        .form-input:focus { border-color: var(--primary); background: white; }
        .modal-btn-cancel {
          padding: 10px 20px; border-radius: 10px; border: 1.5px solid var(--border);
          background: white; cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .modal-btn-save {
          padding: 10px 20px; border-radius: 10px; border: none;
          background: var(--primary); color: white; cursor: pointer; font-size: 14px; font-weight: 600;
        }
        .modal-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default Profile;