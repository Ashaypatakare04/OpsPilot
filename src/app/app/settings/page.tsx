'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { Settings, ShieldCheck, Sliders, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const [autoLimit, setAutoLimit] = useState(50000);
  const [requirePO, setRequirePO] = useState(true);
  const [requireVerifiedVendor, setRequireVerifiedVendor] = useState(true);
  const [varianceTolerance, setVarianceTolerance] = useState(0);
  const [blockDuplicates, setBlockDuplicates] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenUpload={() => {}} />

        <main className="p-6 space-y-6 max-w-4xl w-full mx-auto">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-graphite-100">Autonomy & Risk Policy Settings</h2>
            <p className="text-xs text-graphite-400 mt-0.5">
              Control how much financial autonomy OpsPilot is permitted to exercise
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="p-6 rounded-xl bg-canvas-900 border border-canvas-800 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-canvas-800">
                <Sliders className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-graphite-200">Autonomous Execution Thresholds</h3>
              </div>

              {/* Threshold Slider / Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-graphite-200">
                    Maximum Automated Payment Limit (₹ INR)
                  </label>
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    ₹{autoLimit.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={autoLimit}
                  onChange={(e) => setAutoLimit(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-[11px] text-graphite-500">
                  Invoices above this threshold unconditionally trigger human approval, even if PO matches 100%.
                </p>
              </div>

              {/* Variance Tolerance */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-graphite-200">
                    Max Allowed PO Variance Tolerance (%)
                  </label>
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {varianceTolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={varianceTolerance}
                  onChange={(e) => setVarianceTolerance(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <p className="text-[11px] text-graphite-500">
                  Default: 0%. Any price overage beyond this percentage will be flagged for human sign-off.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-canvas-800 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-graphite-200 block">Require Pre-Authorized Purchase Order</span>
                    <span className="text-graphite-500 text-[11px]">Block auto-processing for invoices lacking PO records</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requirePO}
                    onChange={(e) => setRequirePO(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-graphite-200 block">Require Verified Vendor Status</span>
                    <span className="text-graphite-500 text-[11px]">Require vendor trust score &gt; 50% for straight-through automation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireVerifiedVendor}
                    onChange={(e) => setRequireVerifiedVendor(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-graphite-200 block">Hard Block Duplicate Invoices</span>
                    <span className="text-graphite-500 text-[11px]">Immediately terminate execution upon duplicate detection</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={blockDuplicates}
                    onChange={(e) => setBlockDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {saved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Check className="w-3.5 h-3.5" />
                  <span>Policies updated</span>
                </span>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Governance Policy</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
