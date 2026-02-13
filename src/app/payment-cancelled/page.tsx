"use client";

import React from 'react';
import { XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentCancelledPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-red-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full" />

            <div className="w-full max-w-lg relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 border border-slate-200 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl"
                >
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
                            <XCircle className="text-red-500" size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Pago Cancelado</h2>
                        <p className="text-slate-500 mb-2 text-lg">No se realizó ningún cargo.</p>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                            Si deseas completar tu suscripción, puedes volver a registrarte y realizar el pago.
                        </p>

                        <div className="space-y-3">
                            <Link
                                href="/#pricing"
                                className="flex items-center justify-center gap-3 w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                <RotateCcw size={18} />
                                Volver a Intentar
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 w-full h-14 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-slate-700 transition-all"
                            >
                                Ir al Inicio
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
