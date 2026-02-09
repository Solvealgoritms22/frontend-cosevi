"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <button className="px-4 py-2 text-xs font-semibold bg-white text-[#0f172a] rounded-lg hover:bg-slate-100 transition-colors">
                                Customer Portal
                            </button>
                        </Link>
                        <div className="size-8 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-500/30">
                            <ShieldCheck className="text-indigo-400" size={18} />
                        </div>
                        <span className="text-lg font-bold text-slate-200">
                            COSEVI
                        </span>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto prose prose-invert prose-slate"
                >
                    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                    <p className="lead text-xl text-slate-400 mb-12">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <div className="space-y-12 text-slate-300">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the COSEVI platform, you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                            <p>
                                COSEVI provides a comprehensive visitor management and access control system for residential complexes.
                                The service includes mobile applications, web dashboards, and integration with security hardware.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                                <li>You agree to provide accurate and up-to-date information.</li>
                                <li>You may not use the platform for any illegal or unauthorized purpose.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Limitation of Liability</h2>
                            <p>
                                COSEVI shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                                including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">5. Modifications</h2>
                            <p>
                                We reserve the right to modify these terms at any time. We will notify users of any material changes
                                to these terms via email or platform notification.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
