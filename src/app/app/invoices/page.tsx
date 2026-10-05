'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { InvoiceDetailDrawer } from '@/components/dashboard/InvoiceDetailDrawer';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { WorkflowTimeline } from '@/components/dashboard/WorkflowTimeline';
import { ApprovalModal } from '@/components/dashboard/ApprovalModal';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/formatters';
import { FileText, Eye, Play, Plus, Search, Sparkles } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAgent, setIsRunningAgent] = useState(false);

  // Modals & Drawers state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  // Toast banner
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

      const freshInvoices = invData.invoices || [];
      const freshWorkflows = wfData.workflows || [];

      if (invData.invoices) setInvoices(freshInvoices);
      if (wfData.workflows) setWorkflows(freshWorkflows);

      return { invoices: freshInvoices, workflows: freshWorkflows };
    } catch (err) {
      console.error('Error loading invoices data:', err);
      return { invoices: [], workflows: [] };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunAgent = async (invoiceId: string) => {
    setIsRunningAgent(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      const fresh = await loadData();
      if (data.workflow) {
        setSelectedWorkflow(data.workflow);
        const inv = fresh.invoices.find((i: Invoice) => i.id === invoiceId) || invoices.find((i) => i.id === invoiceId);
        if (inv) setSelectedInvoice(inv);
        setIsTimelineOpen(true);
        showToast(`Agent execution finished with decision: ${data.workflow.autonomyDecision}`);
      }
    } catch (err) {
      console.error('Agent execution error:', err);
      showToast('Agent execution failed. Please check logs.');
    } finally {
      setIsRunningAgent(false);
    }
  };

  const handleApprove = async (approvalId: string, note?: string) => {
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, note, approvedBy: 'Founder / Operations Lead' }),
      });
      const data = await res.json();
      if (data.workflow) {
        setSelectedWorkflow(data.workflow);
        showToast('Approval granted. Simulated payment executed & verified.');
      }
      await loadData();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleReject = async (approvalId: string, reason: string) => {
    try {
      const res = await fetch('/api/agent/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, reason, rejectedBy: 'Founder / Operations Lead' }),
      });
      const data = await res.json();
      if (data.workflow) {
        setSelectedWorkflow(data.workflow);
        showToast('Payment rejected. Action terminated safely without moving funds.');
      }
      await loadData();
    } catch (err) {
      console.error('Rejection failed:', err);
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
    let targetInvoice = invoices.find((i) => i.id === targetId);
    let wf = workflows.find((w) => w.invoiceId === targetId);

    if (!targetInvoice || !wf) {
      const fresh = await loadData();
      targetInvoice = fresh.invoices.find((i: Invoice) => i.id === targetId);
      wf = fresh.workflows.find((w: WorkflowRun) => w.invoiceId === targetId);
    }

    if (targetInvoice) {
      setSelectedInvoice(targetInvoice);
      setSelectedWorkflow(wf || null);

      if (targetInvoice.status === 'AWAITING_APPROVAL') {
        setIsApprovalOpen(true);
        showToast(`Opened Scenario (${key}): Awaiting human approval`);
      } else {
        setIsTimelineOpen(true);
        showToast(`Inspecting Scenario (${key}): ${targetInvoice.vendorName}`);
      }
    } else {
      showToast(`Loading scenario ${key}...`);
      await loadData();
    }
  };

  const handleUploadCustom = async (invoiceData: Partial<Invoice>) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.invoice) {
        showToast(`Invoice #${data.invoice.invoiceNumber} ingested. Launching autonomous agent...`);
        await handleRunAgent(data.invoice.id);
      }
    } catch (err) {
      console.error('Custom invoice upload failed:', err);
    }
  };

  const filtered = invoices.filter(
    (inv) =>
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.purchaseOrderNumber && inv.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-graphite-100">Invoices Ledger</h2>
              <p className="text-xs text-graphite-400 mt-0.5">
                All extracted, verified, and reconciled invoice records
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-graphite-500" />
                <input
                  type="text"
                  placeholder="Search invoices, vendors, POs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-canvas-900 border border-canvas-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-graphite-100 placeholder-graphite-500 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-canvas-900 border border-canvas-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-canvas-800 bg-canvas-850/50 text-[11px] font-mono uppercase text-graphite-400">
                    <th className="py-3 px-4 font-medium">Invoice #</th>
                    <th className="py-3 px-4 font-medium">Vendor</th>
                    <th className="py-3 px-4 font-medium">PO Reference</th>
                    <th className="py-3 px-4 font-medium">Due Date</th>
                    <th className="py-3 px-4 font-medium">Amount</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-800">
                  {filtered.map((inv) => {
                    const statusInfo = getStatusBadge(inv.status);
                    const wf = workflows.find((w) => w.invoiceId === inv.id);

                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-canvas-850/50 transition-colors cursor-pointer group"
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setSelectedWorkflow(wf || null);
                          setIsDrawerOpen(true);
                        }}
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-graphite-200 group-hover:text-blue-300 transition-colors">
                          #{inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-graphite-100">
                          {inv.vendorName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-graphite-400">
                          {inv.purchaseOrderNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-graphite-400">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-graphite-100">
                          {formatCurrency(inv.totalAmount, inv.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {inv.status === 'PENDING' && (
                              <button
                                onClick={() => handleRunAgent(inv.id)}
                                disabled={isRunningAgent}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium shadow-sm transition-all"
                                title="Run Autonomous Agent"
                              >
                                <Play className="w-3 h-3" />
                                <span>Run</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setSelectedWorkflow(wf || null);
                                setIsDrawerOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-canvas-800 hover:bg-canvas-700 text-graphite-300 hover:text-graphite-100 border border-canvas-700 text-[11px] transition-all"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Invoice Detail Drawer */}
      <InvoiceDetailDrawer
        isOpen={isDrawerOpen}
        invoice={selectedInvoice}
        workflow={selectedWorkflow || (selectedInvoice ? workflows.find((w) => w.invoiceId === selectedInvoice.id) || null : null)}
        onClose={() => setIsDrawerOpen(false)}
        onOpenApproval={() => {
          setIsDrawerOpen(false);
          setIsApprovalOpen(true);
        }}
        onViewWorkflow={() => {
          setIsDrawerOpen(false);
          const targetWf = selectedWorkflow || (selectedInvoice ? workflows.find((w) => w.invoiceId === selectedInvoice.id) || null : null);
          if (targetWf) {
            setSelectedWorkflow(targetWf);
            setIsTimelineOpen(true);
          } else if (selectedInvoice) {
            showToast(`Generating workflow for #${selectedInvoice.invoiceNumber}...`);
            handleRunAgent(selectedInvoice.id);
          }
        }}
        onRunAgent={(id) => {
          setIsDrawerOpen(false);
          handleRunAgent(id);
        }}
      />

      {/* Workflow Timeline Modal */}
      {isTimelineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-canvas-750">
            <WorkflowTimeline
              workflow={selectedWorkflow}
              onClose={() => setIsTimelineOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Human Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        invoice={selectedInvoice}
        workflow={selectedWorkflow || (selectedInvoice ? workflows.find((w) => w.invoiceId === selectedInvoice.id) || null : null)}
        onClose={() => setIsApprovalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Invoice Ingestion Modal */}
      <InvoiceUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectScenario={handleSelectScenario}
        onUploadCustom={handleUploadCustom}
        isProcessing={isRunningAgent}
      />
    </div>
  );
}
