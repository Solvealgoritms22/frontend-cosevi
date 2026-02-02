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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-800 flex items-center gap-4">
                        <Settings className="text-indigo-500" size={36} />
                        {t('systemDirector')}
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg font-medium">{t('coreConfiguration')}</p>
                </div>
                <GlassButton variant="primary" icon={Save} glow className="h-14 px-8" >
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
                                section.active ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-50 "
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
                    <GlassPanel>
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-800 ">{t('localizationBranding')}</h3>
                                <p className="text-sm text-slate-400 font-medium">{t('globalIdentity')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t('deploymentIdentity')}</label>
                                <input type="text" defaultValue="COSEVI Central Admin" className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t('activeLogicLanguage')}</label>
                                <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none" >
                                    <option value="en">{t('englishUS')}</option>
                                    <option value="es">{t('spanishDR')}</option>
                                </select>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Security Protocols */}
                    <GlassPanel>
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-slate-800 ">{t('securityProtocols')}</h3>
                                <p className="text-sm text-slate-400 font-medium">{t('automatedProtocols')}</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            {[
                                { id: 'lpr', title: t('lprAutonomous'), desc: t('lprAutonomousDesc'), icon: Database, active: true },
                                { id: 'mfa', title: t('badgingTunnel'), desc: t('badgingTunnelDesc'), icon: Bell, active: false }
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-500/20 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 ">{item.title}</h4>
                                            <p className="text-xs text-slate-400 font-medium max-w-md">{item.desc}</p>
                                        </div>
                                    </div>
                                    <button className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center transition-all",
                                        item.active ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-400"
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