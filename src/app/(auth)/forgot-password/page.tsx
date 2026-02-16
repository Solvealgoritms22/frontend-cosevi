"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { useTranslation } from '@/context/translation-context';

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <Link
                href="/login"
                className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold z-50 group"
            >
                <div className="size-10 rounded-full bg-white/50 border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                    <ArrowLeft size={18} />
                </div>
                <span className="hidden sm:inline">{t('backToLogin')}</span>
            </Link>

            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <h1 className="text-3xl font-black mb-2 text-center text-slate-900">{t('recovery')}</h1>
                    <p className="text-slate-500 text-center mb-10 font-medium">
                        {t('forgotPasswordDesc')}
                    </p>

                    {success ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                            <h3 className="text-green-800 font-bold mb-2">{t('checkInbox')}</h3>
                            <p className="text-green-700 text-sm">
                                {t('recoverySentMsg')}
                            </p>
                            <Link href="/login" className="mt-4 inline-block text-green-700 font-bold hover:underline">
                                {t('returnToLogin')}
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('emailAddress')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold placeholder:text-slate-400 text-slate-900"
                                        placeholder="admin@entra.com"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                            <button
                                disabled={loading}
                                className="w-full h-16 bg-[#2563eb] hover:bg-[#2563eb]/80 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl shadow-[#2563eb]/20 active:scale-95 text-white"
                            >
                                {loading ? t('sending') : (
                                    <>
                                        {t('sendLink')}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
