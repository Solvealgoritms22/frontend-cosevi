'use client'

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface GlassCardProps {
    children: ReactNode
    className?: string
    blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    glow?: boolean
    interactive?: boolean
    variant?: 'default' | 'primary' | 'destructive'
    animate?: boolean
}

export function GlassCard({
    children,
    className,
    blur = 'md',
    elevation = 'sm',
    glow = false,
    interactive = false,
    variant = 'default',
    animate = false,
}: GlassCardProps) {
    // Map abstract blur/elevation props to Tailwind classes if needed, 
    // or rely on utility classes if they exist. 
    // Using standard Tailwind classes for portability.

    // Enterprise style uses simpler, cleaner backgrounds
    const variantStyles = {
        default: 'bg-[var(--card)] border-[var(--border)] text-[var(--card-foreground)]',
        primary: 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900 text-indigo-900 dark:text-indigo-100',
        destructive: 'bg-red-50/50 dark:bg-red-950/30 border-red-100 dark:border-red-900 text-red-900 dark:text-red-100',
    }

    const elevationStyles = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    }

    const blurStyles = {
        none: '',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
    }

    const content = (
        <div
            className={cn(
                'relative rounded-xl border p-6 transition-all',
                variantStyles[variant],
                elevationStyles[elevation],
                blurStyles[blur],
                glow && 'ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]',
                interactive && 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300',
                className
            )}
        >
            {/* Subtle Gradient Overlay for depth */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none opacity-50" />

            <div className="relative z-10">
                {children}
            </div>
        </div>
    )

    if (animate) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {content}
            </motion.div>
        )
    }

    return content
}
