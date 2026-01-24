import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import { getSettings, updateSettings } from '../../services/adminService';
import './AdminSettings.css';

const AdminSettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeCategory, setActiveCategory] = useState('GENERAL');

    const categories = [
        { key: 'GENERAL', label: 'Général', icon: 'settings' },
        { key: 'EMAIL', label: 'Email', icon: 'mail' },
        { key: 'SECURITY', label: 'Sécurité', icon: 'shield' },
        { key: 'NOTIFICATIONS', label: 'Notifications', icon: 'bell' },
        { key: 'MAINTENANCE', label: 'Maintenance', icon: 'tool' }
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            // Convert array to object for easier manipulation
            const settingsObj = {};
            (data.settings || []).forEach(s => {
                settingsObj[s.setting_key] = {
                    value: s.setting_value,
                    type: s.setting_type,
                    category: s.category,
                    description: s.description
                };
            });
            setSettings(settingsObj);
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            toast.error('Erreur lors du chargement des paramètres');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const settingsToUpdate = {};
            Object.entries(settings).forEach(([key, data]) => {
                settingsToUpdate[key] = data.value;
            });
            await updateSettings(settingsToUpdate);
            toast.success('Paramètres sauvegardés');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const renderSettingInput = (key, setting) => {
        if (setting.type === 'BOOLEAN') {
            return (
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={setting.value === 'true'}
                        onChange={(e) => handleSettingChange(key, e.target.checked ? 'true' : 'false')}
                    />
                    <span className="toggle-slider"></span>
                </label>
            );
        }

        if (setting.type === 'NUMBER') {
            return (
                <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(key, e.target.value)}
                    className="setting-input"
                />
            );
        }

        return (
            <input
                type="text"
                value={setting.value}
                onChange={(e) => handleSettingChange(key, e.target.value)}
                className="setting-input"
            />
        );
    };

    const getSettingsByCategory = (category) => {
        return Object.entries(settings).filter(([key, data]) => data.category === category);
    };

    const getCategoryIcon = (iconName) => {
        const icons = {
            settings: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
            mail: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
            ),
            shield: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            bell: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            ),
            tool: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            )
        };
        return icons[iconName] || icons.settings;
    };

    const formatSettingLabel = (key) => {
        return key.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Chargement des paramètres...</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="admin-settings">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1>Paramètres Système</h1>
                        <p>Configurez les paramètres de la plateforme DZ-Stagiaire.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <div className="btn-spinner"></div>
                                Sauvegarde...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Sauvegarder
                            </>
                        )}
                    </button>
                </div>

                <div className="settings-container">
                    {/* Sidebar */}
                    <aside className="settings-sidebar">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                className={`category-btn ${activeCategory === cat.key ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.key)}
                            >
                                {getCategoryIcon(cat.icon)}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </aside>

                    {/* Settings Content */}
                    <div className="settings-content">
                        <div className="settings-section">
                            <h2>
                                {categories.find(c => c.key === activeCategory)?.label || 'Paramètres'}
                            </h2>

                            <div className="settings-list">
                                {getSettingsByCategory(activeCategory).length === 0 ? (
                                    <p className="no-settings">Aucun paramètre dans cette catégorie.</p>
                                ) : (
                                    getSettingsByCategory(activeCategory).map(([key, setting]) => (
                                        <div key={key} className="setting-item">
                                            <div className="setting-info">
                                                <label className="setting-label">{formatSettingLabel(key)}</label>
                                                <p className="setting-description">{setting.description || ''}</p>
                                            </div>
                                            <div className="setting-control">
                                                {renderSettingInput(key, setting)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="settings-section">
                            <h2>Actions rapides</h2>
                            <div className="quick-actions">
                                <button className="action-card">
                                    <div className="action-icon blue">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23 4 23 10 17 10" />
                                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                        </svg>
                                    </div>
                                    <div className="action-info">
                                        <strong>Vider le cache</strong>
                                        <span>Effacer le cache système</span>
                                    </div>
                                </button>

                                <button className="action-card">
                                    <div className="action-icon green">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <div className="action-info">
                                        <strong>Exporter les données</strong>
                                        <span>Télécharger une sauvegarde</span>
                                    </div>
                                </button>

                                <button className="action-card warning">
                                    <div className="action-icon orange">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                    </div>
                                    <div className="action-info">
                                        <strong>Mode maintenance</strong>
                                        <span>Activer/Désactiver</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
