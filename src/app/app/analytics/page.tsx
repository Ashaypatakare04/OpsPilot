'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Zap, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenUpload={() => {}} />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-graphite-100">Operations & Autonomy Analytics</h2>
            <p className="text-xs text-graphite-400 mt-0.5">
              Efficiency gains, anomaly distribution, and risk mitigation metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Autonomous Execution Rate</span>
              <div className="text-3xl font-bold text-emerald-400">76.4%</div>
              <p className="text-[11px] text-graphite-500">Invoices processed straight-through without human touch</p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Discrepancies Caught</span>
              <div className="text-3xl font-bold text-rose-400">₹1,00,000+</div>
              <p className="text-[11px] text-graphite-500">Duplicate billings & unauthorized PO overages prevented</p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Cycle Time Reduction</span>
              <div className="text-3xl font-bold text-blue-400">4.2 days → 1.8s</div>
              <p className="text-[11px] text-graphite-500">Average reconciliation and ledger settlement velocity</p>
            </div>
          </div>

          {/* Anomaly Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-4">
              <h3 className="text-sm font-semibold text-graphite-200">Anomaly Distribution</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-graphite-300">PO Price Mismatch</span>
                    <span className="font-mono text-graphite-400">42%</span>
                  </div>
                  <div className="w-full bg-canvas-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-graphite-300">Missing Purchase Order Linkage</span>
                    <span className="font-mono text-graphite-400">28%</span>
                  </div>
                  <div className="w-full bg-canvas-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-graphite-300">Unverified / New Vendor</span>
                    <span className="font-mono text-graphite-400">18%</span>
                  </div>
                  <div className="w-full bg-canvas-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-graphite-300">Duplicate Invoice Submissions</span>
                    <span className="font-mono text-graphite-400">12%</span>
                  </div>
                  <div className="w-full bg-canvas-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-4">
              <h3 className="text-sm font-semibold text-graphite-200">Autonomy Matrix</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <div className="font-semibold mb-0.5">Automate (Low Risk)</div>
                  <div className="text-[11px] text-emerald-400/80">Matched PO, known vendor, under ₹50,000 limit.</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <div className="font-semibold mb-0.5">Require Human Approval (Medium & High Risk)</div>
                  <div className="text-[11px] text-amber-400/80">Amount overages, unbudgeted line items, high-value disbursements.</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                  <div className="font-semibold mb-0.5">Block Action (Critical Risk)</div>
                  <div className="text-[11px] text-red-400/80">Duplicate invoices, altered bank routing, suspected fraudulent claims.</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
