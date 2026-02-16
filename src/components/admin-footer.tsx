import Link from "next/link";
import Image from "next/image";

export function AdminFooter() {
    return (
        <footer className="w-full py-6 mt-12 border-t border-slate-200">
            <div className="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo-official.png"
                        alt="Cosevi Logo"
                        width={100}
                        height={40}
                        className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="h-4 w-px bg-slate-300 mx-1" />
                    <span className="font-bold text-slate-500 tracking-tight text-xs">
                        Admin <span className="text-blue-500">Console</span>
                    </span>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex gap-4 items-center">
                        <Link href="/support" className="hover:text-blue-600 transition-colors">
                            Support
                        </Link>
                        <span className="size-1 rounded-full bg-slate-200" />
                        <Link href="/documentation" className="hover:text-blue-600 transition-colors">
                            Documentation
                        </Link>
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