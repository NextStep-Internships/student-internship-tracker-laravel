import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./services/api";
import Sidebar from "./Sidebar";

function ReportsList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchUser();
    fetchReports();
  }, []);

  const fetchUser = () => {
    api.get("/auth/profile")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/rapports");
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setReports(data);
      setError("");
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.post("/auth/logout").finally(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  };

  // Status Handlers
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/rapports/${id}/statut`, { statut: newStatus });
      setReports(reports.map(r => r.id === id ? {...r, statut: newStatus} : r));
      if(selectedReport?.id === id) setSelectedReport({...selectedReport, statut: newStatus});
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report permanently?")) return;
    try {
      await api.delete(`/rapports/${id}`);
      setReports(reports.filter(r => r.id !== id));
      setShowModal(false);
    } catch (err) {
      alert("Error deleting report");
    }
  };

  // Comments Handlers
  const openComments = async (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setNewComment("");
    try {
      setLoadingComments(true);
      const res = await api.get(`/rapports/${report.id}/commentaires`);
      setComments(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/rapports/${selectedReport.id}/commentaires`, { contenu: newComment });
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      alert("Error adding comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/commentaires/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert("Error deleting comment");
    }
  };

  // Helpers
  const getRoleLabel = (role) => ({
    ETUDIANT: "Student",
    ENCADRANT: "Supervisor",
    ADMIN: "Admin"
  }[role] || role);

  const getStatusConfig = (statut) => {
    const configs = {
      BROUILLON: { label: "Draft", icon: "bi-pencil-square", color: "gray", bgClass: "#6c757d" },
      SOUMIS: { label: "Submitted", icon: "bi-send-check", color: "blue", bgClass: "#0d6efd" },
      VALIDE: { label: "Validated", icon: "bi-patch-check-fill", color: "green", bgClass: "#198754" },
      REJETE: { label: "Rejected", icon: "bi-x-circle-fill", color: "red", bgClass: "#dc3545" }
    };
    return configs[statut] || { label: statut, icon: "bi-question-circle", color: "secondary" };
  };

  const canEdit = (report) => user?.role === "ETUDIANT" && String(report.auteur_id) === String(user?.id) && report.statut === "BROUILLON";
  const canSubmit = (report) => user?.role === "ETUDIANT" && String(report.auteur_id) === String(user?.id) && report.statut === "BROUILLON";
  const canReview = (report) => (user?.role === "ENCADRANT" || user?.role === "ADMIN") && report.statut === "SOUMIS";
  
  const filteredReports = filterStatus === "ALL" 
    ? reports 
    : reports.filter(r => r.statut === filterStatus);

  const stats = {
    TOTAL: reports.length,
    BROUILLON: reports.filter(r => r.statut === "BROUILLON").length,
    SOUMIS: reports.filter(r => r.statut === "SOUMIS").length,
    VALIDE: reports.filter(r => r.statut === "VALIDE").length,
    REJETE: reports.filter(r => r.statut === "REJETE").length
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
      <Sidebar activePage="reports" />

      {/* Main Wrapper */}
      <div className="pro-main-wrapper">
        {/* Topbar - Same as Dashboard */}
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Reports Management</h1>
            <p className="pro-page-sub">Track and manage internship weekly reports • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="pro-topbar-right">
            <button className="pro-topbar-btn" onClick={() => navigate('/dashboard')}>
              <i className="bi bi-arrow-left"></i>
            </button>
            <button className="pro-topbar-btn">
              <i className="bi bi-bell"></i>
            </button>
            <div className="pro-topbar-avatar">{user.nom.charAt(0)}</div>
          </div>
        </header>

        <main className="pro-content">
          {/* Error State */}
          {error && (
            <div className="pro-alert error">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {error}
              <button onClick={fetchReports}>Retry</button>
            </div>
          )}

          {/* Stats Row - Using exact Dashboard Stat Card Style */}
          <section className="pro-stats-row">
            <div className="pro-stat-card">
              <div className="pro-stat-icon blue"><i className="bi bi-journal-text"></i></div>
              <div className="pro-stat-info">
                <span className="pro-stat-label">Total Reports</span>
                <h3 className="pro-stat-value">{stats.TOTAL}</h3>
              </div>
            </div>
            
            <div className="pro-stat-card">
              <div className="pro-stat-icon gray"><i className="bi bi-pencil-square"></i></div>
              <div className="pro-stat-info">
                <span className="pro-stat-label">Drafts</span>
                <h3 className="pro-stat-value">{stats.BROUILLON}</h3>
              </div>
            </div>

            <div className="pro-stat-card">
              <div className="pro-stat-icon orange"><i className="bi bi-hourglass-split"></i></div>
              <div className="pro-stat-info">
                <span className="pro-stat-label">Pending Review</span>
                <h3 className="pro-stat-value">{stats.SOUMIS}</h3>
              </div>
            </div>

            <div className="pro-stat-card">
              <div className="pro-stat-icon green"><i className="bi bi-patch-check"></i></div>
              <div className="pro-stat-info">
                <span className="pro-stat-label">Validated</span>
                <h3 className="pro-stat-value">{stats.VALIDE}</h3>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="pro-content-grid">
            {/* Left Column: Actions & Filters */}
            <section className="pro-card">
              <div className="pro-card-header">
                <h3><i className="bi bi-funnel-fill"></i> Filters & Actions</h3>
                <span className="pro-role-tag">Control Panel</span>
              </div>
              <div className="pro-card-body">
                <div className="filter-group">
                  <label>Status Filter:</label>
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pro-select"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="BROUILLON">Drafts Only</option>
                    <option value="SOUMIS">Submitted</option>
                    <option value="VALIDE">Validated</option>
                    <option value="REJETE">Rejected</option>
                  </select>
                </div>

                <div className="quick-actions-grid mt-20">
                  {user?.role === 'ETUDIANT' && (
                    <button className="qa-btn" onClick={() => navigate('/reports/new')}>
                      <div className="qa-icon"><i className="bi bi-plus-circle-fill"></i></div>
                      <span>New Report</span>
                      <small>Create weekly submission</small>
                    </button>
                  )}
                  
                  {(user?.role === 'ENCADRANT' || user?.role === 'ADMIN') && stats.SOUMIS > 0 && (
                    <button className="qa-btn warning" onClick={() => setFilterStatus('SOUMIS')}>
                      <div className="qa-icon"><i className="bi bi-eye-fill"></i></div>
                      <span>{stats.SOUMIS} Pending</span>
                      <small>Requires review</small>
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Right Column: Quick Info */}
            <section className="pro-card">
              <div className="pro-card-header">
                <h3><i className="bi bi-info-circle-fill"></i> Module Guide</h3>
              </div>
              <div className="pro-card-body">
                <div className="guide-list">
                  <div className="guide-item">
                    <i className="bi bi-check2-circle text-green"></i>
                    <div>
                      <strong>One Report Per Week</strong>
                      <small>You can only submit one validated report per calendar week.</small>
                    </div>
                  </div>
                  
                  <div className="guide-item">
                    <i className="bi bi-shield-lock text-blue"></i>
                    <div>
                      <strong>Status Workflow</strong>
                      <small>Draft → Submitted → Validated/Rejected</small>
                    </div>
                  </div>

                  <div className="guide-item">
                    <i className="bi bi-chat-quote text-purple"></i>
                    <div>
                      <strong>Comments System</strong>
                      <small>Supervisors can add feedback on any submitted report.</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Main Table Card */}
          <section className="pro-card full-width">
            <div className="pro-card-header space-between">
              <h3><i className="bi bi-table"></i> Reports List</h3>
              <span className="status-count">{filteredReports.length} entries</span>
            </div>
            <div className="pro-card-body p-0">
              
              {loading ? (
                <div className="dash-loading p-40">
                  <div className="dash-spinner"></div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <h3>No reports found</h3>
                  <p>Try adjusting your filters or create a new report.</p>
                  {user?.role === 'ETUDIANT' && (
                    <button className="btn btn-primary mt-10" onClick={() => navigate('/reports/new')}>
                      Create First Report
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="reports-table-pro">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Author</th>
                        {(user?.role === 'ENCADRANT' || user?.role === 'ADMIN') && <th>Supervisor</th>}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => {
                        const statusCfg = getStatusConfig(report.statut);
                        return (
                          <tr key={report.id}>
                            <td data-label="ID">#{report.id}</td>
                            <td data-label="Title">
                              <div className="report-title-cell">
                                <strong>{report.titre}</strong>
                                <small>{report.contenu?.substring(0, 50)}...</small>
                              </div>
                            </td>
                            <td data-label="Date">
                              {new Date(report.date_depot).toLocaleDateString()}
                            </td>
                            <td data-label="Status">
                              <span className={`status-badge ${statusCfg.color}`}>
                                <i className={`bi ${statusCfg.icon}`}></i>
                                {statusCfg.label}
                              </span>
                            </td>
                            <td data-label="Author">
                              <div className="user-cell">
                                <div className="mini-avatar">{report.auteur?.nom?.charAt(0) || '?'}</div>
                                <span>{report.auteur?.nom || `User #${report.auteur_id}`}</span>
                              </div>
                            </td>
                            
                            {(user?.role === 'ENCADRANT' || user?.role === 'ADMIN') && (
                              <td data-label="Supervisor">
                                {report.encadrant?.nom || '-'}
                              </td>
                            )}

                            <td data-label="Actions" className="actions-cell">
                              <div className="action-group">
                                
                                {/* Details Button */}
                                <button 
                                  className="btn-details" 
                                  title="Quick view comments"
                                  onClick={() => openComments(report)}
                                >
                                  <i className="bi bi-chat-text-fill"></i>
                                  <span>Comments</span>
                                </button>
                                
                                {/* Full Report View for Supervisor/Admin */}
                                {(user?.role === 'ENCADRANT' || user?.role === 'ADMIN') && (
                                  <button 
                                    className="btn-details" 
                                    title="View full report and grade"
                                    onClick={() => navigate(`/reports/${report.id}`)}
                                  >
                                    <i className="bi bi-eye-fill"></i>
                                    <span>Consulter</span>
                                  </button>
                                )}

                                {/* Student Actions */}
                                {canEdit(report) && (
                                  <>
                                    <button 
                                      className="icon-btn warning"
                                      title="Edit draft"
                                      onClick={() => navigate(`/reports/edit/${report.id}`)}
                                    >
                                      <i className="bi bi-pencil-fill"></i>
                                    </button>
                                    
                                    <button 
                                      className="icon-btn danger"
                                      title="Delete draft"
                                      onClick={() => handleDelete(report.id)}
                                    >
                                      <i className="bi bi-trash-fill"></i>
                                    </button>
                                  </>
                                )}

                                {canSubmit(report) && (
                                  <button 
                                    className="btn btn-sm btn-success"
                                    onClick={() => handleStatusChange(report.id, 'SOUMIS')}
                                  >
                                    Submit
                                  </button>
                                )}

                                {/* Supervisor/Admin Actions */}
                                {canReview(report) && (
                                  <div className="review-actions">
                                    <button 
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleStatusChange(report.id, 'VALIDE')}
                                    >
                                      <i className="bi bi-check-lg"></i> Validate
                                    </button>
                                    <button 
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleStatusChange(report.id, 'REJETE')}
                                    >
                                      <i className="bi bi-x-lg"></i> Reject
                                    </button>
                                  </div>
                                )}

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
          </section>
        </main>
      </div>

      {/* Modal Overlay for Comments - Styled like Pro UI */}
      {showModal && selectedReport && (
        <div className="modal-overlay-fancy" onClick={() => setShowModal(false)}>
          <div className="modal-window" onClick={e => e.stopPropagation()}>
            <div className="modal-header-fancy">
              <div className="modal-title-group">
                <i className="bi bi-chat-left-text-fill"></i>
                <div>
                  <h3>Report Discussion</h3>
                  <small>{selectedReport.titre} #{selectedReport.id}</small>
                </div>
              </div>
              
              <div className="modal-meta">
                <span className={`status-badge ${getStatusConfig(selectedReport.statut).color}`}>
                  {getStatusConfig(selectedReport.statut).label}
                </span>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div className="modal-body-fancy">
              {/* Comments List */}
              <div className="comments-scroll-area">
                {loadingComments ? (
                  <div className="dash-loading p-20">
                    <div className="dash-spinner small"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="empty-comments">
                    <i className="bi bi-chat-heart"></i>
                    <p>No comments yet. Start the discussion!</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-header">
                        <div className="commenter-info">
                          <div className="mini-avatar small">
                            {comment.auteur?.nom?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <strong>{comment.auteur?.nom || 'Unknown'}</strong>
                            <small>{new Date(comment.date_creation).toLocaleString()}</small>
                          </div>
                        </div>
                        
                        {(String(comment.auteur_id) === String(user?.id) || user?.role === 'ADMIN') && (
                          <button 
                            className="text-danger danger-link"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <i className="bi bi-trash3"></i> Delete
                          </button>
                        )}
                      </div>
                      
                      <div className="comment-body">
                        {comment.contenu}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="comment-form-fancy">
                <textarea
                  placeholder="Write your feedback or question here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                  required
                ></textarea>
                
                <div className="form-footer">
                  <small className="text-muted">Press Ctrl+Enter to send</small>
                  <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
                    <i className="bi bi-send-fill"></i> Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for additional elements not in main css */}
      <style>{`
        .mt-20 { margin-top: 20px; }
        .mt-10 { margin-top: 10px; }
        .mb-10 { margin-bottom: 10px; }
        .p-0 { padding: 0 !important; }
        .p-40 { padding: 40px; }
        .p-20 { padding: 20px; }
        
        /* Status Badge Enhancements */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .status-badge.gray { background-color: rgba(108,117,125,0.15); color: #6c757d; border: 1px solid rgba(108,117,125,0.3); }
        .status-badge.blue { background-color: rgba(13,110,253,0.15); color: #0d6efd; border: 1px solid rgba(13,110,253,0.3); }
        .status-badge.green { background-color: rgba(25,135,84,0.15); color: #198754; border: 1px solid rgba(25,135,84,0.3); }
        .status-badge.red { background-color: rgba(220,53,69,0.15); color: #dc3545; border: 1px solid rgba(220,53,69,0.3); }
        
        /* Form Elements */
        .pro-select {
          width: 100%;
          padding: 12px;
          border: 2px solid #eee;
          border-radius: 8px;
          background-color: white;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.3s;
        }
        .pro-select:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13,110,253,0.1);
        }

        /* Report Table Professional */
        .table-responsive { overflow-x: auto; }
        .reports-table-pro { width: 100%; border-collapse: collapse; font-size: 14px; }
        .reports-table-pro th {
          background-color: #f8f9fa;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          white-space: nowrap;
        }
        .reports-table-pro td {
          padding: 16px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
        }
        .reports-table-pro tbody tr:hover {
          background-color: rgba(13,110,253,0.03);
          transition: background-color 0.2s;
        }

        /* Cell Contents */
        .report-title-cell strong { display: block; color: #212529; margin-bottom: 4px; }
        .report-title-cell small { color: #6c757d; font-size: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .user-cell { display: flex; align-items: center; gap: 8px; }
        .mini-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 13px;
        }
        .mini-avatar.small { width: 28px; height: 28px; font-size: 11px; }

        /* Actions */
        .actions-cell { white-space: nowrap; width: 150px; }
        .action-group { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

        .btn-details {
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-details:hover {
          background-color: rgba(13, 110, 253, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(13, 110, 253, 0.2);
        }
        
        .icon-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.2s;
          background-color: #f8f9fa;
          color: #495057;
        }
        .icon-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .icon-btn.info { color: #0d6efd; background-color: rgba(13,110,253,0.1); }
        .icon-btn.warning { color: #fd7e14; background-color: rgba(253,126,20,0.1); }
        .icon-btn.danger { color: #dc3545; background-color: rgba(220,53,69,0.1); }
        .icon-btn small { position: absolute; top: -4px; right: -4px; font-size: 9px; background: #dc3545; color: white; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .review-actions { display: flex; gap: 4px; width: 100%; margin-top: 4px; }
        .btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; transition: opacity 0.2s; }
        .btn-sm:hover { opacity: 0.9; }
        .btn-primary { background: #0d6efd; color: white; }
        .btn-success { background: #198754; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Helper Classes */
        .full-width { grid-column: 1 / -1; }
        .space-between { display: flex; justify-content: space-between; align-items: center; }
        .status-count { font-size: 13px; color: #6c757d; background: #f8f9fa; padding: 4px 12px; border-radius: 20px; }
        
        /* Empty States */
        .empty-state { text-align: center; padding: 60px 20px; color: #6c757d; }
        .empty-state i { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }
        .empty-state h3 { color: #495057; margin-bottom: 8px; }

        /* Guide List */
        .guide-list { display: flex; flex-direction: column; gap: 16px; }
        .guide-item { display: flex; gap: 12px; align-items: start; }
        .guide-item i { font-size: 18px; margin-top: 2px; }
        .guide-item div strong { display: block; color: #212529; font-size: 13px; }
        .guide-item div small { color: #6c757d; font-size: 12px; line-height: 1.4; }
        .text-green { color: #198754; }
        .text-blue { color: #0d6efd; }
        .text-purple { color: #6f42c1; }
        .text-muted { color: #6c757d; }
        .text-danger { color: #dc3545; }

        /* Modal Styles */
        .modal-overlay-fancy {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .modal-window {
          background: white;
          width: 90%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header-fancy {
          padding: 24px 28px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to right, #f8f9fa, white);
        }
        
        .modal-title-group { display: flex; align-items: center; gap: 12px; }
        .modal-title-group i { font-size: 24px; color: #0d6efd; }
        .modal-title-group h3 { margin: 0; color: #212529; font-size: 18px; }
        .modal-title-group small { color: #6c757d; display: block; }
        
        .modal-meta { display: flex; gap: 12px; align-items: center; }
        .close-modal-btn {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: #f8f9fa; color: #6c757d; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .close-modal-btn:hover { background: #dc3545; color: white; }

        .modal-body-fancy {
          padding: 28px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .comments-scroll-area {
          min-height: 200px;
          max-height: 400px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .empty-comments { text-align: center; padding: 30px; color: #adb5bd; }
        .empty-comments i { font-size: 32px; margin-bottom: 8px; display: block; }

        .comment-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          border-left: 3px solid #0d6efd;
          transition: transform 0.2s;
        }
        .comment-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .commenter-info { display: flex; gap: 10px; align-items: center; }
        .commenter-info strong { color: #212529; font-size: 13px; display: block; }
        .commenter-info small { color: #adb5bd; font-size: 11px; }
        
        .danger-link {
          background: none; border: none; color: #dc3545; cursor: pointer;
          font-size: 12px; display: flex; align-items: center; gap: 4px; padding: 4px 8px;
        }
        .danger-link:hover { background: rgba(220,53,69,0.1); border-radius: 4px; }
        
        .comment-body { color: #495057; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }

        .comment-form-fancy { display: flex; flex-direction: column; gap: 12px; }
        .comment-form-fancy textarea {
          width: 100%; padding: 14px; border: 2px solid #e9ecef; border-radius: 12px;
          resize: vertical; font-family: inherit; font-size: 14px; transition: border-color 0.3s;
          box-sizing: border-box;
        }
        .comment-form-fancy textarea:focus { outline: none; border-color: #0d6efd; box-shadow: 0 0 0 3px rgba(13,110,253,0.1); }
        
        .form-footer { display: flex; justify-content: space-between; align-items: center; }
        
        /* Alert Box */
        .pro-alert.error {
          background: #fdf7f7;
          border: 1px solid #f5c2c7;
          color: #842029;
          padding: 16px 20px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          animation: fadeIn 0.3s;
        }
        .pro-alert button {
          background: #dc3545; color: white; border: none; padding: 6px 12px;
          border-radius: 6px; cursor: pointer; font-weight: 600;
        }

        .spinner.small { width: 24px; height: 24px; border-width: 3px; }
        
        @media (max-width: 768px) {
          .pro-stats-row { grid-template-columns: repeat(2, 1fr); }
          .modal-window { width: 95%; height: 95vh; margin: auto; }
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}

export default ReportsList;