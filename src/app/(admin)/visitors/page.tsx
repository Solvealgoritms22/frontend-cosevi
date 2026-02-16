"use client"

import { Search, Filter, Download, Plus, MoreHorizontal, User, Calendar, Clock, ChevronRight, Trash2, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/modal"
import { useNotifications } from "@/context/notification-context"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import useSWR from "swr"
import api, { API_BASE_URL } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { useTranslation } from "@/context/translation-context"
import { SafeImage } from "@/components/ui/safe-image"

const fetcher = (url: string) => api.get(url).then((res) => res.data)

const visitSchema = z.object({
    visitorName: z.string().min(3, "Name must be at least 3 characters"),
    visitorIdNumber: z.string().min(5, "ID Number is required"),
    licensePlate: z.string().min(4, "License plate is required"),
    validFrom: z.string().min(1, "Start date is required"),
    validUntil: z.string().min(1, "End date is required"),
})

type VisitFormValues = z.infer<typeof visitSchema>

interface Visit {
    id: string;
    visitorName: string;
    visitorIdNumber: string;
    licensePlate: string;
    status: 'PENDING' | 'APPROVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'DENIED' | 'EXPIRED';
    createdAt: string;
    validFrom: string;
    validUntil: string;
    entryTime?: string;
    exitTime?: string;
    companionCount?: number;
    images?: string;
    accessCode?: string;
    qrCode?: string;
    host?: { name: string; email: string };
    spaceId?: string;
    space?: { name: string; level: number };
}

const ITEMS_PER_PAGE = 5

export default function VisitorsPage() {
    const { t, language } = useTranslation()
    const { data: visitsResponse, mutate, isLoading, error } = useSWR<{ data: Visit[], meta: any }>("/visits", fetcher)
    const { addNotification } = useNotifications()
    const { register, handleSubmit, reset, formState: { errors } } = useForm<VisitFormValues>({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            validFrom: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
    })

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const searchParams = useSearchParams()
    const urlQuery = searchParams.get('q') || ""
    const [searchQuery, setSearchQuery] = useState(urlQuery)

    useEffect(() => {
        if (urlQuery) setSearchQuery(urlQuery)
    }, [urlQuery])

    const [currentPage, setCurrentPage] = useState(1)

    const [statusFilter, setStatusFilter] = useState("ALL")
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [visitToDelete, setVisitToDelete] = useState<string | null>(null)
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, statusFilter])

    if (error) return <div className="p-8 text-red-600 italic font-bold">Failed to load access logs. Please verify connection.</div>
    if (isLoading) return <div className="p-8 text-slate-400 animate-pulse italic">Synchronizing with ENTRA Cloud...</div>

    const visitsArray = visitsResponse?.data || []

    const filteredVisits = visitsArray.filter((v) => {
        const matchesSearch = v.visitorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.host?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalPages = Math.ceil(filteredVisits.length / ITEMS_PER_PAGE)
    const paginatedVisits = filteredVisits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const handleExportCSV = () => {
        if (filteredVisits.length === 0) {
            addNotification({ title: 'Warning', message: 'No data to export', type: 'warning' })
            return
        }
        const headers = ['Visitor Name', 'ID Number', 'License Plate', 'Status', 'Host', 'Created At']
        const csvContent = [
            headers.join(','),
            ...filteredVisits.map((v) => [
                `"${v.visitorName || ''}"`,
                `"${v.visitorIdNumber || ''}"`,
                `"${v.licensePlate || ''}"`,
                `"${v.status || ''}"`,
                `"${v.host?.name || 'Self-check'}"`,
                `"${new Date(v.createdAt).toLocaleString()}"`
            ].join(','))
        ].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `visitors_export_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        addNotification({ title: 'Success', message: `Exported ${filteredVisits.length} records`, type: 'success' })
    }

    const handleCreateVisit = async (data: VisitFormValues) => {
        setIsSubmitting(true)
        try {
            await api.post('/visits', {
                ...data,
                hostId: localStorage.getItem('userId') || 'default-host-id',
                validFrom: new Date(data.validFrom).toISOString(),
                validUntil: new Date(data.validUntil).toISOString(),
            })
            addNotification({ title: 'Success', message: 'Visit created successfully', type: 'success' })
            setIsCreateModalOpen(false)
            mutate()
            reset()
        } catch (error: any) {
            addNotification({ title: 'Error', message: error.response?.data?.message || 'Failed to create visit', type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteVisit = async (id: string) => {
        try {
            await api.delete(`/visits/${id}`)
            addNotification({ title: 'Success', message: 'Visit deleted', type: 'success' })
            mutate()
        } catch (error: any) {
            addNotification({ title: 'Error', message: error.response?.data?.message || 'Failed to delete visit', type: 'error' })
        }
    }

    return (
        <div className="flex flex-col gap-8 sm:gap-16 max-w-[1400px] mx-auto px-2 sm:px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
                <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        {t('visitorLogs').includes(' ') ? (
                            <>
                                {t('visitorLogs').substring(0, t('visitorLogs').lastIndexOf(' '))} <span className="text-blue-500">{t('visitorLogs').split(' ').pop()}</span>
                            </>
                        ) : (
                            <span className="text-slate-800">{t('visitorLogs')}</span>
                        )}
                    </h2>
                    <p className="text-slate-600 text-base sm:text-xl font-medium tracking-tight opacity-70">{t('facilityAccess')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <GlassButton onClick={handleExportCSV} variant="secondary" icon={Download}>
                        {t('exportData')}
                    </GlassButton>
                    <GlassButton onClick={() => setIsCreateModalOpen(true)} variant="primary" icon={Plus} glow>
                        {t('newVisit')}
                    </GlassButton>
                </div>
            </div>

            {/* Constraints & Search - Glass UI */}
            <div className="space-y-12">
                <div className="flex flex-col xl:flex-row items-center gap-6 sm:gap-10">
                    <div className="relative group flex-1 w-full">
                        <div className="absolute inset-0 bg-white/40 blur-md rounded-4xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 h-6 w-6 z-10 transition-colors group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder={t('searchVisitors')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative z-10 w-full h-16 sm:h-20 pl-18 pr-8 bg-white/40 border border-white/60 rounded-3xl sm:rounded-4xl outline-none font-bold tracking-tight text-slate-800 placeholder:text-slate-500 text-base sm:text-lg focus:ring-4 focus:ring-blue-500/5 transition-all"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto">
                        <div className="h-16 sm:h-20 bg-white/40 border border-white/60 rounded-3xl sm:rounded-4xl px-8 flex items-center justify-between sm:justify-start gap-5 w-full sm:min-w-[280px] shadow-sm">
                            <Calendar size={20} className="text-blue-500 shrink-0" />
                            <span className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-widest">{new Date().toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className={cn(
                                    "h-16 w-full sm:size-20 rounded-3xl sm:rounded-4xl flex items-center justify-center transition-all duration-500 shadow-sm",
                                    statusFilter !== 'ALL' ? "bg-white border-white scale-[1.05] sm:scale-[1.1] shadow-xl" : "bg-white/40 border border-white/60 hover:bg-white/60 "
                                )}
                            >
                                <Filter size={24} className={statusFilter !== 'ALL' ? "text-blue-500" : "text-slate-500"} />
                                <span className="sm:hidden ml-3 text-xs font-black uppercase tracking-widest text-slate-500">Filter</span>
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 top-full mt-6 z-50 bg-white rounded-[2.5rem] shadow-2xl p-4 min-w-[240px] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="p-4 mb-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t('statusFilter')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        {['ALL', 'PENDING', 'CHECKED_IN', 'CHECKED_OUT'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setShowFilterDropdown(false) }}
                                                className={cn(
                                                    "w-full px-6 py-4 text-left text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300",
                                                    statusFilter === status ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 "
                                                )}
                                            >
                                                {status === 'ALL' ? t('allActivity') : status.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dynamic List */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        {paginatedVisits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 gap-4 bg-white/20 rounded-3xl border border-white/40">
                                <div className="size-20 rounded-full bg-white/40 flex items-center justify-center">
                                    <User size={40} strokeWidth={1.5} />
                                </div>
                                <p className="text-xl font-black uppercase tracking-widest opacity-60">{t('noVisitsFound') || "No visits found"}</p>
                            </div>
                        ) : (
                            paginatedVisits.map((visit, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                    key={visit.id}
                                    className="group"
                                    onClick={() => { setSelectedVisit(visit); setIsDetailModalOpen(true) }}
                                >
                                    <GlassCard interactive elevation="sm" className="p-3 sm:p-8 border-white/40 cursor-pointer">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                                            <div className="flex items-center gap-4 sm:gap-8">
                                                <div className="size-14 sm:size-20 rounded-2xl sm:rounded-3xl bg-white shadow-sm border border-white flex items-center justify-center group-hover:scale-105 transition-all duration-500 relative shrink-0">
                                                    <User size={32} strokeWidth={2} className="text-blue-500 z-10" />
                                                    <div className="absolute inset-0 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-lg sm:text-2xl font-black tracking-tighter text-slate-800 leading-none mb-2 sm:mb-3 truncate max-w-[150px] sm:max-w-none">{visit.visitorName}</p>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                        <span className={cn(
                                                            "text-fluid-label font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm",
                                                            visit.status === 'CHECKED_IN' ? "bg-emerald-50 text-emerald-700 border-emerald-100 " :
                                                                visit.status === 'CHECKED_OUT' ? "bg-slate-50 text-slate-600 border-slate-100 " :
                                                                    visit.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-100 " :
                                                                        "bg-red-50 text-red-700 border-red-100 "
                                                        )}>
                                                            {visit.status.replace('_', ' ')}
                                                        </span>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50/50 rounded-lg border border-slate-100/50">
                                                            <span className="text-fluid-label font-black text-slate-400 uppercase tracking-widest">{t('host')}:</span>
                                                            <span className="text-fluid-label font-bold text-slate-600 uppercase tracking-tight truncate max-w-[80px] sm:max-w-none">{visit.host?.name || "Self-check"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 sm:gap-12 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                                                <div className="text-left lg:text-right">
                                                    <div className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.2em] mb-1 sm:mb-2 opacity-60">{t('authorizedAccess')}</div>
                                                    <div className="text-lg sm:text-xl font-black text-slate-800 tabular-nums tracking-tighter">{new Date(visit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <div className="flex items-center gap-4 ml-auto lg:ml-0">
                                                    <div className={cn(
                                                        "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-fluid-label uppercase tracking-widest sm:tracking-[0.2em] text-center shadow-sm border",
                                                        visit.status === 'CHECKED_IN' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            visit.status === 'CHECKED_OUT' ? "bg-slate-50 text-slate-400 border-slate-100" :
                                                                visit.status === 'PENDING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                    "bg-red-50 text-red-600 border-red-100"
                                                    )}>
                                                        {visit.status.replace('_', ' ')}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setVisitToDelete(visit.id)
                                                        }}
                                                        className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 hover:bg-red-50 flex items-center justify-center text-red-400 group-hover:scale-110 transition-all duration-500 hover:shadow-lg shrink-0"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div >

            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-10 px-8 border-t border-white/20 mt-10">
                    <p className="text-fluid-label font-black uppercase tracking-[0.2em] text-slate-400">
                        {t('showing')} <span className="text-slate-800">{paginatedVisits.length}</span> {t('of')} <span className="text-slate-800">{filteredVisits.length}</span> {t('resultsFound')}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={cn(
                                "size-12 rounded-2xl flex items-center justify-center transition-all border border-white/60",
                                currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
                            )}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "size-12 rounded-2xl text-[10px] font-black transition-all",
                                        currentPage === page
                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-white/40 text-slate-500 hover:bg-white border border-white/60"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={cn(
                                "size-12 rounded-2xl flex items-center justify-center transition-all border border-white/60",
                                currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
                            )}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Create Visit Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); reset() }} title={t('newVisit')}>
                <form onSubmit={handleSubmit(handleCreateVisit)} className="space-y-8 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('visitorName')}</label>
                            <input {...register("visitorName")} className={cn(
                                "w-full px-8 h-14 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                                errors.visitorName && "ring-2 ring-red-500/20 border-red-200"
                            )} placeholder="John Doe" />
                            {errors.visitorName && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{errors.visitorName.message}</p>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('idNumber')}</label>
                            <input {...register("visitorIdNumber")} className={cn(
                                "w-full px-8 h-14 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                                errors.visitorIdNumber && "ring-2 ring-red-500/20 border-red-200"
                            )} placeholder="001-0123456-7" />
                            {errors.visitorIdNumber && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{errors.visitorIdNumber.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('licensePlate')}</label>
                        <input {...register("licensePlate")} className={cn(
                            "w-full px-8 h-14 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                            errors.licensePlate && "ring-2 ring-red-500/20 border-red-200 "
                        )} placeholder="ABC-1234" />
                        {errors.licensePlate && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{errors.licensePlate.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('validFrom')}</label>
                            <input type="date" {...register("validFrom")} className={cn(
                                "w-full px-8 h-14 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                                errors.validFrom && "ring-2 ring-red-500/20 border-red-200"
                            )} />
                            {errors.validFrom && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{errors.validFrom.message}</p>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('validUntil')}</label>
                            <input type="date" {...register("validUntil")} className={cn(
                                "w-full px-8 h-14 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                                errors.validUntil && "ring-2 ring-red-500/20 border-red-200"
                            )} />
                            {errors.validUntil && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{errors.validUntil.message}</p>}
                        </div>
                    </div>
                    <div className="flex gap-6 pt-6">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 h-16 rounded-[1.25rem] text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all">
                            {t('cancel')}
                        </button>
                        <GlassButton type="submit" disabled={isSubmitting} variant="primary" className="flex-1 h-16" glow>
                            {isSubmitting ? t('processing') : t('authorizeVisit')}
                        </GlassButton>
                    </div>
                </form>
            </Modal >

            {/* Visit Detail Modal */}
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={t('visitDetails') || "Visit Details"}>
                {selectedVisit && (
                    <div className="space-y-10 p-6">
                        {/* Status Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('currentStatus')}</span>
                                <span className={cn(
                                    "text-sm font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm self-start mt-1",
                                    selectedVisit.status === 'CHECKED_IN' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        selectedVisit.status === 'CHECKED_OUT' ? "bg-slate-50 text-slate-600 border-slate-100" :
                                            selectedVisit.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                "bg-red-50 text-red-700 border-red-100"
                                )}>
                                    {selectedVisit.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('visitId')}</span>
                                <p className="text-xs font-mono font-bold text-slate-400 mt-1">{selectedVisit.id.slice(0, 8)}...</p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('visitorName')}</span>
                                    <p className="text-xl font-black tracking-tight text-slate-800 ">{selectedVisit.visitorName}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('idNumber')}</span>
                                    <p className="text-sm font-bold text-slate-700 ">{selectedVisit.visitorIdNumber}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('licensePlate')}</span>
                                    <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{selectedVisit.licensePlate || t('noVehicle')}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('host')}</span>
                                    <p className="text-md font-bold text-slate-800 ">{selectedVisit.host?.name || "Self-check"}</p>
                                    <p className="text-xs text-slate-500">{selectedVisit.host?.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('companionCount')}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Plus size={14} className="text-slate-400" />
                                        <p className="text-sm font-bold text-slate-700 ">{selectedVisit.companionCount || 0} {t('guests')}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('parkingAssignment')}</span>
                                    {selectedVisit.space ? (
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 text-xs font-black">
                                                {selectedVisit.space.name}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">LVL {selectedVisit.space.level}</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-400 mt-1 italic">{t('noParkingAssigned')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Timing Section */}
                        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{t('entryTime')}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 ">{selectedVisit.entryTime ? new Date(selectedVisit.entryTime).toLocaleString() : "—"}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{t('exitTime')}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 ">{selectedVisit.exitTime ? new Date(selectedVisit.exitTime).toLocaleString() : "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Images Section */}
                        {selectedVisit.images && (
                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">{t('identificationPhotos')}</span>
                                <div className="grid grid-cols-2 gap-4">
                                    {(() => {
                                        try {
                                            const images = selectedVisit.images ? JSON.parse(selectedVisit.images) : [];
                                            return images.map((img: string, idx: number) => (
                                                <div key={idx} className="aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
                                                    <SafeImage
                                                        src={img.startsWith('data:') || img.startsWith('http') ? img : `${API_BASE_URL}${img}`}
                                                        alt={`Visitor ID ${idx + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                </div>
                                            ));
                                        } catch (e) {
                                            console.error('Error parsing images:', e);
                                            return null;
                                        }
                                    })()}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <GlassButton onClick={() => setIsDetailModalOpen(false)} className="w-full h-16" variant="secondary">
                                {t('close')}
                            </GlassButton>
                        </div>
                    </div>
                )}
            </Modal >

            {/* Confirmation Dialog */}
            <ConfirmDialog isOpen={!!visitToDelete} onClose={() => setVisitToDelete(null)} onConfirm={() => visitToDelete && handleDeleteVisit(visitToDelete)} title={t('deleteVisitorRecord')} message={t('deleteConfirmMsg')} confirmText={t('deleteRecord')} variant="destructive" />
        </div >
    )
}