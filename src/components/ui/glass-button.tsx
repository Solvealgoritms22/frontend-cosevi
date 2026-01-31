'use client'

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { ButtonHTMLAttributes, ReactNode } from "react"

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    icon?: LucideIcon
    loading?: boolean
    glow?: boolean
}

export function GlassButton({
    children,
    variant = 'default',
    size = 'md',
    icon: Icon,
    loading = false,
    glow = false,
    className,
    disabled,
    ...props
}: GlassButtonProps) {
    const variants = {
        default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm',
        primary: 'bg-indigo-600 text-white border border-transparent hover:bg-indigo-700 shadow-md shadow-indigo-500/20',
        secondary: 'bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800',
        ghost: 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
        danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900 hover:bg-red-100/50 dark:hover:bg-red-900/50 hover:border-red-200 dark:hover:border-red-800',
    }

    const sizes = {
        sm: 'px-3 h-9 text-xs font-medium',
        md: 'px-5 h-11 text-sm font-semibold tracking-wide',
        lg: 'px-8 h-14 text-base font-bold tracking-wide',
    }

    return (
        <button
            className={cn(
                'rounded-xl transition-all duration-200 cursor-pointer active:scale-95',
                'flex items-center justify-center gap-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                glow && variant === 'primary' && 'shadow-[0_0_20px_rgba(79,70,229,0.3)]',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
                <>
                    {Icon && <Icon className="size-4" />}
                    {children}
                </>
            )}
        </button>
    )
}
