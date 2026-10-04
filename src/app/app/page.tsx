'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { OperationsInbox } from '@/components/dashboard/OperationsInbox';
import { ApprovalModal } from '@/components/dashboard/ApprovalModal';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { WorkflowTimeline } from '@/components/dashboard/WorkflowTimeline';
import { InvoiceDetailDrawer } from '@/components/dashboard/InvoiceDetailDrawer';
import { Invoice, WorkflowRun } from '@/types';
import { Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isRunningAgent, setIsRunningAgent] = useState(false);

  // Modals & Drawers state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);

  // Success alert toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
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
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/reset', { method: 'POST' });
      await loadData();
      showToast('Demo environment reset to pristine baseline scenarios.');
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunAgent = async (invoiceId: string) => {
    setIsRunningAgent(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.workflow) {
        setSelectedWorkflow(data.workflow);
        const inv = invoices.find((i) => i.id === invoiceId);
        if (inv) setSelectedInvoice(inv);
        setIsTimelineOpen(true);
        showToast(`Agent execution finished with decision: ${data.workflow.autonomyDecision}`);
      }
      await loadData();
    } catch (err) {
      console.error('Agent execution error:', err);
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

  // Scenario quick selector handler
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

    if (targetInvoice) {
      setSelectedInvoice(targetInvoice);
      const wf = workflows.find((w) => w.invoiceId === targetInvoice.id);
      setSelectedWorkflow(wf || null);

      if (targetInvoice.status === 'AWAITING_APPROVAL') {
        setIsApprovalOpen(true);
      } else {
        setIsTimelineOpen(true);
      }
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
        await loadData();
        // Immediately trigger agent on uploaded invoice
        await handleRunAgent(data.invoice.id);
      }
    } catch (err) {
      console.error('Custom invoice upload failed:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100 selection:bg-blue-600/30 selection:text-blue-200">
      {/* Fixed Sidebar */}
      <Sidebar onResetDemo={handleResetDemo} isResetting={isResetting} />

      {/* Main Workspace Area */}
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

          {/* Metrics Overview Cards */}
          <MetricsOverview invoices={invoices} workflows={workflows} />

          {/* Interactive Workflow Timeline (if open) */}
          {isTimelineOpen && selectedWorkflow && (
            <WorkflowTimeline
              workflow={selectedWorkflow}
              onClose={() => setIsTimelineOpen(false)}
            />
          )}

          {/* Operations Inbox */}
          <OperationsInbox
            invoices={invoices}
            workflows={workflows}
            onReviewApproval={(inv, wf) => {
              setSelectedInvoice(inv);
              setSelectedWorkflow(wf || null);
              setIsApprovalOpen(true);
            }}
            onViewWorkflow={(inv, wf) => {
              setSelectedInvoice(inv);
              setSelectedWorkflow(wf || null);
              setIsTimelineOpen(true);
            }}
            onRunAgent={handleRunAgent}
            isRunningAgent={isRunningAgent}
          />
        </main>
      </div>

      {/* Human-in-the-Loop Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        invoice={selectedInvoice}
        workflow={selectedWorkflow}
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

      {/* Invoice Detail Drawer */}
      <InvoiceDetailDrawer
        isOpen={isDrawerOpen}
        invoice={selectedInvoice}
        workflow={selectedWorkflow}
        onClose={() => setIsDrawerOpen(false)}
        onOpenApproval={() => {
          setIsDrawerOpen(false);
          setIsApprovalOpen(true);
        }}
        onViewWorkflow={() => {
          setIsDrawerOpen(false);
          setIsTimelineOpen(true);
        }}
        onRunAgent={(id) => {
          setIsDrawerOpen(false);
          handleRunAgent(id);
        }}
      />
    </div>
  );
}
