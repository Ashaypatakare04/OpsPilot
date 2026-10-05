'use client';

import React from 'react';
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Eye,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getStatusBadge, getRiskColorClass } from '@/lib/formatters';

interface InvoiceDetailDrawerProps {
  invoice: Invoice | null;
  workflow: WorkflowRun | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenApproval: () => void;
  onViewWorkflow: () => void;
  onRunAgent: (id: string) => void;
}

export const InvoiceDetailDrawer: React.FC<InvoiceDetailDrawerProps> = ({
  invoice,
  workflow,
  isOpen,
  onClose,
  onOpenApproval,
  onViewWorkflow,
  onRunAgent,
}) => {
  if (!isOpen || !invoice) return null;

  const statusInfo = getStatusBadge(invoice.status);
  const riskColors = getRiskColorClass(workflow?.riskAssessment?.level);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-canvas-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-canvas-900 border-l border-canvas-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-canvas-800 flex items-center justify-between bg-canvas-850/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-graphite-100 text-base">#{invoice.invoiceNumber}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-graphite-400 font-mono mt-0.5">{invoice.vendorName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-graphite-400 hover:text-graphite-100 hover:bg-canvas-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Top Summary Card */}
            <div className="p-4 rounded-xl bg-canvas-850 border border-canvas-750 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-graphite-400 uppercase font-mono text-[10px]">Total Payable</span>
                <span className="text-xl font-bold text-graphite-100 font-mono">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-graphite-400 pt-2 border-t border-canvas-800 font-mono text-[11px]">
                <div>
                  <span className="text-graphite-500 block">Subtotal:</span>
                  <span className="text-graphite-200">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div>
                  <span className="text-graphite-500 block">Taxes (GST/VAT):</span>
                  <span className="text-graphite-200">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Model Confidence Scores (Section 8 requirement) */}
            {invoice.confidenceScores && (
              <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-750 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono text-graphite-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Extraction Confidence Metrics</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-400 font-semibold">
                    {Math.round(invoice.confidenceScores.overall * 100)}% Overall
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-mono text-graphite-400">
                  <div className="flex justify-between">
                    <span>Vendor:</span>
                    <span className="text-graphite-200">{Math.round(invoice.confidenceScores.vendor * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice #:</span>
                    <span className="text-graphite-200">{Math.round(invoice.confidenceScores.invoiceNumber * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="text-graphite-200">{Math.round(invoice.confidenceScores.totalAmount * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PO Match:</span>
                    <span className="text-graphite-200">
                      {invoice.confidenceScores.poNumber ? `${Math.round(invoice.confidenceScores.poNumber * 100)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Core Metadata */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono text-graphite-500 tracking-wider">
                Invoice Metadata
              </h4>
              <div className="space-y-2 bg-canvas-850 p-3 rounded-xl border border-canvas-750">
                <div className="flex justify-between">
                  <span className="text-graphite-400">Purchase Order:</span>
                  <span className="font-mono text-graphite-200">{invoice.purchaseOrderNumber || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-400">Invoice Date:</span>
                  <span className="text-graphite-200">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-graphite-400">Due Date:</span>
                  <span className="text-graphite-200">{formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.vendorTaxId && (
                  <div className="flex justify-between">
                    <span className="text-graphite-400">Vendor Tax ID:</span>
                    <span className="font-mono text-graphite-200">{invoice.vendorTaxId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono text-graphite-500 tracking-wider">
                Line Items Breakdown ({invoice.lineItems.length})
              </h4>
              <div className="space-y-2">
                {invoice.lineItems.map((item) => (
                  <div key={item.id} className="p-3 bg-canvas-850 rounded-xl border border-canvas-750">
                    <div className="font-medium text-graphite-200 leading-snug">{item.description}</div>
                    <div className="flex justify-between items-center mt-1.5 text-[11px] font-mono text-graphite-400">
                      <span>Qty: {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}</span>
                      <span className="font-semibold text-graphite-100">{formatCurrency(item.total, invoice.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficiary details */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-mono text-graphite-500 tracking-wider">
                Beneficiary Banking Rail
              </h4>
              <div className="p-3 bg-canvas-850 rounded-xl border border-canvas-750 space-y-1 font-mono text-[11px]">
                <div className="text-graphite-200 font-sans font-medium">{invoice.paymentDetails.accountName}</div>
                <div className="text-graphite-400">{invoice.paymentDetails.bankName}</div>
                <div className="text-graphite-500">A/C: ••••{invoice.paymentDetails.accountNumber.slice(-4)} • {invoice.paymentDetails.routingOrIfsc}</div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-canvas-800 bg-canvas-850/80 flex items-center gap-2">
            {invoice.status === 'AWAITING_APPROVAL' && (
              <button
                onClick={onOpenApproval}
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Review Approval</span>
              </button>
            )}

            {invoice.status === 'PENDING' && (
              <button
                onClick={() => onRunAgent(invoice.id)}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Agent</span>
              </button>
            )}

            <button
              onClick={onViewWorkflow}
              className="flex-1 py-2 px-3 rounded-lg bg-canvas-800 hover:bg-canvas-700 hover:border-blue-500/50 text-graphite-100 border border-canvas-700 font-medium text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
              title={workflow ? 'Inspect agentic workflow execution graph' : 'Run agent to inspect workflow graph'}
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{workflow ? 'Inspect Workflow' : 'Run & Inspect Workflow'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
