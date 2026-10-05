'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { AuditLogEntry, Invoice } from '@/types';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Clock, Sparkles } from 'lucide-react';
import { getRiskColorClass } from '@/lib/formatters';

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectScenario = async (key: 'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE') => {
    const idMap: Record<string, string> = {
      SAFE: 'inv-1041',
      MISMATCH: 'inv-1042',
      DUPLICATE: 'inv-1042-dup',
      UNKNOWN: 'inv-9901',
      HIGH_VALUE: 'inv-5520',
    };

    const targetInvoiceId = idMap[key];
    setIsProcessing(true);
    try {
      showToast(`Running scenario ${key} through audit trail...`);
      await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: targetInvoiceId }),
      });
      await loadData();
      showToast(`Audit trail updated with scenario ${key} tool traces`);
    } catch (err) {
      console.error('Failed to run scenario:', err);
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
        await loadData();
        showToast(`Logged verified audit steps for #${data.invoice.invoiceNumber}`);
      }
    } catch (err) {
      console.error('Custom invoice error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getResultBadge = (res: string) => {
    switch (res) {
      case 'SUCCESS':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">SUCCESS</span>;
      case 'WARNING':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">WARNING</span>;
      case 'BLOCKED':
      case 'FAILED':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">BLOCKED</span>;
      case 'PENDING_USER':
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">PENDING USER</span>;
      default:
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-graphite-800 text-graphite-300">{res}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={loadData}
          isRefreshing={isLoading}
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
            <h2 className="text-xl font-bold tracking-tight text-graphite-100">Tamper-Evident Audit Trail</h2>
            <p className="text-xs text-graphite-400 mt-0.5">
              Cryptographically trace all autonomous actions, tool executions, and human decisions
            </p>
          </div>

          <div className="bg-canvas-900 border border-canvas-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-canvas-800 flex items-center justify-between text-xs text-graphite-400 font-mono">
              <span>{logs.length} Logged Events</span>
              <span>Zero CoT Exfiltration • Strict Operational Visibility</span>
            </div>

            <div className="divide-y divide-canvas-800">
              {logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-canvas-850/50 transition-colors flex items-start gap-4 text-xs">
                  <div className="font-mono text-graphite-500 shrink-0 mt-0.5 text-[11px] w-20">
                    {log.timestamp}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-graphite-200">{log.action}</span>
                      {log.toolUsed && (
                        <span className="font-mono text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          {log.toolUsed}()
                        </span>
                      )}
                      {getResultBadge(log.result)}
                      {log.riskLevel && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getRiskColorClass(log.riskLevel).badge}`}>
                          Risk: {log.riskLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-graphite-300 leading-relaxed text-xs">{log.explanation}</p>
                    <div className="text-[10px] font-mono text-graphite-500">
                      Workflow ID: {log.workflowId}
                    </div>
                  </div>
                </div>
              ))}
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
