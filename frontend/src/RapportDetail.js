import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./services/api";
import "./RapportDetail.css";

function RapportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data States
  const [rapport, setRapport] = useState(null);
  const [comments, setComments] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  // Auth Info
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Run both requests in parallel for efficiency
      const [rapportRes, commentsRes] = await Promise.all([
        api.get(`/rapports/${id}`),
        api.get(`/rapports/${id}/commentaires`)
      ]);

      setRapport(rapportRes.data);
      
      // Sort comments by date_creation (newest first)
      const sortedComments = Array.isArray(commentsRes.data) 
        ? commentsRes.data.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
        : [];
      
      setComments(sortedComments);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Rapport introuvable");
      } else {
        setError("Erreur lors du chargement");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/rapports/${id}/commentaires`, {
        contenu: commentText
      });
      // Refresh comments list
      setComments(prev => [res.data, ...prev]); 
      setCommentText("");
    } catch (err) {
      setCommentError("Impossible d'ajouter le commentaire.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;

    try {
      await api.delete(`/commentaires/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const getStatusConfig = (statut) => {
    const configs = {
      BROUILLON: { label: "Brouillon", class: "status-gray" },
      SOUMIS: { label: "Soumis", class: "status-blue" },
      VALIDE: { label: "Validé", class: "status-green" },
      REJETE: { label: "Rejeté", class: "status-red" }
    };
    return configs[statut] || { label: statut, class: "status-gray" };
  };

  if (loading) {
    return (
      <div className="pro-dashboard">
        <div className="dash-loading"><div className="dash-spinner"></div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pro-dashboard">
        <div className="pro-card full-width" style={{textAlign: 'center', padding: '50px'}}>
          <i className="bi bi-exclamation-circle" style={{fontSize: '3rem', color: 'red'}}></i>
          <h2>{error}</h2>
          <button className="btn btn-primary" onClick={() => navigate("/reports")}>Retour aux rapports</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-dashboard">
      {/* Sidebar (keeping UI consistent) */}
      <aside className="pro-sidebar">
         <div className="pro-sidebar-header">
            <div className="pro-logo"><i className="bi bi-mortarboard-fill"></i></div>
            <div className="pro-brand-text"><span className="pro-brand-name">InternTrack</span></div>
         </div>
         <nav className="pro-sidebar-nav">
            <button onClick={() => navigate("/dashboard")} className="pro-nav-item"><i className="bi bi-speedometer2"></i><span>Dashboard</span></button>
            <button onClick={() => navigate("/reports")} className="pro-nav-item active"><i className="bi bi-journal-text"></i><span>Reports</span></button>
         </nav>
      </aside>

      <div className="pro-main-wrapper">
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Rapport Détails</h1>
            <button className="btn-link" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i> Back to list
            </button>
          </div>
        </header>

        <main className="pro-content">
          <div className="pro-content-grid">
            
            {/* Left Side: Rapport Content */}
            <section className="pro-card">
              <div className="pro-card-header">
                <h3><i className="bi bi-file-earmark-text"></i> Report Content</h3>
              </div>
              <div className="pro-card-body report-content-body">
                <div className="report-meta-header">
                   <span className={`status-badge ${getStatusConfig(rapport.statut).class}`}>
                     {getStatusConfig(rapport.statut).label}
                   </span>
                   <span className="report-date">
                     <i className="bi bi-calendar3"></i> {new Date(rapport.date_depot).toLocaleDateString('fr-FR')}
                   </span>
                </div>

                <h2 className="report-main-title">{rapport.titre}</h2>
                
                <div className="report-author-info">
                  <div className="mini-avatar">{rapport.auteur?.nom?.charAt(0) || '?'}</div>
                  <div>
                    <strong>{rapport.auteur?.nom || "Auteur Inconnu"}</strong>
                    <p className="text-muted small">Submitted by</p>
                  </div>
                </div>

                <hr className="divider" />
                
                <div className="report-text-content">
                  {rapport.contenu}
                </div>
              </div>
            </section>

            {/* Right Side: Comments Section */}
            <section className="pro-card">
              <div className="pro-card-header">
                <h3><i className="bi bi-chat-dots"></i> Discussion ({comments.length})</h3>
              </div>
              
              <div className="pro-card-body comments-section">
                {/* Comment List */}
                <div className="comments-list-container">
                  {comments.length === 0 ? (
                    <div className="empty-comments">
                      <i className="bi bi-chat-heart"></i>
                      <p>Aucun commentaire pour l'instant</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item-pro">
                        <div className="comment-item-header">
                          <div className="commenter-info">
                            <strong>{comment.auteur?.nom || "Utilisateur"}</strong>
                            <small>{new Date(comment.date_creation).toLocaleString('fr-FR')}</small>
                          </div>
                          {user && String(comment.auteur_id) === String(user.id) && (
                            <button 
                              className="delete-comment-btn" 
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Delete"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          )}
                        </div>
                        <div className="comment-text">
                          {comment.contenu}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Form - Only if not BROUILLON */}
                {rapport.statut !== "BROUILLON" && (
                  <form onSubmit={handleAddComment} className="comment-form-pro">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Écrivez un commentaire..."
                      rows="3"
                      required
                    ></textarea>
                    {commentError && <p className="error-msg">{commentError}</p>}
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm">
                        <i className="bi bi-send"></i> Post Comment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

export default RapportDetail;