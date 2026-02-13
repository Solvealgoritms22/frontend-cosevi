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
    const { value } = props; // Destructure value from props for use in label condition

    return (
        <div className="relative w-full">
            {label && (
                <label
                    className={cn(
                        "absolute left-3 transition-all duration-200 pointer-events-none",
                        isFocused || value
                            ? 'top-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-500'
                            : 'top-1/2 -translate-y-1/2 text-slate-500'
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
                    {...props}
                    value={value}
                    onFocus={(e) => { setIsFocused(true); props.onFocus?.(e) }}
                    onBlur={(e) => { setIsFocused(false); props.onBlur?.(e) }}
                    className={cn(
                        "w-full bg-white/50 border border-slate-200 rounded-xl px-3 pt-6 pb-2 text-slate-900 outline-none transition-all duration-200",
                        "hover:bg-white hover:border-blue-200 ",
                        "focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10",
                        icon && 'pl-11', // Keep icon padding if present
                        error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
                        className
                    )}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-red-500 ml-1">{error}</p>
            )}
        </div>
    )
}