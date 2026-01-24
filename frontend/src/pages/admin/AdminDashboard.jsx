import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getDashboardStats, getGrowthStats, getRecentActivity, getRecentApplications } from '../../services/adminService';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [growthData, setGrowthData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, growth, activityData, appsData] = await Promise.all([
                getDashboardStats(),
                getGrowthStats(6),
                getRecentActivity(5),
                getRecentApplications(5)
            ]);
            setStats(statsData);
            setGrowthData(growth);
            setActivities(activityData);
            setApplications(appsData);
        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    const calculateGrowth = (current, previous) => {
        if (!previous || previous === 0) return '+0%';
        const growth = ((current - previous) / previous * 100).toFixed(1);
        return growth >= 0 ? `+${growth}%` : `${growth}%`;
    };

    const getMonthName = (month) => {
        const months = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[month - 1] || '';
    };

    const getActivityIcon = (type) => {
        const icons = {
            NEW_USER: (
                <div className="activity-icon new-user">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                </div>
            ),
            NEW_OFFER: (
                <div className="activity-icon new-offer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                </div>
            ),
            COMPANY_VERIFIED: (
                <div className="activity-icon verified">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                </div>
            ),
            OFFER_REPORTED: (
                <div className="activity-icon reported">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
            ),
        };
        return icons[type] || icons.NEW_USER;
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} minutes`;
        if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            PENDING: { label: 'En attente', className: 'pending' },
            ACCEPTED: { label: 'Validé', className: 'accepted' },
            REJECTED: { label: 'Refusé', className: 'rejected' },
            PRESELECTED: { label: 'Présélectionné', className: 'preselected' },
        };
        const config = statusMap[status] || { label: status, className: 'default' };
        return <span className={`status-badge ${config.className}`}>{config.label}</span>;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Chargement du tableau de bord...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-dashboard">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1>Dashboard Overview</h1>
                        <p>Bienvenue, voici l'état actuel de la plateforme DZ-Stagiaire.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon students">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Étudiants</span>
                            <div className="stat-value">{formatNumber(stats?.total_students)}</div>
                            <span className="stat-growth positive">
                                {calculateGrowth(stats?.growth?.new_users_month, stats?.growth?.prev_users_month)} ↗
                            </span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon companies">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Entreprises</span>
                            <div className="stat-value">{formatNumber(stats?.total_companies)}</div>
                            <span className="stat-growth positive">+2.1% ↗</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon offers">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Offres Actives</span>
                            <div className="stat-value">{formatNumber(stats?.active_offers)}</div>
                            <span className="stat-growth positive">+12.4% ↗</span>
                        </div>
                    </div>

                    <div className="stat-card highlight">
                        <div className="stat-icon applications">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Nouvelles Candidatures (24h)</span>
                            <div className="stat-value">{formatNumber(stats?.new_applications_24h)}</div>
                            <span className="stat-growth positive">+8.5% ↗</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Growth Chart */}
                    <div className="dashboard-card chart-card">
                        <div className="card-header">
                            <h2>Platform Growth</h2>
                            <span className="time-filter">Derniers 30 jours</span>
                        </div>
                        <div className="chart-container">
                            <div className="bar-chart">
                                {growthData?.users?.map((item, index) => (
                                    <div key={index} className="bar-group">
                                        <div
                                            className="bar"
                                            style={{ height: `${Math.min(item.count * 10, 200)}px` }}
                                        ></div>
                                        <span className="bar-label">{getMonthName(item.month)}</span>
                                    </div>
                                ))}
                                {(!growthData?.users || growthData.users.length === 0) && (
                                    <>
                                        <div className="bar-group"><div className="bar" style={{ height: '60px' }}></div><span className="bar-label">JAN</span></div>
                                        <div className="bar-group"><div className="bar" style={{ height: '80px' }}></div><span className="bar-label">FEV</span></div>
                                        <div className="bar-group"><div className="bar" style={{ height: '100px' }}></div><span className="bar-label">MAR</span></div>
                                        <div className="bar-group"><div className="bar" style={{ height: '120px' }}></div><span className="bar-label">AVR</span></div>
                                        <div className="bar-group"><div className="bar" style={{ height: '140px' }}></div><span className="bar-label">MAI</span></div>
                                        <div className="bar-group"><div className="bar" style={{ height: '180px' }}></div><span className="bar-label">JUN</span></div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-card activity-card">
                        <div className="card-header">
                            <h2>Activité Récente</h2>
                            <button className="btn-link">Voir tout</button>
                        </div>
                        <div className="activity-list">
                            {activities.length > 0 ? activities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    {getActivityIcon(activity.type)}
                                    <div className="activity-content">
                                        <strong>{activity.title}</strong>
                                        <p>{activity.description}</p>
                                        <span className="activity-time">{formatTimeAgo(activity.created_at)}</span>
                                    </div>
                                </div>
                            )) : (
                                <>
                                    <div className="activity-item">
                                        {getActivityIcon('NEW_USER')}
                                        <div className="activity-content">
                                            <strong>Nouveau Candidat</strong>
                                            <p>Ahmed B. vient de s'inscrire.</p>
                                            <span className="activity-time">Il y a 2 minutes</span>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        {getActivityIcon('NEW_OFFER')}
                                        <div className="activity-content">
                                            <strong>Nouvelle Offre</strong>
                                            <p>Sonatrach a publié : 'Stagiaire Data Analyst'</p>
                                            <span className="activity-time">Il y a 15 minutes</span>
                                        </div>
                                    </div>
                                    <div className="activity-item">
                                        {getActivityIcon('COMPANY_VERIFIED')}
                                        <div className="activity-content">
                                            <strong>Entreprise Vérifiée</strong>
                                            <p>Ooredoo Algérie a été approuvée.</p>
                                            <span className="activity-time">Il y a 1 heure</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Applications Table */}
                <div className="dashboard-card table-card">
                    <div className="card-header">
                        <h2>Dernières Candidatures</h2>
                        <button className="btn-primary">Gérer les flux</button>
                    </div>
                    <div className="applications-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>CANDIDAT</th>
                                    <th>OFFRE</th>
                                    <th>DATE</th>
                                    <th>STATUT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length > 0 ? applications.map((app, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="candidate-info">
                                                <div className="candidate-avatar">
                                                    {app.first_name?.charAt(0) || 'U'}
                                                </div>
                                                <span>{app.first_name} {app.last_name}</span>
                                            </div>
                                        </td>
                                        <td>{app.offer_title}</td>
                                        <td>{new Date(app.created_at).toLocaleDateString('fr-FR')}</td>
                                        <td>{getStatusBadge(app.status)}</td>
                                    </tr>
                                )) : (
                                    <>
                                        <tr>
                                            <td>
                                                <div className="candidate-info">
                                                    <div className="candidate-avatar">K</div>
                                                    <span>Karim Mansouri</span>
                                                </div>
                                            </td>
                                            <td>Développeur Full-Stack</td>
                                            <td>Aujourd'hui, 14:30</td>
                                            <td>{getStatusBadge('PENDING')}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="candidate-info">
                                                    <div className="candidate-avatar">A</div>
                                                    <span>Amira Zahra</span>
                                                </div>
                                            </td>
                                            <td>UX/UI Designer PFE</td>
                                            <td>Aujourd'hui, 12:15</td>
                                            <td>{getStatusBadge('ACCEPTED')}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Security Status */}
                <div className="security-card">
                    <div className="security-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div className="security-info">
                        <strong>SECURITY ACTIVE</strong>
                        <span>SSL Encryption: v3.2</span>
                        <span>Firewall: Operational</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
