"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    TrendingUp,
    FileText,
    Activity,
    Users,
    Car,
    Shield,
    Monitor,
    ChevronRight,
    CheckCircle,
    AlertTriangle,
    Clock,
    ClipboardList,
    Bell,
    FileBarChart,
} from 'lucide-react';
import api from '@/lib/api';
import { useTranslation } from '@/context/translation-context';

interface UsageResource {
    current: number;
    limit: number;
    extra: number;
    overageCost: number;
    rate: number;
    percentage: number;
}

interface UsageData {
    plan: string;
    planPrice: number;
    resources: {
        units: UsageResource;
        parking: UsageResource;
        monitors: UsageResource;
        security: UsageResource;
        visits: UsageResource;
        alerts: UsageResource;
        reports: UsageResource;
    };
    totalOverage: number;
    estimatedTotal: number;
}

interface SubscriptionData {
    id: string;
    plan: string;
    status: string;
    amount: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    daysRemaining: number;
}

interface InvoiceData {
    id: string;
    amount: number;
    overageAmount: number;
    totalAmount: number;
    status: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    createdAt: string;
}

const resourceLabels = (t: any): Record<string, { label: string; icon: any; color: string }> => ({
    units: { label: t('resourceUnits'), icon: Users, color: '#4f46e5' },
    parking: { label: t('resourceParking'), icon: Car, color: '#059669' },
    monitors: { label: t('resourceMonitors'), icon: Monitor, color: '#d97706' },
    security: { label: t('resourceSecurity'), icon: Shield, color: '#dc2626' },
    visits: { label: t('resourceVisits'), icon: ClipboardList, color: '#0ea5e9' },
    alerts: { label: t('resourceAlerts'), icon: Bell, color: '#f43f5e' },
    reports: { label: t('resourceReports'), icon: FileBarChart, color: '#8b5cf6' },
});

const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-slate-100 text-slate-500',
};

function UsageBar({ resource, data, t }: { resource: string; data: UsageResource, t: any }) {
    const info = resourceLabels(t)[resource];
    const Icon = info.icon;
    const pct = data.limit === Infinity || data.limit === 0 ? 0 : Math.min(100, data.percentage);
    const isOver = data.extra > 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${info.color}15` }}>
                        <Icon size={20} style={{ color: info.color }} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-700">{info.label}</p>
                        <p className="text-xs text-slate-400">
                            {data.limit === Infinity ? data.current : `${data.current} / ${data.limit}`}
                        </p>
                    </div>
                </div>
                {isOver && (
                    <div className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                        <AlertTriangle size={12} />
                        +{data.extra} extra
                    </div>
                )}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                        backgroundColor: isOver ? '#dc2626' : pct > 80 ? '#d97706' : info.color,
                    }}
                />
            </div>
            {isOver && (
                <p className="text-xs text-red-500 font-medium mt-2">
                    {t('overageLabel')}: {data.extra} × ${data.rate.toFixed(2)} = ${data.overageCost.toFixed(2)}/{t('monthShort')}
                </p>
            )}
        </div>
    );
}

export default function BillingPage() {
    const { t, language } = useTranslation();
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/billing/usage').then(r => r.data).catch(() => null),
            api.get('/billing/subscription').then(r => r.data).catch(() => null),
            api.get('/billing/invoices').then(r => r.data).catch(() => []),
        ]).then(([u, s, i]) => {
            setUsage(u);
            setSubscription(s);
            setInvoices(i);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-1">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    {t('billingTitle')}
                </h1>
                <p className="text-slate-400 font-medium mt-1">{t('billingSubtitle')}</p>
            </div>

            {/* Subscription & Estimated Bill */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscription && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-indigo-100 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 col-span-1"
                    >
                        <div className="absolute top-0 right-0 size-32 bg-linear-to-br from-indigo-500/10 to-violet-500/10 rounded-bl-full -mr-8 -mt-8" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 w-fit px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-wider border border-indigo-100">
                                <CreditCard size={14} />
                                {t('activePlan')}
                            </div>
                            <p className="text-3xl font-black capitalize mb-1 text-slate-900 tracking-tight">{subscription.plan}</p>
                            <p className="text-slate-500 text-lg font-bold">${subscription.amount.toFixed(2)}<span className="text-sm font-medium text-slate-400">/{t('monthShort')}</span></p>

                            <div className="mt-6 flex items-center gap-2 text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                <Clock size={16} className="text-indigo-500" />
                                <span className="text-sm font-bold">
                                    <span className="text-slate-900">{subscription.daysRemaining}</span> {t('daysRemaining')}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {usage && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-slate-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-bold">
                                <TrendingUp size={16} />
                                {t('currentOverage')}
                            </div>
                            <p className="text-3xl font-black text-slate-900">
                                ${usage.totalOverage.toFixed(2)}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                                {usage.totalOverage > 0 ? t('willBeCharged') : t('noOverage')}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-slate-200 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm font-bold">
                                <Activity size={16} />
                                {t('estimatedTotal')}
                            </div>
                            <p className="text-3xl font-black text-slate-900">
                                ${usage.estimatedTotal.toFixed(2)}
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                                {t('planBase')} ${usage.planPrice} {t('plusOverage')} ${usage.totalOverage.toFixed(2)}
                            </p>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Usage Bars */}
            {usage && (
                <div>
                    <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">

                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(usage.resources).map(([key, data]) => (
                            <UsageBar key={key} resource={key} data={data} t={t} />
                        ))}
                    </div>
                </div>
            )}

            {/* Invoices */}
            <div>
                <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-600" />
                    {t('invoiceHistory')}
                </h2>
                {invoices.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                        <FileText className="text-slate-300 mx-auto mb-3" size={40} />
                        <p className="text-slate-400 font-medium">{t('noInvoices')}</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/80 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <th className="px-5 py-3">{t('period')}</th>
                                    <th className="px-5 py-3">{t('basePlan')}</th>
                                    <th className="px-5 py-3">{t('overage')}</th>
                                    <th className="px-5 py-3">{t('total')}</th>
                                    <th className="px-5 py-3">{t('billingStatus')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-700 font-medium">
                                            {new Date(inv.billingPeriodStart).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-600">${inv.amount.toFixed(2)}</td>
                                        <td className="px-5 py-3 text-sm text-slate-600">
                                            {inv.overageAmount > 0 ? (
                                                <span className="text-red-600 font-bold">${inv.overageAmount.toFixed(2)}</span>
                                            ) : (
                                                '$0.00'
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-bold text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[inv.status] || 'bg-slate-100 text-slate-500'}`}>
                                                {inv.status === 'PAID' && <CheckCircle size={10} />}
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
