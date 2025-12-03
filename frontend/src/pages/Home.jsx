import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="bg-black text-white min-h-screen">
            {/* Hero Section */}
            <section className="px-6 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Trouvez votre stage ou PFE idéale en Algérie.
                    </h1>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        La plateforme N°1 qui connecte les étudiants et les entreprises en Algérie pour des opportunités de stages et PFE.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/offres"
                            className="bg-yellow-400 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 transition"
                        >
                            Voir les offres
                        </Link>
                        <Link
                            to="/signup"
                            className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
                        >
                            Créer un compte Étudiant
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        Comment ça marche
                    </h2>
                    <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
                        Trouver votre stage de rêve n'a jamais été aussi simple. Suivez ces trois étapes faciles pour commencer votre carrière.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-zinc-900 rounded-xl p-8 text-center hover:bg-zinc-800 transition">
                            <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">👤</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">1. Créez votre profil</h3>
                            <p className="text-gray-400">
                                Mettez en avant vos compétences et expériences avec un profil professionnel qui attire les recruteurs.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-zinc-900 rounded-xl p-8 text-center hover:bg-zinc-800 transition">
                            <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">🔍</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">2. Cherchez & Postulez</h3>
                            <p className="text-gray-400">
                                Parcourez des centaines d'offres exclusives et postulez en un seul clic à celles qui vous correspondent.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-zinc-900 rounded-xl p-8 text-center hover:bg-zinc-800 transition">
                            <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-3xl">💼</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">3. Décrochez votre stage</h3>
                            <p className="text-gray-400">
                                Passez des entretiens et recevez des offres pour lancer votre carrière avec succès.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="px-6 py-20">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
                        Ce que nos utilisateurs disent
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-zinc-900 rounded-xl p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-xl">👤</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Amina K.</h4>
                                    <p className="text-sm text-gray-400">Étudiante en Informatique, USTHB</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">⭐</span>
                                ))}
                            </div>
                            <p className="text-gray-400">
                                "Grâce à DZ-Stagiaire, j'ai trouvé un PFE incroyable dans une startup tech. Le processus était intuitif et les offres sont de qualité."
                            </p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-zinc-900 rounded-xl p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-xl">👤</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Yacine B.</h4>
                                    <p className="text-sm text-gray-400">Étudiant en Marketing, ESEC</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">⭐</span>
                                ))}
                            </div>
                            <p className="text-gray-400">
                                "Le processus était si simple et rapide. J'ai postulé à plusieurs offres et j'ai décroché un stage en moins de deux semaines. Je recommande vivement!"
                            </p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-zinc-900 rounded-xl p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-xl">👤</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Lina S.</h4>
                                    <p className="text-sm text-gray-400">Étudiante en Génie Civil, ESI</p>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-yellow-400">⭐</span>
                                ))}
                            </div>
                            <p className="text-gray-400">
                                "Enfin une plateforme sérieuse pour les stages en Algérie. J'ai apprécié la qualité des entreprises présentées et la facilité d'utilisation."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-zinc-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-yellow-400">📊</span>
                        <span>© 2024 DZ-Stagiaire. Tous droits réservés.</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-400">
                        <Link to="/contact" className="hover:text-white transition">
                            Contact
                        </Link>
                        <Link to="/conditions" className="hover:text-white transition">
                            Conditions d'utilisation
                        </Link>
                        <Link to="/confidentialite" className="hover:text-white transition">
                            Politique de confidentialité
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;
