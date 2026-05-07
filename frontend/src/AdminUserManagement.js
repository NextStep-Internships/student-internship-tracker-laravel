import { useState, useEffect } from "react";
import api from "./services/api";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function AdminUserManagement() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form state
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [mot_de_passe, setPassword] = useState("");
    const [role, setRole] = useState("ETUDIANT");
    const [formLoading, setFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Inline edit state
    const [editingId, setEditingId] = useState(null);

    // Search filter
    const [search, setSearch] = useState("");

    const getRoleLabel = (role) => {
        switch (role) {
            case "ETUDIANT": return "Student";
            case "ENCADRANT": return "Supervisor";
            case "ADMIN": return "Administrator";
            default: return role;
        }
    };

    const fetchUsers = () => {
        setLoading(true);
        const userData = localStorage.getItem("user");
        if (userData) {
            try { setCurrentUser(JSON.parse(userData)); } catch {}
        }
        api.get("/auth/users")
            .then((res) => setUsers(res.data.users))
            .catch(() => setError("Failed to load users."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        setError("");
        setSuccess("");
        setFormLoading(true);
        try {
            await api.post("/auth/users", { nom, email, mot_de_passe, role });
            setSuccess("User created successfully!");
            setNom("");
            setEmail("");
            setPassword("");
            setRole("ETUDIANT");
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat()[0]
                : err.response?.data?.message || "Failed to create user.";
            setError(msg);
            setTimeout(() => setError(""), 4000);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/auth/users/${id}`);
            setSuccess("User deleted successfully.");
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user.");
        }
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setNom(user.nom);
        setEmail(user.email);
        setRole(user.role);
        setPassword(""); // Clear password field for security/choice
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setNom("");
        setEmail("");
        setRole("ETUDIANT");
        setPassword("");
    };

    const handleUpdateUser = async () => {
        setError("");
        setSuccess("");
        setFormLoading(true);
        try {
            await api.put(`/auth/users/${editingId}`, { nom, email, role });
            setSuccess("User updated successfully!");
            cancelEdit();
            fetchUsers();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            const msg = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat()[0]
                : err.response?.data?.message || "Failed to update user.";
            setError(msg);
            setTimeout(() => setError(""), 4000);
        } finally {
            setFormLoading(false);
        }
    };

    const getRoleStyle = (role) => {
        switch (role) {
            case "ADMIN": return { bg: "linear-gradient(135deg, #7c3aed, #5b21b6)", label: "Admin" };
            case "ENCADRANT": return { bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", label: "Supervisor" };
            case "ETUDIANT": return { bg: "linear-gradient(135deg, #16a34a, #15803d)", label: "Student" };
            default: return { bg: "#94a3b8", label: role };
        }
    };

    const getAvatarStyle = (role) => {
        switch (role) {
            case "ADMIN": return { bg: "#f3e8ff", color: "#7c3aed" };
            case "ENCADRANT": return { bg: "#dbeafe", color: "#2563eb" };
            case "ETUDIANT": return { bg: "#dcfce7", color: "#16a34a" };
            default: return { bg: "#f1f5f9", color: "#64748b" };
        }
    };

    const adminCount = users.filter(u => u.role === "ADMIN").length;
    const encadrantCount = users.filter(u => u.role === "ENCADRANT").length;
    const studentCount = users.filter(u => u.role === "ETUDIANT").length;

    const filteredUsers = users.filter(user =>
        user.nom.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="pro-dashboard">
            {/* Sidebar */}
            <Sidebar activePage="admin-users" />

            {/* Main Content */}
            <div className="pro-main-wrapper">
                {/* Top Bar */}
                <header className="pro-topbar">
                    <div className="pro-topbar-left">
                        <h1 className="pro-page-title">User Management</h1>
                        <p className="pro-page-sub">Manage roles and accounts across the platform</p>
                    </div>
                    <div className="pro-topbar-right">
                        <div className="aum-topbar-search">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="pro-content">
                    {/* Stats Row */}
                    <div className="aum-stats-row">
                        <div className="aum-stat-card aum-stat-total">
                            <div className="aum-stat-icon"><i className="bi bi-people-fill"></i></div>
                            <div className="aum-stat-info">
                                <span className="aum-stat-label">Total Users</span>
                                <h3 className="aum-stat-value">{users.length}</h3>
                            </div>
                        </div>
                        <div className="aum-stat-card aum-stat-admin">
                            <div className="aum-stat-icon"><i className="bi bi-shield-fill"></i></div>
                            <div className="aum-stat-info">
                                <span className="aum-stat-label">Admins</span>
                                <h3 className="aum-stat-value">{adminCount}</h3>
                            </div>
                        </div>
                        <div className="aum-stat-card aum-stat-supervisor">
                            <div className="aum-stat-icon"><i className="bi bi-person-badge"></i></div>
                            <div className="aum-stat-info">
                                <span className="aum-stat-label">Supervisors</span>
                                <h3 className="aum-stat-value">{encadrantCount}</h3>
                            </div>
                        </div>
                        <div className="aum-stat-card aum-stat-student">
                            <div className="aum-stat-icon"><i className="bi bi-mortarboard"></i></div>
                            <div className="aum-stat-info">
                                <span className="aum-stat-label">Students</span>
                                <h3 className="aum-stat-value">{studentCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Two column grid: form + table */}
                    <div className="aum-grid">
                        {/* Create User Form */}
                        <div className="aum-card aum-form-card">
                            <div className="aum-card-header">
                                <h2><i className={`bi bi-person-${editingId ? "pencil" : "plus"}-fill`}></i> {editingId ? "Update User" : "Create New User"}</h2>
                                <p>{editingId ? `Modifying details for: ${nom}` : "Add a new user account to the platform"}</p>
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

                                <div className="aum-form-group">
                                    <label>Full Name</label>
                                    <div className="aum-input-wrap">
                                        <i className="bi bi-person"></i>
                                        <input type="text" placeholder="e.g. Sarah Johnson" value={nom}
                                            onChange={(e) => setNom(e.target.value)} />
                                    </div>
                                </div>

                                <div className="aum-form-group">
                                    <label>Email Address</label>
                                    <div className="aum-input-wrap">
                                        <i className="bi bi-envelope"></i>
                                        <input type="email" placeholder="e.g. sarah@university.edu" value={email}
                                            onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>

                                {!editingId && (
                                    <div className="aum-form-group">
                                        <label>Password</label>
                                        <div className="aum-input-wrap">
                                            <i className="bi bi-lock"></i>
                                            <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={mot_de_passe}
                                                onChange={(e) => setPassword(e.target.value)} />
                                            <button type="button" className="aum-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`bi bi-eye${showPassword ? "-slash" : ""}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="aum-form-group">
                                    <label>Role</label>
                                    <div className="aum-input-wrap aum-select-wrap">
                                        <i className="bi bi-shield-check"></i>
                                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                                            <option value="ETUDIANT">Student</option>
                                            <option value="ENCADRANT">Supervisor</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="aum-form-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <button className="aum-btn aum-btn-create" onClick={editingId ? handleUpdateUser : handleCreateUser} disabled={formLoading}>
                                        {formLoading ? (
                                            <>
                                                <span className="aum-spinner"></span>
                                                {editingId ? "Updating..." : "Creating..."}
                                            </>
                                        ) : (
                                            <>
                                                <i className={`bi bi-${editingId ? "pencil-square" : "check2-circle"}`}></i>
                                                {editingId ? "Update User" : "Create User"}
                                            </>
                                        )}
                                    </button>
                                    {editingId && (
                                        <button className="aum-btn" style={{ background: '#f1f5f9', color: '#64748b' }} onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Users Table Card */}
                        <div className="aum-card aum-table-card">
                            <div className="aum-card-header">
                                <h2><i className="bi bi-list-ul"></i> All Users</h2>
                                <span className="aum-table-count">{filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="aum-card-body aum-card-body-table">
                                {loading ? (
                                    <div className="aum-loading">
                                        <div className="aum-spinner-lg"></div>
                                        <p>Loading users...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="aum-empty">
                                        <i className="bi bi-inbox"></i>
                                        <p>No users found</p>
                                    </div>
                                ) : (
                                    <div className="aum-table-scroll">
                                        <table className="aum-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Role</th>
                                                    <th>Change Role</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredUsers.map((user) => {
                                                    const roleStyle = getRoleStyle(user.role);
                                                    const avatarStyle = getAvatarStyle(user.role);
                                                    return (
                                                        <tr key={user.id}>
                                                            <td>
                                                                <div className="aum-user-cell">
                                                                    <div className="aum-user-avatar" style={{ background: avatarStyle.bg, color: avatarStyle.color }}>
                                                                        {user.nom.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="aum-user-info">
                                                                        <span className="aum-user-name">{user.nom}</span>
                                                                        <span className="aum-user-email">{user.email}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="aum-role-badge" style={{ background: roleStyle.bg }}>
                                                                    {roleStyle.label}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="aum-row-actions">
                                                                    <button className="aum-btn-icon aum-btn-edit" onClick={() => startEdit(user)} title="Edit user">
                                                                        <i className="bi bi-pencil-square"></i>
                                                                    </button>
                                                                    <button className="aum-btn-icon aum-btn-delete" onClick={() => handleDeleteUser(user.id)} title="Delete user">
                                                                        <i className="bi bi-trash3"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminUserManagement;