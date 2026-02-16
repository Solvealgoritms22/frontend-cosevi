"use client"

import { TrendingUp, PieChart, Activity, Download, Calendar, ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"
import useSWR from "swr"
import api from "@/lib/api"
import { useNotifications } from "@/context/notification-context"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/context/translation-context"

interface Visit {
    id: string;
    status: 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT';
    createdAt: string;
}

interface Space {
    id: string;
    status: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function ReportsPage() {
    const { t, language } = useTranslation()
    const { data: visitsResponse } = useSWR<{ data: Visit[], meta: any }>("/visits", fetcher)
    const { data: spaces } = useSWR<Space[]>("/spaces", fetcher)
    const { addNotification } = useNotifications()

    // Calculate real statistics
    const visitsArray = visitsResponse?.data || []
    const spacesArray = spaces || []
    const checkedIn = visitsArray.filter((v) => v.status === 'CHECKED_IN').length
    const pending = visitsArray.filter((v) => v.status === 'PENDING').length
    const total = visitsArray.length || 1

    const residentPercent = Math.round((checkedIn / total) * 100) || 0
    const guestPercent = Math.round((pending / total) * 100) || 0
    const staffPercent = Math.round(Math.max(0, 100 - residentPercent - guestPercent))

    // Generate weekly data from visits
    const weeklyData = [0, 0, 0, 0, 0, 0, 0, 0]
    visitsArray.forEach((v) => {
        const day = new Date(v.createdAt).getDay()
        if (day < 8) weeklyData[day] = (weeklyData[day] || 0) + 1
    })

    const maxVisits = Math.max(...weeklyData, 1)
    const normalizedWeekly = weeklyData.map(v => Math.round((v / maxVisits) * 100))

    // Download PDF (print-based)
    const handleDownloadPDF = () => {
        addNotification({ title: 'Info', message: 'Generating PDF report...', type: 'info' })
        window.print()
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 lg:gap-10 h-full pb-10 p-2 sm:p-4 lg:p-8 print:bg-white print:text-black"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12 px-4">
                <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        {t('analyticsReports').substring(0, t('analyticsReports').lastIndexOf(' '))} <span className="text-blue-500">{t('analyticsReports').split(' ').pop()}</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-xl font-medium tracking-tight opacity-70">{t('deepDiveAccess')}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white/40 border border-white/60 rounded-2xl shadow-sm">
                        <Calendar size={18} className="text-blue-500" />
                        <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <GlassButton
                        onClick={handleDownloadPDF}
                        variant="secondary"
                        icon={Download}
                        className="h-12 lg:h-14 px-6 lg:px-8 w-full sm:w-auto"
                    >
                        {t('downloadPDF')}
                    </GlassButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:px-4">
                <GlassCard elevation="sm" className="p-4 sm:p-6 lg:p-10 border-white/40 flex flex-col gap-8 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-800 flex items-center gap-3">
                            <TrendingUp className="text-blue-500" size={28} />
                            {t('visitorTrends')}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-6 shrink-0">
                            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-blue-50/50 border border-blue-100/50 rounded-full">
                                <span className="size-1.5 sm:size-2 rounded-full bg-blue-500 shadow-sm" />
                                <span className="text-fluid-label font-black text-blue-600 uppercase tracking-widest">{t('reportsChartActive')}</span>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50/50 border border-slate-100/50 rounded-full">
                                <span className="size-2 rounded-full bg-slate-300 shadow-sm" />
                                <span className="text-fluid-label font-black text-slate-400 uppercase tracking-widest">{t('reportsChartTarget')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Bar Chart */}
                    <div className="h-72 flex items-end justify-between gap-5 pt-6">
                        {normalizedWeekly.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <div className="w-full relative h-56">
                                    {/* Ghost Bar */}
                                    <div className="absolute inset-0 w-full bg-slate-50/50 rounded-t-xl border-x border-t border-slate-100/30 " />
                                    {/* Active Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05, duration: 1, ease: "circOut" }}
                                        className="absolute bottom-0 w-full bg-linear-to-t from-blue-500 to-blue-400 rounded-t-xl shadow-xl shadow-blue-500/10 group-hover:scale-y-[1.02] transition-transform origin-bottom"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard elevation="sm" className="p-4 sm:p-10 border-white/40 flex flex-col gap-8 relative overflow-hidden">
                    <h3 className="text-2xl font-black tracking-tighter text-slate-800 flex items-center gap-4 mb-8">
                        <PieChart className="text-blue-500" size={28} />
                        {t('occupancyStatus')}
                    </h3>

                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-10 relative">
                        {/* High-Fidelity Donut */}
                        <div className="size-48 sm:size-60 rounded-full border-12 sm:border-16 border-slate-50/80 shadow-inner flex items-center justify-center relative shrink-0">
                            <div className="absolute inset-0 rounded-full border-12 sm:border-16 border-emerald-500/10" />
                            <div
                                className="absolute inset-0 rounded-full border-12 sm:border-16 border-emerald-500 shadow-xl shadow-emerald-500/10"
                                style={{ clipPath: `inset(0 0 ${100 - residentPercent}% 0)` }}
                            />
                            <div className="size-32 sm:size-40 rounded-full bg-white/60 backdrop-blur-md shadow-2xl border border-white flex flex-col items-center justify-center animate-pulse-subtle">
                                <span className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter tabular-nums">{residentPercent}%</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-center max-w-full truncate px-2">{t('reportsStatusPreAuthorized')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-row sm:flex-col gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible w-full sm:w-auto px-4 sm:px-0">
                        {[
                            { label: t('reportsChartActive'), value: residentPercent, color: 'bg-emerald-500' },
                            { label: t('pendingApproval'), value: guestPercent, color: 'bg-blue-400' },
                            { label: t('other') || 'Other', value: staffPercent, color: 'bg-blue-200' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-white/40 border border-white/60 rounded-2xl shadow-sm hover:scale-105 transition-transform cursor-default shrink-0">
                                <span className={cn("size-2.5 rounded-full shadow-sm", item.color)} />
                                <div className="flex flex-col">
                                    <span className="text-fluid-label font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-xs sm:text-sm font-black text-slate-800 tabular-nums">{item.value}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div >

            <div className="glass-panel border-white/60 bg-linear-to-br from-blue-500/10 to-blue-600/5 rounded-4xl p-6 sm:p-10 flex flex-col xl:flex-row items-center justify-between gap-10 shadow-2xl mx-4">
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                    <div className="size-16 sm:size-20 rounded-3xl bg-blue-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 shrink-0">
                        <Activity size={40} />
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-800 flex items-center justify-center sm:justify-start gap-3">
                            {t('smartPerception')}
                            <ArrowUpRight className="text-emerald-500" size={24} />
                        </h4>
                        <p className="text-slate-500 max-w-lg font-medium tracking-tight text-base sm:text-lg mt-1">
                            {t('reportsOccupancyAnalysis')}
                        </p>
                    </div>
                </div>
                <GlassButton
                    onClick={() => addNotification({ title: t('reportsSystemInsights'), message: t('reportsActionPlan') || "Action plan generated based on current occupancy data. Forwarding to security supervisor...", type: 'success' })}
                    variant="primary"
                    glow
                    className="h-16 px-10 text-lg shadow-2xl shadow-blue-500/20 w-full xl:w-auto"
                >
                    {t('reportsReviewInsights')}
                </GlassButton>
            </div>
        </motion.div >
    )
}