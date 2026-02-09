"use client";

import { motion } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    Check,
    Zap,
    Lock,
    Globe,
    Server,
    Activity,
    Smartphone
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { pricingPlans } from "@/lib/pricing-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden selection:bg-indigo-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">
                            COSEVI
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {['Features', 'Security', 'Pricing'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                        <Link href="/login">
                            <button className="px-5 py-2.5 text-sm font-semibold bg-white text-[#0f172a] rounded-lg hover:bg-slate-100 transition-colors">
                                Customer Portal
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-48 pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                            <span className="text-xs font-medium text-indigo-300 tracking-wide uppercase">Enterprise Grade Security</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            Secure Access <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
                                Redefined.
                            </span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            The next-generation access control platform for modern residential complexes.
                            Seamless integration, bank-grade encryption, and real-time monitoring.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                            >
                                Get Started <ArrowRight size={18} />
                            </button>
                            <button className="h-14 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center justify-center">
                                View Demo
                            </button>
                        </div>

                        <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                            {[
                                { label: "Active Users", value: "10k+" },
                                { label: "Uptime SLA", value: "99.99%" },
                                { label: "Countries", value: "12" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Placeholder for Hero Illustration - Will use generated image here */}
                        {/* CSS-based Abstract Security Shield Illustration */}
                        <div className="relative aspect-square w-full max-w-[500px] mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-emerald-500/20 rounded-full blur-[100px]" />

                            {/* Central Shield Structure */}
                            <div className="relative w-64 h-80 bg-linear-to-b from-indigo-900/50 to-slate-900/50 backdrop-blur-md border border-indigo-500/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 -rotate-12 z-10 transition-transform hover:rotate-0 duration-700">
                                <div className="absolute inset-0 bg-grid-white/[0.05] rounded-3xl" />
                                <ShieldCheck size={80} className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                                {/* Floating Elements */}
                                <div className="absolute -top-12 -right-12 p-4 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-bounce duration-3000">
                                    <Activity size={24} className="text-emerald-400" />
                                </div>
                                <div className="absolute -bottom-8 -left-8 p-4 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-pulse">
                                    <Lock size={24} className="text-blue-400" />
                                </div>
                            </div>

                            {/* Background Elements */}
                            <div className="absolute inset-0 border border-indigo-500/10 rounded-full scale-110 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-125 animate-[spin_15s_linear_infinite_reverse]" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-32 px-6 bg-[#0f172a]" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need</h2>
                        <p className="text-slate-400 text-lg">Powerful features designed security professionals and property managers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Lock, title: "Bank-Grade Encryption", desc: "End-to-end encryption for all data transit and storage.", color: "indigo" },
                            { icon: Activity, title: "Real-time Analytics", desc: "Live monitoring of access logs and security events.", color: "emerald" },
                            { icon: Globe, title: "Global CDN", desc: "Lightning fast access from anywhere in the world.", color: "blue" },
                            { icon: Smartphone, title: "Mobile First", desc: "Native apps for iOS and Android with offline support.", color: "violet" },
                            { icon: ShieldCheck, title: "Role Management", desc: "Granular access controls and permission hierarchies.", color: "cyan" },
                            { icon: Server, title: "Dedicated Database", desc: "Isolated instances for Elite customers.", color: "rose" },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                            >
                                <div className={`size-12 rounded-lg bg-${feature.color}-500/10 flex items-center justify-center mb-6 text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#0b1120]" id="pricing">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Choose the perfect plan for your community. No hidden fees.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {pricingPlans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-8 rounded-3xl h-full flex flex-col ${plan.isPopular
                                    ? 'bg-[#1e293b] border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10'
                                    : 'bg-[#0f172a] border border-white/10'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                        <span className="px-4 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm h-10">{plan.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 size-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => router.push(`/register?plan=${plan.id}`)}
                                    className={`w-full h-12 rounded-xl font-semibold transition-all ${plan.isPopular
                                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/10 hover:bg-white/15 text-white'
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                            <ShieldCheck className="text-indigo-400" size={18} />
                        </div>
                        <span className="text-lg font-bold text-slate-200">
                            COSEVI
                        </span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © 2026 COSEVI Infrastructure. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'Security', 'Contact'].map((link) => (
                            <a key={link} href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
