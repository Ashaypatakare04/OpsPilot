'use client';

import React from 'react';
import { Mail, FileSpreadsheet, FileText, AlertTriangle, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  return (
    <section id="core-insight" className="py-24 border-b border-canvas-800/80 bg-canvas-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            The Startup Finance Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-graphite-100">
            Too much operational work happens between the systems.
          </h2>
          <p className="text-sm text-graphite-300 leading-relaxed">
            Invoices arrive via email, PDFs, and vendor portals. Founders and lean ops teams are stuck manually cross-checking line items against purchase orders.
          </p>
        </div>

        {/* Visual Comparison: The Broken Manual Gap vs OpsPilot Controlled Autonomy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left: The Broken Manual Process */}
          <div className="p-7 rounded-2xl bg-canvas-900 border border-canvas-800 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <XCircle className="w-4 h-4" />
                <span>The Manual Trap or Blind AI Automation</span>
              </div>

              <div className="space-y-3 text-xs text-graphite-300">
                <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-800 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-graphite-400 shrink-0" />
                  <span>Unstructured PDF received in email inbox</span>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-800 flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-graphite-400 shrink-0" />
                  <span>Manual search in ERP / spreadsheets for PO authorization</span>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-800 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hidden price creeping: 16% overage unnoticed</span>
                </div>
                <div className="p-3.5 rounded-xl bg-canvas-850 border border-canvas-800 flex items-center gap-3 text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Blind AI scripts accidentally pay duplicate invoices</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-canvas-800/80 text-[11px] font-mono text-graphite-400">
              Result: Repetitive delays, duplicate disbursement risk, zero auditability.
            </div>
          </div>

          {/* Right: The OpsPilot Solution */}
          <div className="p-7 rounded-2xl bg-canvas-900 border border-blue-500/30 space-y-5 flex flex-col justify-between shadow-lg shadow-blue-500/5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>OpsPilot Autonomous Execution Layer</span>
              </div>

              <div className="space-y-3 text-xs text-graphite-200">
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                  <span>Confidence-aware structured extraction</span>
                  <span className="text-[10px] font-mono text-blue-400">Multimodal Gemini</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                  <span>Mathematical PO reconciliation & line item diff</span>
                  <span className="text-[10px] font-mono text-emerald-400">0% Tolerance</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                  <span>Deterministic Anomaly & Duplicate Detection</span>
                  <span className="text-[10px] font-mono text-amber-400">Policy Guard</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                  <span>Autonomy Gating: Safe to execute vs Human Approval</span>
                  <span className="text-[10px] font-mono text-emerald-400">Controlled Autonomy</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-canvas-800/80 text-[11px] font-mono text-emerald-400">
              Result: Designed for safe straight-through automation without ceding financial control.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
