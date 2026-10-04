'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { WorkflowTimeline } from '@/components/dashboard/WorkflowTimeline';
import { WorkflowRun } from '@/types';
import { GitBranch, Clock, CheckCircle2, AlertTriangle, Eye, Layers } from 'lucide-react';
import { getRiskColorClass } from '@/lib/formatters';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRun | null>(null);

  useEffect(() => {
    fetch('/api/workflows')
      .then((r) => r.json())
      .then((data) => {
        if (data.workflows) {
          setWorkflows(data.workflows);
          if (data.workflows.length > 0) setSelectedWorkflow(data.workflows[0]);
        }
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenUpload={() => {}} />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-graphite-100">Agentic Workflow Runs</h2>
            <p className="text-xs text-graphite-400 mt-0.5">
              Multi-step execution graphs: Ingest → Extract → Reconcile → Risk → Plan → Execute → Verify
            </p>
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
    </div>
  );
}
