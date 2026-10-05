'use client';

import React from 'react';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency } from '@/lib/formatters';

import Link from 'next/link';

interface MetricsOverviewProps {
  invoices: Invoice[];
  workflows: WorkflowRun[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ invoices, workflows }) => {
  const processedCount = invoices.filter((i) => i.status === 'COMPLETED').length;
  const approvalsWaiting = invoices.filter((i) => i.status === 'AWAITING_APPROVAL').length;
  const anomaliesCount = workflows.filter((w) => w.anomalies?.detected).length;

  const totalReviewedAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const autoProcessedAmount = workflows
    .filter((w) => w.autonomyDecision === 'AUTO_PROCESS' && w.status === 'COMPLETED')
    .reduce((sum, w) => sum + (w.executionResult?.amount || 0), 0);

  const metrics = [
    {
      label: 'Invoices Processed',
      value: `${processedCount} completed`,
      sub: `${invoices.length} total in system`,
      icon: FileCheck2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      href: '/app/invoices',
    },
    {
      label: 'Approvals Waiting',
      value: `${approvalsWaiting} action required`,
      sub: 'Human oversight needed',
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      highlight: approvalsWaiting > 0,
      href: '/app/approvals',
    },
    {
      label: 'Anomalies Detected',
      value: `${anomaliesCount} flagged`,
      sub: 'Protected against mismatch/dups',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      href: '/app/workflows',
    },
    {
      label: 'Volume Reviewed',
      value: formatCurrency(totalReviewedAmount, 'INR'),
      sub: `${formatCurrency(autoProcessedAmount, 'INR')} automated`,
      icon: CreditCard,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      href: '/app/analytics',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Link
            key={m.label}
            href={m.href}
            className={`p-4 rounded-xl bg-canvas-900 border ${
              m.highlight ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' : 'border-canvas-800'
            } transition-all hover:border-canvas-700 hover:scale-[1.01] active:scale-[0.99] group block cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-graphite-400 font-medium group-hover:text-graphite-200 transition-colors">{m.label}</span>
              <div className={`p-2 rounded-lg border ${m.bg}`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className="text-lg font-semibold text-graphite-100 tracking-tight group-hover:text-blue-300 transition-colors">{m.value}</div>
            <div className="text-[11px] text-graphite-500 mt-0.5">{m.sub}</div>
          </Link>
        );
      })}
    </div>
  );
};
