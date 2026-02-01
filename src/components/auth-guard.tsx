"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import api from "@/lib/api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token")
                if (!token) {
                    setAuthorized(false)
                    router.push("/login")
                    return
                }

                try {
                    const response = await api.get('/auth/profile')
                    const user = response.data

                    if (user.role !== 'ADMIN') {
                        setAuthorized(false)
                        localStorage.removeItem('token')
                        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                        router.push("/login?error=unauthorized")
                        return
                    }

                    setAuthorized(true)
                } catch (error) {
                    setAuthorized(false)
                    router.push("/login")
                }
            }
        }

        checkAuth()
    }, [router])

    if (!authorized) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/20 border border-primary/20 animate-pulse flex items-center justify-center text-primary">
                    <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-muted-foreground font-black text-xs uppercase tracking-widest animate-pulse">
                    Authenticating Environment...
                </p>
            </div>
        )
    }

    return <>{children}</>
}
