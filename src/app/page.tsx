"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    Smartphone,
    BarChart3,
    Zap,
    ArrowRight,
    Check,
    ChevronRight,
    Users,
    Activity,
    MonitorCheck
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { pricingPlans } from "@/lib/pricing-data";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/40 backdrop-blur-xl border-b border-white/60">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800">
                            COSEVI
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Características</a>
                        <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Planes</a>
                        <Link href="/login">
                            <GlassButton variant="primary" className="h-11">Acceso Portal</GlassButton>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-20 left-0 size-[500px] bg-indigo-100/50 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute top-40 right-0 size-[400px] bg-emerald-100/40 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto text-center space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full"
                    >
                        <Zap size={16} className="text-indigo-600" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Nueva era en seguridad residencial</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-slate-800 leading-[0.9]"
                    >
                        Seguridad Inteligente <br />
                        <span className="text-indigo-600">Sin Compromisos.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed"
                    >
                        COSEVI es la plataforma líder en gestión de visitantes y control de acceso.
                        Tecnología de vanguardia para condominios que priorizan la paz mental.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <GlassButton
                            variant="primary"
                            className="h-16 px-10 text-lg shadow-2xl shadow-indigo-200"
                            icon={ArrowRight}
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            Ver Planes de Pago
                        </GlassButton>
                        <GlassButton
                            className="h-16 px-10 text-lg border-slate-200"
                        >
                            Solicitar Demo
                        </GlassButton>
                    </motion.div>
                </div>
            </section>

            {/* Features Stats */}
            <section className="py-20 px-6 bg-white/50 border-y border-white/80" id="features">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: Users, label: "Visitantes Gestionados", value: "2M+", color: "indigo" },
                        { icon: Activity, label: "Uptime del Sistema", value: "99.9%", color: "emerald" },
                        { icon: MonitorCheck, label: "Precisión LPR", value: "98.5%", color: "blue" },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlassCard className="p-8 text-center space-y-4">
                                <div className={`size-14 mx-auto rounded-2xl flex items-center justify-center bg-${feature.color}-50 text-${feature.color}-500`}>
                                    <feature.icon size={28} />
                                </div>
                                <p className="text-4xl font-black text-slate-800">{feature.value}</p>
                                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{feature.label}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-32 px-6" id="pricing">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-800">
                            Planes diseñados para tu <span className="text-indigo-600">escalabilidad</span>
                        </h2>
                        <p className="text-lg text-slate-500 font-medium">
                            Elige el plan que mejor se adapte a las necesidades de tu comunidad.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <GlassCard
                                    elevation={plan.isPopular ? "xl" : "md"}
                                    className={`relative p-8 h-full flex flex-col space-y-8 border-2 ${plan.isPopular ? 'border-indigo-200' : 'border-white/40'}`}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            Más Popular
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-800">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-800">${plan.price}</span>
                                            <span className="text-slate-400 font-bold">/mes</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">{plan.description}</p>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        {plan.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="size-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center p-1">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <GlassButton
                                        variant={plan.isPopular ? "primary" : "secondary"}
                                        className="w-full h-14"
                                        glow={plan.isPopular}
                                        onClick={() => router.push(`/register?plan=${plan.id}`)}
                                    >
                                        {plan.buttonText}
                                    </GlassButton>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-800">
                            COSEVI
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-400">
                        © 2026 COSEVI Infrastructure. Todos los derechos reservados.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Privacidad</a>
                        <a href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Términos</a>
                        <a href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">Soporte</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
