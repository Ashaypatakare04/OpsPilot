'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Wrench,
  ChevronRight,
  ShieldAlert,
  ArrowDown,
  Layers,
  Terminal,
} from 'lucide-react';
import { WorkflowRun, WorkflowTimelineStep } from '@/types';

interface WorkflowTimelineProps {
  workflow: WorkflowRun | null;
  onClose?: () => void;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ workflow, onClose }) => {
  const [selectedStep, setSelectedStep] = useState<WorkflowTimelineStep | null>(null);

  if (!workflow) {
    return (
      <div className="p-8 text-center text-graphite-400 bg-canvas-900 border border-canvas-800 rounded-xl">
        <Layers className="w-8 h-8 mx-auto mb-2 text-graphite-600" />
        <p className="text-sm font-medium text-graphite-300">No active workflow selected</p>
        <p className="text-xs text-graphite-500 mt-1">Select an invoice to inspect its autonomous execution lifecycle.</p>
      </div>
    );
  }

  const getStatusIcon = (status: WorkflowTimelineStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'WAITING_APPROVAL':
        return <Clock className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'BLOCKED':
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'RUNNING':
        return <span className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-graphite-600" />;
    }
  };

  const currentStep = selectedStep || workflow.timeline[workflow.timeline.length - 1];

  return (
    <div className="bg-canvas-900 border border-canvas-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-canvas-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-graphite-100">Workflow Execution Graph</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Run ID: {workflow.id}
            </span>
          </div>
          <p className="text-xs text-graphite-400 mt-0.5">
            Agent trace: Reason → Plan → Tool → Observe → Decide → Act → Verify
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-graphite-400 hover:text-graphite-200 px-2 py-1 rounded bg-canvas-800"
          >
            Close
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* Timeline Node Flow (Left/Main Column) */}
        <div className="lg:col-span-7 p-5 border-b lg:border-b-0 lg:border-r border-canvas-800 overflow-y-auto max-h-[520px]">
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-canvas-800">
            {workflow.timeline.map((step, idx) => {
              const isSelected = currentStep?.id === step.id;

              return (
                <div
                  key={step.id || idx}
                  onClick={() => setSelectedStep(step)}
                  className={`relative cursor-pointer group p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-canvas-800 border-blue-500/50 shadow-sm'
                      : 'bg-canvas-850/60 border-canvas-800 hover:bg-canvas-800/80 hover:border-canvas-700'
                  }`}
                >
                  {/* Step status node bullet */}
                  <div
                    className={`absolute -left-[30px] top-4 w-5 h-5 rounded-full bg-canvas-900 border flex items-center justify-center ${
                      step.status === 'COMPLETED'
                        ? 'border-emerald-500/50'
                        : step.status === 'WARNING'
                        ? 'border-amber-500/50'
                        : step.status === 'WAITING_APPROVAL'
                        ? 'border-rose-500/50'
                        : 'border-canvas-700'
                    }`}
                  >
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Step Header */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-graphite-100 group-hover:text-blue-300 transition-colors">
                        {step.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-canvas-800 text-graphite-400 border border-canvas-700">
                        {step.toolName}
                      </span>
                    </div>

                    <div className="text-[10px] font-mono text-graphite-500 flex items-center gap-1.5">
                      {step.timestamp && <span>{step.timestamp}</span>}
                      {step.durationMs && <span>({step.durationMs}ms)</span>}
                    </div>
                  </div>

                  {/* Step Summary */}
                  <p className="text-xs text-graphite-300 leading-relaxed">{step.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Step Inspector (Right Column) */}
        <div className="lg:col-span-5 p-5 bg-canvas-950/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-canvas-800">
              <Terminal className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-graphite-200 font-mono uppercase tracking-wider">
                Step Observability Inspector
              </h4>
            </div>

            {currentStep ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-graphite-500">Operation Node</span>
                  <div className="text-sm font-semibold text-graphite-100">{currentStep.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      Tool: {currentStep.toolName}()
                    </span>
                    <span className="text-[11px] font-mono text-graphite-400">
                      Status: {currentStep.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-graphite-500">Agent Decision Explanation</span>
                  <p className="text-xs text-graphite-300 mt-1 leading-relaxed bg-canvas-850 p-3 rounded-lg border border-canvas-800">
                    {currentStep.summary}
                  </p>
                </div>

                {currentStep.details && Object.keys(currentStep.details).length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono uppercase text-graphite-500">Verified Payload Metadata</span>
                    <pre className="text-[11px] font-mono text-graphite-300 bg-canvas-900 p-3 rounded-lg border border-canvas-800 mt-1 overflow-x-auto max-h-48 text-wrap">
                      {JSON.stringify(currentStep.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-graphite-500 text-center py-12">
                Select a step on the timeline to inspect its verified tool telemetry.
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-canvas-800 text-[11px] font-mono text-graphite-500 flex items-center justify-between">
            <span>Safety: Strict Schema Enforcement</span>
            <span>Audit: Hash Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
