'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { Invoice } from '@/types';
import { Settings, ShieldCheck, Sliders, Save, Check, Sparkles } from 'lucide-react';

export default function SettingsPage() {
  const [autoLimit, setAutoLimit] = useState(50000);
  const [requirePO, setRequirePO] = useState(true);
  const [requireVerifiedVendor, setRequireVerifiedVendor] = useState(true);
  const [varianceTolerance, setVarianceTolerance] = useState(0);
  const [blockDuplicates, setBlockDuplicates] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadPolicy = async () => {
    try {
      const res = await fetch('/api/policy');
      const data = await res.json();
      if (data.policy) {
        setAutoLimit(data.policy.autoApprovalMaxAmount ?? 50000);
        setRequirePO(data.policy.requireExistingPO ?? true);
        setRequireVerifiedVendor(data.policy.requireVerifiedVendor ?? true);
        setVarianceTolerance(data.policy.maxAllowedVariancePercent ?? 0);
        setBlockDuplicates(data.policy.blockDuplicateInvoices ?? true);
      }
    } catch (err) {
      console.error('Failed to load policy:', err);
    }
  };

  useEffect(() => {
    loadPolicy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoApprovalMaxAmount: autoLimit,
          requireExistingPO: requirePO,
          requireVerifiedVendor,
          maxAllowedVariancePercent: varianceTolerance,
          blockDuplicateInvoices: blockDuplicates,
        }),
      });
      setSaved(true);
      showToast('Autonomy & Risk Policy updated and persisted.');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save policy:', err);
      showToast('Failed to save policy settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectScenario = async (key: string) => {
    showToast(`Scenario ${key} selected. Ready to run under current governance policy.`);
  };

  const handleUploadCustom = async (invoiceData: Partial<Invoice>) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.invoice) {
        showToast(`Invoice #${data.invoice.invoiceNumber} uploaded successfully.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={loadPolicy}
        />

        <main className="p-6 space-y-6 max-w-4xl w-full mx-auto">
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
                  <span>Policies updated in database</span>
                </span>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Governance Policy'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      <InvoiceUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectScenario={handleSelectScenario as any}
        onUploadCustom={handleUploadCustom}
      />
    </div>
  );
}
