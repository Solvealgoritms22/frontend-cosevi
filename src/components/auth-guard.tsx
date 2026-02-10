"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import api from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (typeof window !== "undefined") {
                const token = localStorage.getItem("token");
                console.log('[AuthGuard] Checking token:', !!token);
                if (!token) {
                    console.log('[AuthGuard] No token found, redirecting to login');
                    setAuthorized(false);
                    router.push("/login");
                    return;
                }
                try {
                    console.log('[AuthGuard] Fetching profile...');
                    const response = await api.get('/auth/profile');
                    const user = response.data;
                    console.log('[AuthGuard] User profile:', user);

                    if (user.role !== 'ADMIN') {
                        console.log('[AuthGuard] User is not ADMIN:', user.role);
                        setAuthorized(false);
                        localStorage.removeItem('token');
                        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
                        router.push("/login?error=unauthorized");
                        return;
                    }
                    console.log('[AuthGuard] Authorized!');
                    setAuthorized(true);
                } catch (error: any) {
                    console.error('[AuthGuard] Error checking auth:', error);
                    console.error('[AuthGuard] Error details:', error.response?.data);
                    setAuthorized(false);
                    // router.push("/login"); // Commented out to see the error in console if needed, or keep it.
                    // Let's keep the redirect but log first
                    router.push("/login");
                }
            }
        };
        checkAuth();
    }, [router]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="size-12 rounded-2xl bg-orange-600/20 border border-orange-600/20 animate-pulse flex items-center justify-center text-orange-600">
                    <div className="size-6 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                </div>
                <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">
                    Authenticating Environment...
                </p>
            </div>
        );
    }

    return <>{children}</>;
}