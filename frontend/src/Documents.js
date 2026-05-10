import { useEffect, useState, useRef } from "react";
import api from "./services/api";
import Sidebar from "./Sidebar";

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef();

  const fetchDocuments = () => {
    api.get("/documents")
      .then((res) => setDocuments(res.data.documents || []))
      .catch(() => setError("Failed to load documents."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    setSuccess("");

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      try {
        await api.post("/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        setError(err.response?.data?.message || `Failed to upload ${file.name}`);
        setUploading(false);
        return;
      }
    }
    setSuccess(`${files.length} file(s) uploaded successfully.`);
    setUploading(false);
    fetchDocuments();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setSuccess("Document deleted.");
    } catch {
      setError("Failed to delete document.");
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const res = await api.get(`/documents/${id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setError("Failed to download document.");
    }
  };

  const getFileIcon = (name) => {
    const ext = name?.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return { icon: "bi-file-earmark-pdf-fill", color: "#dc2626" };
    if (["doc", "docx"].includes(ext)) return { icon: "bi-file-earmark-word-fill", color: "#2563eb" };
    if (["xls", "xlsx"].includes(ext)) return { icon: "bi-file-earmark-excel-fill", color: "#16a34a" };
    if (["png", "jpg", "jpeg", "gif"].includes(ext)) return { icon: "bi-file-earmark-image-fill", color: "#7c3aed" };
    if (["zip", "rar"].includes(ext)) return { icon: "bi-file-earmark-zip-fill", color: "#f59e0b" };
    return { icon: "bi-file-earmark-fill", color: "#64748b" };
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="pro-dashboard">
      <Sidebar activePage="documents" />
      <div className="pro-main-wrapper">
        <header className="pro-topbar">
          <div className="pro-topbar-left">
            <h1 className="pro-page-title">Documents</h1>
            <p className="pro-page-sub">Upload and manage your internship files</p>
          </div>
          <div className="pro-topbar-right">
            <button className="pro-topbar-btn"><i className="bi bi-bell"></i></button>
            <button className="pro-topbar-btn"><i className="bi bi-gear"></i></button>
            <div className="pro-topbar-avatar">
              {JSON.parse(localStorage.getItem("user") || "{}").nom?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <main className="pro-content">
          {error && (
            <div className="doc-alert doc-alert-error">
              <i className="bi bi-exclamation-circle-fill"></i> {error}
              <button onClick={() => setError("")}><i className="bi bi-x"></i></button>
            </div>
          )}
          {success && (
            <div className="doc-alert doc-alert-success">
              <i className="bi bi-check-circle-fill"></i> {success}
              <button onClick={() => setSuccess("")}><i className="bi bi-x"></i></button>
            </div>
          )}

          {/* Upload Zone */}
          <section className="pro-card" style={{ marginBottom: "24px" }}>
            <div className="pro-card-header">
              <h3><i className="bi bi-cloud-upload-fill"></i> Upload Documents</h3>
            </div>
            <div className="pro-card-body">
              <div
                className={`doc-dropzone ${dragOver ? "dragover" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleUpload(e.target.files)}
                />
                <div className="doc-dropzone-icon">
                  {uploading
                    ? <div className="dash-spinner" style={{ width: 40, height: 40 }}></div>
                    : <i className="bi bi-cloud-arrow-up-fill"></i>
                  }
                </div>
                <p className="doc-dropzone-title">
                  {uploading ? "Uploading..." : "Drag & drop files here"}
                </p>
                <p className="doc-dropzone-sub">
                  {uploading ? "Please wait" : "or click to browse — PDF, Word, Excel, Images (max 10MB)"}
                </p>
              </div>
            </div>
          </section>

          {/* Documents List */}
          <section className="pro-card">
            <div className="pro-card-header">
              <h3><i className="bi bi-folder2-open"></i> My Documents</h3>
              <span className="doc-count-badge">{documents.length} file{documents.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="pro-card-body" style={{ padding: 0 }}>
              {loading ? (
                <div className="pro-reports-empty"><div className="dash-spinner"></div></div>
              ) : documents.length === 0 ? (
                <div className="pro-reports-empty">
                  <i className="bi bi-folder-x"></i>
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="doc-list">
                  {documents.map((doc) => {
                    const { icon, color } = getFileIcon(doc.original_name || doc.name);
                    return (
                      <div key={doc.id} className="doc-item">
                        <div className="doc-item-icon" style={{ color }}>
                          <i className={`bi ${icon}`}></i>
                        </div>
                        <div className="doc-item-info">
                          <span className="doc-item-name">{doc.original_name || doc.name}</span>
                          <span className="doc-item-meta">
                            {formatSize(doc.size)} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                          </span>
                        </div>
                        <div className="doc-item-actions">
                          <button
                            className="doc-action-btn download"
                            onClick={() => handleDownload(doc.id, doc.original_name || doc.name)}
                            title="Download"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                          <button
                            className="doc-action-btn delete"
                            onClick={() => handleDelete(doc.id)}
                            title="Delete"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .doc-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;
          font-size: 14px; font-weight: 500;
        }
        .doc-alert button { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.7; font-size: 16px; }
        .doc-alert-error { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .doc-alert-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .doc-dropzone {
          border: 2px dashed var(--border); border-radius: 16px;
          padding: 48px 24px; text-align: center; cursor: pointer;
          transition: all 0.2s ease; background: var(--light-bg);
        }
        .doc-dropzone:hover, .doc-dropzone.dragover {
          border-color: var(--primary); background: var(--primary-soft);
        }
        .doc-dropzone-icon { font-size: 48px; color: var(--primary); margin-bottom: 12px; }
        .doc-dropzone-title { font-size: 16px; font-weight: 600; margin: 0 0 6px; color: var(--dark); }
        .doc-dropzone-sub { font-size: 13px; color: var(--muted); margin: 0; }
        .doc-count-badge {
          background: var(--primary-soft); color: var(--primary);
          padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 600;
        }
        .doc-list { display: flex; flex-direction: column; }
        .doc-item {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 24px; border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .doc-item:last-child { border-bottom: none; }
        .doc-item:hover { background: var(--light-bg); }
        .doc-item-icon { font-size: 28px; flex-shrink: 0; }
        .doc-item-info { flex: 1; min-width: 0; }
        .doc-item-name { display: block; font-weight: 600; font-size: 14px; color: var(--dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-item-meta { font-size: 12px; color: var(--muted); }
        .doc-item-actions { display: flex; gap: 8px; }
        .doc-action-btn {
          width: 34px; height: 34px; border-radius: 8px; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all 0.15s;
        }
        .doc-action-btn.download { background: var(--primary-soft); color: var(--primary); }
        .doc-action-btn.download:hover { background: var(--primary); color: white; }
        .doc-action-btn.delete { background: #fef2f2; color: #dc2626; }
        .doc-action-btn.delete:hover { background: #dc2626; color: white; }
      `}</style>
    </div>
  );
}

export default Documents;