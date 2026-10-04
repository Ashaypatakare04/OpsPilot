'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  CreditCard,
  Ban,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getRiskColorClass } from '@/lib/formatters';

interface ApprovalModalProps {
  invoice: Invoice | null;
  workflow: WorkflowRun | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (approvalId: string, note?: string) => Promise<void>;
  onReject: (approvalId: string, reason: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  invoice,
  workflow,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('Amount discrepancy exceeds approved purchase order budget');

  if (!isOpen || !invoice) return null;

  const approvalReq = workflow?.approvalRequest;
  const recon = workflow?.reconciliation;
  const risk = workflow?.riskAssessment;
  const riskColors = getRiskColorClass(risk?.level);

  const handleApproveClick = async () => {
    if (!approvalReq) return;
    setIsSubmitting(true);
    try {
      await onApprove(approvalReq.id, approvalNote || 'Approved by Founder/Operations Reviewer');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!approvalReq) return;
    setIsSubmitting(true);
    try {
      await onReject(approvalReq.id, rejectReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-canvas-900 border border-canvas-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-canvas-800 flex items-center justify-between bg-canvas-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-graphite-100 tracking-tight">
                  Human Approval Required
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${riskColors.badge}`}>
                  {risk?.level || 'HIGH'} RISK
                </span>
              </div>
              <p className="text-xs text-graphite-400 font-mono mt-0.5">
                Invoice #{invoice.invoiceNumber} • {invoice.vendorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-graphite-100 hover:bg-canvas-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Comparison Cards: Invoice vs PO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Invoice Card */}
            <div className="p-4 rounded-xl bg-canvas-850 border border-canvas-750 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Invoice Amount
              </span>
              <div className="text-2xl font-bold text-graphite-100">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </div>
              <div className="text-xs text-graphite-400 space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-graphite-300">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-mono text-graphite-300">
                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* PO Card */}
            <div className="p-4 rounded-xl bg-canvas-850 border border-canvas-750 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-graphite-400">
                Purchase Order Baseline
              </span>
              <div className="text-2xl font-bold text-graphite-100">
                {recon?.poFound ? formatCurrency(recon.poTotal, invoice.currency) : 'No PO Linked'}
              </div>
              <div className="text-xs text-graphite-400 space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>PO Number:</span>
                  <span className="font-mono text-graphite-300">
                    {invoice.purchaseOrderNumber || 'Missing PO'}
                  </span>
                </div>
                {recon?.differenceAmount !== undefined && (
                  <div className="flex justify-between font-medium">
                    <span>Difference:</span>
                    <span className={recon.differenceAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {recon.differenceAmount > 0 ? '+' : ''}
                      {formatCurrency(recon.differenceAmount, invoice.currency)} ({recon.variancePercentage}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Explanation Banner */}
          <div className="p-4 rounded-xl bg-canvas-850/70 border border-canvas-750 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-graphite-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI & Deterministic Policy Rationale</span>
            </div>
            <p className="text-xs text-graphite-300 leading-relaxed">
              {risk?.suggestedAction || approvalReq?.reason || 'Invoice exceeds approved budget and warrants manual verification.'}
            </p>
            {risk?.reasons && risk.reasons.length > 0 && (
              <ul className="text-xs text-graphite-400 space-y-1 pt-1 list-disc list-inside">
                {risk.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Line Items Details */}
          <div>
            <h4 className="text-xs font-semibold text-graphite-300 uppercase tracking-wider mb-2 font-mono">
              Invoice Line Items ({invoice.lineItems.length})
            </h4>
            <div className="border border-canvas-800 rounded-lg overflow-hidden divide-y divide-canvas-800">
              {invoice.lineItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-canvas-850 text-xs flex items-center justify-between">
                  <div className="pr-4">
                    <p className="font-medium text-graphite-200">{item.description}</p>
                    <p className="text-[11px] text-graphite-500 font-mono">
                      Qty: {item.quantity} × {formatCurrency(item.unitPrice, invoice.currency)}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-graphite-100 shrink-0">
                    {formatCurrency(item.total, invoice.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Destination Payment Details Check */}
          <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-750 text-xs space-y-1">
            <span className="text-[10px] uppercase font-mono text-graphite-400">
              Target Beneficiary (Simulated Clearing Rails)
            </span>
            <div className="flex items-center justify-between text-graphite-200">
              <span className="font-medium">{invoice.paymentDetails.accountName}</span>
              <span className="font-mono text-graphite-400">{invoice.paymentDetails.bankName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-graphite-500 font-mono">
              <span>A/C: ••••{invoice.paymentDetails.accountNumber.slice(-4)}</span>
              <span>IFSC/Routing: {invoice.paymentDetails.routingOrIfsc}</span>
            </div>
          </div>

          {/* Rejection Form Input (Collapsible) */}
          {showRejectForm && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 animate-in fade-in duration-150">
              <label className="text-xs font-medium text-red-300 block">
                Specify Reason for Rejection:
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-canvas-900 border border-red-500/40 rounded-lg px-3 py-1.5 text-xs text-graphite-100 focus:outline-none focus:ring-1 focus:ring-red-400"
              />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-canvas-800 bg-canvas-850/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-graphite-500 font-mono">
            Demo Mode • No real money is moved
          </div>

          <div className="flex items-center gap-2.5">
            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-canvas-800 hover:bg-canvas-750 text-graphite-300 hover:text-rose-300 border border-canvas-700 text-xs font-medium transition-all"
              >
                Reject Action
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRejectClick}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            )}

            <button
              type="button"
              onClick={handleApproveClick}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : 'Approve & Execute Payment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
