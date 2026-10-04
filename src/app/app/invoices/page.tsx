'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { InvoiceDetailDrawer } from '@/components/dashboard/InvoiceDetailDrawer';
import { InvoiceUploader } from '@/components/dashboard/InvoiceUploader';
import { Invoice, WorkflowRun } from '@/types';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/formatters';
import { FileText, Eye, Play, Plus, Search, Filter } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((data) => {
        if (data.invoices) setInvoices(data.invoices);
      });
    fetch('/api/workflows')
      .then((r) => r.json())
      .then((data) => {
        if (data.workflows) setWorkflows(data.workflows);
      });
  }, []);

  const filtered = invoices.filter(
    (inv) =>
      inv.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.purchaseOrderNumber && inv.purchaseOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-canvas-950 text-graphite-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenUpload={() => setIsUploadOpen(true)} />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-graphite-100">Invoices Ledger</h2>
              <p className="text-xs text-graphite-400 mt-0.5">
                All extracted, verified, and reconciled invoice records
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-graphite-500" />
                <input
                  type="text"
                  placeholder="Search invoices, vendors, POs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-canvas-900 border border-canvas-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-graphite-100 placeholder-graphite-500 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-canvas-900 border border-canvas-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-canvas-800 bg-canvas-850/50 text-[11px] font-mono uppercase text-graphite-400">
                    <th className="py-3 px-4 font-medium">Invoice #</th>
                    <th className="py-3 px-4 font-medium">Vendor</th>
                    <th className="py-3 px-4 font-medium">PO Reference</th>
                    <th className="py-3 px-4 font-medium">Due Date</th>
                    <th className="py-3 px-4 font-medium">Amount</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-800">
                  {filtered.map((inv) => {
                    const statusInfo = getStatusBadge(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-canvas-850/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-graphite-200">
                          #{inv.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-graphite-100">
                          {inv.vendorName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-graphite-400">
                          {inv.purchaseOrderNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-graphite-400">
                          {formatDate(inv.dueDate)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-graphite-100">
                          {formatCurrency(inv.totalAmount, inv.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsDrawerOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-canvas-800 hover:bg-canvas-700 text-graphite-300 hover:text-graphite-100 border border-canvas-700 text-[11px]"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <InvoiceDetailDrawer
        isOpen={isDrawerOpen}
        invoice={selectedInvoice}
        workflow={workflows.find((w) => w.invoiceId === selectedInvoice?.id) || null}
        onClose={() => setIsDrawerOpen(false)}
        onOpenApproval={() => {}}
        onViewWorkflow={() => {}}
        onRunAgent={() => {}}
      />

      <InvoiceUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectScenario={() => {}}
        onUploadCustom={async () => {}}
      />
    </div>
  );
}
