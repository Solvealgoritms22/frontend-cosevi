"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "@/context/translation-context";
import { Smartphone, ShieldCheck, User, QrCode, Download, ExternalLink, Info } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MobileAppsPage() {
    const { t } = useTranslation();

    const apps = [
        {
            title: t('residentAppTitle'),
            role: t('residentAppRole'),
            icon: User,
            color: "bg-emerald-500",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            borderColor: "border-emerald-100",
            description: t('residentAppDesc'),
            features: [t('mobileAppsFeature1') || "Generate QR codes for visitors", t('mobileAppsFeature2') || "View assigned parking", t('mobileAppsFeature3') || "Receive security notifications"],
            qrPlaceholderDetails: t('scanWithExpo') || "Scan with Expo Go (Android) or Camera (iOS)",
            qrAsset: "/qr-resident.png"
        },
        {
            title: t('securityAppTitle'),
            role: t('securityAppRole'),
            icon: ShieldCheck,
            color: "bg-blue-500",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
            borderColor: "border-blue-100",
            description: t('securityAppDesc'),
            features: [t('mobileAppsFeature4') || "Scan visitor QR codes", t('mobileAppsFeature5') || "Log entries and exits", t('mobileAppsFeature6') || "Report incidents instantly"],
            qrPlaceholderDetails: t('internalSecurityUse') || "Internal Security Use Only",
            qrAsset: "/qr-security.png"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-8 space-y-12"
        >
            {/* Header */}
            <div className="space-y-6 text-center lg:text-left">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-200 mb-2 w-fit mx-auto lg:mx-0">
                            <Smartphone size={16} className="text-slate-500" />
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Mobile Ecosystem</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tighter">
                            {t('downloadApps')}
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                            {t('mobileAppsSubtitle')}
                        </p>
                    </div>

                    <GlassCard className="p-6 flex items-center gap-6 max-w-md border-white/60 bg-blue-50/50">
                        <div className="size-14 rounded-2xl bg-white flex items-center justify-center shadow-lg shrink-0 overflow-hidden p-2">
                            <Image src="/client.svg" alt="Expo Go Logo" width={40} height={40} className="object-contain" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{t('howToInstall')}</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-snug">
                                1. {t('installStep1')}
                                <br />
                                2. {t('installStep2')}
                            </p>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Apps Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {apps.map((app, idx) => (
                    <GlassCard
                        key={idx}
                        className="p-0 overflow-hidden border-white/60 flex flex-col h-full group hover:shadow-2xl transition-all duration-500"
                        elevation="sm"
                    >
                        <div className={`p-8 ${app.lightColor} border-b ${app.borderColor} relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 p-8 opacity-10 ${app.color} rounded-bl-[100px] size-40 -mr-10 -mt-10 pointer-events-none`} />

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className={`size-16 rounded-2xl ${app.color} text-white flex items-center justify-center shadow-xl shadow-${app.color}/20`}>
                                        <app.icon size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{app.title}</h2>
                                        <p className={`font-bold ${app.textColor} uppercase tracking-wider text-xs mt-1`}>{app.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col lg:flex-row gap-8 flex-1 bg-white/40">
                            {/* Features Side */}
                            <div className="flex-1 space-y-6">
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {app.description}
                                </p>
                                <ul className="space-y-3">
                                    {app.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                            <div className={`size-6 rounded-full ${app.lightColor} flex items-center justify-center text-${app.color.replace('bg-', '')}`}>
                                                <div className={`size-2 rounded-full ${app.color}`} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-6 mt-auto">
                                    <GlassButton variant="secondary" className="w-full justify-between group-hover:bg-white" icon={ExternalLink}>
                                        View Release Notes
                                    </GlassButton>
                                </div>
                            </div>

                            {/* QR Side */}
                            <div className="flex flex-col items-center justify-center gap-4 shrink-0">
                                <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500 relative">
                                    {app.qrAsset ? (
                                        <div className="relative size-48 rounded-xl overflow-hidden bg-white">
                                            <Image
                                                src={app.qrAsset}
                                                alt={`${app.title} QR Code`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="size-48 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-4 gap-2">
                                            <QrCode size={32} className="text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                                {app.title}<br />QR Code
                                            </span>
                                            <span className="text-[9px] text-slate-400 bg-slate-200/50 px-2 py-1 rounded-md">
                                                Replace with Asset
                                            </span>
                                        </div>
                                    )}

                                    {/* Corner Accents */}
                                    <div className={`absolute top-3 left-3 size-8 border-t-4 border-l-4 ${app.borderColor.replace('border-', 'border-')} rounded-tl-xl`} />
                                    <div className={`absolute top-3 right-3 size-8 border-t-4 border-r-4 ${app.borderColor.replace('border-', 'border-')} rounded-tr-xl`} />
                                    <div className={`absolute bottom-3 left-3 size-8 border-b-4 border-l-4 ${app.borderColor.replace('border-', 'border-')} rounded-bl-xl`} />
                                    <div className={`absolute bottom-3 right-3 size-8 border-b-4 border-r-4 ${app.borderColor.replace('border-', 'border-')} rounded-br-xl`} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center max-w-[180px]">
                                    {app.qrPlaceholderDetails}
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Platform Info */}
            <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-slate-50/50 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                <Info size={24} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-500 max-w-2xl">
                    {t('mobileAppsPlatformInfo') || "For production deployments, verify you are using the correct release channels. These QR codes are intended for the development and staging environments via Expo Go."}
                </p>
            </div>
        </motion.div>
    );
}
