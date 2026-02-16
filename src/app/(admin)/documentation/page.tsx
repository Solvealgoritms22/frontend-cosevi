"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { useTranslation } from "@/context/translation-context";
import { BookOpen, FileText, Search, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function DocumentationPage() {
    const { t } = useTranslation();

    const categories = [
        {
            title: "Getting Started",
            icon: Zap,
            description: "Essential guides for system setup and initial configuration.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Security Protocols",
            icon: Shield,
            description: "Understanding access levels, roles, and security policies.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "API Reference",
            icon: FileText,
            description: "Technical documentation for system integrations and endpoints.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto px-4 py-8 space-y-12"
        >
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter">
                    System <span className="text-blue-500">Documentation</span>
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                    Comprehensive guides and references for the SafeSystem platform.
                </p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mt-8 relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-lg px-6 py-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                        <Search className="text-slate-400 mr-4" />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((category, idx) => (
                    <GlassCard
                        key={idx}
                        className="p-8 flex flex-col gap-6 hover:scale-[1.02] transition-transform cursor-pointer group border-white/60"
                        elevation="sm"
                    >
                        <div className={`size-14 rounded-2xl flex items-center justify-center ${category.bg} ${category.color} ring-4 ring-white shadow-sm`}>
                            <category.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                {category.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                {category.description}
                            </p>
                        </div>
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">3 Articles</span>
                            <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <BookOpen size={14} />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Recent Updates */}
            <div className="glass-panel p-8 rounded-3xl border border-white/60 bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-6">Latest Updates</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center gap-4">
                                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">New</span>
                                <span className="text-slate-700 font-bold">Updated Security Policy Guidelines v2.4</span>
                            </div>
                            <span className="text-xs font-medium text-slate-400">Feb 16, 2026</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
