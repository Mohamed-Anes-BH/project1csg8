import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import offerService from '../services/offerService';
import applicationService from '../services/applicationService';
import { useAuth } from '../context/AuthContext';

function DetailleOffer() {
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [saving, setSaving] = useState(false);
    const [offerData, setOfferData] = useState(null);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const data = await offerService.getOfferById(id);
                setOfferData(data);
            } catch (error) {
                console.error("Error fetching offer details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffer();
    }, [id]);

    const handleApply = async () => {
        if (!offerData) return;
        setApplying(true);
        try {
            await applicationService.apply(id);
            const updatedData = await offerService.getOfferById(id);
            setOfferData(updatedData);
            alert("Candidature envoyée avec succès !");
        } catch (error) {
            console.error("Error applying:", error);
            if (error.response?.data?.error) {
                alert(error.response.data.error);
            } else {
                alert("Erreur lors de la candidature.");
            }
        } finally {
            setApplying(false);
        }
    };

    const handleSave = async () => {
        if (!offerData) return;
        setSaving(true);
        try {
            if (offerData.is_saved) {
                await offerService.unsaveOffer(id);
            } else {
                await offerService.saveOffer(id);
            }
            setOfferData(prev => ({ ...prev, is_saved: !prev.is_saved }));
        } catch (error) {
            console.error("Error saving offer:", error);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Chargement...</p>
            </div>
        );
    }

    if (!offerData) {
        return (
            <div style={styles.errorContainer}>
                <p>Offre non trouvée</p>
                <Link to="/offres" style={styles.backLink}>← Retour aux offres</Link>
            </div>
        );
    }

    const skillsList = offerData.skills ? offerData.skills.split(',').map(s => s.trim()) : [];

    const getTypeColor = (type) => {
        switch (type) {
            case 'PFE': return '#9333ea';
            case 'STAGE': return '#3b82f6';
            default: return '#22c55e';
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return { text: 'Acceptée', color: '#22c55e', bg: '#dcfce7' };
            case 'REJECTED':
                return { text: 'Refusée', color: '#ef4444', bg: '#fee2e2' };
            case 'PENDING':
                return { text: 'En attente', color: '#f59e0b', bg: '#fef3c7' };
            default:
                return { text: status, color: '#6b7280', bg: '#f3f4f6' };
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <Link to="/offres" style={styles.backButton}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour aux offres
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <div style={styles.grid}>
                    {/* Left Column - Details */}
                    <div style={styles.leftColumn}>
                        {/* Title Card */}
                        <div style={styles.card}>
                            <div style={styles.titleSection}>
                                <span style={{
                                    ...styles.typeBadge,
                                    backgroundColor: 'rgba(249, 177, 52, 0.1)',
                                    color: '#F9B134',
                                    border: '1px solid #F9B134',
                                }}>
                                    {offerData.type}
                                </span>
                                <h1 style={styles.title}>{offerData.title}</h1>
                                <div style={styles.metaRow}>
                                    <div style={styles.companyInfo}>
                                        <div style={styles.companyLogo}>
                                            {offerData.company_logo ? (
                                                <img src={offerData.company_logo} alt="" style={styles.logoImg} />
                                            ) : (
                                                <span style={styles.logoText}>
                                                    {offerData.company_name?.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span style={styles.companyName}>{offerData.company_name}</span>
                                    </div>
                                    <span style={styles.separator}>•</span>
                                    <span style={styles.location}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {offerData.location}
                                    </span>
                                    <span style={styles.separator}>•</span>
                                    <span style={styles.duration}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {offerData.duration}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={styles.card}>
                            <h2 style={styles.sectionTitle}>Description</h2>
                            <div style={styles.description}>
                                {offerData.description?.split('\n').map((paragraph, i) => (
                                    paragraph.trim() && <p key={i} style={styles.paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        {skillsList.length > 0 && (
                            <div style={styles.card}>
                                <h2 style={styles.sectionTitle}>Compétences requises</h2>
                                <div style={styles.skillsContainer}>
                                    {skillsList.map((skill, i) => (
                                        <span
                                            key={i}
                                            className="skill-tag"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div style={styles.rightColumn}>
                        <div style={styles.stickyCard}>
                            {/* Application Status or Apply Button */}
                            {user?.role === 'STUDENT' && (
                                <>
                                    {offerData.application_status ? (
                                        <div style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusInfo(offerData.application_status).bg,
                                            color: getStatusInfo(offerData.application_status).color,
                                            borderColor: getStatusInfo(offerData.application_status).color,
                                        }}>
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {offerData.application_status === 'ACCEPTED' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                ) : offerData.application_status === 'REJECTED' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                )}
                                            </svg>
                                            Candidature {getStatusInfo(offerData.application_status).text}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            style={styles.applyButton}
                                        >
                                            {applying ? 'Envoi en cours...' : 'Postuler maintenant'}
                                        </button>
                                    )}

                                    {/* Save/Bookmark Button */}
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        style={{
                                            ...styles.saveButton,
                                            backgroundColor: offerData.is_saved ? '#fef3c7' : '#fff',
                                            borderColor: offerData.is_saved ? '#f59e0b' : '#d1d5db',
                                            color: offerData.is_saved ? '#b45309' : '#374151',
                                        }}
                                    >
                                        <svg
                                            width="20"
                                            height="20"
                                            fill={offerData.is_saved ? 'currentColor' : 'none'}
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                            />
                                        </svg>
                                        {saving ? 'Traitement...' : (offerData.is_saved ? 'Enregistrée' : 'Enregistrer')}
                                    </button>
                                </>
                            )}

                            {/* Divider */}
                            <div style={styles.divider}></div>

                            {/* Company Info */}
                            <div style={styles.companyCard}>
                                <div style={styles.companyLogoLarge}>
                                    {offerData.company_logo ? (
                                        <img src={offerData.company_logo} alt="" style={styles.logoImgLarge} />
                                    ) : (
                                        <span style={styles.logoTextLarge}>
                                            {offerData.company_name?.substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <h3 style={styles.companyTitle}>{offerData.company_name}</h3>
                            </div>

                            {/* Divider */}
                            <div style={styles.divider}></div>

                            {/* Stats */}
                            <div style={styles.statsContainer}>
                                <div style={styles.statRow}>
                                    <span style={styles.statLabel}>Vues</span>
                                    <span style={styles.statValue}>{offerData.views || 0}</span>
                                </div>
                                <div style={styles.statRow}>
                                    <span style={styles.statLabel}>Période</span>
                                    <span style={styles.statValue}>{offerData.duration}</span>
                                </div>
                                <div style={styles.statRow}>
                                    <span style={styles.statLabel}>Localisation</span>
                                    <span style={styles.statValue}>{offerData.location}</span>
                                </div>
                                <div style={styles.statRow}>
                                    <span style={styles.statLabel}>Publié le</span>
                                    <span style={styles.statValue}>
                                        {new Date(offerData.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#111',
        color: '#fff',
    },
    loadingContainer: {
        minHeight: '100vh',
        backgroundColor: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTopColor: '#F9B134',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        color: '#9ca3af',
        fontSize: '14px',
    },
    errorContainer: {
        minHeight: '100vh',
        backgroundColor: '#111',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: '#fff',
    },
    backLink: {
        color: '#F9B134',
        textDecoration: 'none',
        fontSize: '14px',
    },
    header: {
        borderBottom: '1px solid #262626',
        backgroundColor: '#1a1a1a',
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
    },
    backButton: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#9ca3af',
        textDecoration: 'none',
        fontSize: '14px',
        transition: 'color 0.2s',
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 24px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        gap: '32px',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    rightColumn: {
        position: 'relative',
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #262626',
        padding: '24px',
    },
    stickyCard: {
        backgroundColor: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #262626',
        padding: '24px',
        position: 'sticky',
        top: '80px',
    },
    titleSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    typeBadge: {
        display: 'inline-block',
        width: 'fit-content',
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#fff',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#fff',
        margin: '0',
        lineHeight: '1.3',
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '8px',
        color: '#9ca3af',
        fontSize: '14px',
    },
    companyInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    companyLogo: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logoImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    logoText: {
        color: '#111',
        fontSize: '10px',
        fontWeight: '700',
    },
    companyName: {
        color: '#fff',
        fontWeight: '500',
    },
    separator: {
        color: '#4b5563',
    },
    location: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    duration: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 16px 0',
        paddingBottom: '12px',
        borderBottom: '1px solid #262626',
    },
    description: {
        lineHeight: '1.7',
    },
    paragraph: {
        color: '#d1d5db',
        margin: '0 0 12px 0',
        fontSize: '15px',
    },
    skillsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    skillTag: {
        padding: '8px 16px',
        backgroundColor: '#262626',
        border: '1px solid #374151',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#e5e7eb',
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '14px',
        border: '1px solid',
    },
    applyButton: {
        width: '100%',
        padding: '14px 24px',
        backgroundColor: '#F9B134',
        color: '#000',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    saveButton: {
        width: '100%',
        padding: '12px 24px',
        border: '1px solid',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px',
        transition: 'all 0.2s',
    },
    divider: {
        height: '1px',
        backgroundColor: '#262626',
        margin: '20px 0',
    },
    companyCard: {
        textAlign: 'center',
    },
    companyLogoLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        overflow: 'hidden',
        border: '4px solid #262626',
        boxShadow: '0 0 0 1px #3A362D',
    },
    logoImgLarge: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    logoTextLarge: {
        color: '#111',
        fontSize: '16px',
        fontWeight: '700',
    },
    companyTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 4px 0',
    },
    viewOffersLink: {
        color: '#F9B134',
        textDecoration: 'none',
        fontSize: '13px',
    },
    statsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    statRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        color: '#6b7280',
        fontSize: '14px',
    },
    statValue: {
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
    },
};

// Add CSS animation for spinner and skill-tag hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    @media (max-width: 900px) {
        .offer-grid {
            grid-template-columns: 1fr !important;
        }
    }
    .skill-tag {
        padding: 10px 18px;
        background-color: #262626;
        border: 1px solid #374151;
        border-radius: 8px;
        font-size: 13px;
        color: #e5e7eb;
        cursor: default;
        transition: all 0.2s ease;
        display: inline-block;
    }
    .skill-tag:hover {
        background-color: #1a1a1a;
        border-color: #F9B134;
        color: #F9B134;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(249, 177, 52, 0.15);
    }
`;
document.head.appendChild(styleSheet);

export default DetailleOffer;
