'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  Eye,
  Play,
  Sparkles,
  Building2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getRiskColorClass, getStatusBadge } from '@/lib/formatters';

interface OperationsInboxProps {
  invoices: Invoice[];
  workflows: WorkflowRun[];
  onReviewApproval: (invoice: Invoice, workflow?: WorkflowRun) => void;
  onViewWorkflow: (invoice: Invoice, workflow?: WorkflowRun) => void;
  onRunAgent: (invoiceId: string) => void;
  onSelectInvoice?: (invoice: Invoice, workflow?: WorkflowRun) => void;
  isRunningAgent?: boolean;
}

export const OperationsInbox: React.FC<OperationsInboxProps> = ({
  invoices,
  workflows,
  onReviewApproval,
  onViewWorkflow,
  onRunAgent,
  onSelectInvoice,
  isRunningAgent,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ATTENTION' | 'COMPLETED' | 'BLOCKED'>('ALL');

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'ATTENTION') return inv.status === 'AWAITING_APPROVAL';
    if (filter === 'COMPLETED') return inv.status === 'COMPLETED';
    if (filter === 'BLOCKED') return inv.status === 'BLOCKED';
    return true;
  });

  const getWorkflowForInvoice = (invoiceId: string) => {
    return workflows.find((w) => w.invoiceId === invoiceId);
  };

  return (
    <div className="bg-canvas-900 border border-canvas-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 border-b border-canvas-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-graphite-100 tracking-tight">Operations Inbox</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-graphite-400 mt-0.5">Things requiring human attention vs autonomous actions</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-canvas-850 p-1 rounded-lg border border-canvas-750 self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'ATTENTION', label: '🔴 Needs Attention' },
            { id: 'COMPLETED', label: '🟢 Completed' },
            { id: 'BLOCKED', label: '⛔ Blocked' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filter === tab.id
                  ? 'bg-canvas-700 text-graphite-100 shadow-sm'
                  : 'text-graphite-400 hover:text-graphite-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List items */}
      <div className="divide-y divide-canvas-800/80">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-graphite-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-graphite-500" />
            <p className="text-sm font-medium text-graphite-300">All operations up to date</p>
            <p className="text-xs text-graphite-500 mt-1">No items found matching the selected filter criteria.</p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const wf = getWorkflowForInvoice(inv.id);
            const statusInfo = getStatusBadge(inv.status);
            const riskColors = getRiskColorClass(wf?.riskAssessment?.level);

            const isApprovalNeeded = inv.status === 'AWAITING_APPROVAL';
            const isCompleted = inv.status === 'COMPLETED';
            const isBlocked = inv.status === 'BLOCKED';
            const isPending = inv.status === 'PENDING';

            return (
              <div
                key={inv.id}
                className="p-4 sm:p-5 hover:bg-canvas-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Column: Vendor & Invoice Details */}
                <div
                  onClick={() => onSelectInvoice?.(inv, wf)}
                  className={`flex items-start gap-3.5 min-w-0 ${onSelectInvoice ? 'cursor-pointer group' : ''}`}
                  title={onSelectInvoice ? 'Click to inspect invoice details' : undefined}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                      isApprovalNeeded
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : isBlocked
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    {isApprovalNeeded && <ShieldAlert className="w-5 h-5 animate-pulse" />}
                    {isBlocked && <Ban className="w-5 h-5" />}
                    {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                    {isPending && <Clock className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-graphite-100 text-sm group-hover:text-blue-300 transition-colors">
                        {inv.vendorName}
                      </span>
                      <span className="text-xs font-mono text-graphite-400">#{inv.invoiceNumber}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                      {wf?.riskAssessment && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${riskColors.badge}`}>
                          Risk: {wf.riskAssessment.level} ({wf.riskAssessment.score}/100)
                        </span>
                      )}
                    </div>

                    {/* Operational Context note */}
                    <p className="text-xs text-graphite-300 line-clamp-1">
                      {isApprovalNeeded && wf?.approvalRequest?.reason}
                      {isCompleted &&
                        (wf?.executionResult
                          ? `Settlement confirmed (${wf.executionResult.paymentReference}) via ${wf.executionResult.adapterUsed}`
                          : 'Processed and verified in ledger')}
                      {isBlocked &&
                        (wf?.riskAssessment?.reasons[0] || 'Terminated by fraud & anomaly prevention policy')}
                      {isPending && 'Queued for agent ingestion & autonomous analysis'}
                    </p>

                    {/* Meta info tags */}
                    <div className="flex items-center gap-3 text-[11px] text-graphite-500 font-mono pt-0.5">
                      <span>PO: {inv.purchaseOrderNumber || 'Missing PO'}</span>
                      <span>•</span>
                      <span>Due: {formatDate(inv.dueDate)}</span>
                      {wf?.reconciliation?.differenceAmount !== undefined && wf.reconciliation.differenceAmount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-400 font-medium">
                            Discrepancy: +{formatCurrency(wf.reconciliation.differenceAmount, inv.currency)} ({wf.reconciliation.variancePercentage}%)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Amount & Action buttons */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-12 md:pl-0">
                  <div className="text-right">
                    <div className="text-base font-semibold text-graphite-100 tracking-tight">
                      {formatCurrency(inv.totalAmount, inv.currency)}
                    </div>
                    <div className="text-[11px] text-graphite-500">
                      {inv.lineItems.length} {inv.lineItems.length === 1 ? 'line item' : 'line items'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSelectInvoice && (
                      <button
                        onClick={() => onSelectInvoice(inv, wf)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-800 hover:bg-canvas-750 text-graphite-300 hover:text-graphite-100 border border-canvas-700 text-xs font-medium transition-all"
                        title="Inspect invoice details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    )}

                    {isApprovalNeeded && (
                      <button
                        onClick={() => onReviewApproval(inv, wf)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    )}

                    {isPending && (
                      <button
                        onClick={() => onRunAgent(inv.id)}
                        disabled={isRunningAgent}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Run Agent</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewWorkflow(inv, wf)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-800 hover:bg-canvas-750 text-graphite-300 hover:text-graphite-100 border border-canvas-700 text-xs font-medium transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
