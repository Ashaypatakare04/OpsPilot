'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { ApprovalModal } from '@/components/dashboard/ApprovalModal';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getRiskColorClass } from '@/lib/formatters';
import { ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

export default function ApprovalsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, wfRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/workflows'),
      ]);
      const invData = await invRes.json();
      const wfData = await wfRes.json();
      if (invData.invoices) setInvoices(invData.invoices);
      if (wfData.workflows) setWorkflows(wfData.workflows);
    } catch (err) {
      console.error('Error loading approvals data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === 'AWAITING_APPROVAL');

  const handleApprove = async (approvalId: string, note?: string) => {
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, note, approvedBy: 'Founder / Finance Officer' }),
      });
      const data = await res.json();
      if (data.workflow) {
        showToast('Approval granted. Simulated payment executed & verified.');
      }
      await loadData();
    } catch (err) {
      console.error('Approval failed:', err);
      showToast('Approval action failed.');
    }
  };

  const handleReject = async (approvalId: string, reason: string) => {
    try {
      const res = await fetch('/api/agent/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, reason, rejectedBy: 'Founder / Finance Officer' }),
      });
      const data = await res.json();
      if (data.workflow) {
        showToast('Payment rejected. Action terminated safely without moving funds.');
      }
      await loadData();
    } catch (err) {
      console.error('Rejection failed:', err);
      showToast('Rejection action failed.');
    }
  };

  const handleSelectScenario = async (key: 'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE') => {
    const idMap: Record<string, string> = {
      SAFE: 'inv-1041',
      MISMATCH: 'inv-1042',
      DUPLICATE: 'inv-1042-dup',
      UNKNOWN: 'inv-9901',
      HIGH_VALUE: 'inv-5520',
    };

    const targetId = idMap[key];
    const targetInvoice = invoices.find((i) => i.id === targetId);
    const targetWf = workflows.find((w) => w.invoiceId === targetId);

    if (targetInvoice) {
      setSelectedInvoice(targetInvoice);
      setSelectedWorkflow(targetWf || null);

      if (targetInvoice.status === 'AWAITING_APPROVAL') {
        setIsModalOpen(true);
        showToast(`Inspecting approval requirement for ${targetInvoice.vendorName}`);
      } else {
        showToast(`Invoice #${targetInvoice.invoiceNumber} is in status: ${targetInvoice.status}`);
      }
    }
  };

  const handleUploadCustom = async (invoiceData: Partial<Invoice>) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.invoice) {
        showToast(`Ingesting #${data.invoice.invoiceNumber} and evaluating policy...`);
        const runRes = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: data.invoice.id }),
        });
        const runData = await runRes.json();
        await loadData();
        if (runData.workflow?.status === 'AWAITING_APPROVAL') {
          setSelectedInvoice(data.invoice);
          setSelectedWorkflow(runData.workflow);
          setIsModalOpen(true);
          showToast('Invoice routed to human approval gate!');
        } else {
          showToast(`Autonomous agent decision: ${runData.workflow?.autonomyDecision || 'COMPLETED'}`);
        }
      }
    } catch (err) {
      console.error('Custom invoice error:', err);
      showToast('Failed to ingest custom invoice.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={loadData}
          isRefreshing={isLoading}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-graphite-400 hover:text-graphite-200 text-xs font-mono"
              >
                Dismiss
              </button>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-graphite-100">Human Approval Gate</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {pendingInvoices.length} Pending Actions
              </span>
            </div>
            <p className="text-xs text-graphite-400 mt-0.5">
              Consequential operational actions halted for mandatory human oversight
            </p>
          </div>

          {pendingInvoices.length === 0 ? (
            <div className="p-16 text-center bg-canvas-900 border border-canvas-800 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-graphite-200">No approvals pending</h3>
              <p className="text-xs text-graphite-500 mt-1">All routine operations are running autonomously within safety thresholds.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingInvoices.map((inv) => {
                const wf = workflows.find((w) => w.invoiceId === inv.id);
                const riskColors = getRiskColorClass(wf?.riskAssessment?.level);

                return (
                  <div
                    key={inv.id}
                    className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 hover:border-canvas-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-graphite-100">{inv.vendorName}</span>
                        <span className="text-xs font-mono text-graphite-400">#{inv.invoiceNumber}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${riskColors.badge}`}>
                          Risk: {wf?.riskAssessment?.level || 'HIGH'} ({wf?.riskAssessment?.score || 75}/100)
                        </span>
                      </div>

                      <p className="text-xs text-graphite-300 max-w-2xl leading-relaxed">
                        {wf?.approvalRequest?.reason || 'Invoice exceeds approved purchase order ceiling or lacks authorized purchase order.'}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-graphite-400 pt-1">
                        <span>Invoice: {formatCurrency(inv.totalAmount, inv.currency)}</span>
                        {wf?.reconciliation?.poFound && (
                          <span>PO Baseline: {formatCurrency(wf.reconciliation.poTotal, inv.currency)}</span>
                        )}
                        {wf?.reconciliation?.differenceAmount !== undefined && wf.reconciliation.differenceAmount > 0 && (
                          <span className="text-rose-400 font-semibold">
                            Variance: +{formatCurrency(wf.reconciliation.differenceAmount, inv.currency)} (+{wf.reconciliation.variancePercentage}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setSelectedWorkflow(wf || null);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Inspect & Decide</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <ApprovalModal
        isOpen={isModalOpen}
        invoice={selectedInvoice}
        workflow={selectedWorkflow}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <InvoiceUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectScenario={handleSelectScenario}
        onUploadCustom={handleUploadCustom}
        isProcessing={isProcessing}
      />
    </div>
  );
}
