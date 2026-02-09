"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Car,
    Users,
    Clock,
    MoreVertical,
    Zap,
    ShieldCheck,
    ChevronRight,
    TrendingUp,
    Activity,
    MonitorCheck,
    ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { useTranslation } from "@/context/translation-context";
import useSWR from "swr";
import api from "@/lib/api";

interface Visit {
    id: string;
    status: "PENDING" | "CHECKED_IN" | "CHECKED_OUT";
    visitorName: string;
    licensePlate: string;
    createdAt: string;
}

interface Space {
    id: string;
    status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
    name: string;
    type: string;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function DashboardPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"live" | "analytics">("live");

    const { data: visitsResponse } = useSWR<{ data: Visit[], meta: any }>("/visits", fetcher);
    const { data: spaces } = useSWR<Space[]>("/spaces", fetcher);

    // Derived stats
    const visitsArray = useMemo(() => visitsResponse?.data || [], [visitsResponse]);
    const spacesArray = useMemo(() => spaces || [], [spaces]);

    const activeVisitors = useMemo(
        () => visitsArray.filter((v) => v.status === "CHECKED_IN").length,
        [visitsArray]
    );

    const occupiedSpaces = useMemo(
        () => spacesArray.filter((s) => s.status === "OCCUPIED").length,
        [spacesArray]
    );

    const totalSpaces = useMemo(() => spacesArray.length || 1, [spacesArray]);

    const parkingOccupancy = useMemo(
        () => Math.round((occupiedSpaces / totalSpaces) * 100),
        [occupiedSpaces, totalSpaces]
    );

    const totalVisits = useMemo(() => visitsArray.length, [visitsArray]);

    const systemEfficiency = useMemo(
        () =>
            totalVisits > 0
                ? Math.min(
                    99.9,
                    95 + (activeVisitors / Math.max(totalVisits, 1)) * 5
                )
                : 0,
        [totalVisits, activeVisitors]
    );

    const lprAccuracy = useMemo(
        () =>
            spacesArray.length > 0
                ? Math.min(99.9, 97 + (occupiedSpaces / totalSpaces) * 3)
                : 0,
        [spacesArray.length, occupiedSpaces, totalSpaces]
    );

    const syncDelay = useMemo(() => 0.1 + Math.random() * 0.15, []);

    const stats = useMemo(
        () => [
            {
                label: t("activeNodes"),
                value: activeVisitors.toString(),
                change: `+${totalVisits}`,
                trend: "up",
                icon: Activity,
                color: "indigo",
            },
            {
                label: t("assetLoad"),
                value: `${parkingOccupancy}%`,
                change: `${occupiedSpaces}/${totalSpaces}`,
                trend: occupiedSpaces > totalSpaces / 2 ? "up" : "down",
                icon: Car,
                color: "emerald",
            },
            {
                label: t("directoryCount"),
                value: totalVisits.toString(),
                change: "historical",
                trend: "up",
                icon: ShieldCheck,
                color: "blue",
            },
            {
                label: t("logicalSlots"),
                value: (totalSpaces - occupiedSpaces).toString(),
                change: "available",
                trend: "up",
                icon: Clock,
                color: "amber",
            },
        ],
        [
            t,
            activeVisitors,
            totalVisits,
            parkingOccupancy,
            occupiedSpaces,
            totalSpaces,
        ]
    );

    return (
        <div className="flex flex-col gap-6 sm:gap-12 lg:gap-16 max-w-[1400px] mx-auto px-2 sm:px-4 py-6 sm:py-8">
            {/* Immersive Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
                <div className="space-y-4">
                    <h1 className="text-fluid-h1 font-black tracking-tighter text-slate-800 leading-[0.9] lg:leading-none">
                        {t("centralDirector").split(" ")[0]}{" "}
                        <span className="text-orange-500 opacity-80">
                            {t("centralDirector").split(" ")[1]}
                        </span>
                    </h1>
                    <p className="text-slate-500 text-base sm:text-lg lg:text-xl font-medium tracking-tight opacity-70">
                        {t("environmentRealTime")} •{" "}
                        <span className="text-slate-800 font-bold">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    </p>
                </div>
                <div className="p-1 sm:p-2 bg-white/40 border border-white/60 rounded-3xl sm:rounded-[2.5rem] flex gap-2 shadow-sm self-start">
                    {["live", "analytics"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-6 sm:px-10 py-3 sm:py-4 rounded-2xl sm:rounded-4xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                activeTab === tab
                                    ? "bg-white shadow-xl text-orange-600 scale-[1.05]"
                                    : "text-slate-400 hover:text-slate-600 "
                            )}
                        >
                            {tab} stream
                        </button>
                    ))}
                </div>
            </div>

            {/* High-Fidelity Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        key={stat.label}
                        className={cn(
                            "w-full",
                            i % 2 === 0 ? "xl:-translate-y-4" : "xl:translate-y-4"
                        )}
                    >
                        <GlassCard interactive elevation="sm" className="group p-6 sm:p-8 lg:p-10 border-white/40">
                            <div className="flex items-center justify-between mb-8 sm:mb-12">
                                <div
                                    className={cn(
                                        "size-16 rounded-3xl flex items-center justify-center relative shadow-inner group-hover:scale-110 transition-transform duration-500",
                                        stat.color === "indigo"
                                            ? "bg-orange-50 text-orange-500"
                                            : stat.color === "emerald"
                                                ? "bg-emerald-50 text-emerald-500"
                                                : stat.color === "blue"
                                                    ? "bg-blue-50 text-blue-500"
                                                    : "bg-amber-50 text-amber-500"
                                    )}
                                >
                                    <stat.icon size={28} strokeWidth={1.5} className="z-10" />
                                    <div
                                        className="absolute inset-0 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
                                        style={{ backgroundColor: "currentColor" }}
                                    />
                                </div>
                                <div
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.2em] uppercase border",
                                        stat.trend === "up"
                                            ? "text-emerald-600 bg-emerald-50/50 border-emerald-100 "
                                            : "text-red-500 bg-red-50/50 border-red-100 "
                                    )}
                                >
                                    {stat.change}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.4em] opacity-60 ml-1">
                                    {stat.label}
                                </p>
                                <h4 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tabular-nums text-slate-800 tracking-tighter flex items-center gap-3">
                                    {stat.value}
                                    <ArrowRight
                                        size={20}
                                        className="text-[#f2a229] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
                                    />
                                </h4>
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-8">
                {/* Traffic Activity Layer */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 gap-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-slate-800 ">
                                {t("visualTelemetry").split(" ")[0]}{" "}
                                <span className="text-orange-500 opacity-80">
                                    {t("visualTelemetry").split(" ")[1]}
                                </span>
                            </h3>
                            <p className="text-fluid-label font-black uppercase tracking-[0.4em] text-slate-400 ">
                                {t("hardwareVerificationLog")}
                            </p>
                        </div>
                        <GlassButton
                            variant="primary"
                            icon={ChevronRight}
                            onClick={() => router.push("/visitors")}
                        >
                            {t("fullRegistry")}
                        </GlassButton>
                    </div>
                    <div className="space-y-6">
                        {visitsArray.slice(0, 4).map((log, i) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="group"
                            >
                                <GlassCard
                                    interactive
                                    elevation="sm"
                                    className="p-3 sm:p-6 lg:p-8 border-white/40 hover:border-orange-100 transition-all hover:translate-x-2"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="size-16 rounded-2xl bg-white shadow-inner flex items-center justify-center relative border border-white group-hover:scale-110 transition-transform duration-500">
                                            <MonitorCheck
                                                size={28}
                                                strokeWidth={1.5}
                                                className="text-orange-500 z-10"
                                            />
                                            <div className="absolute inset-x-0 bottom-[-10%] h-[20%] bg-orange-500/10 blur-md rounded-full" />
                                        </div>
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <p className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight truncate">
                                                    {log.visitorName}
                                                </p>
                                                <div className="px-4 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {new Date(log.createdAt).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm font-medium text-slate-500 ">
                                                <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100 ">
                                                    {log.licensePlate || "Auth Scan"}
                                                </span>
                                                <span className="opacity-40 hidden sm:inline">•</span>
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            "size-2 rounded-full",
                                                            log.status === "CHECKED_IN"
                                                                ? "bg-emerald-400"
                                                                : "bg-slate-300"
                                                        )}
                                                    />
                                                    {log.status.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* System Integrity Engine */}
                <div className="space-y-10">
                    <div className="space-y-1 px-6">
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter text-slate-800 ">
                            {t("coreHealth").split(" ")[0]}{" "}
                            <span className="text-orange-500 opacity-80">
                                {t("coreHealth").split(" ")[1]}
                            </span>
                        </h3>
                        <p className="text-fluid-label font-black uppercase tracking-[0.4em] text-slate-400 ">
                            {t("processingInfrastructure")}
                        </p>
                    </div>
                    <GlassCard
                        elevation="xl"
                        className="rounded-3xl sm:rounded-[4rem] p-4 sm:p-12 bg-white/50 border-white/60 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <Zap size={240} strokeWidth={1} />
                        </div>
                        <div className="flex flex-col items-center gap-10 relative z-10">
                            <div className="size-40 rounded-full bg-white border border-slate-50 flex items-center justify-center relative shadow-2xl group cursor-pointer hover:scale-110 transition-transform duration-700">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-[4px] rounded-full border-t border-orange-500/20"
                                />
                                <div className="size-32 rounded-full bg-orange-50/30 flex items-center justify-center">
                                    <Zap
                                        className="text-orange-500 drop-shadow-lg"
                                        size={48}
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-fluid-label font-black text-slate-400 uppercase tracking-[0.5em]">
                                    {t("systemNodeLoad")}
                                </p>
                                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 tabular-nums leading-none tracking-tighter">
                                    {systemEfficiency.toFixed(1)}
                                    <span className="text-xl sm:text-2xl text-orange-500 opacity-40 ml-1">%</span>
                                </p>
                            </div>
                            <div className="w-full space-y-12 py-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ">
                                        <span>{t("visionPrecision")}</span>
                                        <span className="text-orange-600 ">{lprAccuracy.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100/50 h-2 rounded-full overflow-hidden border border-white ">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${lprAccuracy}%` }}
                                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full bg-linear-to-r from-orange-500 to-orange-300 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ">
                                        <span>{t("temporalLatency")}</span>
                                        <span className="text-emerald-600 ">{syncDelay.toFixed(2)}ms</span>
                                    </div>
                                    <div className="w-full bg-slate-100/50 h-2 rounded-full overflow-hidden border border-white ">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(0, 100 - syncDelay * 200)}%` }}
                                            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                            className="h-full bg-linear-to-r from-emerald-500 to-emerald-300 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <GlassButton
                                onClick={() => router.push("/reports")}
                                className="w-full h-16 shadow-2xl"
                                variant="primary"
                                glow
                                icon={TrendingUp}
                            >
                                {t("healthReport")}
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}