import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./services/api";
import Sidebar from "./Sidebar";
import "./RapportDetail.css";

function RapportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rapport, setRapport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [grade, setGrade] = useState("");
  const [gradeMsg, setGradeMsg] = useState({ text: "", type: "" });
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role === "ENCADRANT" || user?.role === "ADMIN";

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rapportRes, commentsRes] = await Promise.all([
        api.get(`/rapports/${id}`),
        api.get(`/rapports/${id}/commentaires`),
      ]);

      // Backend wraps in { success, data }
      const rapportData = rapportRes.data?.data ?? rapportRes.data;
      const commentsData = commentsRes.data?.data ?? commentsRes.data;

      setRapport(rapportData);
      setGrade(rapportData.grade ?? "");

      const sorted = Array.isArray(commentsData)
        ? [...commentsData].sort(
            (a, b) => new Date(b.date_creation) - new Date(a.date_creation)
          )
        : [];
      setComments(sorted);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.status === 404
          ? "Rapport introuvable."
          : err.response?.status === 403
          ? "Vous n'avez pas accès à ce rapport."
          : "Erreur lors du chargement du rapport."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError("");
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/rapports/${id}/commentaires`, {
        contenu: commentText,
      });
      const newComment = res.data?.data ?? res.data;
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      setCommentError("Impossible d'ajouter le commentaire.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/commentaires/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const handleUpdateGrade = async () => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
      setGradeMsg({ text: "La note doit être entre 0 et 20.", type: "error" });
      return;
    }
    try {
      setGradeMsg({ text: "", type: "" });
      await api.put(`/rapports/${id}`, { grade: numGrade });
      setGradeMsg({ text: "✅ Note enregistrée avec succès", type: "success" });
      setRapport((prev) => ({ ...prev, grade: numGrade }));
      setTimeout(() => setGradeMsg({ text: "", type: "" }), 3000);
    } catch {
      setGradeMsg({ text: "❌ Erreur lors de l'enregistrement.", type: "error" });
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/rapports/${id}/statut`, { statut: newStatus });
      setRapport((prev) => ({ ...prev, statut: newStatus }));
      setStatusMsg({
        text: newStatus === "VALIDE" ? "✅ Rapport validé !" : "❌ Rapport rejeté.",
        type: newStatus === "VALIDE" ? "success" : "error",
      });
      setTimeout(() => setStatusMsg({ text: "", type: "" }), 3000);
    } catch {
      setStatusMsg({ text: "Erreur lors de la mise à jour du statut.", type: "error" });
    }
  };

  const handleLogout = () => {
    api.post("/auth/logout").finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  const statusConfig = {
    BROUILLON: { label: "Brouillon", cls: "rd-badge-gray",  icon: "bi-pencil-square" },
    SOUMIS:    { label: "Soumis",    cls: "rd-badge-blue",  icon: "bi-send-check-fill" },
    VALIDE:    { label: "Validé",    cls: "rd-badge-green", icon: "bi-patch-check-fill" },
    REJETE:    { label: "Rejeté",    cls: "rd-badge-red",   icon: "bi-x-circle-fill" },
  };
  const getStatus = (s) => statusConfig[s] || { label: s, cls: "rd-badge-gray", icon: "bi-question-circle" };

  /* ── Loading ── */
  if (loading) return (
    <div className="rd-loading">
      <div className="rd-spinner"></div>
      <p>Chargement du rapport…</p>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="pro-dashboard">
      <div className="rd-error-wrap">
        <i className="bi bi-exclamation-triangle-fill"></i>
        <h2>{error}</h2>
        <button className="rd-back-btn" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Retour
        </button>
      </div>
    </div>
  );

  const st = getStatus(rapport.statut);

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="reports" />

      {/* ── Main ── */}
      <div className="pro-main-wrapper">
        {/* Topbar */}
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <button className="rd-back-inline" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left"></i> Retour
            </button>
            <h1 className="pro-page-title">{rapport.titre}</h1>
          </div>
          <div className="pro-topbar-right">
            <span className={`rd-status-pill ${st.cls}`}>
              <i className={`bi ${st.icon}`}></i> {st.label}
            </span>
            <div className="pro-topbar-avatar">{user.nom?.charAt(0) || "U"}</div>
          </div>
        </header>

        <main className="pro-content">
          {/* Status feedback messages */}
          {statusMsg.text && (
            <div className={`rd-alert rd-alert-${statusMsg.type}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="rd-grid">
            {/* ── LEFT: Report content ── */}
            <div className="rd-col-main">

              {/* Meta info card */}
              <div className="rd-meta-card">
                <div className="rd-author">
                  <div className="rd-avatar">
                    {rapport.auteur?.nom?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <strong>{rapport.auteur?.nom || "Auteur Inconnu"}</strong>
                    <span>Étudiant</span>
                  </div>
                </div>
                <div className="rd-meta-item">
                  <i className="bi bi-calendar3"></i>
                  <div>
                    <label>Date de dépôt</label>
                    <span>{new Date(rapport.date_depot).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </div>
                </div>
                {rapport.encadrant && (
                  <div className="rd-meta-item">
                    <i className="bi bi-person-badge-fill"></i>
                    <div>
                      <label>Encadrant</label>
                      <span>{rapport.encadrant.nom}</span>
                    </div>
                  </div>
                )}
                {rapport.grade != null && (
                  <div className="rd-meta-item">
                    <i className="bi bi-star-fill"></i>
                    <div>
                      <label>Note</label>
                      <span className="rd-grade-display">{rapport.grade}<small>/20</small></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Report text */}
              <section className="pro-card rd-content-card">
                <div className="pro-card-header">
                  <h3><i className="bi bi-file-earmark-text"></i> Contenu du rapport</h3>
                </div>
                <div className="pro-card-body">
                  <div className="rd-content-text">{rapport.contenu}</div>
                </div>
              </section>

              {/* Supervisor evaluation panel */}
              {isSupervisor && rapport.statut !== "BROUILLON" && (
                <section className="pro-card rd-eval-card">
                  <div className="pro-card-header">
                    <h3><i className="bi bi-clipboard-check-fill"></i> Évaluation et Décision</h3>
                  </div>
                  <div className="pro-card-body rd-eval-body">
                    {/* Grade input */}
                    <div className="rd-grade-section">
                      <label className="rd-label">Note (sur 20)</label>
                      <div className="rd-grade-row">
                        <input
                          type="number"
                          min="0" max="20" step="0.5"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="rd-grade-input"
                          placeholder="0 – 20"
                        />
                        <span className="rd-grade-suffix">/20</span>
                        <button className="rd-save-grade-btn" onClick={handleUpdateGrade}>
                          <i className="bi bi-floppy2-fill"></i> Enregistrer
                        </button>
                        {gradeMsg.text && (
                          <span className={`rd-inline-msg ${gradeMsg.type}`}>{gradeMsg.text}</span>
                        )}
                      </div>
                    </div>

                    {/* Validate / Reject */}
                    <div className="rd-decision-row">
                      <label className="rd-label">Décision</label>
                      <div className="rd-decision-btns">
                        <button
                          className="rd-btn-validate"
                          onClick={() => handleStatusChange("VALIDE")}
                          disabled={rapport.statut === "VALIDE"}
                        >
                          <i className="bi bi-check-circle-fill"></i> Valider le rapport
                        </button>
                        <button
                          className="rd-btn-reject"
                          onClick={() => handleStatusChange("REJETE")}
                          disabled={rapport.statut === "REJETE"}
                        >
                          <i className="bi bi-x-circle-fill"></i> Rejeter le rapport
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT: Comments ── */}
            <div className="rd-col-side">
              <section className="pro-card rd-comments-card">
                <div className="pro-card-header">
                  <h3><i className="bi bi-chat-dots-fill"></i> Discussion</h3>
                  <span className="rd-comment-count">{comments.length}</span>
                </div>

                {/* Comment form */}
                {rapport.statut !== "BROUILLON" && (
                  <form onSubmit={handleAddComment} className="rd-comment-form">
                    <div className="rd-form-author">
                      <div className="rd-form-avatar">{user.nom?.charAt(0) || "U"}</div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Écrivez un commentaire…"
                        rows="3"
                        required
                        className="rd-textarea"
                      />
                    </div>
                    {commentError && <p className="rd-comment-error">{commentError}</p>}
                    <div className="rd-form-actions">
                      <button type="submit" className="rd-submit-btn" disabled={commentLoading}>
                        {commentLoading
                          ? <><i className="bi bi-hourglass-split"></i> Envoi…</>
                          : <><i className="bi bi-send-fill"></i> Envoyer</>
                        }
                      </button>
                    </div>
                  </form>
                )}

                {/* Comment list */}
                <div className="rd-comments-list">
                  {comments.length === 0 ? (
                    <div className="rd-no-comments">
                      <i className="bi bi-chat-heart"></i>
                      <p>Aucun commentaire pour l'instant.<br />Soyez le premier à commenter !</p>
                    </div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="rd-comment">
                        <div className="rd-comment-avatar">
                          {c.auteur?.nom?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="rd-comment-body">
                          <div className="rd-comment-header">
                            <strong>{c.auteur?.nom || "Utilisateur"}</strong>
                            <small>{new Date(c.date_creation).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                            {user && String(c.auteur_id) === String(user.id) && (
                              <button
                                className="rd-delete-btn"
                                onClick={() => handleDeleteComment(c.id)}
                                title="Supprimer"
                              >
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            )}
                          </div>
                          <p className="rd-comment-text">{c.contenu}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RapportDetail;