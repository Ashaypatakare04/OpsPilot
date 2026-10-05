'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { WorkflowTimeline } from '@/components/dashboard/WorkflowTimeline';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { WorkflowRun, Invoice } from '@/types';
import { Sparkles, Play, Plus } from 'lucide-react';
import { getRiskColorClass } from '@/lib/formatters';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (data.workflows) {
        setWorkflows(data.workflows);
        return data.workflows as WorkflowRun[];
      }
      return [];
    } catch (err) {
      console.error('Failed to load workflows:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData().then((wfs) => {
      // Check query param for auto-selection
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const qId = params.get('id');
        const qInvId = params.get('invoiceId');

        if (qId) {
          const match = wfs.find((w) => w.id === qId);
          if (match) {
            setSelectedWorkflow(match);
            return;
          }
        }
        if (qInvId) {
          const match = wfs.find((w) => w.invoiceId === qInvId);
          if (match) {
            setSelectedWorkflow(match);
            return;
          }
        }
      }

      if (wfs.length > 0) {
        setSelectedWorkflow((prev) => prev || wfs[0]);
      }
    });
  }, []);

  const handleSelectScenario = async (key: 'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE') => {
    const idMap: Record<string, string> = {
      SAFE: 'inv-1041',
      MISMATCH: 'inv-1042',
      DUPLICATE: 'inv-1042-dup',
      UNKNOWN: 'inv-9901',
      HIGH_VALUE: 'inv-5520',
    };

    const targetInvoiceId = idMap[key];
    const wfs = await loadData();
    const match = wfs.find((w) => w.invoiceId === targetInvoiceId);

    if (match) {
      setSelectedWorkflow(match);
      showToast(`Selected workflow for ${key} scenario (${match.id})`);
    } else {
      showToast(`Running autonomous agent for ${key}...`);
      setIsRunningAgent(true);
      try {
        const res = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: targetInvoiceId }),
        });
        const data = await res.json();
        if (data.workflow) {
          setSelectedWorkflow(data.workflow);
          await loadData();
          showToast(`Workflow execution finished: ${data.workflow.autonomyDecision}`);
        }
      } catch (err) {
        console.error('Agent run failed:', err);
      } finally {
        setIsRunningAgent(false);
      }
    }
  };

  const handleUploadCustom = async (invoiceData: Partial<Invoice>) => {
    setIsRunningAgent(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.invoice) {
        showToast(`Invoice #${data.invoice.invoiceNumber} ingested. Executing agent...`);
        const runRes = await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: data.invoice.id }),
        });
        const runData = await runRes.json();
        await loadData();
        if (runData.workflow) {
          setSelectedWorkflow(runData.workflow);
          showToast(`Workflow completed with decision: ${runData.workflow.autonomyDecision}`);
        }
      }
    } catch (err) {
      console.error('Custom invoice workflow error:', err);
      showToast('Custom workflow execution failed.');
    } finally {
      setIsRunningAgent(false);
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-graphite-100">Agentic Workflow Runs</h2>
              <p className="text-xs text-graphite-400 mt-0.5">
                Multi-step execution graphs: Ingest → Extract → Reconcile → Risk → Plan → Execute → Verify
              </p>
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest & Run Workflow</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflows List */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase text-graphite-500 block">
                Workflow Executions ({workflows.length})
              </span>
              <div className="space-y-2">
                {workflows.map((wf) => {
                  const isSelected = selectedWorkflow?.id === wf.id;
                  const riskColors = getRiskColorClass(wf.riskAssessment?.level);

                  return (
                    <div
                      key={wf.id}
                      onClick={() => setSelectedWorkflow(wf)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-canvas-850 border-blue-500 shadow-sm'
                          : 'bg-canvas-900 border-canvas-800 hover:border-canvas-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-medium text-xs text-graphite-200">
                          {wf.id}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${riskColors.badge}`}>
                          {wf.riskAssessment?.level || 'LOW'}
                        </span>
                      </div>
                      <p className="text-xs text-graphite-400 line-clamp-1">
                        Decision: {wf.autonomyDecision} • {wf.status}
                      </p>
                      <div className="text-[11px] font-mono text-graphite-500 mt-2 flex items-center justify-between">
                        <span>{wf.timeline.length} tool nodes</span>
                        <span>{wf.startedAt ? new Date(wf.startedAt).toLocaleTimeString() : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Graph Visualization */}
            <div className="lg:col-span-2">
              <WorkflowTimeline workflow={selectedWorkflow} />
            </div>
          </div>
        </main>
      </div>

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
