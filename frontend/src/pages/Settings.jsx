import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import StudentSidebar from '../component/StudentSidebar';
import EnterpriseSidebar from '../component/EnterpriseSidebar';
import SettingsEntreprise from './settingsentreprise';

const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès",
    "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

function Settings() {
    const { user, logout, deleteAccount, updateUser } = useAuth(); // Assuming deleteAccount might be added to context or called directly
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Student Form State
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        wilaya: '',
        avatar: null, // path string
        is_public: true,
        email_alerts: true
    });

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                if (user?.role === 'STUDENT') {
                    const data = await profileService.getStudentProfile();
                    setProfile({
                        first_name: data.user.first_name || '',
                        last_name: data.user.last_name || '',
                        email: data.user.email || '',
                        phone: data.phone || '',
                        wilaya: data.wilaya || '',
                        avatar: data.user.avatar,
                        is_public: data.is_public ?? true,
                        email_alerts: data.email_alerts ?? true
                    });
                    if (data.user.avatar) {
                        // Backend now returns absolute URL for avatar
                        setPreviewAvatar(data.user.avatar);
                    }
                } else if (user?.role === 'COMPANY') {
                    // Similar logic for company if needed
                    const alerts = await profileService.getEmailAlertsStatus();
                    setProfile(prev => ({ ...prev, email_alerts: alerts.email_alerts }));
                }
            } catch (error) {
                console.error("Error fetching settings", error);
            }
        };
        fetchSettings();
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const saveChanges = async () => {
        setLoading(true);
        try {
            // 1. Update Profile Info
            if (user?.role === 'STUDENT') {
                await profileService.updateStudentProfile({
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    email: profile.email,
                    phone: profile.phone,
                    wilaya: profile.wilaya
                });

                // Update specific preferences via dedicated endpoint or include in profile?
                // Backend StudentProfileView.put doesn't update is_public/email_alerts (handled by StudentSettingsView)
                // Let's call updateStudentSettings
                await profileService.updateStudentSettings({
                    is_public: profile.is_public,
                    email_alerts: profile.email_alerts
                });

                // Update Avatar if new file
                if (avatarFile) {
                    await profileService.uploadAvatar(avatarFile);
                }
            } else {
                // Company update logic (minimal for now)
                await profileService.toggleEmailAlerts(); // simplistic toggle based on previous component logic
            }

            // 2. Change Password if provided
            if (passwords.current && passwords.new) {
                if (passwords.new !== passwords.confirm) {
                    toast.error("Les nouveaux mots de passe ne correspondent pas.");
                    setLoading(false);
                    return;
                }
                await authService.changePassword(passwords.current, passwords.new);
                setPasswords({ current: '', new: '', confirm: '' });
            }

            // 3. Refresh Global User State (for Navbar, etc.)
            const freshUser = await authService.getCurrentUser();
            updateUser(freshUser);

            toast.success("Modifications enregistrées avec succès !");
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.error || "Erreur lors de la sauvegarde.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            // Implement delete account logic
            toast.error("Fonctionnalité de suppression à implémenter.");
        }
    };

    const studentView = (
        <div className="flex bg-[#1E1C16] min-h-screen font-sans text-white">
            <StudentSidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-y-auto w-full">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Paramètres du Compte</h1>
                        <p className="text-gray-400">Gérez vos informations personnelles et préférences de sécurité.</p>
                    </div>

                    {/* Personal Info */}
                    <section>
                        <h2 className="text-[#F9B134] font-bold text-lg mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Informations Personnelles
                        </h2>

                        <div className="bg-[#26231D] rounded-xl p-8 border border-[#3A362D] space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-[#3A362D] overflow-hidden flex-shrink-0 border-2 border-[#F9B134]/30">
                                    {previewAvatar ? (
                                        <img src={previewAvatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white mb-1">Photo de profil</h3>
                                    <p className="text-xs text-gray-400 mb-3">JPG, GIF ou PNG. 2Mo max.</p>
                                    <label className="text-[#F9B134] text-xs font-bold hover:underline cursor-pointer">
                                        Télécharger une nouvelle photo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Prénom</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profile.first_name}
                                        onChange={handleProfileChange}
                                        className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Nom</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profile.last_name}
                                        onChange={handleProfileChange}
                                        className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-2">Adresse Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleProfileChange}
                                    className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Téléphone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        placeholder="+213 ..."
                                        className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Ville / Wilaya</label>
                                    <div className="relative">
                                        <select
                                            name="wilaya"
                                            value={profile.wilaya}
                                            onChange={handleProfileChange}
                                            className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Sélectionner une wilaya</option>
                                            {WILAYAS.map((w, i) => (
                                                <option key={i} value={w}>{i + 1} - {w}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Change Password */}
                    <section>
                        <h2 className="text-[#F9B134] font-bold text-lg mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Changer Mot de Passe
                        </h2>

                        <div className="bg-[#26231D] rounded-xl p-8 border border-[#3A362D] space-y-6">
                            <div>
                                <label className="block text-xs text-gray-400 mb-2">Mot de passe actuel</label>
                                <input
                                    type="password"
                                    name="current"
                                    value={passwords.current}
                                    onChange={handlePasswordChange}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-2">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#1E1C16] border border-[#3A362D] rounded-lg px-4 py-3 text-sm focus:border-[#F9B134] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-[#A69C8E] flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                                Le mot de passe doit contenir au moins 8 caractères.
                            </p>
                        </div>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h2 className="text-[#F9B134] font-bold text-lg mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                            Préférences et Visibilité
                        </h2>

                        <div className="bg-[#26231D] rounded-xl border border-[#3A362D] divide-y divide-[#3A362D]">
                            {/* Public Profile */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center text-[#F9B134]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Profil Public</h3>
                                        <p className="text-xs text-gray-400 mt-1">Autoriser les recruteurs à voir votre profil et vous contacter.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_public"
                                        checked={profile.is_public}
                                        onChange={handleProfileChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F9B134]"></div>
                                </label>
                            </div>

                            {/* Email Alerts */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center text-[#F9B134]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Alertes Email</h3>
                                        <p className="text-xs text-gray-400 mt-1">Recevoir des emails pour les nouvelles offres correspondant à votre profil.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="email_alerts"
                                        checked={profile.email_alerts}
                                        onChange={handleProfileChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F9B134]"></div>
                                </label>
                            </div>

                            {/* Newsletter */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#3A362D] flex items-center justify-center text-[#F9B134]">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Newsletter DZ-Stagiaire</h3>
                                        <p className="text-xs text-gray-400 mt-1">Actualités sur l'emploi et conseils de carrière en Algérie.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="newsletter"
                                        checked={false} // Not implemented yet
                                        disabled
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-800 rounded-full peer peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 border-t border-[#3A362D] pt-8">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 rounded-lg border border-[#3A362D] text-white font-medium text-sm hover:bg-[#3A362D] transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={saveChanges}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg bg-[#F9B134] text-black font-bold text-sm hover:bg-[#e5a02a] transition-colors flex items-center gap-2"
                        >
                            {loading && <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            Sauvegarder les modifications
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-[#2E1A1A] rounded-xl p-6 border border-[#4A2D2D] flex items-center justify-between">
                        <div>
                            <h3 className="text-[#E57373] font-bold text-sm">Zone de danger</h3>
                            <p className="text-[#E57373]/70 text-xs mt-1">La suppression de votre compte est irréversible.</p>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            className="text-[#E57373] hover:text-red-400 text-sm font-bold underline transition-colors"
                        >
                            Supprimer mon compte
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );

    const defaultView = (
        <div className="flex bg-black min-h-screen text-white">
            {user?.role === 'COMPANY' && <EnterpriseSidebar />}
            <main className="flex-1 p-8">
                {/* Minimal Settings for Company (Previous rudimentary implementation + Sidebar) */}
                <div className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-1 h-8 bg-[#F9B134] rounded-full"></div>
                        <h1 className="text-3xl font-bold">Paramètres</h1>
                    </div>
                    <div className="bg-[#26231D] rounded-xl p-6 border border-[#3A362D]">
                        <h2 className="text-xl font-bold mb-4">Notifications</h2>
                        <div className="flex items-center justify-between">
                            <p>Alertes Email</p>
                            <button
                                onClick={() => profileService.toggleEmailAlerts().then(() => toast.success("Préférences mises à jour")).catch(() => toast.error("Erreur"))}
                                className="px-4 py-2 bg-[#F9B134] text-black rounded text-sm font-bold"
                            >
                                Basculer
                            </button>
                        </div>
                    </div>
                    {/* Can add password change here too re-using previous logic if needed, but for now focusing on Student */}
                </div>
            </main>
        </div>
    );


    if (user?.role === 'COMPANY') {
        return <SettingsEntreprise />;
    }

    if (user?.role === 'STUDENT') {
        return studentView;
    }

    return null;
}

export default Settings;
