"use client"

import { Modal } from "@/components/modal"
import { GlassButton } from "@/components/ui/glass-button"
import { UserAvatar } from "@/components/user-avatar"
import { useSocket } from "@/context/socket-context"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { Activity, AlertTriangle, ChevronRight, FileText, Filter, MessageSquare, Search, Send } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: {
        name: string;
        role: string;
        profileImage: string | null;
    };
}

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
    comments: Comment[];
}

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export default function SafetyReportsPage() {
    const { data: reports, mutate } = useSWR<Report[]>("/reports", fetcher)
    const { socket } = useSocket()
    const [search, setSearch] = useState("")
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [newComment, setNewComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!socket) return

        const handleRefresh = async (payload?: any) => {
            console.log('Real-time incident update received:', payload)
            mutate()

            // If the updated report is the one currently selected, refresh it
            if (payload && selectedReport) {
                const reportId = payload.incidentReportId || payload.id
                if (reportId === selectedReport.id) {
                    const updatedReports = await fetcher("/reports")
                    const updated = updatedReports.find((r: Report) => r.id === selectedReport.id)
                    if (updated) setSelectedReport(updated)
                }
            }
        }

        socket.on('incidentCreated', handleRefresh)
        socket.on('commentAdded', handleRefresh)
        socket.on('incidentStatusUpdated', handleRefresh)

        return () => {
            socket.off('incidentCreated', handleRefresh)
            socket.off('commentAdded', handleRefresh)
            socket.off('incidentStatusUpdated', handleRefresh)
        }
    }, [socket, selectedReport, mutate])

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

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedReport || !newComment.trim()) return

        setIsSubmitting(true)
        try {
            await api.post(`/reports/${selectedReport.id}/comments`, { text: newComment })
            toast.success("Comment added successfully")
            setNewComment("")
            mutate() // Refresh data
            // Update selected report in modal too
            const updatedReports = await fetcher("/reports")
            const updated = updatedReports.find((r: Report) => r.id === selectedReport.id)
            if (updated) setSelectedReport(updated)
        } catch (error) {
            toast.error("Failed to add comment")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!selectedReport) return
        try {
            await api.patch(`/reports/${selectedReport.id}/status`, { status })
            toast.success(`Status updated to ${status}`)
            mutate()
            setSelectedReport({ ...selectedReport, status: status as any })
        } catch (error) {
            toast.error("Failed to update status")
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
                            onClick={() => setSelectedReport(report)}
                            className="glass-panel border-white/60 bg-white/40 rounded-4xl p-10 flex items-start gap-10 group transition-all duration-500 hover:scale-[1.01] cursor-pointer"
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
                                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden">
                                            <UserAvatar name={report.reporter.name} iconSize={20} />
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 opacity-60">Feedback</p>
                                            <p className="text-sm font-black text-slate-800 ">{report.comments?.length || 0} COMMENTS</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="size-16 p-0 flex items-center justify-center rounded-3xl bg-white/40 border border-white/60 group-hover:bg-white group-hover:shadow-2xl transition-all">
                                <ChevronRight size={28} className="text-indigo-500" />
                            </div>
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

            {/* Detail & Comment Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title="Investigation Log"
                className="max-w-4xl"
            >
                {selectedReport && (
                    <div className="space-y-8 p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-slate-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusColor(selectedReport.status))}>
                                        {selectedReport.status}
                                    </span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">{selectedReport.type.replace('_', ' ')}</h3>
                                <p className="text-slate-500 text-lg leading-relaxed">{selectedReport.description}</p>
                            </div>
                            <div className="flex flex-col gap-4 min-w-[200px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Actions</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {['OPEN', 'INVESTIGATING', 'RESOLVED'].map((stat) => (
                                        <button
                                            key={stat}
                                            onClick={() => handleUpdateStatus(stat)}
                                            className={cn(
                                                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                selectedReport.status === stat
                                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                            )}
                                        >
                                            Set as {stat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                                <MessageSquare className="text-indigo-500" size={20} />
                                Discussion ({selectedReport.comments?.length || 0})
                            </h4>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {selectedReport.comments?.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group">
                                        <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                                            <UserAvatar src={comment.author.profileImage} name={comment.author.name} role={comment.author.role} iconSize={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-slate-800">{comment.author.name}</span>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                                                    {comment.author.role}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-300 ml-auto">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 group-hover:bg-slate-100 transition-colors">
                                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{comment.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!selectedReport.comments || selectedReport.comments.length === 0) && (
                                    <div className="py-10 text-center space-y-3 opacity-30">
                                        <MessageSquare size={32} className="mx-auto" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No comments yet</p>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="flex gap-4 pt-4 border-t border-slate-100">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment or internal note..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full pl-6 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                                    />
                                </div>
                                <GlassButton
                                    type="submit"
                                    variant="primary"
                                    className="px-8 h-14"
                                    glow
                                    disabled={isSubmitting || !newComment.trim()}
                                >
                                    <Send size={18} />
                                </GlassButton>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
        </motion.div>
    )
}
