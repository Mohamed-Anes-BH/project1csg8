import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import offerService from '../services/offerService';
import EnterpriseSidebar from '../component/EnterpriseSidebar';

function ModificationOffre() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        type: 'STAGE',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        responsibilities: '',
        profile: '',
        skills: [],
        skillInput: '',
        status: 'OPEN',
        views: 0,
        applications_count: 0
    });

    const [errors, setErrors] = useState({});

    const wilayas = [
        "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
        "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
        "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
        "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt",
        "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa",
        "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam",
        "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
    ];

    // Parse description to extract sections
    const parseDescription = (fullDescription) => {
        if (!fullDescription) return { desc: '', resp: '', prof: '' };

        let desc = fullDescription;
        let resp = '';
        let prof = '';

        // Extract Profile
        if (desc.includes('|||PROFILE|||')) {
            const parts = desc.split('|||PROFILE|||');
            prof = parts[1].trim();
            desc = parts[0].trim();
        } else {
            // Fallback: check for previous experience format
            const expMatch = desc.match(/\n\nNiveau d'expérience requis: (.+)$/);
            if (expMatch) {
                prof = `Niveau d'expérience requis: ${expMatch[1]}`;
                desc = desc.replace(expMatch[0], '').trim();
            }
        }

        // Extract Responsibilities
        if (desc.includes('|||RESPONSIBILITIES|||')) {
            const parts = desc.split('|||RESPONSIBILITIES|||');
            resp = parts[1].trim();
            desc = parts[0].trim();
        }

        return { desc, resp, prof };
    };

    // Helper to format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        // Expects DD/MM/YYYY
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    };

    // Helper to format date for display/storage (DD/MM/YYYY)
    const formatDateForStorage = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR');
    };

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const offer = await offerService.getOfferById(id);

                const { desc, resp, prof } = parseDescription(offer.description);

                // Parse duration string "Du DD/MM/YYYY au DD/MM/YYYY"
                let start = '';
                let end = '';
                if (offer.duration && offer.duration.startsWith('Du ')) {
                    const parts = offer.duration.replace('Du ', '').split(' au ');
                    if (parts.length === 2) {
                        start = formatDateForInput(parts[0]);
                        end = formatDateForInput(parts[1]);
                    }
                }

                setFormData({
                    title: offer.title || '',
                    type: offer.type || 'STAGE',
                    startDate: start,
                    endDate: end,
                    location: offer.location || '',
                    description: desc,
                    responsibilities: resp,
                    profile: prof,
                    skills: offer.skills ? offer.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
                    skillInput: '',
                    status: offer.status || 'OPEN',
                    views: offer.views || 0,
                    applications_count: offer.applications_count || 0
                });
            } catch (error) {
                console.error("Error fetching offer:", error);
                toast.error("Impossible de charger l'offre.");
                navigate('/gestion-offres');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOffer();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newSkill = formData.skillInput.trim();

            if (newSkill) {
                if (!formData.skills.includes(newSkill)) {
                    setFormData(prev => ({
                        ...prev,
                        skills: [...prev.skills, newSkill],
                        skillInput: ''
                    }));
                } else {
                    // Skill already exists, just clear input and notify
                    setFormData(prev => ({ ...prev, skillInput: '' }));
                    toast.info(`La compétence "${newSkill}" est déjà ajoutée`);
                }
            }
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Le titre est requis";
        if (!formData.startDate) newErrors.duration = "La date de début est requise";
        if (!formData.endDate) newErrors.duration = "La date de fin est requise";
        if (!formData.location.trim()) newErrors.location = "La localisation est requise";
        if (!formData.description.trim()) newErrors.description = "La description est requise";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Veuillez vérifier les champs requis");
            return;
        }

        setIsSubmitting(true);
        try {
            // Reconstruct the full description with delimiters
            let finalDescription = formData.description.trim();

            if (formData.responsibilities.trim()) {
                finalDescription += `\n\n|||RESPONSIBILITIES|||\n\n${formData.responsibilities.trim()}`;
            }

            if (formData.profile.trim()) {
                finalDescription += `\n\n|||PROFILE|||\n\n${formData.profile.trim()}`;
            }

            // Construct duration string
            const durationString = `Du ${formatDateForStorage(formData.startDate)} au ${formatDateForStorage(formData.endDate)}`;

            const payload = {
                title: formData.title,
                type: formData.type,
                duration: durationString,
                location: formData.location,
                description: finalDescription,
                skills: formData.skills.join(', '),
                status: formData.status
            };

            await offerService.updateOffer(id, payload);
            toast.success("Offre mise à jour avec succès !");
            navigate(`/gestion-offres/${id}`);
        } catch (error) {
            console.error("Error updating offer:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex">
                <EnterpriseSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134]"></div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex font-sans">
            <EnterpriseSidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <Link to="/gestion-offres" className="hover:text-white transition-colors">Mes offres</Link>
                                <span>›</span>
                                <Link to={`/gestion-offres/${id}`} className="hover:text-white transition-colors">Détail de l'offre</Link>
                                <span>›</span>
                                <span className="text-white">Modifier l'offre</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">Modifier l'offre d'emploi</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(`/gestion-offres/${id}`)}
                                className="px-6 py-2.5 rounded-full border border-[#3A362D] text-gray-300 hover:bg-[#26231D] hover:text-white transition-colors font-medium text-sm"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors text-sm disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Card 1: Informations Générales */}
                        <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                <span className="w-6 h-6 rounded-full bg-[#F9B134] text-black flex items-center justify-center text-xs">i</span>
                                Informations Générales
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Titre de l'offre</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className={`w-full bg-[#26231D] border ${errors.title ? 'border-red-500' : 'border-[#3A362D]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors`}
                                        placeholder="Ex: Développeur Full Stack"
                                    />
                                    {errors.title && <span className="text-red-500 text-xs mt-1 block">{errors.title}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Statut</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors appearance-none cursor-pointer font-medium
                                                ${formData.status === 'OPEN' ? 'bg-[#1E3A2F] border-[#4CAF50] text-[#4CAF50]' :
                                                    formData.status === 'DRAFT' ? 'bg-[#2A2A2A] border-gray-600 text-gray-300' :
                                                        formData.status === 'ARCHIVED' ? 'bg-[#2A2A2A] border-gray-600 text-gray-400' :
                                                            'bg-[#3E1A1A] border-red-800 text-red-400'}`}
                                        >
                                            <option value="DRAFT">Brouillon</option>
                                            <option value="OPEN">Active (Publiée)</option>
                                            <option value="ARCHIVED">Archivée</option>
                                            <option value="CLOSED">Clôturée</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Type de contrat</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="STAGE">Stage</option>
                                            <option value="PFE">Stage PFE</option>
                                            <option value="EMPLOI">Emploi</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Date de début</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Date de fin</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate || ''}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Localisation</label>
                                    <input
                                        list="wilayas"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={`w-full bg-[#26231D] border ${errors.location ? 'border-red-500' : 'border-[#3A362D]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors`}
                                        placeholder="Ex: Alger (Hybride)"
                                    />
                                    <datalist id="wilayas">
                                        {wilayas.map((w, i) => <option key={i} value={`${i + 1} - ${w}`} />)}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Contenu de l'Offre */}
                        <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                <span className="text-[#F9B134]">📄</span>
                                Contenu de l'Offre
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Description du poste</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className={`w-full bg-[#26231D] border ${errors.description ? 'border-red-500' : 'border-[#3A362D]'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors resize-none`}
                                        placeholder="Décrivez le contexte du poste..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Responsabilités (Une par ligne)</label>
                                    <textarea
                                        name="responsibilities"
                                        value={formData.responsibilities}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className="w-full bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors resize-none"
                                        placeholder="Listez les missions principales..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Compétences & Profil */}
                        <div className="bg-[#1E1C16] border border-[#3A362D] rounded-2xl p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                <span className="text-[#F9B134]">🎓</span>
                                Compétences & Profil
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Compétences techniques (Appuyez sur Entrée)</label>
                                    <div className="bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 min-h-[50px] flex flex-wrap gap-2 items-center">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="bg-[#3A362D]/50 border border-[#F9B134]/30 text-[#F9B134] px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="hover:text-white">×</button>
                                            </span>
                                        ))}
                                        <input
                                            type="text"
                                            name="skillInput"
                                            value={formData.skillInput}
                                            onChange={handleInputChange}
                                            onKeyDown={handleSkillKeyDown}
                                            className="bg-transparent border-none outline-none text-white flex-1 min-w-[150px]"
                                            placeholder="Ajouter une compétence..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Niveau d'expérience requis</label>
                                    <select
                                        name="profile"
                                        value={formData.profile}
                                        onChange={handleInputChange}
                                        className="w-full bg-[#26231D] border border-[#3A362D] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors appearance-none cursor-pointer"
                                    >
                                        <option value="">Sélectionner un niveau d'expérience</option>
                                        <option value="Aucune expérience requise">Aucune expérience requise</option>
                                        <option value="Moins d'un an">Moins d'un an</option>
                                        <option value="1-2 ans">1-2 ans</option>
                                        <option value="2-3 ans">2-3 ans</option>
                                        <option value="3-5 ans">3-5 ans</option>
                                        <option value="Plus de 5 ans">Plus de 5 ans</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                    </div>



                    {/* Footer Actions */}

                </div>
            </main >
        </div >
    );
}

export default ModificationOffre;
