"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Mail, Lock, User, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { useTranslation } from '@/context/translation-context';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'starter';
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        organizationName: '',
        plan: plan
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Updated registration to include organization and plan
            const res = await api.post('/auth/register', formData);
            const token = res.data.access_token;
            const tenantId = res.data.tenantId;

            localStorage.setItem('token', token);
            if (tenantId) {
                localStorage.setItem('tenantId', tenantId);
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            if (tenantId) {
                api.defaults.headers.common['x-tenant-id'] = tenantId;
            }

            const profileRes = await api.get('/auth/profile');
            const user = profileRes.data;

            if (user.role !== 'ADMIN') {
                localStorage.removeItem('token');
                localStorage.removeItem('tenantId');
                delete api.defaults.headers.common['Authorization'];
                delete api.defaults.headers.common['x-tenant-id'];
                setError('Only administrators can access this panel.');
                setLoading(false);
                return;
            }

            document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex items-center gap-3"
            >
                <div className="size-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <span className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">COSEVI v2.0</span>
            </motion.div>

            <div className="w-full max-w-lg relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <h1 className="text-3xl font-black mb-2 text-center text-slate-900">Join COSEVI</h1>
                    <p className="text-slate-500 text-center mb-10 font-medium">Create your administrative account</p>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-indigo-500/50 transition-colors font-bold text-slate-900"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Organization Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    value={formData.organizationName}
                                    onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-indigo-500/50 transition-colors font-bold text-slate-900"
                                    placeholder="Acme Residencies"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-indigo-500/50 transition-colors font-bold text-slate-900"
                                    placeholder="admin@cosevi.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-indigo-500/50 transition-colors font-bold text-slate-900"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-white"
                        >
                            {loading ? "Creating Account..." : (
                                <>
                                    CREATE ACCOUNT
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-slate-500 text-sm font-bold pt-4">
                            Already have an account? {' '}
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}