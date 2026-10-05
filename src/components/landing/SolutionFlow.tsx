'use client';

import React from 'react';
import {
  Inbox,
  Cpu,
  GitCompare,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export const SolutionFlow: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Receive & Ingest',
      desc: 'Multimodal ingestion of PDFs, scans, and emails into structured schemas.',
      icon: Inbox,
    },
    {
      num: '02',
      title: 'Understand Context',
      desc: 'Vendor identification, trust score checks, and bank registry cross-matching.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Reconcile Data',
      desc: 'Line-by-line comparison with purchase orders to detect variances and unbudgeted items.',
      icon: GitCompare,
    },
    {
      num: '04',
      title: 'Decide Autonomy',
      desc: 'Deterministic + AI risk engine classifies risk as Low, Medium, High, or Critical.',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'Act / Gated Release',
      desc: 'Autonomous execution for safe invoices; stops and asks human for high-risk actions.',
      icon: Zap,
    },
    {
      num: '06',
      title: 'Verify & Audit',
      desc: 'Confirms ledger settlement and seals a tamper-evident audit trail entry.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="workflow" className="py-24 border-b border-canvas-800/80 bg-canvas-900/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            End-to-End Orchestration
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-graphite-100">
            Reason → Plan → Tool → Observe → Decide → Act → Verify
          </h2>
          <p className="text-sm text-graphite-300 leading-relaxed">
            OpsPilot is not a passive LLM wrapper. It is an agentic operational machine with strict tool schemas and cryptographic auditability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-6 rounded-2xl bg-canvas-900 border border-canvas-800 hover:border-canvas-700 transition-all space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-canvas-850 border border-canvas-750 group-hover:border-blue-500/40 group-hover:text-blue-400 transition-colors">
                    <Icon className="w-5 h-5 text-graphite-300 group-hover:text-blue-400" />
                  </div>
                  <span className="font-mono text-xs text-graphite-600 font-bold">{st.num}</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-graphite-100">{st.title}</h3>
                  <p className="text-xs text-graphite-400 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
