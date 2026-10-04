'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  Ban,
  ShieldAlert,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export const WorkflowInteractiveDemo: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<
    'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE'
  >('MISMATCH');

  const scenarios = {
    SAFE: {
      name: 'Scenario A: Safe Invoice',
      invoice: 'INV-1041',
      vendor: 'Acme Cloud Services',
      amount: 42500,
      poAmount: 42500,
      variance: '0%',
      risk: 'LOW (12/100)',
      action: 'AUTO-PROCESS',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      explanation: 'Invoice matches PO-7841 exactly. Vendor is verified with a 98% trust score. Amount is within the ₹50,000 threshold. Safe for autonomous settlement.',
      steps: [
        { tool: 'extractInvoice()', result: 'Extracted INV-1041 (₹42,500)' },
        { tool: 'matchInvoiceToPO()', result: '100% Match with PO-7841' },
        { tool: 'calculateRisk()', result: 'Risk: LOW • Clearance: AUTO' },
        { tool: 'executePaymentAction()', result: 'Simulated NEFT reference DEMO-PAY-881920' },
        { tool: 'verifyAction()', result: 'Ledger reconciled & verified' },
      ],
    },
    MISMATCH: {
      name: 'Scenario B: PO Mismatch (+16.7%)',
      invoice: 'INV-1042',
      vendor: 'Acme Cloud Services',
      amount: 87500,
      poAmount: 75000,
      variance: '+16.67% (₹12,500 overage)',
      risk: 'HIGH (78/100)',
      action: 'REQUIRE HUMAN APPROVAL',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      explanation: 'Invoice exceeds Purchase Order PO-7842 by ₹12,500. Detected unbudgeted line item: "Unplanned Overage: Egress Bandwidth Traffic Spikes". Automatic payment blocked.',
      steps: [
        { tool: 'extractInvoice()', result: 'Extracted INV-1042 (₹87,500)' },
        { tool: 'matchInvoiceToPO()', result: 'PO-7842 Mismatch: +₹12,500 variance' },
        { tool: 'detectAnomalies()', result: 'Flagged unbudgeted bandwidth egress' },
        { tool: 'calculateRisk()', result: 'Risk: HIGH • Autonomous Action BLOCKED' },
        { tool: 'createApprovalRequest()', result: 'Sent alert to Operations Inbox' },
      ],
    },
    DUPLICATE: {
      name: 'Scenario C: Duplicate Submission',
      invoice: 'INV-1042 (Resubmitted)',
      vendor: 'Acme Cloud Services',
      amount: 87500,
      poAmount: 75000,
      variance: 'Duplicate Record',
      risk: 'CRITICAL (99/100)',
      action: 'HARD BLOCK',
      statusColor: 'text-red-400 bg-red-500/10 border-red-500/20',
      explanation: 'Invoice #INV-1042 for Acme Cloud Services already exists in the system. Duplicate payment protection triggered to prevent double cash disbursement.',
      steps: [
        { tool: 'extractInvoice()', result: 'Extracted INV-1042' },
        { tool: 'checkDuplicateInvoice()', result: 'Duplicate found in active ledger' },
        { tool: 'calculateRisk()', result: 'Risk: CRITICAL (Score 99)' },
        { tool: 'policyEnforcer()', result: 'Workflow permanently halted' },
      ],
    },
    UNKNOWN: {
      name: 'Scenario D: Unknown Vendor',
      invoice: 'INV-9901',
      vendor: 'Apex Strategic Consulting',
      amount: 95000,
      poAmount: 0,
      variance: 'Missing PO Linkage',
      risk: 'HIGH (84/100)',
      action: 'REQUIRE HUMAN REVIEW',
      statusColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      explanation: 'Vendor "Apex Strategic Consulting" is unverified with low trust score (42%). No authorized Purchase Order exists for this invoice.',
      steps: [
        { tool: 'extractInvoice()', result: 'Extracted INV-9901 (₹95,000)' },
        { tool: 'getVendor()', result: 'Unverified vendor • Trust score 42%' },
        { tool: 'matchInvoiceToPO()', result: 'Missing PO authorization' },
        { tool: 'calculateRisk()', result: 'Risk: HIGH • Manual compliance required' },
        { tool: 'createApprovalRequest()', result: 'Founder review requested' },
      ],
    },
    HIGH_VALUE: {
      name: 'Scenario E: High Value Retainer',
      invoice: 'INV-5520',
      vendor: 'CyberGuard Defense Systems',
      amount: 640000,
      poAmount: 640000,
      variance: '0% (Exceeds ₹50k Cap)',
      risk: 'HIGH (72/100)',
      action: 'REQUIRE DUAL APPROVAL',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      explanation: 'Invoice matches PO-9201 100%, but amount (₹6,40,000) exceeds autonomous threshold (₹50,000). Responsible AI guardrail enforces executive confirmation.',
      steps: [
        { tool: 'extractInvoice()', result: 'Extracted INV-5520 (₹6,40,000)' },
        { tool: 'matchInvoiceToPO()', result: 'PO-9201 matched 100%' },
        { tool: 'detectAnomalies()', result: 'Exceeds autonomous cap of ₹50k' },
        { tool: 'calculateRisk()', result: 'Risk: HIGH due to capital exposure' },
        { tool: 'createApprovalRequest()', result: 'Executive dual sign-off dispatched' },
      ],
    },
  };

  const curr = scenarios[selectedScenario];

  return (
    <section id="demo-sandbox" className="py-24 border-b border-canvas-800/80 bg-canvas-900/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            Interactive Test Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-graphite-100">
            Simulate the Agent in Action
          </h2>
          <p className="text-sm text-graphite-300 leading-relaxed">
            Toggle through the 5 official hackathon scenarios below to observe how OpsPilot reasons, plans, and selects appropriate safety actions.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((k) => (
            <button
              key={k}
              onClick={() => setSelectedScenario(k)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedScenario === k
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-canvas-850 hover:bg-canvas-800 text-graphite-300 border border-canvas-750'
              }`}
            >
              {scenarios[k].name}
            </button>
          ))}
        </div>

        {/* Simulation Display Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-canvas-950 border border-canvas-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-canvas-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-graphite-100">{curr.vendor}</h3>
                <span className="text-xs font-mono text-graphite-400">#{curr.invoice}</span>
              </div>
              <p className="text-xs text-graphite-400 font-mono mt-0.5">
                Amount: {formatCurrency(curr.amount, 'INR')} • Variance: {curr.variance}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${curr.statusColor}`}>
                {curr.action}
              </span>
            </div>
          </div>

          {/* AI Decision Explanation */}
          <div className="p-4 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-graphite-200">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Orchestrator Decision Explanation</span>
            </div>
            <p className="text-xs text-graphite-300 leading-relaxed font-sans">
              {curr.explanation}
            </p>
          </div>

          {/* Tool Execution Steps */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase text-graphite-500 block">
              Executed Tool Telemetry Trace
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {curr.steps.map((st, i) => (
                <div key={i} className="p-3 rounded-lg bg-canvas-900 border border-canvas-800/80 text-xs flex items-center justify-between">
                  <span className="font-mono text-blue-400 text-[11px]">{st.tool}</span>
                  <span className="text-graphite-300 text-[11px] font-medium">{st.result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Link to Live Dashboard */}
          <div className="pt-4 border-t border-canvas-800 flex items-center justify-between">
            <span className="text-xs text-graphite-400 font-mono">
              Ready to test with your own invoices?
            </span>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all hover:scale-105"
            >
              <span>Open Full Operations App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
