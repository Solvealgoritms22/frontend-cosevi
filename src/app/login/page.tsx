"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, ArrowLeft, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_BASE_URL } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/translation-context';

export default function LoginPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [branding, setBranding] = useState<{ name?: string; logoUrl?: string } | null>(null);

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const errorParam = searchParams?.get('error');

    // Load branding from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cosevi_branding');
            if (saved) {
                setBranding(JSON.parse(saved));
            }
        } catch { }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            const token = res.data.access_token;
            const tenant = res.data.tenant;

            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Save branding to localStorage for next visit
            if (tenant) {
                const brandingData = {
                    name: tenant.name,
                    logoUrl: tenant.branding?.logo,
                    primaryColor: tenant.branding?.primaryColor,
                    secondaryColor: tenant.branding?.secondaryColor,
                };
                localStorage.setItem('cosevi_branding', JSON.stringify(brandingData));
                if (tenant.id) {
                    localStorage.setItem('tenantId', tenant.id);
                }
                if (tenant.name) {
                    localStorage.setItem('cosevi_org_name', tenant.name);
                }
            }

            const profileRes = await api.get('/auth/profile');
            const user = profileRes.data;

            if (user.role !== 'ADMIN') {
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                setError('Only administrators can access this panel.');
                setLoading(false);
                return;
            }

            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const logoSrc = branding?.logoUrl
        ? `${API_BASE_URL.replace('/api', '')}${branding.logoUrl}`
        : '/logo-official.png';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <Link
                href="/"
                className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold z-50 group"
            >
                <div className="size-10 rounded-full bg-white/50 border border-slate-200 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all">
                    <ArrowLeft size={18} />
                </div>
                <span className="hidden sm:inline">Volver al inicio</span>
            </Link>

            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 flex flex-col items-center justify-center"
            >
                <div className="relative w-64 h-24 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image
                        src={logoSrc}
                        alt={branding?.name || "Entrar"}
                        fill
                        className="object-contain drop-shadow-2xl"
                        unoptimized
                        priority
                    />
                </div>
                {branding?.name && (
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-3">{branding.name}</p>
                )}
            </motion.div>

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <h1 className="text-3xl font-black mb-2 text-center text-slate-900">{t('welcomeBack')}</h1>
                    <p className="text-slate-500 text-center mb-10 font-medium">{t('logInManage')}</p>

                    <form onSubmit={handleLogin} className="space-y-6">
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold placeholder:text-slate-400 text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex justify-end mt-1 px-4">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {t('forgotPassword') || 'Forgot Password?'}
                                </Link>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
                        {errorParam === 'unauthorized' && !error && (
                            <p className="text-amber-600 text-sm font-bold text-center">
                                Your account is not authorized to access the admin panel.
                            </p>
                        )}

                        <button
                            disabled={loading}
                            className="w-full h-16 bg-[#2563eb] hover:bg-[#2563eb]/80 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl shadow-[#2563eb]/20 active:scale-95 text-white"
                        >
                            {loading ? t('authenticating') : (
                                <>
                                    {t('signIn')}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6 relative z-10">
                    <Link href="/privacy" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</Link>
                    <Link href="/terms" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}