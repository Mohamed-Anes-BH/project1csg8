import { useState } from 'react';

function Contact() {
    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                    Contactez-nous
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                    Une question, une suggestion ou besoin d'assistance ? Nous sommes là pour vous aider.
                    Remplissez le formulaire ci-dessous ou utilisez nos coordonnées directes.
                </p>
            </div>

            {/* Main Content Card */}
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="bg-[#252525] rounded-3xl p-8 md:p-12 shadow-2xl border border-white/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Left Column: Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Nom complet</label>
                                <input
                                    type="text"
                                    placeholder="Votre nom complet"
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Adresse e-mail</label>
                                <input
                                    type="email"
                                    placeholder="votre.email@exemple.com"
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Sujet</label>
                                <input
                                    type="text"
                                    placeholder="Sujet de votre message"
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 mb-2 text-sm font-medium">Message</label>
                                <textarea
                                    rows="5"
                                    placeholder="Écrivez votre message ici..."
                                    className="w-full bg-[#2d2d2d] border border-[#3d3d3d] text-white px-4 py-3.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-[#F9B134] focus:ring-1 focus:ring-[#F9B134] transition-all resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#F9B134] text-black font-bold py-4 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/20 text-base"
                            >
                                Envoyer le message
                            </button>
                        </div>

                        {/* Right Column: Contact Info */}
                        <div className="flex flex-col h-full">
                            <h3 className="text-2xl font-bold mb-8">Informations de contact</h3>

                            <div className="space-y-8 flex-grow">
                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#F9B134]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9B134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Email</h4>
                                        <p className="text-gray-400">contact@dz-stagiaire.com</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#F9B134]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9B134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Téléphone</h4>
                                        <p className="text-gray-400">+213 (0) 123 456 789</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#F9B134]/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#F9B134]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Adresse</h4>
                                        <p className="text-gray-400">123 Rue de la Technologie,<br />Cyberparc, Alger, Algérie</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="mt-8 w-full h-48 rounded-2xl overflow-hidden border border-white/10 relative bg-[#2d2d2d]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3197.469276966276!2d2.9734!3d36.715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb3067648074b%3A0x675f05d33690130!2sCyberparc%20de%20Sidi%20Abdellah!5e0!3m2!1sen!2sdz!4v1650000000000!5m2!1sen!2sdz"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                                {/* Overlay to match the dark theme better if map style isn't perfect */}
                                <div className="absolute inset-0 pointer-events-none mix-blend-overlay bg-[#F9B134]/10"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
