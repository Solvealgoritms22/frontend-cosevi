"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "@/context/translation-context";
import { useState } from "react";
import { Mail, MessageSquare, Phone, Send, LifeBuoy, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SupportPage() {
    const { t } = useTranslation();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { q: t('supportFaqResetPassword'), a: t('supportFaqResetPasswordAns') },
        { q: t('supportFaqSystemLogs'), a: t('supportFaqSystemLogsAns') },
        { q: t('supportFaqAddResident'), a: t('supportFaqAddResidentAns') },
        { q: t('supportFaqPaymentSecure'), a: t('supportFaqPaymentSecureAns') },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-4 py-8 space-y-12"
        >
            {/* Header */}
            <div className="text-center space-y-6 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-4">
                    <LifeBuoy size={16} className="text-blue-500" />
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t('support247')}</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">
                    {t('supportHelperTitle')} <span className="text-blue-500">{t('supportHelperTitleHighlight')}</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    {t('supportHelperDesc')}
                </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-8 text-center flex flex-col items-center gap-6 border-white/60 hover:-translate-y-1 transition-transform duration-300">
                    <div className="size-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{t('supportEmailTitle')}</h3>
                        <p className="text-slate-500 mt-2 font-medium">{t('supportEmailDesc')}</p>
                    </div>
                    <GlassButton variant="secondary" className="w-full mt-auto" icon={Send}>{t('supportSendEmail')}</GlassButton>
                </GlassCard>

                <GlassCard className="p-8 text-center flex flex-col items-center gap-6 border-white/60 hover:-translate-y-1 transition-transform duration-300">
                    <div className="size-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Phone size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{t('supportPriorityTitle')}</h3>
                        <p className="text-slate-500 mt-2 font-medium">{t('supportPriorityDesc')}</p>
                    </div>
                    <GlassButton variant="ghost" className="w-full mt-auto border border-slate-200" icon={Phone}>+1 (800) 123-4567</GlassButton>
                </GlassCard>
            </div>

            {/* FAQ Section */}
            <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/60 bg-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <FileQuestion size={200} />
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-lg">{t('supportFaqTitle')}</span>
                    <span className="opacity-50">{t('supportFaqSubtitle')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="flex gap-4 items-start group cursor-pointer"
                        >
                            <div className={cn(
                                "mt-1 size-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300",
                                openFaq === i
                                    ? "bg-blue-500 text-white rotate-180"
                                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                            )}>
                                {openFaq === i ? '−' : '?'}
                            </div>
                            <div className="space-y-2">
                                <h4 className={cn(
                                    "font-bold transition-colors duration-300",
                                    openFaq === i ? "text-blue-600" : "text-slate-700 group-hover:text-blue-600"
                                )}>
                                    {faq.q}
                                </h4>
                                <div className={cn(
                                    "grid transition-all duration-300 ease-in-out",
                                    openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}>
                                    <div className="overflow-hidden">
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                                {openFaq !== i && (
                                    <p className="text-sm text-slate-400 font-medium animate-in fade-in slide-in-from-top-1">
                                        {t('supportFaqClick')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
