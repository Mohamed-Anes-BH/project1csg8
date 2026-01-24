import { useState, useEffect } from 'react';
import ProfileSection from '../component/ProfileSection';
import profileService from '../services/profileService';
import { toast } from 'react-toastify';

function ProfileEtudient() {
    const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [uploadingCV, setUploadingCV] = useState(false);

    // Modal states
    const [editModal, setEditModal] = useState({ isOpen: false, type: null });
    const [formData, setFormData] = useState({});
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileService.getStudentProfile();
                setProfileData(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleVisibilityToggle = async () => {
        if (!profileData) return;
        try {
            // Optimistic update
            setProfileData(prev => ({ ...prev, is_public: !prev.is_public }));
            await profileService.toggleStudentVisibility();
        } catch (error) {
            console.error("Error toggling visibility:", error);
            setProfileData(prev => ({ ...prev, is_public: !prev.is_public })); // Revert
        }
    };

    const handleEmailAlertsToggle = async () => {
        if (!profileData) return;
        try {
            setProfileData(prev => ({ ...prev, email_alerts: !prev.email_alerts }));
            await profileService.toggleEmailAlerts();
        } catch (error) {
            console.error("Error toggling alerts:", error);
            setProfileData(prev => ({ ...prev, email_alerts: !prev.email_alerts }));
        }
    };

    const handleCVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCV(true);
        try {
            await profileService.uploadCV(file);
            alert("CV téléchargé avec succès !");
            // Refresh profile to update CV link/status
            const data = await profileService.getStudentProfile();
            setProfileData(data);
        } catch (error) {
            console.error("Error uploading CV:", error);
            alert("Erreur lors de l'upload du CV.");
        } finally {
            setUploadingCV(false);
            setCvFile(null); // Reset input
        }
    };

    const handleDeleteCV = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre CV ?")) return;

        try {
            await profileService.deleteCV();
            toast.success("CV supprimé avec succès !");
            // Refresh profile
            const data = await profileService.getStudentProfile();
            setProfileData(data);
        } catch (error) {
            console.error("Error deleting CV:", error);
            toast.error("Erreur lors de la suppression du CV.");
        }
    };

    const handleEdit = (section) => {
        console.log(`Editing ${section}`);
        // Initialize form data based on section
        switch (section) {
            case 'formations':
                setFormData({
                    degree: '',
                    institution: '',
                    start_date: '',
                    end_date: ''
                });
                break;
            case 'competences':
                setFormData({
                    skills: profileData.skills || ''
                });
                setNewSkill('');
                break;
            case 'experiences':
                setFormData({
                    title: '',
                    company: '',
                    start_date: '',
                    end_date: '',
                    description: ''
                });
                break;
            case 'links':
                setFormData({
                    linkedin: profileData.social_links?.linkedin || '',
                    github: profileData.social_links?.github || '',
                    portfolio: profileData.social_links?.portfolio || '',

                });
                break;
            default:
                setFormData({});
        }
        setEditModal({ isOpen: true, type: section });
    };

    const handleCloseModal = () => {
        setEditModal({ isOpen: false, type: null });
        setFormData({});
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        if (!currentSkills.includes(newSkill.trim())) {
            const updatedSkills = [...currentSkills, newSkill.trim()].join(', ');
            setFormData(prev => ({ ...prev, skills: updatedSkills }));
        }
        setNewSkill('');
    };

    const handleRemoveSkill = (skillToRemove) => {
        const currentSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
        const updatedSkills = currentSkills.filter(s => s !== skillToRemove).join(', ');
        setFormData(prev => ({ ...prev, skills: updatedSkills }));
    };

    const handleSaveSection = async () => {
        // Prepare Payload
        let updateData = {};
        switch (editModal.type) {
            case 'formations':
                const newEducation = [...(profileData.education || []), formData];
                updateData = { education: newEducation };
                break;
            case 'competences':
                updateData = { skills: formData.skills };
                break;
            case 'experiences':
                const newExperience = [...(profileData.experience || []), formData];
                updateData = { experience: newExperience };
                break;
            case 'links':
                updateData = { social_links: formData };
                break;
        }

        // 1. Optimistic Update (Immediate Feedback)
        const previousProfileData = profileData; // Backup for rollback
        setProfileData(prev => {
            const newData = { ...prev };
            switch (editModal.type) {
                case 'formations':
                    newData.education = updateData.education;
                    break;
                case 'competences':
                    newData.skills = updateData.skills;
                    break;
                case 'experiences':
                    newData.experience = updateData.experience;
                    break;
                case 'links':
                    newData.social_links = { ...prev.social_links, ...updateData.social_links };
                    break;
            }
            return newData;
        });

        handleCloseModal(); // Close modal immediately

        // 2. Perform Server Update in Background
        try {
            await profileService.updateStudentProfile(updateData);
            toast.success('Profil mis à jour avec succès !');

            // Re-fetch to ensure consistency (optional, but robust)
            const data = await profileService.getStudentProfile();
            setProfileData(data);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Erreur lors de la mise à jour. Annulation...');
            setProfileData(previousProfileData); // Rollback changes on error
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
            </div>
        );
    }

    if (!profileData) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Erreur de chargement du profil</div>;
    }

    // Helper to extract display name
    const displayName = profileData.user ? (
        profileData.user.first_name && profileData.user.last_name
            ? `${profileData.user.first_name} ${profileData.user.last_name}`
            : profileData.user.username
    ) : "Étudiant";

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Profile Header */}
                <div className="bg-black rounded-xl overflow-hidden border border-[#3A362D] mb-4">
                    {/* Cover Photo */}
                    <div className="h-40 w-full relative group">
                        <img
                            src="/assets/cover-pattern.png"
                            alt="Cover"
                            className="w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    <div className="px-5 pb-5 -mt-12">
                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            {/* Avatar */}
                            <div className="flex-shrink-0 relative z-10">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#26231D] bg-zinc-800">
                                    {profileData.user?.avatar ? (
                                        <img src={profileData.user.avatar} alt={displayName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#3A362D] text-[#F9B134] text-2xl font-bold">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="flex-1 w-full pt-12 md:pt-14">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h1 className="text-xl font-bold text-white">{displayName}</h1>
                                            <span className="px-2 py-0.5 rounded-md bg-[#3A362D] text-gray-400 text-[10px] font-medium border border-[#4A463D]">
                                                <svg className="w-3 h-3 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                Étudiant
                                            </span>
                                        </div>
                                        <p className="text-[#F9B134] font-medium text-sm mb-2">{profileData.title || "Étudiant"}</p>
                                        <p className="text-gray-400 text-xs leading-relaxed max-w-2xl">
                                            {profileData.bio || "Aucune bio renseignée."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visibility & Alerts Section */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                    {/* Visibility */}
                    <div className="bg-[#26231D] rounded-xl p-4 border border-[#3A362D] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-white">Visibilité du profil</h3>
                            <div
                                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${profileData.is_public ? 'bg-[#F9B134]' : 'bg-[#3A362D]'}`}
                                onClick={handleVisibilityToggle}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${profileData.is_public ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                            <span className="text-xs text-gray-500">
                                {profileData.is_public ? 'Profil public' : 'Profil privé'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {/* Upload CV Button - Only show if no CV exists */}
                            {!profileData.resume && (
                                <label className={`cursor-pointer px-3 py-1.5 rounded-lg bg-[#3A362D] border border-[#4A463D] text-white text-xs font-medium hover:bg-[#4A463D] transition-colors flex items-center gap-2 ${uploadingCV ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    {uploadingCV ? "Upload..." : "Upload CV PDF"}
                                    <input type="file" className="hidden" accept=".pdf" onChange={handleCVUpload} disabled={uploadingCV} />
                                </label>
                            )}

                            {profileData.resume && (
                                <div className="flex items-center gap-2">
                                    <a
                                        href={profileData.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-[#3A362D] border border-[#4A463D] text-white text-xs font-medium hover:bg-[#4A463D] transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Mon CV
                                    </a>
                                    <button
                                        onClick={handleDeleteCV}
                                        className="px-3 py-1.5 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-xs font-medium hover:bg-red-900/50 transition-colors flex items-center gap-2"
                                        title="Supprimer le CV"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alerts */}
                    <div className="bg-[#26231D] rounded-xl p-4 border border-[#3A362D] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-white mb-0.5">Alertes Email</h3>
                            <p className="text-xs text-gray-500">Recevez les dernières offres de stage directement dans votre boîte mail.</p>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={handleEmailAlertsToggle}>
                            <span className="text-xs text-white font-medium">Recevoir des alertes par email</span>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${profileData.email_alerts ? 'bg-[#F9B134] border-[#F9B134]' : 'bg-transparent border-gray-500'}`}>
                                {profileData.email_alerts && (
                                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formations Section */}
                <div className="mb-4">
                    <ProfileSection title="Formations" onEdit={() => handleEdit('formations')}>
                        <div className="space-y-6 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-[#3A362D]"></div>

                            {profileData.education && profileData.education.length > 0 ? (
                                profileData.education.map((formation, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 z-10">
                                            <div className="w-10 h-10 rounded-full bg-[#26231D] border border-[#3A362D] flex items-center justify-center">
                                                <svg className="w-5 h-5 text-[#F9B134]" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Details */}
                                        <div className="pt-1">
                                            <h3 className="text-sm font-bold text-white mb-0.5">{formation.degree || formation.title}</h3>
                                            <p className="text-gray-400 text-xs">
                                                {formation.institution} <span className="mx-1 text-gray-600">|</span> {formation.start_date} - {formation.end_date || "Présent"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs pl-10">Aucune formation ajoutée.</p>
                            )}
                        </div>
                    </ProfileSection>
                </div>

                {/* Compétences Section */}
                <div className="mb-4">
                    <ProfileSection title="Compétences" onEdit={() => handleEdit('competences')}>
                        <div className="flex flex-wrap gap-2">
                            {profileData.skills ? (
                                profileData.skills.split(',').map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#26231D] text-[#F9B134] border border-[#F9B134]/30 hover:border-[#F9B134] transition-colors cursor-default"
                                    >
                                        {skill.trim()}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs">Aucune compétence ajoutée.</p>
                            )}
                        </div>
                    </ProfileSection>
                </div>

                {/* Expériences Section */}
                <div className="mb-4">
                    <ProfileSection title="Expériences" onEdit={() => handleEdit('experiences')}>
                        <div className="space-y-6 relative pl-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-[#3A362D]"></div>

                            {profileData.experience && profileData.experience.length > 0 ? (
                                profileData.experience.map((exp, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 z-10">
                                            <div className="w-10 h-10 rounded-full bg-[#26231D] border border-[#3A362D] flex items-center justify-center">
                                                <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <h3 className="text-sm font-bold text-white mb-0.5">{exp.title}</h3>
                                            <p className="text-gray-400 text-xs mb-2">
                                                {exp.company} <span className="mx-1 text-gray-600">|</span> {exp.start_date} - {exp.end_date || "Présent"}
                                            </p>
                                            <p className="text-gray-400 text-xs leading-relaxed">
                                                {exp.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-xs pl-10">Aucune expérience ajoutée.</p>
                            )}
                        </div>
                    </ProfileSection>
                </div>

                {/* Liens Externes Section */}
                <div className="mb-4">
                    <ProfileSection title="Liens Externes" onEdit={() => handleEdit('links')}>
                        <div className="flex flex-wrap gap-4">
                            {profileData.social_links && Object.values(profileData.social_links).some(url => url) ? (
                                Object.entries(profileData.social_links).map(([name, url], index) => {
                                    if (!url) return null;
                                    let icon;
                                    switch (name) {
                                        case 'linkedin':
                                            icon = (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                </svg>
                                            );
                                            break;
                                        case 'github':
                                            icon = (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                </svg>
                                            );
                                            break;
                                        case 'portfolio':
                                            icon = (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                </svg>
                                            );
                                            break;

                                        default:
                                            icon = (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                            );
                                    }

                                    const formatUrl = (url) => {
                                        if (!url) return '';
                                        if (url.startsWith('http://') || url.startsWith('https://')) {
                                            return url;
                                        }
                                        return `https://${url}`;
                                    };

                                    return (
                                        <a
                                            key={index}
                                            href={formatUrl(url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group text-sm"
                                        >
                                            {icon}
                                            <span className="group-hover:underline capitalize">{name}</span>
                                        </a>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-xs">Aucun lien ajouté.</p>
                            )}
                        </div>
                    </ProfileSection>
                </div>
            </main>

            {/* Edit Modal */}
            {editModal.isOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#26231D] rounded-xl border border-[#3A362D] w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-5 border-b border-[#3A362D] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">
                                {editModal.type === 'formations' && 'Ajouter une formation'}
                                {editModal.type === 'competences' && 'Modifier les compétences'}
                                {editModal.type === 'experiences' && 'Ajouter une expérience'}
                                {editModal.type === 'links' && 'Modifier les liens'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Formations Form */}
                            {editModal.type === 'formations' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Diplôme</label>
                                        <input
                                            type="text"
                                            name="degree"
                                            value={formData.degree || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            placeholder="Ex: Licence Informatique"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Établissement</label>
                                        <input
                                            type="text"
                                            name="institution"
                                            value={formData.institution || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            placeholder="Ex: Université d'Alger"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Date début</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={formData.start_date || ''}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Date fin</label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={formData.end_date || ''}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Compétences Form */}
                            {editModal.type === 'competences' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Compétences</label>

                                    {/* Input zone */}
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSkill();
                                                }
                                            }}
                                            className="flex-1 bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            placeholder="Ex: React"
                                        />
                                        <button
                                            onClick={handleAddSkill}
                                            disabled={!newSkill.trim()}
                                            className="px-4 py-2 rounded-lg bg-[#3A362D] text-white text-sm font-medium hover:bg-[#4A463D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Ajouter
                                        </button>
                                    </div>

                                    {/* Skills List */}
                                    <div className="flex flex-wrap gap-2 p-3 bg-[#1a1814] border border-[#3A362D] rounded-lg min-h-[100px]">
                                        {formData.skills && formData.skills.split(',').filter(s => s.trim()).length > 0 ? (
                                            formData.skills.split(',').map((skill, index) => {
                                                const skillName = skill.trim();
                                                if (!skillName) return null;
                                                return (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 rounded-md text-xs font-medium bg-[#26231D] text-[#F9B134] border border-[#F9B134]/30 flex items-center gap-2"
                                                    >
                                                        {skillName}
                                                        <button
                                                            onClick={() => handleRemoveSkill(skillName)}
                                                            className="text-[#F9B134] hover:text-white focus:outline-none"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <p className="text-gray-500 text-xs italic w-full text-center mt-8">Aucune compétence ajoutée.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Expériences Form */}
                            {editModal.type === 'experiences' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Titre du poste</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            placeholder="Ex: Développeur Web Stagiaire"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Entreprise</label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            placeholder="Ex: TechCorp"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Date début</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={formData.start_date || ''}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Date fin</label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={formData.end_date || ''}
                                                onChange={handleFormChange}
                                                className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleFormChange}
                                            rows={3}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg px-3 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none resize-none"
                                            placeholder="Décrivez vos responsabilités..."
                                        />
                                    </div>
                                </>
                            )}

                            {/* Links Form */}
                            {editModal.type === 'links' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg pl-10 pr-10 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none placeholder-gray-600"
                                            placeholder="Profil LinkedIn"
                                        />
                                        {formData.linkedin && (
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, linkedin: '' }))}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                                type="button"
                                                title="Supprimer le lien"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type="url"
                                            name="github"
                                            value={formData.github || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg pl-10 pr-10 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none placeholder-gray-600"
                                            placeholder="Profil GitHub"
                                        />
                                        {formData.github && (
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, github: '' }))}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                                type="button"
                                                title="Supprimer le lien"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                        </div>
                                        <input
                                            type="url"
                                            name="portfolio"
                                            value={formData.portfolio || ''}
                                            onChange={handleFormChange}
                                            className="w-full bg-[#1a1814] border border-[#3A362D] rounded-lg pl-10 pr-10 py-2 text-white text-sm focus:border-[#F9B134] focus:outline-none placeholder-gray-600"
                                            placeholder="Portfolio / Site Web"
                                        />
                                        {formData.portfolio && (
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, portfolio: '' }))}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white"
                                                type="button"
                                                title="Supprimer le lien"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-[#3A362D] flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-lg bg-[#3A362D] text-white text-sm font-medium hover:bg-[#4A463D] transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveSection}
                                className="px-4 py-2 rounded-lg bg-[#F9B134] text-black text-sm font-bold hover:bg-[#e5a02a] transition-colors"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileEtudient;
