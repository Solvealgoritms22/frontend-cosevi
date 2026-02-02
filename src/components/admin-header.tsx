"use client";

import {
    Search,
    Bell,
    ShieldAlert,
    MonitorCheck,
    Command,
    Settings,
    ChevronDown,
    Languages,
    Archive,
    CheckCircle2,
    Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/context/translation-context";
import { useNotifications } from "@/context/notification-context";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { t, language, setLanguage } = useTranslation();
    const {
        notifications,
        unreadCount,
        markAsRead,
        clearRead,
        addNotification,
    } = useNotifications();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/visitors?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="h-16 z-30 px-6 lg:px-8 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="flex lg:hidden size-9 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                    <Menu size={18} />
                </button>

                <div className="hidden lg:flex items-center relative w-96">
                    <Search className="absolute left-3 text-slate-400 size-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        placeholder={t("searchPlaceholder")}
                        className="w-full h-10 pl-10 pr-12 bg-slate-100 hover:bg-slate-50 focus:bg-white border-transparent focus:border-indigo-500 rounded-lg text-sm text-slate-800 transition-all outline-none"
                    />
                    <div className="absolute right-3 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 ">
                        ⌘ K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-6 w-px bg-slate-200 mx-1" />
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(language === "en" ? "es" : "en")}
                        className="h-9 px-3 bg-white border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-all"
                    >
                        <Languages size={14} className="text-slate-500" />
                        <span className="text-[10px] font-bold uppercase text-slate-600">
                            {language}
                        </span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className={cn(
                                "size-9 rounded-lg flex items-center justify-center transition-all relative border",
                                isNotificationOpen
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white" />
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
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                {t("activityPulse")}
                                            </h3>
                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {unreadCount} {t("newBadge")}
                                            </span>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-50">
                                                    {notifications.map((n) => (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => markAsRead(n.id)}
                                                            className={cn(
                                                                "p-4 hover:bg-slate-50 cursor-pointer transition-colors relative",
                                                                !n.read && "bg-indigo-50/30"
                                                            )}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div
                                                                    className={cn(
                                                                        "mt-1 size-2 rounded-full shrink-0",
                                                                        !n.read ? "bg-indigo-500" : "bg-slate-300"
                                                                    )}
                                                                />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                                                        {n.title}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                                        {n.message}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                                        {n.time || t("loggedRecently")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                                                    <CheckCircle2
                                                        size={32}
                                                        strokeWidth={1.5}
                                                        className="opacity-50"
                                                    />
                                                    <p className="text-xs">{t("noNewNotifications")}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 bg-slate-50 border-t border-slate-100">
                                            <button
                                                onClick={clearRead}
                                                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                            >
                                                {t("clearNotifications")}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                        <MonitorCheck size={14} />
                        <span className="text-xs font-bold">{t("systemHealthy")}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}