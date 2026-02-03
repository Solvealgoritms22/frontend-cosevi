"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { Toaster } from "sonner";
import { AdminFooter } from "@/components/admin-footer";
import { AuthGuard } from "@/components/auth-guard";
import React, { useState } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <AuthGuard>
            <div className="flex h-screen overflow-hidden w-full relative sm:gap-6 p-2 sm:p-6">
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <div className="flex-1 flex flex-col min-w-0 relative h-full gap-4 sm:gap-6">
                    <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
                    <main
                        className="flex-1 overflow-y-auto relative"
                        style={{
                            background: "transparent",
                            boxShadow: "none",
                            border: "none",
                            backdropFilter: "none",
                        }}
                    >
                        <div className="min-h-full flex flex-col p-4 sm:p-8 lg:p-12">
                            <div className="flex-1 max-w-[1600px] w-full mx-auto">
                                {children}
                            </div>
                            <AdminFooter />
                        </div>
                    </main>
                </div>
            </div>
            <Toaster position="top-right" richColors closeButton />
        </AuthGuard>
    );
}