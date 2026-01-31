"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    History,
    SquareParking,
    ShieldCheck,
    BarChart3,
    Settings,
    LogOut,
    Users,
    AlertTriangle,
    Bell,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import api, { API_BASE_URL } from "@/lib/api"
// Temporary translation fallback
import { useTranslation } from "@/context/translation-context"

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname()
    const { t } = useTranslation()
    const router = useRouter()
    const [user, setUser] = useState<{ name: string; email: string; role: string; profileImage?: string } | null>(null)
    const [collapsed, setCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        // Fetch current user profile
        api.get('/auth/profile')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
        router.push('/login')
    }

    const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
    const userName = user?.name || 'Loading...'
    const userRole = user?.role || 'User'

    const itms = [
        { title: t('dashboard'), href: "/", icon: LayoutDashboard },
        { title: t('visitorLogs'), href: "/visitors", icon: History },
        { title: t('safety'), href: "/safety", icon: ShieldCheck },
        { title: t('parkingControl'), href: "/parking", icon: SquareParking },
        { title: t('incidentReports'), href: "/safety/reports", icon: AlertTriangle },
        { title: t('emergencies'), href: "/safety/emergencies", icon: Bell },
        { title: t('analytics'), href: "/reports", icon: BarChart3 },
        { title: t('users'), href: "/users", icon: Users },
        { title: t('settings'), href: "/settings", icon: Settings },
    ]

    const [orgName, setOrgName] = useState('COSEVI')

    useEffect(() => {
        const savedOrg = localStorage.getItem('cosevi_org_name')
        if (savedOrg) setOrgName(savedOrg)
    }, [])

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={cn(
                "fixed md:sticky top-0 left-0 h-full transition-all duration-300 z-50 flex flex-col shrink-0",
                "bg-(--sidebar-background) backdrop-blur-xl border-r border-(--sidebar-border)",
                collapsed ? "w-20" : "w-72",
                "md:rounded-r-3xl md:h-[calc(100vh-2rem)] md:top-4 md:ml-4 shadow-2xl shadow-indigo-500/5",
                !isMobile && "hidden md:flex", // Hide on mobile if not open (controlled by isOpen prop implicitly via standard mobile generic drawer logic usually, but here distinct)
                isMobile && (isOpen ? "translate-x-0 w-80 rounded-r-3xl h-full top-0 ml-0 fixed" : "-translate-x-full fixed")
            )}>
                {/* Collapse Toggle (Desktop Only) */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-full shadow-md text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hidden md:flex items-center justify-center transition-transform hover:scale-110 z-50"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 md:hidden hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Logo Section */}
                <div className={cn("flex flex-col items-center gap-4 transition-all duration-300", collapsed ? "py-8 px-2" : "p-8")}>
                    <div className={cn("rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 text-white transition-all", collapsed ? "size-10" : "size-12")}>
                        <ShieldCheck className={cn("transition-all", collapsed ? "size-5" : "size-6")} strokeWidth={2} />
                    </div>

                    {!collapsed && (
                        <div className="text-center w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-none">{orgName}</h1>
                            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Enterprise Admin</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto custom-scrollbar">
                    {itms.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 relative group cursor-pointer",
                                    isActive
                                        ? "bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.title : undefined}
                            >
                                <Icon size={20} className={cn(
                                    "shrink-0 transition-colors",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                )} />

                                {!collapsed && (
                                    <span className="text-sm truncate animate-in fade-in slide-in-from-left-2 duration-200">
                                        {item.title}
                                    </span>
                                )}

                                {isActive && !collapsed && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Profile Footer */}
                <div className={cn("p-4 border-t border-(--border) bg-slate-50/50 dark:bg-slate-800/50", collapsed ? "px-2" : "px-4")}>
                    <div className={cn("flex items-center gap-3 transition-all", collapsed ? "justify-center flex-col" : "")}>
                        <div className="size-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs ring-2 ring-white dark:ring-slate-900 cursor-help overflow-hidden" title={userName}>
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage.startsWith('http') ? user.profileImage : `${API_BASE_URL}${user.profileImage}`}
                                    alt={userName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                userInitials
                            )}
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{userName}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate opacity-80">{userRole}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className={cn(
                                "flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all",
                                collapsed ? "size-8 mt-2" : "size-8 shrink-0"
                            )}
                            title="Log out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
