import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import offerService from '../services/offerService';

function CreationOffre() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        titre: '',
        entreprise: '',
        lieu: '',
        type: '',
        dateDebut: '',
        dateFin: '',
        description: '',
        responsabilites: '',
        competences: [],
        competenceInput: '',
        experience: ''
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    const steps = [
        { number: 1, label: 'Informations' },
        { number: 2, label: 'Type' },
        { number: 3, label: 'Durée' },
        { number: 4, label: 'Description' },
        { number: 5, label: 'Compétences' },
        { number: 6, label: 'Expérience' }
    ];

    const experienceLevels = [
        'Aucune expérience requise',
        'Moins de 1 an',
        '1-2 ans',
        '2-3 ans',
        '3-5 ans',
        'Plus de 5 ans'
    ];

    const wilayas = [
        { id: 1, name: 'Adrar' },
        { id: 2, name: 'Chlef' },
        { id: 3, name: 'Laghouat' },
        { id: 4, name: 'Oum El Bouaghi' },
        { id: 5, name: 'Batna' },
        { id: 6, name: 'Béjaïa' },
        { id: 7, name: 'Biskra' },
        { id: 8, name: 'Béchar' },
        { id: 9, name: 'Blida' },
        { id: 10, name: 'Bouira' },
        { id: 11, name: 'Tamanrasset' },
        { id: 12, name: 'Tébessa' },
        { id: 13, name: 'Tlemcen' },
        { id: 14, name: 'Tiaret' },
        { id: 15, name: 'Tizi Ouzou' },
        { id: 16, name: 'Alger' },
        { id: 17, name: 'Djelfa' },
        { id: 18, name: 'Jijel' },
        { id: 19, name: 'Sétif' },
        { id: 20, name: 'Saïda' },
        { id: 21, name: 'Skikda' },
        { id: 22, name: 'Sidi Bel Abbès' },
        { id: 23, name: 'Annaba' },
        { id: 24, name: 'Guelma' },
        { id: 25, name: 'Constantine' },
        { id: 26, name: 'Médéa' },
        { id: 27, name: 'Mostaganem' },
        { id: 28, name: "M'Sila" },
        { id: 29, name: 'Mascara' },
        { id: 30, name: 'Ouargla' },
        { id: 31, name: 'Oran' },
        { id: 32, name: 'El Bayadh' },
        { id: 33, name: 'Illizi' },
        { id: 34, name: 'Bordj Bou Arreridj' },
        { id: 35, name: 'Boumerdès' },
        { id: 36, name: 'El Tarf' },
        { id: 37, name: 'Tindouf' },
        { id: 38, name: 'Tissemsilt' },
        { id: 39, name: 'El Oued' },
        { id: 40, name: 'Khenchela' },
        { id: 41, name: 'Souk Ahras' },
        { id: 42, name: 'Tipaza' },
        { id: 43, name: 'Mila' },
        { id: 44, name: 'Aïn Defla' },
        { id: 45, name: 'Naâma' },
        { id: 46, name: 'Aïn Témouchent' },
        { id: 47, name: 'Ghardaïa' },
        { id: 48, name: 'Relizane' },
        { id: 49, name: 'Timimoun' },
        { id: 50, name: 'Bordj Badji Mokhtar' },
        { id: 51, name: 'Ouled Djellal' },
        { id: 52, name: 'Béni Abbès' },
        { id: 53, name: 'In Salah' },
        { id: 54, name: 'In Guezzam' },
        { id: 55, name: 'Touggourt' },
        { id: 56, name: 'Djanet' },
        { id: 57, name: "El M'Ghair" },
        { id: 58, name: 'El Meniaa' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTypeSelect = (type) => {
        setFormData(prev => ({ ...prev, type }));
        if (errors.type) {
            setErrors(prev => ({ ...prev, type: '' }));
        }
    };

    const addCompetence = (e) => {
        if (e.key === 'Enter' && formData.competenceInput.trim()) {
            e.preventDefault();
            if (!formData.competences.includes(formData.competenceInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    competences: [...prev.competences, prev.competenceInput.trim()],
                    competenceInput: ''
                }));
            }
        }
    };

    const removeCompetence = (competence) => {
        setFormData(prev => ({
            ...prev,
            competences: prev.competences.filter(c => c !== competence)
        }));
    };

    const validateStep = () => {
        const newErrors = {};

        switch (currentStep) {
            case 1:
                if (!formData.titre.trim()) {
                    newErrors.titre = "Le titre de l'offre est requis.";
                }
                if (!formData.entreprise.trim()) {
                    newErrors.entreprise = "Ce champ ne peut être vide.";
                }
                if (!formData.lieu.trim()) {
                    newErrors.lieu = "Ce champ ne peut être vide.";
                }
                break;
            case 2:
                if (!formData.type) {
                    newErrors.type = "Veuillez sélectionner un type d'offre.";
                }
                break;
            case 3:
                if (!formData.dateDebut) {
                    newErrors.dateDebut = "La date de début est requise.";
                }
                if (!formData.dateFin) {
                    newErrors.dateFin = "La date de fin est requise.";
                }
                break;
            case 4:
                if (!formData.description.trim()) {
                    newErrors.description = "La description est requise.";
                }
                if (!formData.responsabilites.trim()) {
                    newErrors.responsabilites = "Les responsabilités sont requises.";
                }
                break;
            case 5:
                // Competences are optional
                break;
            case 6:
                // Experience is optional
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (currentStep < 6) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (validateStep()) {
            setIsSubmitting(true);
            try {
                const duration = `Du ${new Date(formData.dateDebut).toLocaleDateString()} au ${new Date(formData.dateFin).toLocaleDateString()}`;

                // Combine description and responsabilites with a delimiter
                let finalDescription = formData.description;
                if (formData.responsabilites.trim()) {
                    finalDescription += `\n\n|||RESPONSIBILITIES|||\n\n${formData.responsabilites}`;
                }
                if (formData.experience) {
                    finalDescription += `\n\nNiveau d'expérience requis: ${formData.experience}`;
                }

                const payload = {
                    title: formData.titre,
                    description: finalDescription,
                    type: formData.type === "PFE (Projet de Fin d'Études)" ? "PFE" : formData.type.toUpperCase(),
                    location: formData.lieu, // Format: "16 - Alger"
                    duration: duration,
                    skills: formData.competences.join(', '),
                    is_draft: false // Publish directly
                };

                console.log("Submitting offer payload:", payload);
                await offerService.createOffer(payload);
                toast.success("Offre créée avec succès !");
                navigate('/gestion-offres'); // Navigate to company's offer management
            } catch (error) {
                console.error("Error creating offer:", error);
                const errorMsg = error.response?.data?.error || "Une erreur est survenue lors de la création de l'offre.";
                toast.error(errorMsg);
                setErrors(prev => ({ ...prev, submit: errorMsg }));
            } finally {
                setIsSubmitting(false);
            }
        } else {
            console.log("Validation failed");
            toast.error("Veuillez vérifier les champs du formulaire.");
        }
    };

    const handleCancel = () => {
        navigate('/offres');
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 1: Informations générales</h3>

                        {/* Titre */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Titre de l'offre</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="titre"
                                    value={formData.titre}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Développeur Web Full-Stack"
                                    className={`w-full bg-zinc-800/50 border ${errors.titre ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors`}
                                />
                                {errors.titre && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                                )}
                            </div>
                            {errors.titre && <p className="text-red-400 text-sm mt-1">{errors.titre}</p>}
                        </div>

                        {/* Entreprise and Lieu */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Entreprise</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="entreprise"
                                        value={formData.entreprise}
                                        onChange={handleInputChange}
                                        placeholder="Nom de votre entreprise"
                                        className={`w-full bg-zinc-800/50 border ${errors.entreprise ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors`}
                                    />
                                    {errors.entreprise && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</span>
                                    )}
                                </div>
                                {errors.entreprise && <p className="text-red-400 text-sm mt-1">{errors.entreprise}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Lieu (Wilaya)</label>
                                <select
                                    name="lieu"
                                    value={formData.lieu}
                                    onChange={handleInputChange}
                                    className={`w-full bg-zinc-800/50 border ${errors.lieu ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors appearance-none cursor-pointer`}
                                >
                                    <option value="">Sélectionner une wilaya</option>
                                    {wilayas.map((wilaya) => (
                                        <option key={wilaya.id} value={`${wilaya.id} - ${wilaya.name}`}>
                                            {wilaya.id} - {wilaya.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.lieu && <p className="text-red-400 text-sm mt-1">{errors.lieu}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 2: Type d'offre</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Stage', 'PFE (Projet de Fin d\'Études)', 'Emploi'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeSelect(type)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center gap-3 ${formData.type === type
                                        ? 'border-[#F9B134] bg-[#F9B134]/10'
                                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.type === type ? 'border-[#F9B134]' : 'border-zinc-500'
                                        }`}>
                                        {formData.type === type && (
                                            <div className="w-3 h-3 rounded-full bg-[#F9B134]"></div>
                                        )}
                                    </div>
                                    <span className="font-medium">{type}</span>
                                </button>
                            ))}
                        </div>
                        {errors.type && <p className="text-red-400 text-sm">{errors.type}</p>}
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 3: Durée</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Date de début</label>
                                <input
                                    type="date"
                                    name="dateDebut"
                                    value={formData.dateDebut}
                                    onChange={handleInputChange}
                                    className={`w-full bg-zinc-800/50 border ${errors.dateDebut ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors`}
                                />
                                {errors.dateDebut && <p className="text-red-400 text-sm mt-1">{errors.dateDebut}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date de fin</label>
                                <input
                                    type="date"
                                    name="dateFin"
                                    value={formData.dateFin}
                                    onChange={handleInputChange}
                                    className={`w-full bg-zinc-800/50 border ${errors.dateFin ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors`}
                                />
                                {errors.dateFin && <p className="text-red-400 text-sm mt-1">{errors.dateFin}</p>}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 4: Description et Responsabilités</h3>

                        {/* Description Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Description du poste
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Décrivez le contexte du poste, l'environnement de travail, et ce que le candidat peut attendre de cette opportunité..."
                                rows={5}
                                className={`w-full bg-zinc-800/50 border ${errors.description ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors resize-none`}
                            />
                            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Responsabilités Field */}
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Responsabilités
                            </label>
                            <textarea
                                name="responsabilites"
                                value={formData.responsabilites}
                                onChange={handleInputChange}
                                placeholder="Listez les missions et responsabilités principales du poste (une par ligne de préférence)..."
                                rows={5}
                                className={`w-full bg-zinc-800/50 border ${errors.responsabilites ? 'border-red-500' : 'border-zinc-700'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F9B134] transition-colors resize-none`}
                            />
                            {errors.responsabilites && <p className="text-red-400 text-sm mt-1">{errors.responsabilites}</p>}
                            <p className="text-gray-500 text-sm mt-2">💡 Conseil: Utilisez des points (•) ou des tirets (-) pour lister les responsabilités</p>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 5: Compétences requises</h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">Ajouter des compétences</label>
                            <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg min-h-[50px]">
                                {formData.competences.map((comp, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-2 bg-zinc-700 text-white px-3 py-1 rounded-full text-sm"
                                    >
                                        {comp}
                                        <button
                                            onClick={() => removeCompetence(comp)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    name="competenceInput"
                                    value={formData.competenceInput}
                                    onChange={handleInputChange}
                                    onKeyDown={addCompetence}
                                    placeholder="Ex: Figma"
                                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-white placeholder-gray-500"
                                />
                            </div>
                            <p className="text-gray-500 text-sm mt-2">Appuyez sur Entrée pour ajouter une compétence</p>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold">Étape 6: Expérience souhaitée</h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">Niveau d'expérience</label>
                            <select
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F9B134] transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Sélectionner un niveau</option>
                                {experienceLevels.map((level, index) => (
                                    <option key={index} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#121212] text-white">
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold italic mb-2">Création d'une Offre</h1>
                    <p className="text-gray-400">
                        Remplissez les informations ci-dessous pour publier une nouvelle opportunité.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === step.number
                                            ? 'bg-[#F9B134] text-black'
                                            : currentStep > step.number
                                                ? 'bg-[#F9B134] text-black'
                                                : 'bg-zinc-700 text-gray-400'
                                            }`}
                                    >
                                        {currentStep > step.number ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.number
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 transition-colors ${currentStep === step.number ? 'text-[#F9B134]' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > step.number ? 'bg-[#F9B134]' : 'bg-zinc-700'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-zinc-900/30 rounded-2xl p-6 md:p-8 border border-zinc-800 mb-8">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={currentStep === 1 ? handleCancel : handlePrevious}
                        className="px-6 py-3 rounded-full border border-zinc-600 text-gray-300 font-medium hover:bg-zinc-800 transition-colors"
                    >
                        {currentStep === 1 ? 'Annuler' : 'Précédent'}
                    </button>

                    {currentStep < 6 ? (
                        <button
                            onClick={handleNext}
                            className="px-8 py-3 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors"
                        >
                            Suivant
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-full bg-[#F9B134] text-black font-bold hover:bg-[#e5a02a] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Création...
                                </>
                            ) : (
                                "Créer l'Offre"
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

export default CreationOffre;
