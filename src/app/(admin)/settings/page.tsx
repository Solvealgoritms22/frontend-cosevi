"use client"

import { Globe, Bell, Save, ShieldCheck, Database, Settings, AlertTriangle, Palette, Upload, X, Check, Webhook } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { GlassButton } from "@/components/ui/glass-button"
import { useTranslation } from "@/context/translation-context"
import api, { API_BASE_URL, BASE_URL } from "@/lib/api"
import { toast } from "sonner"
import Image from "next/image"

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
    const [activeSection, setActiveSection] = useState('general')

    // Brand config state
    const [logoUrl, setLogoUrl] = useState<string | null>(null)
    const [primaryColor, setPrimaryColor] = useState('#4f46e5')
    const [secondaryColor, setSecondaryColor] = useState('#1e293b')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [brandLoaded, setBrandLoaded] = useState(false)
    const [tenant, setTenant] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load current branding from localStorage & fetch full tenant details
    useEffect(() => {
        try {
            const stored = localStorage.getItem('cosevi_branding')
            if (stored) {
                const data = JSON.parse(stored)
                if (data.logoUrl) setLogoUrl(data.logoUrl)
                if (data.primaryColor) setPrimaryColor(data.primaryColor)
                if (data.secondaryColor) setSecondaryColor(data.secondaryColor)
            }
        } catch { }
        setBrandLoaded(true)

        // Fetch tenant details for API Key visibility
        api.get('/tenants/me')
            .then((res) => setTenant(res.data))
            .catch(() => console.error('Failed to fetch tenant details'));
    }, [])

    const handleGenerateApiKey = async () => {
        try {
            const res = await api.post('/tenants/api-key');
            setTenant({ ...tenant, apiKey: res.data.apiKey });
            toast.success(t('settingsToastApiKeyGenerated'));
        } catch (error) {
            toast.error(t('settingsToastApiKeyError'));
        }
    }

    const baseSections = [
        { id: 'general', title: t('settings'), icon: Settings },
        { id: 'brand', title: t('settingsBrandTitle'), icon: Palette },
        { id: 'security', title: t('security'), icon: ShieldCheck },
    ]

    const settingsSections = tenant?.plan?.toLowerCase().includes('elite')
        ? [...baseSections, { id: 'integrations', title: t('settingsIntegrationsTitle'), icon: Webhook }]
        : baseSections;

    const handlePurge = async () => {
        setIsPurging(true)
        try {
            await api.delete('/visits/purge')
            toast.success(t('settingsToastPurgeSuccess'))
            setIsConfirmOpen(false)
        } catch (error) {
            toast.error(t('settingsToastPurgeError'))
        } finally {
            setIsPurging(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error(t('settingsToastLogoFormatError'))
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(t('settingsToastLogoSizeError'))
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await api.post('/uploads/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            setLogoUrl(res.data.url)
            toast.success(t('settingsToastLogoSuccess'))
        } catch {
            toast.error(t('settingsToastLogoError'))
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveLogo = () => {
        setLogoUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSaveBranding = async () => {
        setSaving(true)
        try {
            const res = await api.patch('/tenants/branding', {
                logoUrl: logoUrl || null,
                primaryColor,
                secondaryColor,
            })

            // Update localStorage with new branding
            const brandingData = {
                logoUrl: res.data.logoUrl,
                name: res.data.name,
                primaryColor: res.data.primaryColor,
                secondaryColor: res.data.secondaryColor,
            }
            localStorage.setItem('cosevi_branding', JSON.stringify(brandingData))

            toast.success(t('settingsToastBrandSuccess'))
        } catch {
            toast.error(t('settingsToastBrandError'))
        } finally {
            setSaving(false)
        }
    }

    const fullLogoUrl = logoUrl
        ? logoUrl.startsWith('http') ? logoUrl : `${BASE_URL}${logoUrl}`
        : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 lg:p-8 max-w-7xl mx-auto space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12 px-4">
                <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-800 leading-none">
                        {t('systemDirector').substring(0, t('systemDirector').lastIndexOf(' '))} <span className="text-blue-500">{t('systemDirector').split(' ').pop()}</span>
                    </h2>
                    <p className="text-slate-600 text-base sm:text-xl font-medium tracking-tight opacity-70">{t('coreConfiguration')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {settingsSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                activeSection === section.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-slate-50 "
                            )}
                        >
                            <section.icon size={20} />
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-10">
                    <AnimatePresence mode="wait">
                        {activeSection === 'general' && (
                            <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                {/* Localization Section */}
                                <GlassPanel className="p-6 sm:p-10">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
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
                                            <input type="text" defaultValue="ENTRA Central Admin" className="w-full h-14 sm:h-16 px-5 sm:px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm sm:text-base cursor-not-allowed opacity-60" disabled />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-fluid-label font-black uppercase tracking-widest text-slate-400 px-1">{t('activeLogicLanguage')}</label>
                                            <div className="relative group">
                                                <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full h-14 sm:h-16 px-5 sm:px-8 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer text-sm sm:text-base group-hover:bg-white" >
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
                            </motion.div>
                        )}

                        {activeSection === 'brand' && brandLoaded && (
                            <motion.div key="brand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                {/* Logo Upload */}
                                <GlassPanel className="p-6 sm:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight text-slate-800">{t('settingsBrandLogoTitle')}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{t('settingsBrandLogoDesc')}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start gap-8">
                                        {/* Preview */}
                                        <div className="relative group">
                                            <div className="w-40 h-40 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-violet-400">
                                                {fullLogoUrl ? (
                                                    <Image
                                                        src={fullLogoUrl}
                                                        alt="Logo"
                                                        width={140}
                                                        height={140}
                                                        className="object-contain p-3"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                                                        <p className="text-xs text-slate-400 font-medium">{t('settingsBrandNoLogo')}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {fullLogoUrl && (
                                                <button
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 size-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Upload controls */}
                                        <div className="flex-1 space-y-4">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className={cn(
                                                    "inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm cursor-pointer transition-all",
                                                    uploading
                                                        ? "bg-slate-100 text-slate-400 cursor-wait"
                                                        : "bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200"
                                                )}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <div className="size-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                                                        {t('settingsBrandUploading')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={16} />
                                                        {t('settingsBrandSelectImage')}
                                                    </>
                                                )}
                                            </label>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-400">{t('settingsBrandFormats')}</p>
                                                <p className="text-xs text-slate-400">{t('settingsBrandMaxSize')}</p>
                                                <p className="text-xs text-slate-400">{t('settingsBrandRecommended')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </GlassPanel>

                                {/* Color Palette */}
                                <GlassPanel className="p-6 sm:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Palette size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight text-slate-800">{t('settingsBrandPaletteTitle')}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{t('settingsBrandPaletteDesc')}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Primary Color */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('settingsBrandPrimaryColor')}</label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="w-16 h-16 rounded-2xl cursor-pointer border-2 border-slate-200 p-1"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={primaryColor}
                                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                                        className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm uppercase"
                                                        maxLength={7}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-1">{t('settingsBrandPrimaryDesc')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Secondary Color */}
                                        <div className="space-y-4">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t('settingsBrandSecondaryColor')}</label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={secondaryColor}
                                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                                        className="w-16 h-16 rounded-2xl cursor-pointer border-2 border-slate-200 p-1"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={secondaryColor}
                                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                                        className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm uppercase"
                                                        maxLength={7}
                                                    />
                                                    <p className="text-xs text-slate-400 mt-1">{t('settingsBrandSecondaryDesc')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t('settingsBrandPreview')}</p>
                                        <div className="rounded-2xl overflow-hidden border border-slate-200">
                                            {/* Mock header */}
                                            <div className="h-14 flex items-center px-6 gap-4" style={{ backgroundColor: secondaryColor }}>
                                                {fullLogoUrl ? (
                                                    <Image src={fullLogoUrl} alt="Logo preview" width={80} height={32} className="object-contain" unoptimized />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-white/20" />
                                                )}
                                                <span className="text-white/80 font-bold text-sm">{t('settingsBrandMockOrg')}</span>
                                            </div>
                                            {/* Mock content */}
                                            <div className="p-6 bg-slate-50 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                                                    <div className="h-3 bg-slate-200 rounded-full w-48" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.5 }} />
                                                    <div className="h-3 bg-slate-200 rounded-full w-32" />
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <button className="px-4 py-2 rounded-xl text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                                                        {t('settingsBrandMockPrimaryBtn')}
                                                    </button>
                                                    <button className="px-4 py-2 rounded-xl text-xs font-bold border-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                                                        {t('settingsBrandMockSecondaryBtn')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GlassPanel>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <GlassButton
                                        onClick={handleSaveBranding}
                                        variant="primary"
                                        icon={saving ? undefined : Check}
                                        glow
                                        className="h-16 px-10 text-lg shadow-2xl shadow-blue-500/20"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span className="flex items-center gap-3">
                                                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t('settingsBrandSaving')}
                                            </span>
                                        ) : (
                                            t('settingsBrandSave')
                                        )}
                                    </GlassButton>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === 'security' && (
                            <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
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
                                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-4xl bg-slate-50/50 border border-slate-100 hover:border-blue-500/20 transition-all group gap-4">
                                                <div className="flex items-center gap-5">
                                                    <div className="size-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                                                        <item.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm sm:text-base">{item.title}</h4>
                                                        <p className="text-xs text-slate-400 font-medium max-w-sm sm:max-w-md">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <button className={cn(
                                                    "size-12 rounded-2xl flex items-center justify-center transition-all self-end sm:self-auto",
                                                    item.active ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-slate-200 text-slate-400"
                                                )}>
                                                    <div className={cn("size-6 rounded-full border-2 border-current flex items-center justify-center", item.active && "bg-white/20")}>
                                                        {item.active && <div className="size-2 bg-white rounded-full" />}
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </GlassPanel>
                            </motion.div>
                        )}

                        {activeSection === 'integrations' && tenant?.plan?.toLowerCase().includes('elite') && (
                            <motion.div key="integrations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                {/* API Key Section */}
                                <GlassPanel className="p-6 sm:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="size-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                                            <Webhook size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight text-slate-800">{t('settingsIntegrationsApiTitle')}</h3>
                                            <p className="text-sm text-slate-400 font-medium">{t('settingsIntegrationsApiDesc')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* API Key Card */}
                                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                            <h4 className="font-bold text-slate-800 mb-2">{t('settingsIntegrationsApiKeyTitle')}</h4>
                                            <p className="text-sm text-slate-500 mb-4">{t('settingsIntegrationsApiKeyDesc')}</p>

                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-12 bg-white border border-slate-200 rounded-xl px-4 flex items-center font-mono text-sm text-slate-600 truncate">
                                                    {tenant?.apiKey || t('settingsIntegrationsNoKey')}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(tenant?.apiKey || '');
                                                        toast.success(t('settingsToastApiKeyCopied'));
                                                    }}
                                                    className="h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors font-medium text-sm"
                                                >
                                                    {t('settingsIntegrationsCopy')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <GlassButton
                                                onClick={handleGenerateApiKey}
                                                variant="secondary"
                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                            >
                                                {tenant?.apiKey ? t('settingsIntegrationsRotate') : t('settingsIntegrationsGenerate')}
                                            </GlassButton>
                                        </div>
                                        {tenant?.apiKey && (
                                            <p className="text-xs text-red-400 text-right mt-2">
                                                {t('settingsIntegrationsWarning')}
                                            </p>
                                        )}
                                    </div>
                                </GlassPanel>

                                {/* Hardware Devices Section */}
                                <GlassPanel className="p-6 sm:p-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <Database size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight text-slate-800">{t('settingsIntegrationsHardwareTitle')}</h3>
                                                <p className="text-sm text-slate-400 font-medium">{t('settingsIntegrationsHardwareDesc')}</p>
                                            </div>
                                        </div>
                                        <GlassButton variant="primary" icon={Settings} glow>
                                            {t('settingsIntegrationsConnectNew')}
                                        </GlassButton>
                                    </div>

                                    {/* Mock Empty State / List */}
                                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                                        <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                            <Database size={32} className="text-slate-300" />
                                        </div>
                                        <h4 className="text-slate-900 font-bold mb-1">{t('settingsIntegrationsNoDevices')}</h4>
                                        <p className="text-slate-400 text-sm max-w-sm mb-6">
                                            {t('settingsIntegrationsConnectDesc')}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500">LPR-CAM-01</span>
                                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500">GATE-CTRL-02</span>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handlePurge} title={t('purgeConfirmTitle')} message={t('purgeConfirmMsg')} confirmText={isPurging ? t('syncing') : t('confirmPurge')} variant="destructive" />
        </motion.div >
    )
}