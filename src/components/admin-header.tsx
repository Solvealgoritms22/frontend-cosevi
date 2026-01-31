"use client"

import { Search, Bell, ShieldAlert, MonitorCheck, Command, Settings, ChevronDown, Languages, Archive, CheckCircle2, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/context/translation-context"
import { useNotifications } from "@/context/notification-context"
import { ConfirmDialog } from "@/components/confirm-dialog"

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { t, language, setLanguage } = useTranslation()
    const { notifications, unreadCount, markAsRead, clearRead, addNotification } = useNotifications()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/visitors?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="h-16 z-30 px-6 lg:px-8 flex items-center justify-between sticky top-0 bg-(--background)/80 backdrop-blur-md border-b border-(--border) transition-all">
            {/* Mobile Menu Trigger */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="flex md:hidden size-9 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
                >
                    <Menu size={18} />
                </button>

                {/* Search Bar - Minimalist */}
                <div className="hidden lg:flex items-center relative w-96">
                    <Search className="absolute left-3 text-slate-400 dark:text-slate-500 size-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder={t('searchPlaceholder')}
                        className="w-full h-10 pl-10 pr-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 border-transparent focus:border-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-100 transition-all outline-none"
                    />
                    <div className="absolute right-3 px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        ⌘ K
                    </div>
                </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center gap-2">
                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                        className="h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        <Languages size={14} className="text-slate-500 dark:text-slate-400" />
                        <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">{language}</span>
                    </button>

                    {/* Notification Center */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={cn(
                                "size-9 rounded-lg flex items-center justify-center transition-all relative border",
                                isNotificationOpen ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="absolute right-0 mt-3 w-80 z-50 origin-top-right"
                                >
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-black/5">
                                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{t('activityPulse')}</h3>
                                            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} {t('newBadge')}</span>
                                        </div>

                                        <div className="max-h-[350px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                                    {notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => markAsRead(n.id)}
                                                            className={cn(
                                                                "p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors relative",
                                                                !n.read && "bg-indigo-50/30 dark:bg-indigo-900/20"
                                                            )}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className={cn("mt-1 size-2 rounded-full shrink-0", !n.read ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600")} />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{n.title}</p>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{n.time || t('loggedRecently')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                                                    <CheckCircle2 size={32} strokeWidth={1.5} className="opacity-50" />
                                                    <p className="text-xs">{t('noNewNotifications')}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                            <button
                                                onClick={clearRead}
                                                className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                {t('clearNotifications')}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Status Badge */}
                    <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400">
                        <MonitorCheck size={14} />
                        <span className="text-xs font-bold">{t('systemHealthy')}</span>
                    </div>
                </div>
            </div>

        </header>
    )
}
