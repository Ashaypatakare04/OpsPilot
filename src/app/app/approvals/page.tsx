'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { ApprovalModal } from '@/components/dashboard/ApprovalModal';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getRiskColorClass } from '@/lib/formatters';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function ApprovalsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    const [invRes, wfRes] = await Promise.all([
      fetch('/api/invoices'),
      fetch('/api/workflows'),
    ]);
    const invData = await invRes.json();
    const wfData = await wfRes.json();
    if (invData.invoices) setInvoices(invData.invoices);
    if (wfData.workflows) setWorkflows(wfData.workflows);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === 'AWAITING_APPROVAL');

  const handleApprove = async (approvalId: string, note?: string) => {
    await fetch('/api/agent/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId, note, approvedBy: 'Founder / Finance Officer' }),
    });
    await loadData();
  };

  const handleReject = async (approvalId: string, reason: string) => {
    await fetch('/api/agent/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId, reason, rejectedBy: 'Founder / Finance Officer' }),
    });
    await loadData();
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenUpload={() => {}} onRefresh={loadData} />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
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
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
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
    </div>
  );
}
