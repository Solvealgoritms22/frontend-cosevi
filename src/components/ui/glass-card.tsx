"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    blur?: "none" | "sm" | "md" | "lg" | "xl";
    elevation?: "none" | "sm" | "md" | "lg" | "xl";
    glow?: boolean;
    interactive?: boolean;
    variant?: "default" | "primary" | "destructive";
    animate?: boolean;
}

export function GlassCard({
    children,
    className,
    blur = "md",
    elevation = "sm",
    glow = false,
    interactive = false,
    variant = "default",
    animate = false,
}: GlassCardProps) {
    const variantStyles = {
        default: "bg-white/80 border-slate-200 text-slate-900",
        primary: "bg-indigo-50/50 border-indigo-100 text-indigo-900",
        destructive: "bg-red-50/50 border-red-100 text-red-900",
    };

    const elevationStyles = {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
    };

    const blurStyles = {
        none: "",
        sm: "backdrop-blur-sm",
        md: "backdrop-blur-md",
        lg: "backdrop-blur-lg",
        xl: "backdrop-blur-xl",
    };

    const content = (
        <div
            className={cn(
                "relative rounded-3xl border border-white/60 p-5 sm:p-7 md:p-8 transition-all",
                variantStyles[variant],
                elevationStyles[elevation],
                blurStyles[blur],
                glow &&
                "ring-1 ring-white/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
                interactive &&
                "cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:bg-white/90 hover:border-white transition-all duration-500",
                className
            )}
        >
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/40 to-transparent pointer-events-none opacity-50" />
            <div className="relative z-10">{children}</div>
        </div>
    );

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {content}
            </motion.div>
        );
    }

    return content;
}