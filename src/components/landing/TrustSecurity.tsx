'use client';

import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';

export const TrustSecurity: React.FC = () => {
  const pillars = [
    {
      title: 'Human Control & Oversight',
      desc: 'High-value disbursements, PO discrepancies, and unverified suppliers unconditionally route to humans for sign-off.',
      icon: ShieldCheck,
    },
    {
      title: 'Deterministic + AI Guardrails',
      desc: 'Critical financial rules are enforced deterministically. AI provides semantic reasoning, never unchecked money movement.',
      icon: Lock,
    },
    {
      title: 'Zero Chain-of-Thought Exfiltration',
      desc: 'Exposes concise decision rationale and verified tool outputs. Internal reasoning tokens are never leaked to external logs.',
      icon: Eye,
    },
    {
      title: 'Controlled Tool Schemas',
      desc: 'No arbitrary shell, SQL, or code execution. All actions pass through strict, typed schema tools.',
      icon: FileText,
    },
    {
      title: 'Immutable Audit Trail',
      desc: 'Every timestamp, tool input, output, and reviewer signature is cryptographically traceable in the operations ledger.',
      icon: CheckCircle2,
    },
    {
      title: 'Fail-Safe Architecture',
      desc: 'When an anomaly, timeout, or ambiguity is detected, OpsPilot defaults to: STOP AND ASK A HUMAN.',
      icon: AlertOctagon,
    },
  ];

  return (
    <section id="governance" className="py-24 border-b border-canvas-800/80 bg-canvas-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Responsible AI Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-graphite-100">
            Built for enterprise financial compliance.
          </h2>
          <p className="text-sm text-graphite-300 leading-relaxed">
            Finance teams cannot tolerate hallucinations. OpsPilot was engineered with safety-first design principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-canvas-900 border border-canvas-800 hover:border-canvas-700 transition-all space-y-3"
              >
                <div className="p-3 rounded-xl bg-canvas-850 border border-canvas-750 inline-block text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-graphite-100">{p.title}</h3>
                <p className="text-xs text-graphite-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
