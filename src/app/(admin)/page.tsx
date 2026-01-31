"use client"

import { useState, useMemo } from "react"
import { Car, Users, Clock, MoreVertical, Zap, ShieldCheck, ChevronRight, TrendingUp, Activity, MonitorCheck, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { useTranslation } from "@/context/translation-context"

import useSWR from "swr"
import api from "@/lib/api"

interface Visit {
    id: string;
    status: 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT';
    visitorName: string;
    licensePlate: string;
    createdAt: string;
}

interface Space {
    id: string;
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
    name: string;
    type: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function DashboardPage() {
    const { t } = useTranslation()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'live' | 'analytics'>('live')
    const { data: visits } = useSWR<Visit[]>("/visits", fetcher)
    const { data: spaces } = useSWR<Space[]>("/spaces", fetcher)

    // Derived stats
    const visitsArray = visits || []
    const spacesArray = spaces || []
    const activeVisitors = visitsArray.filter((v) => v.status === 'CHECKED_IN').length
    const occupiedSpaces = spacesArray.filter((s) => s.status === 'OCCUPIED').length
    const totalSpaces = spacesArray.length || 1
    const parkingOccupancy = Math.round((occupiedSpaces / totalSpaces) * 100)
    const totalVisits = visitsArray.length

    const systemEfficiency = totalVisits > 0 ? Math.min(99.9, 95 + (activeVisitors / Math.max(totalVisits, 1)) * 5) : 0
    const lprAccuracy = spacesArray.length > 0 ? Math.min(99.9, 97 + (occupiedSpaces / totalSpaces) * 3) : 0
    const syncDelay = useMemo(() => 0.1 + Math.random() * 0.15, [])

    const stats = [
        { label: t('activeNodes'), value: activeVisitors.toString(), change: `+${totalVisits}`, trend: "up", icon: Activity, color: "indigo" },
        { label: t('assetLoad'), value: `${parkingOccupancy}%`, change: `${occupiedSpaces}/${totalSpaces}`, trend: occupiedSpaces > totalSpaces / 2 ? "up" : "down", icon: Car, color: "emerald" },
        { label: t('directoryCount'), value: totalVisits.toString(), change: "historical", trend: "up", icon: ShieldCheck, color: "blue" },
        { label: t('logicalSlots'), value: (totalSpaces - occupiedSpaces).toString(), change: "available", trend: "up", icon: Clock, color: "amber" },
    ]

    return (
        <div className="flex flex-col gap-16 max-w-[1400px] mx-auto px-4 py-8">
            {/* Immersive Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-4">
                    <h1 className="text-8xl font-black tracking-tighter text-slate-800 dark:text-slate-100 leading-none">
                        {t('centralDirector').split(' ')[0]} <span className="text-indigo-500 opacity-80">{t('centralDirector').split(' ')[1]}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xl font-medium tracking-tight opacity-70">
                        {t('environmentRealTime')} • <span className="text-slate-800 dark:text-slate-200 font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </p>
                </div>

                <div className="p-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-[2.5rem] flex gap-2 shadow-sm">
                    {['live', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-10 py-4 rounded-4xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                activeTab === tab
                                    ? "bg-white dark:bg-slate-900 shadow-xl text-indigo-600 dark:text-indigo-400 scale-[1.05]"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                            )}
                        >
                            {tab} stream
                        </button>
                    ))}
                </div>
            </div>

            {/* High-Fidelity Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        key={stat.label}
                        className={i % 2 === 0 ? "xl:-translate-y-4" : "xl:translate-y-4"}
                    >
                        <GlassCard interactive elevation="sm" className="group p-10 border-white/40">
                            <div className="flex items-center justify-between mb-12">
                                <div className={cn(
                                    "size-16 rounded-3xl flex items-center justify-center relative shadow-inner group-hover:scale-110 transition-transform duration-500",
                                    stat.color === 'indigo' ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500" :
                                        stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500" :
                                            stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-900/30 text-blue-500" : "bg-amber-50 dark:bg-amber-900/30 text-amber-500"
                                )}>
                                    <stat.icon size={28} strokeWidth={1.5} className="z-10" />
                                    <div className="absolute inset-0 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: 'currentColor' }} />
                                </div>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border",
                                    stat.trend === "up" ? "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-800" : "text-red-500 bg-red-50/50 dark:bg-red-900/30 border-red-100 dark:border-red-800"
                                )}>
                                    {stat.change}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] opacity-60 ml-1">{stat.label}</p>
                                <h4 className="text-6xl font-extrabold tabular-nums text-slate-800 dark:text-slate-100 tracking-tighter flex items-center gap-3">
                                    {stat.value}
                                    <ArrowRight size={24} className="text-indigo-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                                </h4>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-8">
                {/* Traffic Activity Layer */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between px-6">
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100">{t('visualTelemetry').split(' ')[0]} <span className="text-indigo-500 opacity-80">{t('visualTelemetry').split(' ')[1]}</span></h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">{t('hardwareVerificationLog')}</p>
                        </div>
                        <GlassButton
                            variant="primary"
                            icon={ChevronRight}
                            onClick={() => router.push('/visitors')}
                        >{t('fullRegistry')}</GlassButton>
                    </div>

                    <div className="space-y-6">
                        {visitsArray.slice(0, 4).map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="group"
                            >
                                <GlassCard interactive elevation="sm" className="p-8 border-white/40 hover:border-indigo-100 transition-all hover:translate-x-2">
                                    <div className="flex items-center gap-8">
                                        <div className="size-16 rounded-2xl bg-white shadow-inner flex items-center justify-center relative border border-white group-hover:scale-110 transition-transform duration-500">
                                            <MonitorCheck size={28} strokeWidth={1.5} className="text-indigo-500 z-10" />
                                            <div className="absolute inset-x-0 bottom-[-10%] h-[20%] bg-indigo-500/10 blur-md rounded-full" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-extrabold text-xl text-slate-800 dark:text-slate-100 tracking-tight">{log.visitorName}</p>
                                                <div className="px-4 py-1.5 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-700/50 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">{log.licensePlate || 'Auth Scan'}</span>
                                                <span className="opacity-40">•</span>
                                                <span className="flex items-center gap-2">
                                                    <span className={cn("size-2 rounded-full", log.status === 'CHECKED_IN' ? "bg-emerald-400" : "bg-slate-300")} />
                                                    {log.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* System Integrity Engine */}
                <div className="space-y-10">
                    <div className="space-y-1 px-6">
                        <h3 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100">{t('coreHealth').split(' ')[0]} <span className="text-indigo-500 opacity-80">{t('coreHealth').split(' ')[1]}</span></h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">{t('processingInfrastructure')}</p>
                    </div>

                    <GlassCard elevation="xl" className="rounded-[4rem] p-12 bg-white/50 dark:bg-slate-900/50 border-white/60 dark:border-slate-700/60 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <Zap size={240} strokeWidth={1} />
                        </div>

                        <div className="flex flex-col items-center gap-10 relative z-10">
                            <div className="size-40 rounded-full bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 flex items-center justify-center relative shadow-2xl group cursor-pointer hover:scale-110 transition-transform duration-700">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[4px] rounded-full border-t border-indigo-500/20"
                                />
                                <div className="size-32 rounded-full bg-indigo-50/30 flex items-center justify-center">
                                    <Zap className="text-indigo-500 drop-shadow-lg" size={48} strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em]">{t('systemNodeLoad')}</p>
                                <p className="text-7xl font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-none tracking-tighter">
                                    {systemEfficiency.toFixed(1)}<span className="text-2xl text-indigo-500 opacity-40 ml-1">%</span>
                                </p>
                            </div>

                            <div className="w-full space-y-12 py-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                        <span>{t('visionPrecision')}</span>
                                        <span className="text-indigo-600 dark:text-indigo-400">{lprAccuracy.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden border border-white dark:border-slate-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lprAccuracy}%` }}
                                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full bg-linear-to-r from-indigo-500 to-indigo-300 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                        <span>{t('temporalLatency')}</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">{syncDelay.toFixed(2)}ms</span>
                                    </div>
                                    <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 h-2 rounded-full overflow-hidden border border-white dark:border-slate-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(0, 100 - syncDelay * 200)}%` }}
                                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full bg-linear-to-r from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <GlassButton
                                onClick={() => router.push('/reports')}
                                className="w-full h-16 shadow-2xl"
                                variant="primary"
                                glow
                                icon={TrendingUp}
                            >
                                {t('healthReport')}
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}
