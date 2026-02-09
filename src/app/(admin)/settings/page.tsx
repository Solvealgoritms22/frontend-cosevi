"use client"

import { Globe, Bell, Save, ShieldCheck, Database, Settings, AlertTriangle, History } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { GlassButton } from "@/components/ui/glass-button"
import { useTranslation } from "@/context/translation-context"
import api from "@/lib/api"
import { toast } from "sonner"

const GlassPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
        "glass-panel rounded-4xl border border-white/60 p-10 shadow-2xl relative overflow-hidden",
        className
    )}>
        {children}
    </div>
)

export default function SettingsPage() {
    const { t, language, setLanguage } = useTranslation()
    const [isPurging, setIsPurging] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const settingsSections = [
        { id: 'general', title: t('settings'), icon: Settings, active: true },
        { id: 'security', title: t('security'), icon: ShieldCheck, active: false },
    ]

    const handlePurge = async () => {
        setIsPurging(true)
        try {
            await api.delete('/visits/purge')
            toast.success("System data purged successfully")
            setIsConfirmOpen(false)
        } catch (error) {
            toast.error("Failed to purge system data")
        } finally {
            setIsPurging(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 lg:p-8 max-w-7xl mx-auto space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12 px-4">
                <div className="space-y-4">
                    <h2 className="text-fluid-h2 font-black tracking-tighter text-slate-800 leading-none">
                        System <span className="text-orange-500">Director</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-xl font-medium tracking-tight opacity-70">{t('coreConfiguration')}</p>
                </div>
                <GlassButton variant="primary" icon={Save} glow className="h-16 px-10 text-lg shadow-2xl shadow-orange-500/20" >
                    {t('applyChanges')}
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                section.active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 hover:bg-slate-50 "
                            )}
                        >
                            <section.icon size={20} />
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-10">
                    {/* Localization Section */}
                    <GlassPanel className="p-6 sm:p-10">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-800 ">{t('localizationBranding')}</h3>
                                <p className="text-sm text-slate-400 font-medium">{t('globalIdentity')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8">
                            <div className="space-y-3">
                                <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('deploymentIdentity')}</label>
                                <input type="text" defaultValue="COSEVI Central Admin" className="w-full h-14 sm:h-16 px-5 sm:px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all text-sm sm:text-base cursor-not-allowed opacity-60" disabled />
                            </div>
                            <div className="space-y-3">
                                <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('activeLogicLanguage')}</label>
                                <div className="relative group">
                                    <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full h-14 sm:h-16 px-5 sm:px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer text-sm sm:text-base group-hover:bg-white" >
                                        <option value="en">{t('englishUS')}</option>
                                        <option value="es">{t('spanishDR')}</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <Globe size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Security Protocols */}
                    <GlassPanel className="p-6 sm:p-10">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-800 ">{t('securityProtocols')}</h3>
                                <p className="text-sm text-slate-400 font-medium">{t('automatedProtocols')}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-6 sm:pt-8">
                            {[
                                { id: 'lpr', title: t('lprAutonomous'), desc: t('lprAutonomousDesc'), icon: Database, active: true },
                                { id: 'mfa', title: t('badgingTunnel'), desc: t('badgingTunnelDesc'), icon: Bell, active: false }
                            ].map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-4xl bg-slate-50/50 border border-slate-100 hover:border-orange-500/20 transition-all group gap-4">
                                    <div className="flex items-center gap-5">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors shrink-0">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h4>
                                            <p className="text-xs text-slate-400 font-medium max-w-sm sm:max-w-md">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center transition-all self-end sm:self-auto",
                                        item.active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-slate-200 text-slate-400"
                                    )}>
                                        <div className={cn("size-6 rounded-full border-2 border-current flex items-center justify-center", item.active && "bg-white/20")}>
                                            {item.active && <div className="size-2 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>

                    {/* Danger Zone */}
                    <GlassPanel className="border-red-500/20 bg-red-50/10 ">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black tracking-tight text-red-600 flex items-center gap-3">
                                    <AlertTriangle size={20} /> {t('systemPurgeDirective')}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium max-w-xl">
                                    {t('systemPurgeDesc')}
                                </p>
                            </div>
                            <GlassButton onClick={() => setIsConfirmOpen(true)} variant="secondary" className="border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white shrink-0 h-14 px-8" >
                                {t('executePurge')}
                            </GlassButton>
                        </div>
                    </GlassPanel>
                </div>
            </div>
            <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handlePurge} title={t('purgeConfirmTitle')} message={t('purgeConfirmMsg')} confirmText={isPurging ? t('syncing') : t('confirmPurge')} variant="destructive" />
        </motion.div>
    )
}