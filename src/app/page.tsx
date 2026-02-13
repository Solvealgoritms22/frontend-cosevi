"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    Check,
    Zap,
    Lock,
    Globe,
    Server,
    Activity,
    Smartphone,
    Menu,
    X,
    ChevronRight
} from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import { pricingPlans } from "@/lib/pricing-data";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "@/context/translation-context";

export default function LandingPage() {
    const { t, language, setLanguage } = useTranslation();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const translatedPricingPlans = [
        {
            id: 'starter',
            name: t('starterPlan'),
            price: '49',
            description: t('starterDesc'),
            features: [
                t('upTo50Units'),
                t('upTo100Parking'),
                t('twoAdmins'),
                t('upTo5Guards'),
                t('basicVisitorMgmt'),
                t('qrAccessControl'),
            ],
            limits: pricingPlans[0].limits,
            buttonText: t('starterButton'),
        },
        {
            id: 'premium',
            name: t('premiumPlan'),
            price: '129',
            description: t('premiumDesc'),
            features: [
                t('upTo200Units'),
                t('upTo400Parking'),
                t('fiveAdmins'),
                t('upTo15Guards'),
                t('sosSystem'),
                t('advancedReports'),
                t('prioritySupport'),
            ],
            isPopular: true,
            limits: pricingPlans[1].limits,
            buttonText: t('premiumButton'),
        },
        {
            id: 'elite',
            name: t('elitePlan'),
            price: '299',
            description: t('eliteDesc'),
            features: [
                t('unlimitedUnits'),
                t('unlimitedAdmins'),
                t('unlimitedSecurity'),
                t('dedicatedDbData'),
                t('lprIntegration'),
                t('brandCustomization'),
                t('hardwareIntegration'),
            ],
            limits: pricingPlans[2].limits,
            buttonText: t('eliteButton'),
        },
    ];

    const navItems = [
        { name: t('featuresParams'), href: '#features' },
        { name: t('security'), href: '#security' },
        { name: t('pricing'), href: '#pricing' },
    ];

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    // ... (rest of the component)

    return (
        <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-28 h-14 md:w-40 md:h-22 flex items-center justify-center py-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo-landing.png"
                                alt="Entrar"
                                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}

                        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-white/5">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'en' ? 'bg-[#2563eb] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('es')}
                                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'es' ? 'bg-[#2563eb] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                ES
                            </button>
                        </div>

                        <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                            <button className="px-5 py-2.5 text-sm font-semibold bg-white text-[#0f172a] rounded-lg hover:bg-slate-100 transition-colors">
                                {t('customerPortal')}
                            </button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-white/5 mr-2">
                            <button
                                onClick={() => setLanguage('en')}
                                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'en' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLanguage('es')}
                                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'es' ? 'bg-[#3b82f6] text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                ES
                            </button>
                        </div>
                        <button
                            onClick={toggleMenu}
                            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "100vh" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden fixed inset-0 top-20 bg-[#0f172a] z-40 border-t border-white/10 overflow-y-auto"
                        >
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {navItems.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="p-4 rounded-xl bg-slate-800/30 border border-white/5 text-lg font-medium text-slate-200 hover:bg-slate-800/50 hover:text-white transition-all flex items-center justify-between group"
                                        >
                                            {item.name}
                                            <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                                        </a>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <button className="w-full py-4 text-center font-semibold bg-white text-[#0f172a] rounded-lg hover:bg-slate-100 transition-colors shadow-lg shadow-blue-500/20">
                                            {t('customerPortal')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <span className="flex h-2 w-2 rounded-full bg-[#3b82f6] animate-pulse"></span>
                            <span className="text-xs font-medium text-blue-300 tracking-wide uppercase">{t('enterpriseGradeSecurity')}</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            {t('secureAccess')} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-300 to-blue-900">
                                {t('redefined')}
                            </span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                                className="h-14 px-8 rounded-xl bg-[#2563eb] hover:bg-[#2563eb]/80 text-white font-semibold transition-all shadow-lg shadow-[#2563eb]/25 flex items-center justify-center gap-2"
                            >
                                {t('getStarted')} <ArrowRight size={18} />
                            </button>
                            <button className="h-14 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center justify-center">
                                {t('viewDemo')}
                            </button>
                        </div>

                        <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                            {[
                                { label: t('activeUsers'), value: "10k+" },
                                { label: t('uptimeSLA'), value: "99.99%" },
                                { label: t('countries'), value: "12" }
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
                            <div className="absolute inset-0 bg-linear-to-tr from-[#2563eb]/20 to-[#2563eb]/20 rounded-full blur-[100px]" />

                            {/* Central Shield Structure */}
                            <div className="relative w-64 h-80 bg-linear-to-b from-[#2563eb]/50 to-slate-900/50 backdrop-blur-md border border-[#2563eb]/30 rounded-3xl flex items-center justify-center shadow-2xl shadow-[#2563eb]/20 -rotate-12 z-10 transition-transform hover:rotate-0 duration-700">
                                <div className="absolute inset-0 bg-grid-white/[0.05] rounded-3xl" />
                                <ShieldCheck size={80} className="text-blue-100 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

                                {/* Floating Elements */}
                                <div className="absolute -top-12 -right-12 p-4 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-bounce duration-3000">
                                    <Activity size={24} className="text-red-400" />
                                </div>
                                <div className="absolute -bottom-8 -left-8 p-4 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl animate-pulse">
                                    <Lock size={24} className="text-blue-400" />
                                </div>
                            </div>

                            {/* Background Elements */}
                            <div className="absolute inset-0 border border-blue-500/10 rounded-full scale-110 animate-[spin_10s_linear_infinite]" />
                            <div className="absolute inset-0 border border-emerald-500/10 rounded-full scale-125 animate-[spin_15s_linear_infinite_reverse]" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 py-32 px-6 bg-[#0f172a]" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t('everythingYouNeed')}</h2>
                        <p className="text-slate-400 text-lg">{t('featuresSubtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Lock, title: t('bankGradeEncryption'), desc: t('bankGradeEncryptionDesc'), color: "indigo" },
                            { icon: Activity, title: t('realTimeAnalytics'), desc: t('realTimeAnalyticsDesc'), color: "emerald" },
                            { icon: Globe, title: t('globalCDN'), desc: t('globalCDNDesc'), color: "blue" },
                            { icon: Smartphone, title: t('mobileFirst'), desc: t('mobileFirstDesc'), color: "violet" },
                            { icon: ShieldCheck, title: t('roleManagement'), desc: t('roleManagementDesc'), color: "cyan" },
                            { icon: Server, title: t('dedicatedDatabase'), desc: t('dedicatedDatabaseDesc'), color: "rose" },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                            >
                                <div className={`size-12 rounded-lg flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="relative z-10 py-32 px-6 bg-[#0b1120] border-t border-white/5" id="security">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">{t('enterpriseGradeSecurity')}</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                                {t('securityTitle')}
                            </h2>
                            <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                                {t('securitySubtitle')}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                {[
                                    { title: t('endToEndEncryption'), desc: t('endToEndEncryptionDesc'), icon: Lock },
                                    { title: t('threatMonitoring'), desc: t('threatMonitoringDesc'), icon: Activity },
                                    { title: t('dataSovereignty'), desc: t('dataSovereigntyDesc'), icon: Globe },
                                    { title: t('complianceReady'), desc: t('complianceReadyDesc'), icon: ShieldCheck },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-[#3b82f6]">
                                            <item.icon size={20} />
                                        </div>
                                        <h4 className="font-bold text-white">{item.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="relative aspect-square w-full max-w-md mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-[80px]" />
                                <div className="relative w-full h-full bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden group shadow-2xl">
                                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <ShieldCheck size={160} className="text-emerald-500/20 animate-pulse" />
                                            <ShieldCheck size={120} className="absolute inset-0 m-auto text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
                                        </div>
                                    </div>

                                    {/* Decorative floating bits */}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-[#0b1120]" id="pricing">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">{t('simplePricing')}</h2>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            {t('simplePricingSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {translatedPricingPlans.map((plan, i) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-8 rounded-3xl h-full flex flex-col ${plan.isPopular
                                    ? 'bg-[#1e293b] border-2 border-[#2563eb] shadow-2xl shadow-[#2563eb]/10'
                                    : 'bg-[#0f172a] border border-white/10'
                                    }`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                        <span className="px-4 py-1 bg-[#2563eb] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                            {t('mostPopular')}
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm h-10">{plan.description}</p>
                                </div>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-slate-500 font-medium">{t('perMonth')}</span>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="mt-1 size-5 rounded-full bg-blue-500/20 text-[#3b82f6] flex items-center justify-center shrink-0">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => router.push(`/register?plan=${plan.id}`)}
                                    className={`w-full h-12 rounded-xl font-semibold transition-all ${plan.isPopular
                                        ? 'bg-[#2563eb] hover:bg-[#2563eb]/80 text-white shadow-lg shadow-[#2563eb]/25'
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
                        <div className="relative w-40 h-16 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/logo-landing.png"
                                alt="Entrar"
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">
                        {t('footerRights')}
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">{t('privacyPolicy')}</Link>
                        <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">{t('termsOfService')}</Link>
                        <Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors">{t('contactSupport')}</Link>
                    </div>
                </div>
            </footer>

            <ScrollToTop />
        </div>
    );
}

function ScrollToTop() {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5, pointerEvents: isVisible ? 'auto' : 'none' }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30 hover:bg-[#2563eb]/80 transition-colors"
        >
            <ArrowRight size={20} className="-rotate-90" />
        </motion.button>
    );
}
