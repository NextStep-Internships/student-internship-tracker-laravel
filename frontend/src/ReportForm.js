import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./services/api";
import Sidebar from "./Sidebar";
import "./ReportForm.css";

function ReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [date_depot, setDate_depot] = useState(new Date().toISOString().split("T")[0]);

  // Validation state
  const [canCreateReport, setCanCreateReport] = useState(true);
  const [weeklyReportMessage, setWeeklyReportMessage] = useState("");

  // Error state
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchUser();
    if (!isEdit) {
      checkWeeklyReportStatus();
    } else {
      fetchReport();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  // Helper: Get the Monday of the current week
  const getMondayOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  // Helper: Get the Sunday of the current week
  const getSundayOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // get Sunday
    return new Date(d.setDate(diff));
  };

  // Helper: Check if a date is within the current week
  const isDateInCurrentWeek = (dateString) => {
    const rapportDate = new Date(dateString);
    const monday = getMondayOfWeek();
    const sunday = getSundayOfWeek();

    // Set to midnight for comparison
    rapportDate.setHours(0, 0, 0, 0);
    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);

    return rapportDate >= monday && rapportDate <= sunday;
  };

  // Check if user has already submitted a rapport this week
  const checkWeeklyReportStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/rapports");
      const rapports = Array.isArray(res.data) ? res.data : res.data.data || [];

      // Check if any rapport was submitted this week with SOUMIS or VALIDE status
      const weeklyRapport = rapports.find(
        (rapport) =>
          (rapport.statut === "SOUMIS" || rapport.statut === "VALIDE") &&
          isDateInCurrentWeek(rapport.date_depot)
      );

      if (weeklyRapport) {
        setCanCreateReport(false);
        setWeeklyReportMessage("Vous avez déjà soumis un rapport cette semaine");
      } else {
        setCanCreateReport(true);
        setWeeklyReportMessage("");
        // Set default date to today
        const today = new Date().toISOString().split("T")[0];
        setDate_depot(today);
      }

      setError("");
    } catch (err) {
      setError("Failed to check weekly report status");
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing report for editing
  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rapports/${id}`);
      
      // Handle different response structures
      const rapport = res.data.data || res.data;

      setTitre(rapport.titre || "");
      setContenu(rapport.contenu || "");
      setDate_depot(rapport.date_depot || "");

      setError("");
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!titre.trim()) {
      setFormError("Title is required");
      return;
    }

    if (!contenu.trim()) {
      setFormError("Content is required");
      return;
    }

    if (!date_depot) {
      setFormError("Submission date is required");
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        // Update existing report
        await api.put(`/rapports/${id}`, {
          titre,
          contenu,
          date_depot,
        });
        alert("Report updated successfully");
      } else {
        // Create new report
        const res = await api.post("/rapports", {
          titre,
          contenu,
          date_depot,
        });

        // If creation is successful, submit the report
        if (res.data && res.data.id) {
          await api.put(`/rapports/${res.data.id}/statut`, {
            statut: "SOUMIS",
          });
          alert("Report submitted successfully");
        }
      }

      navigate("/reports");
    } catch (err) {
      setSubmitting(false);

      // Handle the 422 error for "one report per week" violation
      if (err.response?.status === 422) {
        setFormError(
          err.response.data?.message ||
            "Vous avez déjà soumis un rapport cette semaine"
        );
        // Do NOT reset form fields on this error
        return;
      }

      // Handle other errors
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit report"
      );
    }
  };

  const handleCancel = () => {
    navigate("/reports");
  };

  // Show loading state
  if (loading || !user) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
      </div>
    );
  }

  // Show error state
  if (error && !isEdit) {
    return (
      <div className="form-container">
        <div className="pro-alert error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
          <button onClick={() => navigate("/reports")}>Back to Reports</button>
        </div>
      </div>
    );
  }

  // Redirect non-students from create form
  if (!isEdit && user.role !== "ETUDIANT") {
    navigate("/reports");
    return null;
  }

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="reports" />

      {/* Main Wrapper */}
      <div className="pro-main-wrapper">
        {/* Topbar */}
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">
              {isEdit ? "Edit Report" : "Create New Report"}
            </h1>
            <p className="pro-page-sub">
              {isEdit ? "Update your report details" : "Submit a new weekly report"}
            </p>
          </div>
          <div className="pro-topbar-right">
            <button
              className="pro-topbar-btn"
              onClick={() => navigate("/reports")}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
          </div>
        </header>

        <main className="pro-content">
          {/* Weekly Validation Message */}
          {!isEdit && !canCreateReport && (
            <div className="pro-alert warning">
              <i className="bi bi-exclamation-circle-fill"></i>
              {weeklyReportMessage}
            </div>
          )}

          {/* Form Card */}
          <section className="pro-card form-card">
            <div className="pro-card-header">
              <h3>
                <i className="bi bi-pencil-square"></i>
                {isEdit ? "Report Details" : "Report Information"}
              </h3>
            </div>

            {!isEdit && !canCreateReport ? (
              // Show blocked state
              <div className="pro-card-body">
                <div className="blocked-state">
                  <i className="bi bi-lock-fill"></i>
                  <h3>Weekly Limit Reached</h3>
                  <p>{weeklyReportMessage}</p>
                  <p className="text-muted">
                    You can submit one report per week. Please wait until next week to submit another report.
                  </p>
                  <button
                    className="btn btn-secondary mt-20"
                    onClick={() => navigate("/reports")}
                  >
                    Back to Reports
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pro-form">
                <div className="pro-card-body">
                  {/* Form Error Message */}
                  {formError && (
                    <div className="form-error-message">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      {formError}
                    </div>
                  )}

                  {/* Title Field */}
                  <div className="form-group">
                    <label htmlFor="titre" className="form-label">
                      Report Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="titre"
                      className="form-control"
                      placeholder="Enter report title"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      required
                    />
                  </div>

                  {/* Date Field */}
                  <div className="form-group">
                    <label htmlFor="date_depot" className="form-label">
                      Submission Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_depot"
                      className="form-control"
                      value={date_depot}
                      onChange={(e) => setDate_depot(e.target.value)}
                      readOnly={true}
                      required
                    />
                  </div>

                  {/* Content Field */}
                  <div className="form-group">
                    <label htmlFor="contenu" className="form-label">
                      Report Content <span className="required">*</span>
                    </label>
                    <textarea
                      id="contenu"
                      className="form-control"
                      placeholder="Write your report content here..."
                      value={contenu}
                      onChange={(e) => setContenu(e.target.value)}
                      rows="10"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pro-card-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <i className="bi bi-hourglass-split"></i> Submitting...
                      </>
                    ) : isEdit ? (
                      <>
                        <i className="bi bi-check-lg"></i> Update Report
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill"></i> Submit Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        </main>
      </div>

    </div>
  );
}

export default ReportForm;
