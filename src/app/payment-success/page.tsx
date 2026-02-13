"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const registrationId = searchParams.get('registration');
    const paypalToken = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!registrationId || !paypalToken) {
            setStatus('error');
            setErrorMsg('Datos de pago incompletos.');
            return;
        }

        const confirmPayment = async () => {
            try {
                await api.post('/registrations/confirm', {
                    registrationId,
                    paypalToken,
                });
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(err.response?.data?.message || 'Error al confirmar el pago.');
            }
        };

        confirmPayment();
    }, [registrationId, paypalToken]);

    if (status === 'loading') {
        return (
            <div className="text-center py-12">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-700">Confirmando tu pago...</h2>
                <p className="text-slate-400 mt-2">Esto puede tomar unos segundos</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                    <span className="text-red-600 text-3xl">✕</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Error en el pago</h2>
                <p className="text-slate-500 mb-6">{errorMsg}</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 rounded-2xl px-8 py-4 font-bold text-slate-700 transition-all"
                >
                    Volver al inicio
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
        >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
                <CheckCircle className="text-green-600" size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">¡Pago Exitoso!</h2>
            <p className="text-slate-500 mb-2 text-lg">Tu cuenta ha sido creada correctamente.</p>
            <p className="text-slate-400 mb-8">Ya puedes iniciar sesión con tu correo y contraseña.</p>

            <Link
                href="/login"
                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 rounded-2xl px-10 py-4 font-black text-lg text-white transition-all shadow-xl shadow-green-600/20 active:scale-95"
            >
                Iniciar Sesión
                <ArrowRight size={20} />
            </Link>
        </motion.div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-green-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full" />

            <div className="w-full max-w-lg relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <Suspense fallback={
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
                            <p className="text-slate-400">Cargando...</p>
                        </div>
                    }>
                        <PaymentSuccessContent />
                    </Suspense>
                </motion.div>
            </div>
        </div>
    );
}
