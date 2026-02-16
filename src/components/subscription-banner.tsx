"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CreditCard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";

export function SubscriptionBanner() {
    const [status, setStatus] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await api.get('/auth/profile');
                setStatus(res.data.subscriptionStatus);
            } catch (err) {
                console.error('Failed to fetch subscription status for banner:', err);
            }
        };
        fetchStatus();
    }, []);

    if (!status || status === 'ACTIVE' || !isVisible) return null;

    const isPastDue = status === 'PAST_DUE';
    const isCancelled = status === 'CANCELLED';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full overflow-hidden ${isCancelled ? 'bg-red-600' : 'bg-amber-500'} text-white relative z-100`}
            >
                <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                            {isCancelled ? <X size={18} /> : <AlertCircle size={18} />}
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight leading-none">
                                {isCancelled ? 'Suscripción Cancelada' : 'Pago Pendiente'}
                            </p>
                            <p className="text-[11px] font-bold opacity-90 mt-1">
                                {isCancelled
                                    ? 'Tu acceso ha sido restringido. Por favor, renueva tu plan para continuar.'
                                    : 'Tu cuenta está en modo de solo lectura. Realiza el pago para habilitar todas las funciones.'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/billing"
                            className="h-10 px-4 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-black/10"
                        >
                            <CreditCard size={14} />
                            Gestionar Pago
                        </Link>
                        {isPastDue && (
                            <button
                                onClick={() => setIsVisible(false)}
                                className="size-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
