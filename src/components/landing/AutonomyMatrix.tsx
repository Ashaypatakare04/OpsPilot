'use client';

import React from 'react';
import { CheckCircle2, ShieldAlert, Ban, ArrowRight } from 'lucide-react';

export const AutonomyMatrix: React.FC = () => {
  return (
    <section id="autonomy" className="py-24 border-b border-canvas-800/80 bg-canvas-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Core Product Differentiator
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-graphite-100">
            AI should know when NOT to automate.
          </h2>
          <p className="text-sm text-graphite-300 leading-relaxed">
            Most agents fail because they either automate blindly or require human confirmation for trivial tasks. OpsPilot defines strict mathematical autonomy tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* SAFE -> AUTOMATE */}
          <div className="p-7 rounded-2xl bg-canvas-900 border border-emerald-500/30 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  TIER 1 • LOW RISK
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-graphite-100">SAFE → AUTOMATE</h3>
                <p className="text-xs text-graphite-300 leading-relaxed">
                  Low-value invoices matching authorized purchase orders with 0% variance from verified vendors.
                </p>
              </div>

              <ul className="text-xs text-graphite-400 space-y-2 pt-2 border-t border-canvas-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Amount within ₹50k limit</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Verified vendor registry</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Straight-through settlement</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[11px] font-mono text-emerald-300">
              Action: Fully Autonomous Execution
            </div>
          </div>

          {/* UNCERTAIN -> ASK HUMAN */}
          <div className="p-7 rounded-2xl bg-canvas-900 border border-amber-500/40 space-y-5 flex flex-col justify-between shadow-lg shadow-amber-500/5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  TIER 2 • MEDIUM & HIGH RISK
                </span>
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-graphite-100">UNCERTAIN → ASK HUMAN</h3>
                <p className="text-xs text-graphite-300 leading-relaxed">
                  Price discrepancies, unbudgeted line items, high-value disbursements, or unverified suppliers.
                </p>
              </div>

              <ul className="text-xs text-graphite-400 space-y-2 pt-2 border-t border-canvas-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Variance overage &gt; 0%</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Missing PO reference</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>Dispatches approval to Inbox</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] font-mono text-amber-300">
              Action: Human-in-the-Loop Sign-off
            </div>
          </div>

          {/* DANGEROUS -> BLOCK */}
          <div className="p-7 rounded-2xl bg-canvas-900 border border-red-500/30 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  TIER 3 • CRITICAL RISK
                </span>
                <Ban className="w-5 h-5 text-red-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-graphite-100">DANGEROUS → BLOCK</h3>
                <p className="text-xs text-graphite-300 leading-relaxed">
                  Duplicate invoices, altered bank accounts, checksum failures, and anomalous vendor spoofing.
                </p>
              </div>

              <ul className="text-xs text-graphite-400 space-y-2 pt-2 border-t border-canvas-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Duplicate invoice number</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Altered bank routing info</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Hard block prevents capital loss</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-[11px] font-mono text-red-300">
              Action: Execution Hard Block
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
