"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
}

export function Modal({ isOpen, onClose, title, children, size = "md", className }: ModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl"
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={cn(sizeClasses[size], "w-full z-60", className)}
                    >
                        <div className="bg-white rounded-4xl shadow-2xl max-h-[90vh] flex flex-col border border-white/40 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-2xl font-black tracking-tighter text-slate-800 ">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="size-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white transition-all border border-transparent hover:border-slate-200 "
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-10">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}