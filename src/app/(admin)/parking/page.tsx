"use client"

import { Car, CircleOff, MapPin, Search, Layers, List, Grid3X3, Zap, Info, ArrowRight, Plus, Trash2, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import useSWR from "swr"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/modal"
import { useNotifications } from "@/context/notification-context"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

const spaceSchema = z.object({
    name: z.string().min(1, "Asset identifier required"),
    type: z.enum(["PARKING", "EV Charging", "RESERVED", "MAINTENANCE"]),
    status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]),
})

type SpaceFormValues = z.infer<typeof spaceSchema>

const ITEMS_PER_PAGE = 6

export default function ParkingPage() {
    const { addNotification } = useNotifications()
    const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID")
    const [currentFloor, setCurrentFloor] = useState(1)
    const [selectedSpace, setSelectedSpace] = useState<any>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null)
    const [filter, setFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    const { data: spaces = [], mutate } = useSWR("/spaces", (url) => api.get(url).then((res: any) => res.data))

    const { register, handleSubmit, reset, formState: { errors: formErrors, isSubmitting } } = useForm<SpaceFormValues>({
        resolver: zodResolver(spaceSchema),
        defaultValues: {
            type: "PARKING",
            status: "AVAILABLE"
        }
    })

    const filteredSpaces = spaces.filter((s: any) => {
        const matchesFilter = filter === 'ALL' || s.status === filter
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesFilter && matchesSearch
    })

    const totalPages = Math.ceil(filteredSpaces.length / ITEMS_PER_PAGE)
    const paginatedSpaces = filteredSpaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    useEffect(() => {
        setCurrentPage(1)
    }, [filter, searchQuery, currentFloor])

    const handleCreateSpace = async (data: SpaceFormValues) => {
        try {
            await api.post('/spaces', data)
            addNotification({ title: 'Asset Provisioned', message: `Space ${data.name} is now active in the directory`, type: 'success' })
            setIsCreateModalOpen(false)
            reset()
            mutate()
        } catch (error: any) {
            addNotification({ title: 'Provisioning Failed', message: error.response?.data?.message || 'Hardware sync error', type: 'error' })
        }
    }

    const handleUpdateSpaceStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/spaces/${id}`, { status })
            addNotification({ title: 'State Updated', message: `Space ${id} transitioned to ${status}`, type: 'success' })
            mutate()
            if (selectedSpace?.id === id) {
                setSelectedSpace({ ...selectedSpace, status })
            }
        } catch (error: any) {
            addNotification({ title: 'Update Failed', message: 'Failed to synchronize hardware state', type: 'error' })
        }
    }

    const handleDeleteSpace = async (id: string) => {
        try {
            await api.delete(`/spaces/${id}`)
            addNotification({ title: 'Asset Decommissioned', message: `Space ${id} removed from logical directory`, type: 'success' })
            setSpaceToDelete(null)
            setSelectedSpace(null)
            mutate()
        } catch (error: any) {
            addNotification({ title: 'Decommission Error', message: 'Failed to purge asset record', type: 'error' })
        }
    }

    return (
        <div className="flex flex-col gap-10 sm:gap-12 max-w-[1500px] mx-auto px-2 sm:px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-4">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-800 leading-none">Parking <span className="text-blue-500 opacity-80">Logistics</span></h1>
                    <p className="text-slate-500 text-xl font-medium tracking-tight opacity-70">Level 1 & 2 • Real-time Hardware Monitoring</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 p-2 bg-white/40 border border-white/60 rounded-3xl shadow-sm">
                        <button onClick={() => setViewMode("GRID")} className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === "GRID" ? "bg-white shadow-md text-blue-500" : "text-slate-400 hover:text-slate-600 ")} >
                            <Grid3X3 size={20} />
                        </button>
                        <button onClick={() => setViewMode("LIST")} className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === "LIST" ? "bg-white shadow-md text-blue-500" : "text-slate-400 hover:text-slate-600 ")} >
                            <List size={20} />
                        </button>
                    </div>
                    <GlassButton onClick={() => setIsCreateModalOpen(true)} variant="primary" icon={Plus} glow >
                        Create Space
                    </GlassButton>
                </div>
            </div>

            {/* Quick Action Bar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Visual Map Section */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                    <GlassCard elevation="sm" className="p-4 sm:p-10 border-white/40">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-8">
                                <div className="px-6 py-2.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 shadow-sm">Zone {String.fromCharCode(64 + currentFloor)}-{currentFloor}</div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 ">
                                        <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]" /> Available
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 ">
                                        <span className="size-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.4)]" /> Occupied
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400 ">
                                        <span className="size-2.5 rounded-full bg-slate-300" /> Reserved
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentFloor(currentFloor >= 2 ? 1 : currentFloor + 1)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors group" >
                                <Layers size={16} className="group-hover:rotate-12 transition-transform" /> Switch Facility Level
                            </button>
                        </div>

                        {/* Interactive View Content */}
                        <div className="min-h-[500px]">
                            {paginatedSpaces.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 gap-4">
                                    <div className="size-20 rounded-full bg-white/40 flex items-center justify-center">
                                        <CircleOff size={40} strokeWidth={1.5} />
                                    </div>
                                    <p className="text-xl font-black uppercase tracking-widest opacity-60">No hay parqueos disponibles</p>
                                </div>
                            ) : viewMode === "GRID" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-12 p-2 sm:p-4">
                                    {paginatedSpaces.map((space: any, i: number) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05, duration: 0.4 }}
                                            layoutId={space.id}
                                            key={space.id}
                                            onClick={() => setSelectedSpace(space)}
                                            className={cn(
                                                "aspect-square rounded-4xl border-2 cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500",
                                                selectedSpace?.id === space.id ? "scale-95 shadow-inner ring-4 ring-blue-500/20" : "hover:scale-[1.02] hover:shadow-2xl",
                                                space.status === 'AVAILABLE' ? "bg-white border-white " : space.status === 'OCCUPIED' ? "bg-white border-red-100 " : "bg-slate-100 border-slate-200 "
                                            )}
                                        >
                                            {/* Status Background Gradient */}
                                            <div className={cn(
                                                "absolute inset-0 opacity-20 transition-all duration-500",
                                                space.status === 'AVAILABLE' ? "bg-linear-to-br from-emerald-400 via-transparent to-transparent group-hover:opacity-30" : space.status === 'OCCUPIED' ? "bg-linear-to-br from-red-400 via-transparent to-transparent group-hover:opacity-30" : "bg-linear-to-br from-slate-400 via-transparent to-transparent"
                                            )} />

                                            {/* Top Status Indicator */}
                                            <div className="absolute top-8 right-8 flex flex-col items-end gap-1">
                                                <div className={cn(
                                                    "size-5 rounded-full shadow-lg",
                                                    space.status === 'AVAILABLE' ? "bg-emerald-400 shadow-emerald-400/50 animate-pulse" : space.status === 'OCCUPIED' ? "bg-red-500 shadow-red-500/50" : "bg-slate-400"
                                                )} />
                                            </div>

                                            {/* Central Content */}
                                            <div className="relative z-10 flex flex-col items-center justify-center gap-6 w-full h-full p-4 sm:p-12">
                                                <h3 className={cn(
                                                    "text-6xl font-black tracking-tighter transition-colors duration-300 text-center leading-none",
                                                    space.status === 'AVAILABLE' ? "text-slate-800 " : space.status === 'OCCUPIED' ? "text-red-500 " : "text-slate-400"
                                                )}>
                                                    {space.name}
                                                </h3>
                                                <div className="h-12 flex items-center justify-center">
                                                    <AnimatePresence mode="wait">
                                                        {space.status === 'OCCUPIED' ? (
                                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-50 border border-red-100 shadow-sm" >
                                                                <Car size={20} className="text-red-500" />
                                                                <span className="text-sm font-black uppercase tracking-widest text-red-600 ">{space.vehicle || 'Occupied'}</span>
                                                            </motion.div>
                                                        ) : space.status === 'AVAILABLE' ? (
                                                            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="px-6 py-3 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm" >
                                                                <span className="text-sm font-black uppercase tracking-widest text-emerald-600 ">Available</span>
                                                            </motion.div>
                                                        ) : (
                                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{space.status}</span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Bottom Decoration */}
                                            {space.type === "EV Charging" && (
                                                <div className="absolute bottom-8 left-8 text-amber-500/80">
                                                    <Zap size={32} fill="currentColor" />
                                                </div>
                                            )}

                                            {/* Hover Reveal Details */}
                                            <div className="absolute bottom-8 right-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <ArrowRight size={32} className="text-slate-400 " />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-hidden bg-white/30 rounded-3xl border border-white/60 ">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-white ">
                                                <th className="px-10 py-6">Space Identity</th>
                                                <th className="px-10 py-6">State</th>
                                                <th className="px-10 py-6">Allocation Type</th>
                                                <th className="px-10 py-6">Occupant</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/40 ">
                                            {paginatedSpaces.map((space: any) => (
                                                <tr key={space.id} onClick={() => setSelectedSpace(space)} className={cn(
                                                    "group cursor-pointer transition-all duration-300",
                                                    selectedSpace?.id === space.id ? "bg-white/60 shadow-lg" : "hover:bg-white/40 "
                                                )} >
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-black text-xs border border-blue-100 ">{space.name}</div>
                                                            <span className="font-bold text-slate-800 ">Spot Asset {space.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className={cn(
                                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                                            space.status === 'AVAILABLE' ? "bg-emerald-50 text-emerald-600 border-emerald-100 " :
                                                                space.status === 'OCCUPIED' ? "bg-red-50 text-red-600 border-red-100 " :
                                                                    "bg-slate-50 text-slate-500 border-slate-100 "
                                                        )}>
                                                            {space.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 ">
                                                            <Layers size={14} className="text-[#f2a229" /> {space.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3 text-sm font-black text-slate-800 ">
                                                            <Car size={16} className={space.status === 'OCCUPIED' ? "text-red-500" : "text-slate-300 "} /> {space.vehicle || <span className="text-slate-300 font-medium">---</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Pagination UI */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-10 border-t border-white/20 mt-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Showing <span className="text-slate-800">{paginatedSpaces.length}</span> of <span className="text-slate-800">{filteredSpaces.length}</span> spaces
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === 1 ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
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
                                            "size-10 rounded-xl flex items-center justify-center transition-all border border-white/60",
                                            currentPage === totalPages ? "opacity-30 cursor-not-allowed" : "bg-white/40 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm"
                                        )}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Info Panel / Filter */}
                <div className="xl:col-span-4 flex flex-col gap-8 sticky top-32">
                    <GlassCard elevation="sm" className="p-4 sm:p-10 border-white/40">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Quick Lookup</h3>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/40 blur-md rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 h-5 w-5 z-10 transition-all" />
                                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="relative z-10 w-full h-16 pl-14 pr-6 bg-white/40 border border-white/60 rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-400 tracking-tight focus:ring-4 focus:ring-blue-500/5 transition-all" placeholder="Spot or vehicle identity..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Filter State</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'].map((opt) => (
                                        <button key={opt} onClick={() => setFilter(opt)} className={cn(
                                            "w-full h-16 px-8 rounded-2xl text-left text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-between group",
                                            filter === opt ? "bg-blue-50 text-blue-600 border-blue-100 shadow-sm" : "bg-white/30 border-transparent hover:bg-white/60 text-slate-500 "
                                        )} >
                                            <div className="flex items-center gap-4">
                                                <div className={cn("size-2 rounded-full", opt === 'ALL' ? "bg-blue-500" : opt === 'AVAILABLE' ? "bg-emerald-400" : opt === 'OCCUPIED' ? "bg-red-400" : "bg-slate-400")} />
                                                {opt === 'ALL' ? 'Show All Spaces' : opt}
                                            </div>
                                            <ArrowRight size={16} className={cn("transition-all duration-300", filter === opt ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-60")} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <AnimatePresence>
                        {selectedSpace ? (
                            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="group" >
                                <GlassCard elevation="xl" className="p-4 sm:p-10 border-blue-200/50 bg-blue-50/20">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#f2a229">Asset Identifier</span>
                                            <h2 className="text-5xl font-black italic tracking-tighter text-slate-800 leading-none">{selectedSpace.name}</h2>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                                            selectedSpace.status === 'AVAILABLE' ? "bg-emerald-500 text-white shadow-emerald-500/20" : selectedSpace.status === 'OCCUPIED' ? "bg-red-500 text-white shadow-red-500/20" : "bg-slate-800 text-white"
                                        )}>
                                            {selectedSpace.status}
                                        </div>
                                    </div>
                                    <div className="space-y-8 mb-12">
                                        <div className="flex items-center gap-6 p-6 bg-white/40 rounded-3xl border border-white shadow-sm">
                                            <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Car size={32} strokeWidth={1.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ">Current Occupant</p>
                                                <p className="font-black text-xl text-slate-800 tracking-tight">{selectedSpace.vehicle || 'Not Detected'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 p-6 bg-white/40 rounded-3xl border border-white shadow-sm">
                                            <div className="size-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Info size={32} strokeWidth={1.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ">Configuration</p>
                                                <p className="font-black text-xl text-slate-800 tracking-tight">{selectedSpace.type} • L{selectedSpace.level}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <GlassButton onClick={() => handleUpdateSpaceStatus(selectedSpace.id, 'AVAILABLE')} variant="secondary" className="h-14 bg-emerald-500! text-white! border-transparent! hover:bg-emerald-600! shadow-lg shadow-emerald-500/20" >
                                                Available
                                            </GlassButton>
                                            <GlassButton onClick={() => handleUpdateSpaceStatus(selectedSpace.id, 'OCCUPIED')} variant="secondary" className="h-14 bg-red-500! text-white! border-transparent! hover:bg-red-600! shadow-lg shadow-red-500/20" >
                                                Occupied
                                            </GlassButton>
                                        </div>
                                        <button onClick={() => setSpaceToDelete(selectedSpace.id)} className="h-14 w-full bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-red-600 transition-all active:scale-95" >
                                            Decommission Space
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ) : (
                            <div className="bg-white/20 border-2 border-dashed border-white/60 rounded-[2.5rem] p-16 flex flex-col items-center text-center gap-6 animate-pulse">
                                <div className="size-20 rounded-full bg-white/40 flex items-center justify-center text-slate-400 ">
                                    <MapPin size={40} strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-black text-slate-400/80 uppercase tracking-widest leading-relaxed">System Idle<br />Waiting for Asset Interaction</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Space Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); reset() }} title="Provision Parking Asset">
                <form onSubmit={handleSubmit(handleCreateSpace)} className="space-y-10 p-6">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Space Identifier</label>
                        <input {...register("name")} className={cn(
                            "w-full px-8 h-16 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all",
                            formErrors.name && "ring-2 ring-red-500/20 border-red-200 "
                        )} placeholder="e.g. ALPHA-01" />
                        {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-2 px-4 italic uppercase">{formErrors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Asset Class</label>
                            <select {...register("type")} className={cn(
                                "w-full px-8 h-16 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none cursor-pointer",
                                formErrors.type && "ring-2 ring-red-500/20 border-red-200"
                            )} >
                                <option value="PARKING">Standard Parking</option>
                                <option value="EV Charging">EV Charging Station</option>
                                <option value="RESERVED">Executive Reserved</option>
                                <option value="MAINTENANCE">Maintenance Zone</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Initial State</label>
                            <select {...register("status")} className={cn(
                                "w-full px-8 h-16 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none cursor-pointer",
                                formErrors.status && "ring-2 ring-red-500/20 border-red-200"
                            )} >
                                <option value="AVAILABLE">Available</option>
                                <option value="OCCUPIED">Occupied / Test</option>
                                <option value="RESERVED">Provisionally Reserved</option>
                                <option value="MAINTENANCE">Under Maintenance</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-6 pt-6">
                        <button type="button" onClick={() => { setIsCreateModalOpen(false); reset() }} className="flex-1 h-16 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all font-inter" >
                            Cancel Provisioning
                        </button>
                        <GlassButton type="submit" disabled={isSubmitting} variant="primary" className="flex-1 h-16" glow >
                            {isSubmitting ? 'Syncing...' : 'Provision Space'}
                        </GlassButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmation Dialog */}
            <ConfirmDialog isOpen={!!spaceToDelete} onClose={() => setSpaceToDelete(null)} onConfirm={() => spaceToDelete && handleDeleteSpace(spaceToDelete)} title="Decommission Parking Asset" message="Are you sure you want to remove this space from the logical directory? Physical hardware will remain detectable but unmanaged." confirmText="Decommission" variant="destructive" />
        </div>
    )
}