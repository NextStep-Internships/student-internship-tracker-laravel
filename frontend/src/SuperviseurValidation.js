import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import Sidebar from './Sidebar';
import './SuperviseurValidation.css';

const SuperviseurValidation = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('TOUS');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);
    const [msgType, setMsgType] = useState('success');

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!user || user.role === 'ETUDIANT') {
            navigate('/dashboard');
            return;
        }
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/rapports');
            const data = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];
            setReports(data);
        } catch (err) {
            setError("Erreur lors du chargement des rapports.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/rapports/${id}/statut`, { statut: newStatus });
            setMsg(newStatus === 'VALIDE' ? "✅ Rapport validé avec succès" : "❌ Rapport rejeté");
            setMsgType(newStatus === 'VALIDE' ? 'success' : 'error');
            setReports(prev => prev.map(r => r.id === id ? { ...r, statut: newStatus } : r));
            setTimeout(() => setMsg(null), 3000);
        } catch (err) {
            setMsg("Erreur lors de la mise à jour");
            setMsgType('error');
        }
    };

    const handleLogout = () => {
        api.post("/auth/logout").finally(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        });
    };

    const getStatusConfig = (statut) => ({
        BROUILLON: { label: 'Brouillon', colorClass: 'badge-gray', icon: 'bi-pencil-square' },
        SOUMIS:    { label: 'Soumis',    colorClass: 'badge-blue', icon: 'bi-send-check' },
        VALIDE:    { label: 'Validé',    colorClass: 'badge-green', icon: 'bi-patch-check-fill' },
        REJETE:    { label: 'Rejeté',    colorClass: 'badge-red',  icon: 'bi-x-circle-fill' },
    }[statut] || { label: statut, colorClass: 'badge-gray', icon: 'bi-question-circle' });

    const filterCounts = {
        TOUS:    reports.length,
        SOUMIS:  reports.filter(r => r.statut === 'SOUMIS').length,
        VALIDE:  reports.filter(r => r.statut === 'VALIDE').length,
        REJETE:  reports.filter(r => r.statut === 'REJETE').length,
    };

    const filteredReports = filter === 'TOUS'
        ? reports
        : reports.filter(r => r.statut === filter);

    if (loading) return (
        <div className="sv-loading">
            <div className="sv-spinner"></div>
            <p>Chargement des rapports…</p>
        </div>
    );

    return (
        <div className="pro-dashboard">
            {/* Sidebar */}
            <Sidebar activePage="validation" />

            {/* Main content */}
            <div className="pro-main-wrapper">
                {/* Topbar */}
                <header className="pro-topbar">
                    <div className="pro-topbar-left">
                        <h1 className="pro-page-title">Validation des Rapports</h1>
                        <p className="pro-page-sub">
                            Consultez, notez et validez les rapports soumis par vos étudiants
                        </p>
                    </div>
                    <div className="pro-topbar-right">
                        <button className="pro-topbar-btn" onClick={() => navigate('/dashboard')}>
                            <i className="bi bi-arrow-left"></i>
                        </button>
                        <button className="pro-topbar-btn" onClick={fetchReports}>
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                        <div className="pro-topbar-avatar">{user.nom?.charAt(0) || 'S'}</div>
                    </div>
                </header>

                <main className="pro-content">
                    {/* Alert */}
                    {msg && (
                        <div className={`sv-alert sv-alert-${msgType}`}>
                            <i className={`bi ${msgType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                            {msg}
                        </div>
                    )}
                    {error && (
                        <div className="sv-alert sv-alert-error">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                            <button className="sv-retry-btn" onClick={fetchReports}>Réessayer</button>
                        </div>
                    )}

                    {/* Stats row */}
                    <div className="sv-stats-row">
                        <div className="sv-stat-card sv-stat-blue">
                            <div className="sv-stat-icon"><i className="bi bi-journal-text"></i></div>
                            <div className="sv-stat-info">
                                <span>Total</span>
                                <strong>{filterCounts.TOUS}</strong>
                            </div>
                        </div>
                        <div className="sv-stat-card sv-stat-orange">
                            <div className="sv-stat-icon"><i className="bi bi-hourglass-split"></i></div>
                            <div className="sv-stat-info">
                                <span>À traiter</span>
                                <strong>{filterCounts.SOUMIS}</strong>
                            </div>
                        </div>
                        <div className="sv-stat-card sv-stat-green">
                            <div className="sv-stat-icon"><i className="bi bi-patch-check-fill"></i></div>
                            <div className="sv-stat-info">
                                <span>Validés</span>
                                <strong>{filterCounts.VALIDE}</strong>
                            </div>
                        </div>
                        <div className="sv-stat-card sv-stat-red">
                            <div className="sv-stat-icon"><i className="bi bi-x-circle-fill"></i></div>
                            <div className="sv-stat-info">
                                <span>Rejetés</span>
                                <strong>{filterCounts.REJETE}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="sv-filter-tabs">
                        {['TOUS', 'SOUMIS', 'VALIDE', 'REJETE'].map(f => (
                            <button
                                key={f}
                                className={`sv-filter-btn ${filter === f ? 'active' : ''} sv-filter-${f.toLowerCase()}`}
                                onClick={() => setFilter(f)}
                            >
                                {f === 'TOUS' && <i className="bi bi-grid-3x3-gap-fill"></i>}
                                {f === 'SOUMIS' && <i className="bi bi-send-check"></i>}
                                {f === 'VALIDE' && <i className="bi bi-patch-check-fill"></i>}
                                {f === 'REJETE' && <i className="bi bi-x-circle-fill"></i>}
                                <span>{f.charAt(0) + f.slice(1).toLowerCase()}</span>
                                <span className="sv-filter-count">{filterCounts[f]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <section className="pro-card sv-table-card">
                        <div className="pro-card-header sv-table-header">
                            <h3>
                                <i className="bi bi-table"></i>
                                Liste des rapports
                            </h3>
                            <span className="sv-count-badge">{filteredReports.length} rapport(s)</span>
                        </div>

                        <div className="sv-table-wrap">
                            {filteredReports.length === 0 ? (
                                <div className="sv-empty">
                                    <i className="bi bi-inbox"></i>
                                    <h4>Aucun rapport trouvé</h4>
                                    <p>
                                        {filter === 'TOUS'
                                            ? "Aucun rapport ne vous est encore assigné."
                                            : `Aucun rapport avec le statut « ${filter.charAt(0) + filter.slice(1).toLowerCase()} ».`}
                                    </p>
                                    {filter !== 'TOUS' && (
                                        <button className="sv-reset-btn" onClick={() => setFilter('TOUS')}>
                                            Voir tous les rapports
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="sv-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Titre du rapport</th>
                                            <th>Étudiant</th>
                                            <th>Date de dépôt</th>
                                            <th>Note</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.map(r => {
                                            const cfg = getStatusConfig(r.statut);
                                            return (
                                                <tr key={r.id} className={r.statut === 'SOUMIS' ? 'sv-row-pending' : ''}>
                                                    <td className="sv-td-id">#{r.id}</td>
                                                    <td className="sv-td-title">
                                                        <div className="sv-title-cell">
                                                            <strong>{r.titre}</strong>
                                                            <small>{r.contenu?.substring(0, 60)}…</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="sv-author-cell">
                                                            <div className="sv-mini-avatar">
                                                                {r.auteur?.nom?.charAt(0) || '?'}
                                                            </div>
                                                            <span>{r.auteur?.nom || 'Inconnu'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="sv-td-date">
                                                        <i className="bi bi-calendar3"></i>
                                                        {new Date(r.date_depot).toLocaleDateString('fr-FR', {
                                                            day: '2-digit', month: 'short', year: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="sv-td-grade">
                                                        {r.grade != null
                                                            ? <span className="sv-grade-chip">{r.grade}<small>/20</small></span>
                                                            : <span className="sv-grade-empty">—</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        <span className={`sv-badge ${cfg.colorClass}`}>
                                                            <i className={`bi ${cfg.icon}`}></i>
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="sv-action-group">
                                                            <button
                                                                className="sv-btn sv-btn-view"
                                                                onClick={() => navigate(`/reports/${r.id}`)}
                                                                title="Consulter et noter"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                                <span>Consulter</span>
                                                            </button>
                                                            {r.statut === 'SOUMIS' && (
                                                                <>
                                                                    <button
                                                                        className="sv-btn sv-btn-validate"
                                                                        onClick={() => updateStatus(r.id, 'VALIDE')}
                                                                        title="Valider"
                                                                    >
                                                                        <i className="bi bi-check-lg"></i>
                                                                    </button>
                                                                    <button
                                                                        className="sv-btn sv-btn-reject"
                                                                        onClick={() => updateStatus(r.id, 'REJETE')}
                                                                        title="Rejeter"
                                                                    >
                                                                        <i className="bi bi-x-lg"></i>
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default SuperviseurValidation;