"use client"

import { ShieldCheck, Search, Plus, FileText, CheckCircle2, Clock, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import api from "@/lib/api"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Modal } from "@/components/modal"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { GlassButton } from "@/components/ui/glass-button"

import { useTranslation } from "@/context/translation-context"

interface Visit {
    id: string;
    visitorName: string;
    visitorIdNumber: string;
    licensePlate: string;
    status: 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT';
    createdAt: string;
    validUntil?: string;
}

type RecordFormValues = z.infer<ReturnType<typeof getRecordSchema>>

const getRecordSchema = (t: any) => z.object({
    visitorName: z.string().min(1, t('visitorNameRequired')),
    visitorIdNumber: z.string().min(1, t('idNumberRequired')),
    licensePlate: z.string().min(1, t('licensePlateRequired')),
})

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function SafetyPage() {
    const { t, language } = useTranslation()
    const recordSchema = getRecordSchema(t)
    const { data: visits, mutate, isLoading } = useSWR<Visit[]>("/visits", fetcher)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RecordFormValues>({
        resolver: zodResolver(recordSchema)
    })

    const visitsArray = visits || []

    // Stats based on real data
    const completed = visitsArray.filter((v) => v.status === 'CHECKED_OUT').length
    const pending = visitsArray.filter((v) => v.status === 'PENDING').length
    const active = visitsArray.filter((v) => v.status === 'CHECKED_IN').length

    // Map visits to "induction" style records with dynamic progress
    const inductions = visitsArray.map((v) => {
        let progress = 0
        if (v.status === 'CHECKED_OUT') {
            progress = 100
        } else if (v.status === 'CHECKED_IN') {
            const start = new Date(v.createdAt).getTime()
            const end = v.validUntil ? new Date(v.validUntil).getTime() : start + 4 * 60 * 60 * 1000
            const now = Date.now()

            if (now >= end) {
                progress = 100
            } else {
                const total = end - start
                const elapsed = now - start
                progress = Math.min(Math.round((elapsed / total) * 100), 100)
            }
        }

        return {
            id: v.id,
            type: v.status === 'CHECKED_IN' ? (language === 'es' ? 'Acceso Activo' : 'Active Access') : v.status === 'CHECKED_OUT' ? (language === 'es' ? 'Visita Completada' : 'Completed Visit') : (language === 'es' ? 'Pendiente de Aprobación' : 'Pending Approval'),
            contractor: v.visitorName || 'Unknown',
            date: new Date(v.createdAt).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            expiration: v.validUntil ? new Date(v.validUntil).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
            progress: progress,
            status: v.status
        }
    }).filter((ind) =>
        ind.contractor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateRecord = async (data: RecordFormValues) => {
        setIsSubmitting(true)

        try {
            await api.post('/visits', {
                ...data,
                hostId: localStorage.getItem('userId') || 'default-host-id',
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            toast.success('Access record created')
            setIsCreateModalOpen(false)
            mutate()
            reset()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create record')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/visits/${id}`)
            toast.success('Record deleted')
            mutate()
        } catch (error: any) {
            toast.error('Failed to delete')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8 h-full"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100 flex items-center gap-4">
                        <ShieldCheck className="text-indigo-500" size={36} />
                        {t('safetyAccessControl')}
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 mt-2 text-lg font-medium">{t('manageAccessRecords')}</p>
                </div>
                <GlassButton
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="primary"
                    icon={Plus}
                    glow
                    className="h-14 px-8"
                >
                    {t('newAccessRecord')}
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                        <Skeleton className="h-32 rounded-3xl" />
                    </>
                ) : (
                    <>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl shadow-lg shadow-emerald-500/5 group hover:bg-emerald-500/15 transition-all">
                            <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('completedVisits')}</p>
                            <h3 className="text-6xl font-black mt-3 tracking-tighter text-emerald-600 tabular-nums">{completed}</h3>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-3xl shadow-lg shadow-orange-500/5 group hover:bg-orange-500/15 transition-all">
                            <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('activeNow')}</p>
                            <h3 className="text-6xl font-black mt-3 tracking-tighter text-orange-600 tabular-nums">{active}</h3>
                        </div>
                        <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-3xl shadow-lg shadow-indigo-500/5 group hover:bg-indigo-500/15 transition-all">
                            <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em]">{t('pendingApproval')}</p>
                            <h3 className="text-6xl font-black mt-3 tracking-tighter text-indigo-600 tabular-nums">{pending}</h3>
                        </div>
                    </>
                )}
            </div>

            <div className="glass-panel rounded-4xl border border-white/60 dark:border-slate-700/60 p-10 flex flex-col gap-10 shadow-2xl elevation-3 relative overflow-hidden">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black tracking-tighter text-slate-800 dark:text-slate-100">{t('accessRecords')}</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-white/40 dark:bg-slate-800/40 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchPlaceholder').split(' ')[0] + '...'}
                                className="relative z-10 pl-11 pr-5 h-12 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/5 w-60 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-28 rounded-3xl w-full" />
                            <Skeleton className="h-28 rounded-3xl w-full" />
                            <Skeleton className="h-28 rounded-3xl w-full" />
                        </>
                    ) : inductions.length === 0 ? (
                        <div className="text-center py-20 px-8">
                            <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600">
                                <Search size={32} />
                            </div>
                            <p className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">{t('noAccessRecordsFound')}</p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{t('adjustSearchFilters')}</p>
                        </div>
                    ) : (
                        inductions.map((ind) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={ind.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-7 rounded-3xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-white dark:hover:border-slate-600 transition-all group relative elevation-1 hover:elevation-2 hover:scale-[1.01] duration-500"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-white dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-110">
                                        <FileText size={28} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xl text-slate-800 dark:text-slate-100 tracking-tight">{ind.type}</p>
                                        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 opacity-80">{ind.contractor}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 mt-6 sm:mt-0">
                                    <div className="hidden lg:block text-right">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1 opacity-60">Created</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-slate-100">{ind.date}</p>
                                    </div>
                                    <div className="w-48">
                                        <div className="flex items-center justify-between text-[10px] mb-2 px-1">
                                            <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                                            <span className="font-black text-slate-800 dark:text-slate-100 tabular-nums">{ind.progress}%</span>
                                        </div>
                                        <div className="w-full bg-white/50 dark:bg-slate-700/50 h-2.5 rounded-full overflow-hidden border border-white/60 dark:border-slate-600 p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ind.progress}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className={cn(
                                                    "h-full rounded-full transition-colors shadow-sm",
                                                    ind.progress === 100 ? "bg-emerald-400" : "bg-indigo-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] shadow-sm min-w-[140px] text-center",
                                        ind.status === 'CHECKED_IN' ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800" :
                                            ind.status === 'CHECKED_OUT' ? "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700" :
                                                "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800"
                                    )}>
                                        {ind.status.replace('_', ' ')}
                                    </div>
                                    <button
                                        onClick={() => setRecordToDelete(ind.id)}
                                        className="size-12 rounded-xl bg-red-50/20 dark:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-800 hover:bg-white dark:hover:bg-slate-800 flex items-center justify-center text-red-400 group-hover:scale-110 transition-all duration-500 hover:shadow-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="flex items-center justify-center">
                    <p className="text-sm font-semibold text-muted-foreground">Showing {inductions.length} of {visitsArray.length} records</p>
                </div>
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); reset() }} title={t('newAccessRecord')}>
                <form onSubmit={handleSubmit(handleCreateRecord)} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('visitorName')}</label>
                        <input
                            {...register("visitorName")}
                            className={cn(
                                "w-full mt-1 p-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20",
                                errors.visitorName && "ring-1 ring-red-500/50 border-red-500/50"
                            )}
                        />
                        {errors.visitorName && <p className="text-[10px] text-red-500 font-bold mt-1 px-2 italic uppercase">{errors.visitorName.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('idNumber')}</label>
                        <input
                            {...register("visitorIdNumber")}
                            className={cn(
                                "w-full mt-1 p-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20",
                                errors.visitorIdNumber && "ring-1 ring-red-500/50 border-red-500/50"
                            )}
                        />
                        {errors.visitorIdNumber && <p className="text-[10px] text-red-500 font-bold mt-1 px-2 italic uppercase">{errors.visitorIdNumber.message}</p>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('licensePlate')}</label>
                        <input
                            {...register("licensePlate")}
                            className={cn(
                                "w-full mt-1 p-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20",
                                errors.licensePlate && "ring-1 ring-red-500/50 border-red-500/50"
                            )}
                        />
                        {errors.licensePlate && <p className="text-[10px] text-red-500 font-bold mt-1 px-2 italic uppercase">{errors.licensePlate.message}</p>}
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 pressable active:scale-95 transition-all"
                    >
                        {isSubmitting ? t('creating') : t('createRecord')}
                    </button>
                </form>
            </Modal>
            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!recordToDelete}
                onClose={() => setRecordToDelete(null)}
                onConfirm={() => recordToDelete && handleDelete(recordToDelete)}
                title={t('deleteSafetyRecord')}
                message={t('deleteSafetyRecordMsg')}
                confirmText={t('deleteRecord')}
                variant="destructive"
            />
        </motion.div>
    )
}

