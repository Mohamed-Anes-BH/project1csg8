import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { getUsers, toggleUser, suspendUser, restoreUser, createUser, getUserDetail } from '../../services/adminService';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, students: 0, companies: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ role: '', verified: '', search: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'STUDENT', name: '' });

    useEffect(() => {
        loadUsers();
    }, [filters, pagination.page]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers({
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            });
            setUsers(data.results || []);
            setPagination(prev => ({ ...prev, total: data.count }));

            // Calculate stats
            const allUsers = await getUsers({ limit: 1000 });
            const allData = allUsers.results || [];
            setStats({
                total: allData.length,
                pending: allData.filter(u => !u.is_verified).length,
                students: allData.filter(u => u.role === 'STUDENT').length,
                companies: allData.filter(u => u.role === 'COMPANY').length
            });
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUser = async (userId) => {
        try {
            await toggleUser(userId);
            toast.success('Statut utilisateur mis à jour');
            loadUsers();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const handleSuspendUser = async (userId) => {
        const reason = prompt('Raison de la suspension:');
        if (reason) {
            try {
                await suspendUser(userId, reason);
                toast.success('Utilisateur suspendu');
                loadUsers();
            } catch (error) {
                toast.error('Erreur lors de la suspension');
            }
        }
    };

    const handleRestoreUser = async (userId) => {
        try {
            await restoreUser(userId);
            toast.success('Utilisateur réactivé');
            loadUsers();
        } catch (error) {
            toast.error('Erreur lors de la réactivation');
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const user = await getUserDetail(userId);
            setSelectedUser(user);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Erreur lors du chargement des détails');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(newUser);
            toast.success('Utilisateur créé avec succès');
            setShowCreateModal(false);
            setNewUser({ email: '', password: '', role: 'STUDENT', name: '' });
            loadUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la création');
        }
    };

    const getStatusBadge = (user) => {
        if (!user.is_verified) {
            return <span className="status-badge suspended">Suspendu</span>;
        }
        return <span className="status-badge verified">Vérifié</span>;
    };

    const getUserName = (user) => {
        if (user.name) {
            return `${user.name}${user.last_name ? ' ' + user.last_name : ''}`;
        }
        return user.email.split('@')[0];
    };

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <AdminLayout>
            <div className="admin-users">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <nav className="breadcrumb">
                            <span>Admin</span> / <span className="current">Gestion Utilisateurs</span>
                        </nav>
                        <h1>Gestion des Comptes</h1>
                        <p>Supervisez les étudiants et les entreprises partenaires du réseau.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Ajouter un utilisateur
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Total Utilisateurs</span>
                            <span className="stat-value">{stats.total.toLocaleString()}</span>
                            <span className="stat-growth">↗ +12% ce mois</span>
                        </div>
                        <div className="stat-icon blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">En attente</span>
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-warning">⚠ À vérifier</span>
                        </div>
                        <div className="stat-icon orange">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Étudiants</span>
                            <span className="stat-value">{stats.students}</span>
                            <span className="stat-growth">↗ +8%</span>
                        </div>
                        <div className="stat-icon purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <span className="stat-label">Entreprises</span>
                            <span className="stat-value">{stats.companies}</span>
                            <span className="stat-growth">↗ +15%</span>
                        </div>
                        <div className="stat-icon green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">Tous les rôles</option>
                            <option value="STUDENT">Étudiant</option>
                            <option value="COMPANY">Entreprise</option>
                            <option value="ADMIN">Admin</option>
                        </select>

                        <select
                            value={filters.verified}
                            onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                            className="filter-select"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="true">Vérifié</option>
                            <option value="false">En attente</option>
                            <option value="suspended">Suspendu</option>
                        </select>
                    </div>

                    <div className="filter-actions">
                        <div className="search-input">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <button className="btn-icon" title="Filtres avancés">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                            </svg>
                        </button>
                        <button className="btn-icon" title="Exporter">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="users-table-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Chargement...</p>
                        </div>
                    ) : (
                        <>
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>NOM / ENTREPRISE</th>
                                        <th>TYPE</th>
                                        <th>DATE D'INSCRIPTION</th>
                                        <th>STATUT</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar" style={{ backgroundColor: user.role === 'COMPANY' ? '#8b5cf6' : '#f59e0b' }}>
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" />
                                                        ) : (
                                                            getUserName(user).charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="user-info">
                                                        <span className="user-name">{getUserName(user)}</span>
                                                        <span className="user-email">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`type-badge ${user.role.toLowerCase()}`}>
                                                    {user.role === 'STUDENT' ? '● Étudiant' : user.role === 'COMPANY' ? '■ Entreprise' : '◆ Admin'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>{getStatusBadge(user)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="action-btn view"
                                                        title="Voir"
                                                        onClick={() => handleViewUser(user.id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="action-btn edit"
                                                        title="Modifier"
                                                        onClick={() => handleToggleUser(user.id)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </button>
                                                    {user.is_verified ? (
                                                        <button
                                                            className="action-btn suspend"
                                                            title="Suspendre"
                                                            onClick={() => handleSuspendUser(user.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="action-btn restore"
                                                            title="Réactiver"
                                                            onClick={() => handleRestoreUser(user.id)}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <polyline points="23 4 23 10 17 10" />
                                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="pagination">
                                <span className="pagination-info">
                                    Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} utilisateurs
                                </span>
                                <div className="pagination-controls">
                                    <button
                                        className="page-btn"
                                        disabled={pagination.page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    >
                                        ‹
                                    </button>
                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                                            onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    {totalPages > 5 && <span className="page-dots">...</span>}
                                    {totalPages > 5 && (
                                        <button
                                            className="page-btn"
                                            onClick={() => setPagination(prev => ({ ...prev, page: totalPages }))}
                                        >
                                            {totalPages}
                                        </button>
                                    )}
                                    <button
                                        className="page-btn"
                                        disabled={pagination.page === totalPages}
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Ajouter un utilisateur</h2>
                                <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleCreateUser}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mot de passe</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nom / Entreprise</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Rôle</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="STUDENT">Étudiant</option>
                                        <option value="COMPANY">Entreprise</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Créer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {showDetailModal && selectedUser && (
                    <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Détails utilisateur</h2>
                                <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                            </div>
                            <div className="user-detail">
                                <div className="detail-row">
                                    <span className="detail-label">Email:</span>
                                    <span className="detail-value">{selectedUser.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Rôle:</span>
                                    <span className="detail-value">{selectedUser.role}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Vérifié:</span>
                                    <span className="detail-value">{selectedUser.is_verified ? 'Oui' : 'Non'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Inscrit le:</span>
                                    <span className="detail-value">{new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {selectedUser.profile && (
                                    <>
                                        <hr />
                                        <h3>Profil</h3>
                                        {selectedUser.role === 'STUDENT' && (
                                            <>
                                                <div className="detail-row">
                                                    <span className="detail-label">Nom:</span>
                                                    <span className="detail-value">{selectedUser.profile.first_name} {selectedUser.profile.last_name}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Titre:</span>
                                                    <span className="detail-value">{selectedUser.profile.title || '-'}</span>
                                                </div>
                                            </>
                                        )}
                                        {selectedUser.role === 'COMPANY' && (
                                            <>
                                                <div className="detail-row">
                                                    <span className="detail-label">Entreprise:</span>
                                                    <span className="detail-value">{selectedUser.profile.name}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Secteur:</span>
                                                    <span className="detail-value">{selectedUser.profile.industry || '-'}</span>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
