import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TranslationProvider } from "@/context/translation-context"
import { NotificationProvider } from "@/context/notification-context"
import React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "COSEVI | Integrated VMS & Parking",
    description: "Next-generation visitor management and parking control platform.",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <TranslationProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </TranslationProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
