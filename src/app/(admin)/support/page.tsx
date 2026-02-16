"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "@/context/translation-context";
import { Mail, MessageSquare, Phone, Send, LifeBuoy, FileQuestion } from "lucide-react";
import { motion } from "framer-motion";

export default function SupportPage() {
    const { t } = useTranslation();

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
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest">24/7 Support Center</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter">
                    How can we <span className="text-blue-500">help you?</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    Our dedicated support team is ready to assist you with any questions or technical issues you may encounter.
                </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-8 text-center flex flex-col items-center gap-6 border-white/60 hover:-translate-y-1 transition-transform duration-300">
                    <div className="size-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <MessageSquare size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Live Chat</h3>
                        <p className="text-slate-500 mt-2 font-medium">Real-time assistance with our experts.</p>
                    </div>
                    <GlassButton variant="primary" className="w-full mt-auto" icon={Send} glow>Start Chat</GlassButton>
                </GlassCard>

                <GlassCard className="p-8 text-center flex flex-col items-center gap-6 border-white/60 hover:-translate-y-1 transition-transform duration-300">
                    <div className="size-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Mail size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Email Support</h3>
                        <p className="text-slate-500 mt-2 font-medium">Detailed responses within 24 hours.</p>
                    </div>
                    <GlassButton variant="secondary" className="w-full mt-auto" icon={Send}>Send Email</GlassButton>
                </GlassCard>

                <GlassCard className="p-8 text-center flex flex-col items-center gap-6 border-white/60 hover:-translate-y-1 transition-transform duration-300">
                    <div className="size-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Phone size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Priority Line</h3>
                        <p className="text-slate-500 mt-2 font-medium">Direct access for urgent matters.</p>
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
                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-lg">FAQ</span>
                    <span className="opacity-50">Common Questions</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {[
                        "How do I reset my admin password?",
                        "Where can I view system logs?",
                        "How do I add a new resident?",
                        "Is the payment gateway secure?"
                    ].map((q, i) => (
                        <div key={i} className="flex gap-4 items-start group cursor-pointer">
                            <div className="mt-1 size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                ?
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{q}</h4>
                                <p className="text-sm text-slate-400 mt-1 font-medium">Click to view answer...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
