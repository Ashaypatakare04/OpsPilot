'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { Invoice } from '@/types';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Zap, CheckCircle2, Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectScenario = async (key: 'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE') => {
    const idMap: Record<string, string> = {
      SAFE: 'inv-1041',
      MISMATCH: 'inv-1042',
      DUPLICATE: 'inv-1042-dup',
      UNKNOWN: 'inv-9901',
      HIGH_VALUE: 'inv-5520',
    };

    setIsProcessing(true);
    try {
      showToast(`Running scenario ${key} for analytics telemetry...`);
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: idMap[key] }),
      });
      showToast(`Analytics telemetry refreshed with scenario ${key}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadCustom = async (invoiceData: Partial<Invoice>) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.invoice) {
        showToast(`Ingesting #${data.invoice.invoiceNumber}...`);
        await fetch('/api/agent/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: data.invoice.id }),
        });
        showToast(`Analytics metrics updated for #${data.invoice.invoiceNumber}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={() => showToast('Analytics calculations up to date.')}
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

          <div>
            <h2 className="text-xl font-bold tracking-tight text-graphite-100">Operations & Autonomy Analytics</h2>
            <p className="text-xs text-graphite-400 mt-0.5">
              Efficiency gains, anomaly distribution, and risk mitigation metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Straight-Through Processing</span>
              <div className="text-3xl font-bold text-emerald-400">Policy-Bounded</div>
              <p className="text-[11px] text-graphite-500">Designed for safe straight-through automation without ceding financial control</p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Discrepancy Protection</span>
              <div className="text-3xl font-bold text-rose-400">Active Guardrails</div>
              <p className="text-[11px] text-graphite-500">Duplicate billings & unauthorized PO overages intercepted before payment</p>
            </div>

            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-2">
              <span className="text-xs font-medium text-graphite-400">Reconciliation Velocity</span>
              <div className="text-3xl font-bold text-blue-400">Sub-Second</div>
              <p className="text-[11px] text-graphite-500">Deterministic verification & guardrail evaluation per invoice</p>
            </div>
          </div>

          {/* Anomaly Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-canvas-900 border border-canvas-800 space-y-4">
              <h3 className="text-sm font-semibold text-graphite-200">Incident Category Breakdown</h3>
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

      <InvoiceUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectScenario={handleSelectScenario}
        onUploadCustom={handleUploadCustom}
        isProcessing={isProcessing}
      />
    </div>
  );
}
