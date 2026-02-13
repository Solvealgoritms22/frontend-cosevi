"use client"

import { Check, Info, Bell, MapPin, Printer, CheckCircle, ArrowRight, User, ShieldCheck, Search, Car, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { useTranslation } from "@/context/translation-context"

export default function KioskPage() {
    const { t } = useTranslation()
    const [step, setStep] = useState(1); // 1: Welcome/Register, 2: Success
    const [formData, setFormData] = useState({
        visitorName: '',
        visitorIdNumber: '',
        licensePlate: '',
        hostEmail: 'resident@entra.com',
        hostId: '' // Will be populated when host is selected
    });
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15)

    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else if (step === 2 && timeLeft === 0) {
            setStep(1);
            setTimeLeft(15);
        }
    }, [timeLeft, step])

    // Search for hosts by email/name
    const [hosts, setHosts] = useState<any[]>([])
    const [searchingHosts, setSearchingHosts] = useState(false)

    const searchHosts = async (query: string) => {
        if (query.length < 2) {
            setHosts([])
            return
        }
        setSearchingHosts(true)
        try {
            const res = await api.get('/users')
            const filtered = res.data.filter((u: any) =>
                u.email?.toLowerCase().includes(query.toLowerCase()) ||
                u.name?.toLowerCase().includes(query.toLowerCase())
            )
            setHosts(filtered.slice(0, 5))
        } catch {
            setHosts([])
        } finally {
            setSearchingHosts(false)
        }
    }

    const selectHost = (host: any) => {
        setFormData({ ...formData, hostEmail: host.email, hostId: host.id })
        setHosts([])
    }

    const [regError, setRegError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setRegError(null);
        try {
            // Use the selected hostId or default
            const hostId = (formData as any).hostId
            if (!hostId) {
                setRegError("Please select a host from the search results.");
                setLoading(false);
                return;
            }
            await api.post('/visits', {
                visitorName: formData.visitorName,
                visitorIdNumber: formData.visitorIdNumber,
                licensePlate: formData.licensePlate,
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                hostId
            });
            setStep(2);
        } catch (error: any) {
            console.error('Registration failed:', error);
            setRegError(error.response?.data?.message || 'Registration error. Please check your details.');
        } finally {
            setLoading(false);
        }
    }

    if (step === 1) {
        return (
            <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-12 flex items-center gap-3"
                >
                    <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center">
                        <ShieldCheck size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter uppercase">ENTRA Terminal</span>
                </motion.div>

                <div className="w-full max-w-2xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/50 border border-white/10 backdrop-blur-xl rounded-[3rem] p-12 shadow-2xl"
                    >
                        <h1 className="text-4xl font-black mb-10 text-center">Visitor Check-in</h1>

                        <form onSubmit={handleRegister} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('fullName')}</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            required
                                            value={formData.visitorName}
                                            onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('documentId')}</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                        <input
                                            required
                                            value={formData.visitorIdNumber}
                                            onChange={e => setFormData({ ...formData, visitorIdNumber: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold"
                                            placeholder="001-0000000-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('licensePlate')}</label>
                                <div className="relative">
                                    <Car className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        value={formData.licensePlate}
                                        onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold uppercase"
                                        placeholder="ABC-1234"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{t('searchHost')}</label>
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        value={formData.hostEmail}
                                        onChange={e => {
                                            setFormData({ ...formData, hostEmail: e.target.value, hostId: '' })
                                            searchHosts(e.target.value)
                                        }}
                                        className="w-full bg-white/5 border border-white/10 h-16 rounded-2xl pl-16 pr-6 outline-none focus:border-blue-500/50 transition-colors font-bold"
                                        placeholder="Search resident by name or email..."
                                    />

                                    {/* Host dropdown */}
                                    {hosts.length > 0 && (
                                        <div className="absolute z-10 top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                            {hosts.map((host: { id: string; name?: string; email: string }) => (
                                                <button
                                                    key={host.id}
                                                    type="button"
                                                    onClick={() => selectHost(host)}
                                                    className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                                                >
                                                    <p className="font-bold">{host.name || host.email}</p>
                                                    <p className="text-xs text-slate-400">{host.email}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {formData.hostId && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                                            ✓ Selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            <AnimatePresence>
                                {regError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center italic"
                                    >
                                        {regError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                disabled={loading}
                                className="w-full h-20 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400/50 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                {loading ? t('processing') : (
                                    <>
                                        {t('startCheckIn')}
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-12 flex items-center gap-3"
            >
                <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-white" />
                </div>
                <span className="text-xl font-black italic tracking-tighter">ENTRA SECURE</span>
            </motion.div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="size-28 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
                    >
                        <Check className="h-14 w-14 text-emerald-400 stroke-[3px]" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
                            {t('checkInComplete').split(' ')[0]}<br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600">{t('checkInComplete').split(' ')[1]}.</span>
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
                            {t('welcome')}, <span className="text-white font-bold">{formData.visitorName}</span>.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 flex flex-col gap-6 w-full"
                    >
                        <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                <Printer size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Badge Printing</h3>
                                <p className="text-slate-400 text-sm mt-1">Please collect your access pass from the printer below.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-5 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Host Alerted</h3>
                                <p className="text-slate-400 text-sm mt-1 mb-2">Host has received your notification.</p>
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full w-fit">
                                    <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Signal Sent</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="relative group w-full max-w-sm"
                    >
                        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center p-8 text-slate-900 border-t-12 border-blue-600">
                            <div className="w-16 h-2 bg-slate-100 rounded-full mb-10" />
                            <div className="size-40 rounded-4xl bg-slate-100 overflow-hidden mb-8 border-4 border-slate-50 relative">
                                <div className="size-full bg-blue-50 flex items-center justify-center text-blue-200">
                                    <User size={80} strokeWidth={1.5} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{formData.visitorName}</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 bg-slate-100 px-3 py-1 rounded-full">Authorized Visitor</p>
                        </div>
                        <div className="absolute inset-x-10 -bottom-10 bg-blue-600/30 blur-3xl h-20 -z-10 rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-16 w-full max-w-sm"
                    >
                        <button
                            onClick={() => setStep(1)}
                            className="w-full h-20 bg-white hover:bg-slate-100 text-slate-900 rounded-3xl font-black text-xl flex items-center justify-between px-8 group transition-all relative overflow-hidden active:scale-95"
                        >
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: 0 }}
                                transition={{ duration: 15, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-1 bg-blue-600/20 w-full"
                            />
                            <span className="flex items-center gap-3">
                                <CheckCircle size={28} className="text-blue-600" />
                                {t('done')}
                            </span>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('autoClose')}</span>
                                <span className="text-sm font-bold text-blue-600">{timeLeft}s</span>
                            </div>
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}