"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlassCard } from "./ui/glass-card";
import { GlassButton } from "./ui/glass-button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50/50">
                    <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
                        <div className="size-20 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                            <AlertTriangle size={40} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tighter text-slate-800 uppercase">
                                Something went wrong
                            </h2>
                            <p className="text-slate-500 text-sm">
                                The application encountered an unexpected error. We've been notified and are working on it.
                            </p>
                            {this.state.error && (
                                <p className="text-[10px] font-mono bg-slate-100 p-2 rounded-lg text-slate-400 mt-4 break-all">
                                    {this.state.error.message}
                                </p>
                            )}
                        </div>
                        <GlassButton
                            variant="primary"
                            className="w-full"
                            icon={RefreshCw}
                            onClick={() => window.location.reload()}
                        >
                            Reload Interface
                        </GlassButton>
                    </GlassCard>
                </div>
            );
        }

        return this.props.children;
    }
}
