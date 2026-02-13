"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">
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
                        <div className="flex items-center gap-3">
                            <div className="relative w-40 h-22 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logo-landing.png"
                                    alt="COSEVI"
                                    className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto prose prose-invert prose-slate"
                >
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <p className="lead text-xl text-slate-400 mb-12">
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <div className="space-y-12 text-slate-300">
                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                            <p className="mb-4">
                                We collect information you provide directly to us when you create an account, register a visitor, or communicate with us.
                                This may include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Account information (name, email, phone number)</li>
                                <li>Visitor data (names, license plates, identification)</li>
                                <li>Property information for residents</li>
                                <li>Usage data and access logs</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Information</h2>
                            <p className="mb-4">
                                We use the collected information for the following purposes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and maintain our security services</li>
                                <li>To process visitor access and notifications</li>
                                <li>To improve our platform security and functionality</li>
                                <li>To comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                            <p>
                                We implement enterprise-grade security measures to protect your personal information.
                                Data is encrypted in transit and at rest using industry-standard protocols.
                                Access to personal data is strictly limited to authorized personnel.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-white mb-4">4. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at privacy@cosevi.com.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
