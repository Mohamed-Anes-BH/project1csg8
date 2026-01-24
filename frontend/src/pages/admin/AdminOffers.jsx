import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { getOffers, getOfferStats, approveOffer, rejectOffer, deleteOffer, bulkApproveOffers } from '../../services/adminService';
import './AdminOffers.css';

const AdminOffers = () => {
    const [offers, setOffers] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, reported: 0, archived: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [filters, setFilters] = useState({ search: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [selectedOffers, setSelectedOffers] = useState([]);

    useEffect(() => {
        loadOffers();
        loadStats();
    }, [activeTab, filters, pagination.page]);

    const loadOffers = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
            };

            if (activeTab === 'pending') {
                params.approved = 'pending';
                params.status = 'OPEN';
            } else if (activeTab === 'published') {
                params.approved = 'approved';
                params.status = 'OPEN';
            } else if (activeTab === 'archived') {
                params.status = 'ARCHIVED';
            }

            const data = await getOffers(params);
            setOffers(data.results || []);
            setPagination(prev => ({ ...prev, total: data.count }));
        } catch (error) {
            console.error('Erreur chargement offres:', error);
            toast.error('Erreur lors du chargement des offres');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await getOfferStats();
            setStats({
                pending: data.pending_count || 0,
                approved: data.approved_count || 0,
                reported: 0,
                archived: data.archived_count || 0
            });
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    };

    const handleApproveOffer = async (offerId) => {
        try {
            await approveOffer(offerId);
            toast.success('Offre approuvée');
            loadOffers();
            loadStats();
        } catch (error) {
            toast.error('Erreur lors de l\'approbation');
        }
    };

    const handleRejectOffer = async (offerId) => {
        const reason = prompt('Raison du rejet:');
        if (reason) {
            try {
                await rejectOffer(offerId, reason);
                toast.success('Offre rejetée');
                loadOffers();
                loadStats();
            } catch (error) {
                toast.error('Erreur lors du rejet');
            }
        }
    };

    const handleDeleteOffer = async (offerId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
            try {
                await deleteOffer(offerId, 'Suppression par admin');
                toast.success('Offre supprimée');
                loadOffers();
                loadStats();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleBulkApprove = async () => {
        if (selectedOffers.length === 0) {
            toast.warning('Sélectionnez des offres à approuver');
            return;
        }
        try {
            await bulkApproveOffers(selectedOffers);
            toast.success(`${selectedOffers.length} offres approuvées`);
            setSelectedOffers([]);
            loadOffers();
            loadStats();
        } catch (error) {
            toast.error('Erreur lors de l\'approbation en masse');
        }
    };

    const toggleSelectOffer = (offerId) => {
        setSelectedOffers(prev =>
            prev.includes(offerId)
                ? prev.filter(id => id !== offerId)
                : [...prev, offerId]
        );
    };

    const selectAll = () => {
        if (selectedOffers.length === offers.length) {
            setSelectedOffers([]);
        } else {
            setSelectedOffers(offers.map(o => o.id));
        }
    };

    const getStatusBadge = (offer) => {
        if (offer.status === 'ARCHIVED') {
            return <span className="offer-status archived">Archivée</span>;
        }
        if (!offer.is_approved) {
            return <span className="offer-status pending">En attente</span>;
        }
        return <span className="offer-status approved">Publiée</span>;
    };

    const getOfferTypeLabel = (type) => {
        const types = {
            'STAGE': 'Stage Classique',
            'PFE': 'Stage PFE',
            'EMPLOI': 'Emploi'
        };
        return types[type] || type;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Hier, ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <AdminLayout>
            <div className="admin-offers">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>Modération des Offres</h1>
                        <p>Gérez et validez les opportunités de stage pour les étudiants algériens.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleBulkApprove}
                        disabled={selectedOffers.length === 0}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Tout approuver
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">En attente</span>
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-growth">↗ +12%</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Publiées ce mois</span>
                            <span className="stat-value">{stats.approved}</span>
                            <span className="stat-growth">↗ +5%</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon red">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-label">Signalées</span>
                            <span className="stat-value">{stats.reported}</span>
                            <span className="stat-critical">● Critique</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="offers-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        En attente ({stats.pending})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
                        onClick={() => setActiveTab('published')}
                    >
                        Publiées
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'reported' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reported')}
                    >
                        Signalées
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
                        onClick={() => setActiveTab('archived')}
                    >
                        Archivées
                    </button>
                </div>

                {/* Search */}
                <div className="search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher une offre ou une entreprise..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>

                {/* Offers Table */}
                <div className="offers-table-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <>
                            <table className="offers-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectedOffers.length === offers.length && offers.length > 0}
                                                onChange={selectAll}
                                            />
                                        </th>
                                        <th>TITRE DE L'OFFRE</th>
                                        <th>ENTREPRISE</th>
                                        <th>DATE</th>
                                        <th>STATUT</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {offers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <p>Aucune offre trouvée</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        offers.map((offer) => (
                                            <tr key={offer.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOffers.includes(offer.id)}
                                                        onChange={() => toggleSelectOffer(offer.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="offer-info">
                                                        <span className="offer-title">{offer.title}</span>
                                                        <span className="offer-meta">
                                                            {getOfferTypeLabel(offer.type)} • {offer.duration || 'Non précisé'} • {offer.location || 'Non précisé'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="company-cell">
                                                        <div className="company-logo">
                                                            {offer.company_logo ? (
                                                                <img src={offer.company_logo} alt="" />
                                                            ) : (
                                                                offer.company_name?.charAt(0) || 'E'
                                                            )}
                                                        </div>
                                                        <span>{offer.company_name}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(offer.created_at)}</td>
                                                <td>{getStatusBadge(offer)}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        {!offer.is_approved && offer.status !== 'ARCHIVED' && (
                                                            <button
                                                                className="action-btn approve"
                                                                title="Approuver"
                                                                onClick={() => handleApproveOffer(offer.id)}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            className="action-btn reject"
                                                            title="Rejeter"
                                                            onClick={() => handleRejectOffer(offer.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            title="Supprimer"
                                                            onClick={() => handleDeleteOffer(offer.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            {offers.length > 0 && (
                                <div className="pagination">
                                    <span className="pagination-info">
                                        Affichage de {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} offres
                                    </span>
                                    <div className="pagination-controls">
                                        <button
                                            className="page-btn"
                                            disabled={pagination.page === 1}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        >
                                            Précédent
                                        </button>
                                        {[...Array(Math.min(totalPages, 3))].map((_, i) => (
                                            <button
                                                key={i}
                                                className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                                                onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            className="page-btn"
                                            disabled={pagination.page === totalPages}
                                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOffers;
