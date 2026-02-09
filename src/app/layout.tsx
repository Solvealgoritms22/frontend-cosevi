import { NotificationProvider } from "@/context/notification-context";
import { SocketProvider } from "@/context/socket-context";
import { TranslationProvider } from "@/context/translation-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "COSEVI | Integrated VMS & Parking",
    description: "Next-generation visitor management and parking control platform.",
    icons: {
        icon: '/logo-official.png',
    },
};

import { ErrorBoundary } from "@/components/error-boundary";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ErrorBoundary>
                    <SocketProvider>
                        <TranslationProvider>
                            <NotificationProvider>
                                {children}
                            </NotificationProvider>
                        </TranslationProvider>
                    </SocketProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
