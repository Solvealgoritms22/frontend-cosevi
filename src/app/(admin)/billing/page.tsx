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
    Printer,
    ChevronLeft,
    Repeat,
    Calendar
} from 'lucide-react';
import api from '@/lib/api';
import { useTranslation } from '@/context/translation-context';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

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
    const pct = data.limit === null || data.limit === Infinity || data.limit === 0 ? 0 : Math.min(100, data.percentage);
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
                            {data.limit === Infinity || data.limit === null
                                ? data.current
                                : `${data.current} / ${data.limit}`}
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
    const searchParams = useSearchParams();
    const router = useRouter();
    const [reactivating, setReactivating] = useState(false);
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
    const [targetPlan, setTargetPlan] = useState<string | null>(null);
    const [upgrading, setUpgrading] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const handleCallbacks = async () => {
            const reactivated = searchParams.get('reactivated');
            const cancelled = searchParams.get('cancelled');
            const subscriptionId = searchParams.get('subscription_id');

            if (reactivated === 'true') {
                if (subscriptionId) {
                    try {
                        await api.post('/billing/finalize-reactivation', {
                            paypalSubscriptionId: subscriptionId
                        });
                        toast.success('Your subscription has been successfully reactivated!');
                    } catch (err) {
                        console.error('Failed to finalize reactivation:', err);
                        toast.error('Reactivation successful on PayPal, but sync failed. Please refresh.');
                    }
                } else {
                    toast.success('Your subscription reactivation process has completed!');
                }
                // Clean URL and reload data ONLY after sync
                router.replace('/billing');
                loadData();
            } else if (cancelled === 'true') {
                toast.info('Reactivation process was cancelled.');
                router.replace('/billing');
                loadData();
            } else {
                // Normal load if no params
                loadData();
            }
        };

        handleCallbacks();
    }, [searchParams]);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            api.get('/billing/usage').then((r: any) => r.data).catch(() => null),
            api.get('/billing/subscription').then((r: any) => r.data).catch(() => null),
            api.get('/billing/invoices').then((r: any) => r.data).catch(() => []),
        ]).then(([u, s, i]) => {
            setUsage(u);
            setSubscription(s);
            setInvoices(i);
            setLoading(false);
        });
    };

    const handleUpgradeSubscription = async (plan: string) => {
        setUpgrading(true);
        try {
            const response: any = await api.post('/billing/upgrade-subscription', { plan });
            if (response.data.approvalUrl) {
                toast.info(t('redirectingToPayPal'));
                window.location.href = response.data.approvalUrl;
            } else {
                toast.success(t('upgradeSuccess'));
                loadData();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg === 'UPGRADE_BLOCKED_MANUAL_PLAN') {
                toast.error(t('upgradeBlockedManualPlan'));
            } else if (errorMsg === 'You can only upgrade to a higher tier plan') {
                toast.info('Your plan has already been updated. Refreshing...');
                loadData();
            } else if (errorMsg === 'Invalid target plan') {
                toast.error(errorMsg);
            } else {
                toast.error(t('upgradeError'));
            }
            console.error('Upgrade error:', error);
        } finally {
            setUpgrading(false);
            setIsUpgradeDialogOpen(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setReactivating(true);
        try {
            // Default to previously active plan or starter if unknown
            const planToReactivate = subscription?.plan || 'starter';

            const response: any = await api.post('/billing/reactivate-subscription', {
                plan: planToReactivate
            });

            if (response.data.approvalUrl) {
                toast.info(t('redirectingToPayPal'));
                window.location.href = response.data.approvalUrl;
            }
        } catch (error: any) {
            toast.error('Failed to initiate reactivation.');
            console.error(error);
        } finally {
            setReactivating(false);
        }
    };

    const handleCancelSubscription = async () => {
        setCancelling(true);
        try {
            await api.patch('/billing/cancel-subscription');
            toast.success(t('subscriptionCancelledSuccess'));
            loadData();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message;
            if (errorMsg === 'CANCELLATION_BLOCKED_PENDING_DEBT') {
                toast.error(t('cancellationBlockedPendingDebt'));
            } else if (errorMsg === 'CANCELLATION_BLOCKED_OVERAGES') {
                toast.error(t('cancellationBlockedOverages'));
            } else {
                toast.error(t('subscriptionCancelledError'));
            }
            console.error('Cancellation error:', error);
        } finally {
            setCancelling(false);
            setIsCancelDialogOpen(false);
        }
    };

    const handlePrintInvoice = (inv: InvoiceData) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(inv.billingPeriodStart).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' });

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${date}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
                        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
                        .invoice-info { text-align: right; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f9fafb; text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
                        td { padding: 12px; border-bottom: 1px solid #eee; }
                        .totals { margin-top: 40px; text-align: right; }
                        .total-row { font-size: 18px; font-weight: bold; margin-top: 10px; }
                        .footer { margin-top: 100px; font-size: 12px; color: #999; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">
                            <img src="/logo-landing.png" alt="ENTRAR" style="height: 50px; width: auto; display: block;" />
                        </div>
                        <div class="invoice-info">
                            <h1 style="margin: 0; font-size: 20px;">INVOICE</h1>
                            <p style="margin: 5px 0;">#${inv.id.slice(-8).toUpperCase()}</p>
                            <p style="margin: 5px 0;">${date}</p>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 40px;">
                        <h3 style="margin-bottom: 10px;">Billing Details</h3>
                        <p style="margin: 2px 0;">Status: <strong>${inv.status}</strong></p>
                        <p style="margin: 2px 0;">Period: ${new Date(inv.billingPeriodStart).toLocaleDateString()} - ${new Date(inv.billingPeriodEnd).toLocaleDateString()}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Base Plan Subscription</td>
                                <td style="text-align: right;">$${inv.amount.toFixed(2)}</td>
                            </tr>
                            ${inv.overageAmount > 0 ? `
                            <tr>
                                <td>Resource Overages</td>
                                <td style="text-align: right;">$${inv.overageAmount.toFixed(2)}</td>
                            </tr>
                            ` : ''}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="total-row">Total: $${inv.totalAmount.toFixed(2)} USD</div>
                    </div>

                    <div class="footer">
                        &copy; ${new Date().getFullYear()} ENTRAR. All rights reserved.
                    </div>
                    
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

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
                            <div className={`flex items-center gap-2 mb-4 w-fit px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${subscription.status === 'ACTIVE'
                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                : subscription.status === 'CANCELLED' && subscription.daysRemaining > 0
                                    ? 'bg-amber-50 text-amber-600 border-amber-100'
                                    : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                <CreditCard size={14} />
                                {subscription.status === 'ACTIVE'
                                    ? t('activePlan')
                                    : subscription.status === 'CANCELLED' && subscription.daysRemaining > 0
                                        ? 'Cancelación Pendiente'
                                        : subscription.status === 'CANCELLED' ? 'Cancelado' : subscription.status}
                            </div>
                            <p className="text-3xl font-black capitalize mb-1 text-slate-900 tracking-tight">{subscription.plan}</p>
                            <p className="text-slate-500 text-lg font-bold">${subscription.amount.toFixed(2)}<span className="text-sm font-medium text-slate-400">/{t('monthShort')}</span></p>

                            <div className="mt-6 flex items-center gap-2 text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                <Calendar size={16} className="text-indigo-500" />
                                <span className="text-sm font-bold">
                                    {t('validUntil')}: <span className="text-slate-900">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                                </span>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                {(subscription.status === 'CANCELLED' || subscription.status === 'SUSPENDED' || subscription.status === 'EXPIRED') ? (
                                    <button
                                        onClick={handleReactivateSubscription}
                                        disabled={reactivating}
                                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <Repeat size={14} />
                                        {reactivating ? 'Procesando...' : 'Reactivar Suscripción'}
                                    </button>
                                ) : (
                                    <>
                                        {['starter', 'premium', 'elite'].indexOf(subscription.plan.toLowerCase()) < 2 && (
                                            <button
                                                onClick={() => {
                                                    const nextPlan = subscription.plan.toLowerCase() === 'starter' ? 'premium' : 'elite';
                                                    setTargetPlan(nextPlan);
                                                    setIsUpgradeDialogOpen(true);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                <TrendingUp size={14} />
                                                {t('upgradePlan')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsCancelDialogOpen(true)}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-red-100 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors"
                                        >
                                            <XCircle size={14} />
                                            {t('cancelSubscription')}
                                        </button>
                                    </>
                                )}
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
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        {t('currentUsage')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(usage.resources).map(([key, data]) => (
                            <UsageBar key={key} resource={key} data={data} t={t} />
                        ))}
                    </div>

                    {/* Overage Rates Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-blue-50/50 border border-blue-100 rounded-3xl p-6 md:p-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                                        <TrendingUp size={18} />
                                    </div>
                                    {t('overageRatesTitle')}
                                </h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{t('overageRatesSubtitle')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(resourceLabels(t)).map(([key, info]) => {
                                const rates: Record<string, string> = {
                                    units: '0.25',
                                    parking: '0.10',
                                    monitors: '1.00',
                                    security: '0.50',
                                    visits: '0.01',
                                    alerts: '0.02',
                                    reports: '0.05',
                                };
                                return (
                                    <div key={key} className="bg-white/60 border border-white rounded-2xl p-4 flex items-center gap-4">
                                        <div className="size-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
                                            <info.icon size={20} style={{ color: info.color }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{info.label}</p>
                                            <p className="text-base font-black text-slate-700">
                                                ${rates[key]} <span className="text-xs font-medium text-slate-400 capitalize">/ {t('unit')}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
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
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                            <th className="px-5 py-4">{t('period')}</th>
                                            <th className="px-5 py-4">{t('basePlan')}</th>
                                            <th className="px-5 py-4">{t('overage')}</th>
                                            <th className="px-5 py-4">{t('total')}</th>
                                            <th className="px-5 py-4">{t('billingStatus')}</th>
                                            <th className="px-4 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                                        {invoices
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((inv) => (
                                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-5 py-4 text-sm text-slate-700 font-bold">
                                                        {new Date(inv.billingPeriodStart).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-600 font-medium">${inv.amount.toFixed(2)}</td>
                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {inv.overageAmount > 0 ? (
                                                            <span className="text-red-600 font-bold">${inv.overageAmount.toFixed(2)}</span>
                                                        ) : (
                                                            '$0.00'
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm font-black text-slate-900">${inv.totalAmount.toFixed(2)}</td>
                                                    <td className="px-5 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColors[inv.status] || 'bg-slate-100 text-slate-500'}`}>
                                                            {inv.status === 'PAID' && <CheckCircle size={10} />}
                                                            {inv.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button
                                                            onClick={() => handlePrintInvoice(inv)}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                                                            title={t('printInvoice')}
                                                        >
                                                            <Printer size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {invoices.length > itemsPerPage && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <p className="text-xs font-bold text-slate-400 italic">
                                    {t('showing')} <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, invoices.length)}</span> {t('of')} <span className="text-slate-900">{invoices.length}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft size={14} />
                                        {t('previous')}
                                    </button>
                                    <div className="flex items-center px-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-xs font-black text-slate-900">
                                            {t('page')} {currentPage} {t('of')} {Math.ceil(invoices.length / itemsPerPage)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(invoices.length / itemsPerPage), p + 1))}
                                        disabled={currentPage === Math.ceil(invoices.length / itemsPerPage)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {t('next')}
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={isUpgradeDialogOpen}
                onClose={() => setIsUpgradeDialogOpen(false)}
                onConfirm={() => targetPlan && handleUpgradeSubscription(targetPlan)}
                title={t('upgradePlanConfirmTitle')}
                message={t('upgradePlanConfirmMessage').replace('{plan}', targetPlan || '')}
                confirmText={upgrading ? t('upgrading') : t('upgradePlanAction')}
                cancelText={t('cancel')}
            />

            <ConfirmDialog
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={handleCancelSubscription}
                title={t('cancelSubscriptionConfirmTitle')}
                message={t('cancelSubscriptionConfirmMessage')}
                confirmText={cancelling ? t('processing') : t('cancelSubscriptionAction')}
                cancelText={t('cancel')}
                variant="destructive"
            />
        </div>
    );
}
