"use client";

import React, { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, Lock, User, Building2, MapPin, CheckCircle, Clock, Upload, ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';
import { useTranslation } from '@/context/translation-context';

const PLAN_PRICES: Record<string, number> = {
    starter: 49,
    premium: 129,
    elite: 299,
};

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan');
    const { t } = useTranslation();

    const validPlans = ['starter', 'premium', 'elite'];

    React.useEffect(() => {
        if (!planParam || !validPlans.includes(planParam)) {
            router.replace('/#pricing');
        }
    }, [planParam, router]);

    if (!planParam || !validPlans.includes(planParam)) {
        return null;
    }

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        organizationName: '',
        location: '',
        plan: planParam
    });
    const [logoUrl, setLogoUrl] = useState('');
    const [logoPreview, setLogoPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const isElite = planParam === 'elite';

    const handleLogoUpload = async (file: File) => {
        if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp|svg\+xml)/)) {
            setError('Solo se permiten archivos de imagen.');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await api.post('/uploads/logo', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setLogoUrl(res.data.url);
            setLogoPreview(URL.createObjectURL(file));
        } catch {
            setError('Error al subir el logo. Intenta nuevamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { ...formData, ...(isElite && logoUrl ? { logoUrl } : {}) };
            const res = await api.post('/registrations/pending', payload);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al registrar. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                    <Mail className="text-green-600" size={36} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">¡Revisa tu correo!</h2>
                <p className="text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
                    Hemos enviado un enlace de pago a <strong className="text-slate-700">{formData.email}</strong>.
                    Completa el pago para activar tu cuenta.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <Clock size={16} />
                        El enlace expira en 24 horas
                    </div>
                </div>
                <div className="space-y-3">
                    <Link href="/login" className="w-full h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 flex items-center justify-center gap-2 transition-all">
                        Ir a Iniciar Sesión
                    </Link>
                    <Link href="/" className="block text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
                        Volver al inicio
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleRegister} className="space-y-6">
            {/* Plan badge */}
            <div className="flex items-center justify-center mb-2">
                <div className="bg-indigo-50 border border-indigo-200 rounded-full px-4 py-2 flex items-center gap-2">
                    <CheckCircle className="text-indigo-600" size={16} />
                    <span className="text-sm font-bold text-indigo-700 capitalize">
                        Plan {planParam} — ${PLAN_PRICES[planParam]}/mes
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre Completo</label>
                <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-orange-500/50 transition-colors font-bold text-slate-900"
                        placeholder="Juan Pérez"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nombre de Organización</label>
                <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        required
                        value={formData.organizationName}
                        onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-orange-500/50 transition-colors font-bold text-slate-900"
                        placeholder="Residencial Las Palmas"
                    />
                </div>
            </div>

            {/* Logo upload (Elite only) */}
            {isElite && (
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Logo de tu Organización</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleLogoUpload(file);
                        }}
                        className="relative border-2 border-dashed border-slate-300 hover:border-orange-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/30 min-h-[120px]"
                    >
                        {uploading ? (
                            <div className="flex items-center gap-2 text-slate-500">
                                <div className="animate-spin w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full" />
                                <span className="text-sm font-bold">Subiendo...</span>
                            </div>
                        ) : logoPreview ? (
                            <div className="relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={logoPreview} alt="Logo" className="max-h-16 object-contain" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setLogoUrl(''); setLogoPreview(''); }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                >
                                    <X size={14} />
                                </button>
                                <p className="text-xs text-green-600 font-bold mt-2 text-center">✓ Logo cargado</p>
                            </div>
                        ) : (
                            <>
                                <ImageIcon className="text-slate-400" size={28} />
                                <p className="text-sm font-bold text-slate-500">Arrastra tu logo aquí o haz clic</p>
                                <p className="text-xs text-slate-400">PNG, JPG, SVG — Máx 5MB</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(file);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Ubicación</label>
                <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select
                        required
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-orange-500/50 transition-colors font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                        <option value="" disabled>Selecciona ubicación</option>
                        <option value="Santo Domingo, Dominican Republic">Santo Domingo, Dominican Republic</option>
                        <option value="Santiago, Dominican Republic">Santiago, Dominican Republic</option>
                        <option value="La Romana, Dominican Republic">La Romana, Dominican Republic</option>
                        <option value="Punta Cana, Dominican Republic">Punta Cana, Dominican Republic</option>
                        <option value="San Pedro de Macorís, Dominican Republic">San Pedro de Macorís, Dominican Republic</option>
                        <option value="Miami, United States">Miami, United States</option>
                        <option value="New York, United States">New York, United States</option>
                        <option value="Los Angeles, United States">Los Angeles, United States</option>
                        <option value="Houston, United States">Houston, United States</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Correo Electrónico</label>
                <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-orange-500/50 transition-colors font-bold text-slate-900"
                        placeholder="admin@cosevi.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-orange-500/50 transition-colors font-bold text-slate-900"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

            <button
                disabled={loading}
                className="w-full h-16 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-2xl font-black text-lg flex items-center justify-center gap-4 transition-all shadow-xl shadow-orange-600/20 active:scale-95 text-white"
            >
                {loading ? "Procesando..." : (
                    <>
                        REGISTRAR Y PAGAR
                        <ArrowRight size={20} />
                    </>
                )}
            </button>

            <p className="text-center text-slate-500 text-sm font-bold pt-4">
                ¿Ya tienes cuenta? {' '}
                <Link href="/login" className="text-orange-600 hover:text-orange-700 transition-colors">
                    Iniciar Sesión
                </Link>
            </p>
        </form>
    );
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-600/5 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col items-center gap-4"
            >
                <div className="relative w-48 h-24 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-official.png"
                        alt="COSEVI"
                        className="object-contain w-full h-full drop-shadow-xl"
                    />
                </div>
            </motion.div>

            <div className="w-full max-w-lg relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <h1 className="text-3xl font-black mb-2 text-center text-slate-900">Únete a COSEVI</h1>
                    <p className="text-slate-500 text-center mb-10 font-medium">Crea tu cuenta administrativa</p>

                    <Suspense fallback={<div className="text-center py-10 font-bold text-slate-400">Cargando formulario...</div>}>
                        <RegisterForm />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    );
}