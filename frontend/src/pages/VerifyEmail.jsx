import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('input'); // input, loading, success, error
    const [message, setMessage] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef([]);

    // Get email from URL params or localStorage
    const email = searchParams.get('email') || localStorage.getItem('pendingVerificationEmail') || 'votre adresse email';

    // Auto-verify if token is in URL (for link-based verification)
    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            setStatus('loading');
            const verifyEmail = async () => {
                try {
                    const response = await authService.verifyEmail(token);
                    setStatus('success');
                    setMessage(response.message || 'Votre email a été vérifié avec succès !');
                    toast.success('Email vérifié avec succès !');

                    setTimeout(() => {
                        navigate('/signin');
                    }, 3000);
                } catch (error) {
                    setStatus('error');
                    setMessage(error.response?.data?.error || 'Erreur lors de la vérification de l\'email.');
                    toast.error('Erreur de vérification');
                }
            };
            verifyEmail();
        }
    }, [searchParams, navigate]);

    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newCode = [...code];
            pastedData.split('').forEach((char, i) => {
                if (i < 6) newCode[i] = char;
            });
            setCode(newCode);
            // Focus last filled input or the next empty one
            const lastIndex = Math.min(pastedData.length - 1, 5);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    const handleVerifyCode = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            toast.error('Veuillez entrer le code complet à 6 chiffres');
            return;
        }

        setStatus('loading');
        try {
            const response = await authService.verifyEmail(fullCode);
            setStatus('success');
            setMessage(response.message || 'Votre email a été vérifié avec succès !');
            toast.success('Email vérifié avec succès !');

            setTimeout(() => {
                navigate('/signin');
            }, 3000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.error || 'Code invalide ou expiré.');
            toast.error('Erreur de vérification');
        }
    };

    const handleResendEmail = async () => {
        setIsResending(true);
        try {
            await authService.resendVerification(email);
            toast.success('Email de vérification renvoyé !');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors du renvoi de l\'email');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1714] flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="bg-[#26231D] rounded-2xl border border-[#3A362D] p-8 shadow-2xl">
                        {/* Email Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-[#3A362D] flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#F9B134]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Loading State */}
                        {status === 'loading' && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9B134] mx-auto mb-4"></div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Vérification en cours...
                                </h2>
                                <p className="text-gray-400">
                                    Veuillez patienter pendant que nous vérifions votre email.
                                </p>
                            </div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Email vérifié !
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    {message}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Redirection vers la page de connexion...
                                </p>
                            </div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Erreur de vérification
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    {message}
                                </p>
                                <button
                                    onClick={() => setStatus('input')}
                                    className="w-full bg-[#F9B134] hover:bg-[#e5a02a] text-black font-bold py-3 px-6 rounded-full transition-colors mb-4"
                                >
                                    Réessayer
                                </button>
                                <Link
                                    to="/signin"
                                    className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Retour à la connexion
                                </Link>
                            </div>
                        )}

                        {/* Input State */}
                        {status === 'input' && (
                            <>
                                {/* Title */}
                                <h1 className="text-2xl font-bold text-white text-center mb-3">
                                    Vérifiez votre email
                                </h1>

                                {/* Description */}
                                <p className="text-gray-400 text-center text-sm mb-8 leading-relaxed">
                                    Nous avons envoyé un code de vérification à{' '}
                                    <span className="text-white font-medium">{email}</span>.
                                    Veuillez entrer le code ci-dessous pour activer votre compte.
                                </p>

                                {/* Code Input Boxes */}
                                <div className="flex justify-center gap-3 mb-6">
                                    {code.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={index === 0 ? handlePaste : undefined}
                                            className={`w-12 h-14 text-center text-xl font-bold bg-[#1A1714] border-2 rounded-lg text-white 
                                                focus:outline-none focus:border-[#F9B134] transition-colors
                                                ${digit ? 'border-[#F9B134]' : 'border-[#3A362D]'}`}
                                        />
                                    ))}
                                </div>

                                {/* Verify Button */}
                                <button
                                    onClick={handleVerifyCode}
                                    disabled={code.some(d => !d)}
                                    className="w-full bg-[#F9B134] hover:bg-[#e5a02a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#F9B134]/20"
                                >
                                    Vérifier le code
                                    <svg
                                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>

                                {/* Resend Link */}
                                <div className="text-center mt-6">
                                    <span className="text-gray-500 text-sm">
                                        Vous n'avez rien reçu ?{' '}
                                    </span>
                                    <button
                                        onClick={handleResendEmail}
                                        disabled={isResending}
                                        className="text-[#F9B134] hover:text-[#e5a02a] text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        {isResending ? 'Envoi...' : 'Renvoyer l\'email'}
                                    </button>
                                </div>

                                {/* Back to Login */}
                                <div className="text-center mt-6 pt-6 border-t border-[#3A362D]">
                                    <Link
                                        to="/signin"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6">
                <div className="flex justify-center gap-6 text-sm text-gray-500">
                    <a href="#" className="hover:text-gray-300 transition-colors">
                        Besoin d'aide ?
                    </a>
                    <a href="#" className="hover:text-gray-300 transition-colors">
                        Confidentialité
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default VerifyEmail;

