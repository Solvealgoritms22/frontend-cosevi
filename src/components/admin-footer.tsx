"use client";

import { ShieldCheck } from "lucide-react";

export function AdminFooter() {
    return (
        <footer className="w-full py-6 mt-12 border-t border-slate-200">
            <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-default">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span className="font-bold text-slate-700 tracking-tight">
                        Entrar <span className="text-blue-600">Admin</span>
                    </span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-blue-600 transition-colors">
                            Support
                        </a>
                        <span className="size-1 rounded-full bg-slate-200" />
                        <a href="#" className="hover:text-blue-600 transition-colors">
                            Documentation
                        </a>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-400">
                        © 2026 Consejo de Seguridad Vial
                    </p>
                </div>
            </div>
        </footer>
    );
}