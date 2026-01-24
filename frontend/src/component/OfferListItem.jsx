import { Link } from 'react-router-dom';

function OfferListItem({ id, title, company, location, contractType, type }) {
    const getTypeStyles = () => {
        switch (type?.toUpperCase()) {
            case 'STAGE':
                return { bg: '#F9B134', color: '#000', label: 'Stage' };
            case 'PFE':
                return { bg: '#F9B134', color: '#000', label: 'PFE' };
            case 'EMPLOI':
                return { bg: '#F9B134', color: '#000', label: 'Emploi' };
            default:
                return { bg: '#F9B134', color: '#000', label: type };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <Link
            to={`/offre/${id}`}
            className="offer-card-link"
            style={{
                display: 'block',
                textDecoration: 'none',
            }}
        >
            <div className="offer-card" style={styles.card}>
                {/* Left accent bar */}
                <div
                    style={{
                        ...styles.accentBar,
                        backgroundColor: '#F9B134',
                    }}
                />

                {/* Type Badge (Left Middle) */}
                <div style={styles.badgeColumn}>
                    <span
                        style={{
                            ...styles.typeBadge,
                            color: '#F9B134',
                            border: '1px solid #F9B134',
                            backgroundColor: 'rgba(249, 177, 52, 0.1)', // Slight transparency
                        }}
                    >
                        {typeStyles.label}
                    </span>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Header row */}
                    <div style={styles.headerRow}>
                        <div style={styles.titleSection}>
                            <h3 style={styles.title}>{title}</h3>
                        </div>
                    </div>

                    {/* Meta info */}
                    <div style={styles.metaRow}>
                        {/* Company */}
                        <div style={styles.metaItem}>
                            <svg style={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span style={styles.metaText}>{company}</span>
                        </div>

                        <span style={styles.separator}>•</span>

                        {/* Location */}
                        <div style={styles.metaItem}>
                            <svg style={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span style={styles.metaText}>{location}</span>
                        </div>

                        <span style={styles.separator}>•</span>

                        {/* Duration */}
                        <div style={styles.metaItem}>
                            <svg style={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span style={styles.metaText}>{contractType}</span>
                        </div>
                    </div>
                </div>

                {/* Arrow indicator */}
                <div className="arrow-indicator" style={styles.arrowContainer}>
                    <svg style={styles.arrow} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

const styles = {
    card: {
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: '#18181b',
        borderRadius: '12px',
        border: '1px solid #27272a',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
    },
    accentBar: {
        width: '4px',
        flexShrink: 0,
    },
    badgeColumn: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '0px',
    },
    content: {
        flex: 1,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px', // Reduced gap since badge moved out
    },
    headerRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '4px', // Add some spacing below title since badge is gone
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
    },
    title: {
        fontSize: '17px',
        fontWeight: '600',
        color: '#ffffff',
        margin: 0,
        lineHeight: '1.4',
    },
    typeBadge: {
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap', // Ensure badge doesn't wrap
    },
    metaRow: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    metaIcon: {
        width: '14px',
        height: '14px',
        color: '#71717a',
    },
    metaText: {
        fontSize: '13px',
        color: '#a1a1aa',
    },
    separator: {
        color: '#3f3f46',
        fontSize: '10px',
    },
    arrowContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        transition: 'all 0.25s ease',
    },
    arrow: {
        width: '20px',
        height: '20px',
        color: '#52525b',
        transition: 'all 0.25s ease',
    },
};

// Add CSS for hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .offer-card-link:hover .offer-card {
        border-color: #3f3f46;
        background-color: #1f1f23;
        transform: translateX(4px);
    }
    .offer-card-link:hover .arrow-indicator svg {
        color: #F9B134;
        transform: translateX(4px);
    }
    .offer-card-link:hover .offer-card h3 {
        color: #F9B134;
    }
`;
if (!document.getElementById('offer-list-item-styles')) {
    styleSheet.id = 'offer-list-item-styles';
    document.head.appendChild(styleSheet);
}

export default OfferListItem;
