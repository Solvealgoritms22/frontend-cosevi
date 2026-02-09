'use client'

import { cn } from "@/lib/utils"
import { InputHTMLAttributes, useState } from "react"

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

export function GlassInput({ label, error, icon, className, ...props }: GlassInputProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className="relative w-full">
            {label && (
                <label
                    className={cn(
                        'absolute left-4 transition-all duration-300 pointer-events-none z-20',
                        isFocused || props.value
                            ? 'top-2.5 text-[10px] font-bold uppercase tracking-wider text-orange-500'
                            : 'top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500',
                        error && 'text-red-500'
                    )}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-20">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        'w-full rounded-xl px-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 font-medium transition-all duration-200 outline-none',
                        'hover:bg-white hover:border-orange-200 ',
                        'focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10',
                        'placeholder:text-slate-400 ',
                        icon && 'pl-11',
                        label && 'pt-7 pb-2.5',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
                        className
                    )}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-red-500 ml-1">{error}</p>
            )}
        </div>
    )
}