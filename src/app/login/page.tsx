"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { useTranslation } from '@/context/translation-context';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            document.cookie = `token=${res.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase">COSEVI v2.0</span>
            </motion.div>

            <div className="w-full max-w-md relative z-10">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/50 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl">
                    <h1 className="text-3xl font-black mb-2 text-center">{t('welcomeBack')}</h1>
                    <p className="text-slate-300 text-center mb-10 font-medium">{t('logInManage')}</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4">{t('emailAddress')}</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold placeholder:text-slate-500"
                                    placeholder="admin@cosevi.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-4">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold placeholder:text-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm font-bold text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400/50 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                        >
                            {loading ? t('authenticating') : (
                                <>
                                    {t('signIn')}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-slate-400 text-sm font-bold pt-4">
                            {t('noAccount')} {' '}
                            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                                {t('createOne')}
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
