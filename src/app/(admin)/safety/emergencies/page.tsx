"use client"

import { Bell, MapPin, Clock, User, CheckCircle2, AlertCircle, ChevronRight, Siren, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import api from "@/lib/api"
import { GlassButton } from "@/components/ui/glass-button"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/context/notification-context"
import { useState, useEffect } from "react"

const ITEMS_PER_PAGE = 5

interface Emergency {
    id: string;
    type: string;
    location: string;
    status: 'ACTIVE' | 'RESOLVED';
    createdAt: string;
    sender: {
        name: string;
        email: string;
    };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function EmergenciesPage() {
    const { data: emergencies, mutate } = useSWR<Emergency[]>("/emergencies", fetcher, { refreshInterval: 5000 })
    const { addNotification } = useNotifications()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const handleResolve = async (id: string) => {
        setLoadingId(id)
        try {
            await api.patch(`/emergencies/${id}/resolve`)
            addNotification({ title: 'Success', message: 'Emergency marked as resolved', type: 'success' })
            mutate()
        } catch (error) {
            addNotification({ title: 'Error', message: 'Failed to resolve emergency', type: 'error' })
        } finally {
            setLoadingId(null)
        }
    }

    const activeEmergencies = emergencies?.filter(e => e.status === 'ACTIVE') || []
    const resolvedEmergencies = emergencies?.filter(e => e.status === 'RESOLVED') || []

    const totalPages = Math.ceil(resolvedEmergencies.length / ITEMS_PER_PAGE)
    const paginatedHistory = resolvedEmergencies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    useEffect(() => {
        setCurrentPage(1)
    }, [emergencies?.length])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-10 h-full pb-10 p-8"
        >
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-800 flex items-center gap-4">
                        <Siren className="text-red-500" size={36} />
                        Active Emergencies
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg font-medium tracking-tight">Real-time alerts from residents and security units.</p>
                </div>
            </div>

            {activeEmergencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    <AnimatePresence>
                        {activeEmergencies.map((alert) => (
                            <motion.div
                                layout
                                key={alert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-4xl p-8 shadow-2xl relative overflow-hidden group hover:bg-red-500/15 transition-all duration-500"
                            >
                                <div className="absolute -top-4 -right-4 size-32 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                                    <Bell size={128} className="text-red-500" />
                                </div>
                                <div className="flex items-center gap-6 mb-8 relative z-10">
                                    <div className="size-16 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/30 animate-pulse">
                                        <AlertCircle size={32} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-red-600 uppercase tracking-tighter text-2xl">{alert.type.replace('_', ' ')}</h4>
                                        <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mt-1 opacity-80">{new Date(alert.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-6 mb-10 relative z-10">
                                    <div className="flex items-center gap-4 text-sm font-black text-slate-700 ">
                                        <div className="size-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <User size={16} className="text-slate-400 " />
                                        </div>
                                        <span>{alert.sender.name.toUpperCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-black text-slate-700 ">
                                        <div className="size-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <MapPin size={16} className="text-slate-400 " />
                                        </div>
                                        <span>{alert.location?.toUpperCase() || 'UNKNOWN COORDINATES'}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleResolve(alert.id)}
                                    disabled={loadingId === alert.id}
                                    className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl shadow-red-600/30 relative z-10 disabled:opacity-50"
                                >
                                    {loadingId === alert.id ? 'Processing...' : 'Mark as Resolved'}
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                    <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={40} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Peace and Quiet</h3>
                        <p className="text-slate-400">No active emergencies detected in the institutional perimeter.</p>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <div className="space-y-6 px-4">
                    <h3 className="text-2xl font-black tracking-tighter text-slate-800 ">Resolved History</h3>
                    <div className="glass-panel border-white/60 bg-white/40 rounded-4xl p-10 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                        {resolvedEmergencies.length === 0 ? (
                            <p className="text-center py-10 font-bold text-slate-400 italic">No historical records in current session.</p>
                        ) : (
                            paginatedHistory.map((alert) => (
                                <div key={alert.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-white/40 border border-white/60 hover:bg-white/60 transition-all group duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="size-14 rounded-2xl bg-white shadow-sm border border-white flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all duration-500 group-hover:scale-110">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-slate-800 tracking-tight">{alert.type.replace('_', ' ').toUpperCase()}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-80">SENT BY {alert.sender.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 mt-4 md:mt-0">
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">Location</p>
                                            <p className="text-sm font-black text-slate-800 ">{alert.location?.toUpperCase() || 'N/A'}</p>
                                        </div>
                                        <div className="hidden lg:block text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">Resolution</p>
                                            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                                Success
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 opacity-60">Time</p>
                                            <p className="text-sm font-black text-slate-800 ">{new Date(alert.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="size-10 rounded-xl bg-white shadow-sm border border-white flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-10 border-t border-white/20 mt-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Showing <span className="text-slate-800">{paginatedHistory.length}</span> of <span className="text-slate-800">{resolvedEmergencies.length}</span> records
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-orange-500 shadow-sm"
                                        )}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={cn(
                                                    "size-10 rounded-xl text-[10px] font-black transition-all",
                                                    currentPage === page
                                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
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
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-orange-500 shadow-sm"
                                        )}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}