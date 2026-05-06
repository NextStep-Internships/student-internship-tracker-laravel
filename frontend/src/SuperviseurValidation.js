import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

const SuperviseurValidation = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('TOUS'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        // Access Control
        if (!user || user.role === 'ETUDIANT') {
            navigate('/dashboard');
            return;
        }
        fetchReports();
    }, [navigate, user.role]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/rapports');
            let data = Array.isArray(response.data) ? response.data : response.data.data || [];

            // Filter for Supervisor: Only assigned to them
            if (user.role === 'ENCADRANT') {
                data = data.filter(r => parseInt(r.encadrant_id) === parseInt(user.id));
            }
            
            setReports(data);
            setError(null);
        } catch (err) {
            setError("Erreur lors du chargement des rapports.");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/rapports/${id}/statut`, { statut: newStatus });
            setMsg(newStatus === 'VALIDE' ? "Rapport validé avec succès" : "Rapport rejeté");
            
            // Refresh data after update
            fetchReports();
            
            // Clear message after 3 seconds
            setTimeout(() => setMsg(null), 3000);
        } catch (err) {
            alert("Erreur lors de la mise à jour");
        }
    };

    const getStatusConfig = (statut) => {
        const configs = {
            'BROUILLON': { label: 'Brouillon', color: 'gray' },
            'SOUMIS': { label: 'Soumis', color: 'blue' },
            'VALIDE': { label: 'Validé', color: 'green' },
            'REJETE': { label: 'Rejeté', color: 'red' }
        };
        return configs[statut] || { label: statut, color: 'gray' };
    };

    const filteredReports = reports.filter(r => {
        if (filter === 'TOUS') return true;
        return r.statut === filter;
    });

    if (loading) return <div className="dash-loading"><div className="dash-spinner"></div></div>;

    return (
        <div className="pro-content">
            <header className="mb-20">
                <h1 className="pro-page-title">Validation des Rapports</h1>
                <p>Gestion des rapports soumis par les étudiants</p>
            </header>

            {msg && <div className="pro-alert success mb-20">{msg}</div>}
            {error && <div className="pro-alert error mb-20">{error}</div>}

            {/* Filter Buttons */}
            <div className="filter-tabs mb-20">
                {['TOUS', 'SOUMIS', 'VALIDE', 'REJETE'].map(f => (
                    <button 
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <section className="pro-card">
                <div className="table-responsive">
                    <table className="reports-table-pro">
                        <thead>
                            <tr>
                                <th>Titre</th>
                                <th>Étudiant</th>
                                <th>Date Dépôt</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">Aucun rapport à traiter</td></tr>
                            ) : (
                                filteredReports.map(r => {
                                    const cfg = getStatusConfig(r.statut);
                                    return (
                                        <tr key={r.id}>
                                            <td><strong>{r.titre}</strong></td>
                                            <td>{r.auteur?.nom || 'Inconnu'}</td>
                                            <td>{new Date(r.date_depot).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${cfg.color}`}>{cfg.label}</span>
                                            </td>
                                            <td>
                                                {r.statut === 'SOUMIS' && (
                                                    <div className="action-group">
                                                        <button 
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => updateStatus(r.id, 'VALIDE')}
                                                        >
                                                            <i className="bi bi-check-lg"></i> Valider
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => updateStatus(r.id, 'REJETE')}
                                                        >
                                                            <i className="bi bi-x-lg"></i> Rejeter
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default SuperviseurValidation;