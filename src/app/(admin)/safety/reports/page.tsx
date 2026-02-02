"use client"

import { AlertTriangle, User, MessageSquare, Clock, Filter, Search, ChevronRight, FileText, Activity } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import api from "@/lib/api"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

interface Report {
    id: string;
    type: string;
    description: string;
    status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
    createdAt: string;
    reporter: {
        name: string;
        email: string;
    };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function SafetyReportsPage() {
    const { data: reports, mutate } = useSWR<Report[]>("/reports", fetcher)
    const [search, setSearch] = useState("")

    const filteredReports = reports?.filter(r =>
        r.type.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.reporter.name.toLowerCase().includes(search.toLowerCase())
    ) || []

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'text-red-600 bg-red-50 border-red-100'
            case 'INVESTIGATING':
                return 'text-amber-600 bg-amber-50 border-amber-100'
            case 'RESOLVED':
                return 'text-emerald-600 bg-emerald-50 border-emerald-100'
            default:
                return 'text-slate-400 bg-slate-50 border-slate-100'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-10 h-full pb-10 p-8"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-800 flex items-center gap-4">
                        <FileText className="text-indigo-500" size={36} />
                        Incident Reports
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg font-medium tracking-tight">Log and investigation of security incidents.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filter incidents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-14 pr-8 py-4 bg-white/40 border border-white/60 rounded-3xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 w-96 font-black tracking-tight text-slate-700 shadow-sm transition-all placeholder:text-slate-400/60 "
                        />
                    </div>
                    <GlassButton variant="secondary" className="size-14 p-0 flex items-center justify-center">
                        <Filter size={20} />
                    </GlassButton>
                </div>
            </div>

            <div className="flex flex-col gap-6 px-4">
                <div className="flex items-center gap-4 mb-2">
                    <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter text-slate-800 ">Activity Log</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{filteredReports.length} records found</p>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredReports.map((report, idx) => (
                        <motion.div
                            layout
                            key={report.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-panel border-white/60 bg-white/40 rounded-4xl p-10 flex items-start gap-10 group transition-all duration-500 hover:scale-[1.01]"
                        >
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm", getStatusColor(report.status))}>
                                        {report.status}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">RECORDED {new Date(report.createdAt).toLocaleString()}</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter group-hover:text-indigo-600 transition-colors flex items-center gap-4 uppercase italic">
                                        {report.type.replace('_', ' ')}
                                    </h4>
                                    <p className="text-slate-400 font-medium leading-relaxed max-w-4xl text-lg mt-2">{report.description}</p>
                                </div>
                                <div className="flex items-center gap-10 pt-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[12px] font-black text-slate-400 uppercase">
                                            {report.reporter.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 opacity-60">Reporter</p>
                                            <p className="text-sm font-black text-slate-800 ">{report.reporter.name.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-white/40 border border-white/60 flex items-center justify-center text-slate-400 ">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 opacity-60">Status</p>
                                            <p className="text-sm font-black text-slate-800 ">0 COMMENTS</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <GlassButton variant="secondary" className="size-16 p-0 flex items-center justify-center rounded-3xl group-hover:bg-white group-hover:shadow-2xl transition-all">
                                <ChevronRight size={28} className="text-indigo-500" />
                            </GlassButton>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredReports.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                    <AlertTriangle size={48} className="text-slate-400/30 " />
                    <p className="text-slate-400 font-bold">No incident reports match your current filter.</p>
                </div>
            )}
        </motion.div>
    )
}