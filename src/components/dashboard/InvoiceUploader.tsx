'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ShieldAlert,
  ArrowRight,
  Layers,
  X,
} from 'lucide-react';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenarioKey: 'SAFE' | 'MISMATCH' | 'DUPLICATE' | 'UNKNOWN' | 'HIGH_VALUE') => void;
  onUploadCustom: (fileData: Partial<Invoice>) => Promise<void>;
  isProcessing?: boolean;
}

export const InvoiceUploader: React.FC<InvoiceUploaderProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  onUploadCustom,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'SCENARIOS' | 'UPLOAD'>('SCENARIOS');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Custom Form state
  const [customVendor, setCustomVendor] = useState('Stripe Payments Corp');
  const [customInvoiceNo, setCustomInvoiceNo] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [customAmount, setCustomAmount] = useState('34500');
  const [customPO, setCustomPO] = useState('PO-7841');

  if (!isOpen) return null;

  const demoScenarios = [
    {
      key: 'SAFE' as const,
      badge: 'Scenario A: Safe',
      title: 'Acme Cloud Services (INV-1041)',
      amount: '₹42,500',
      poText: 'PO-7841 (₹42,500 matched 100%)',
      expectedOutcome: 'AUTO-PROCESS (Risk: LOW)',
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      description: 'Standard operational cloud invoice matching approved purchase order within ₹50k limit.',
    },
    {
      key: 'MISMATCH' as const,
      badge: 'Scenario B: Mismatch',
      title: 'Acme Cloud Services (INV-1042)',
      amount: '₹87,500',
      poText: 'PO-7842 baseline is ₹75,000 (+₹12,500 overage)',
      expectedOutcome: 'HUMAN APPROVAL (Risk: HIGH)',
      color: 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      description: 'Invoice exceeds purchase order by 16.67% with extra unplanned bandwidth egress charges.',
    },
    {
      key: 'DUPLICATE' as const,
      badge: 'Scenario C: Duplicate',
      title: 'Acme Cloud Duplicate Submission',
      amount: '₹87,500',
      poText: 'Matches previously processed INV-1042',
      expectedOutcome: 'BLOCK ACTION (Risk: CRITICAL)',
      color: 'border-red-500/30 hover:border-red-500 bg-red-500/5',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
      icon: Ban,
      description: 'Resubmitted invoice matching existing invoice number and vendor. Prevents duplicate outflow.',
    },
    {
      key: 'UNKNOWN' as const,
      badge: 'Scenario D: Unknown Vendor',
      title: 'Apex Strategic Consulting (INV-9901)',
      amount: '₹95,000',
      poText: 'Missing PO linkage • Unverified vendor',
      expectedOutcome: 'HUMAN REVIEW (Risk: HIGH)',
      color: 'border-rose-500/30 hover:border-rose-500 bg-rose-500/5',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: ShieldAlert,
      description: 'Unverified supplier without authorized purchase order or banking transaction history.',
    },
    {
      key: 'HIGH_VALUE' as const,
      badge: 'Scenario E: High Value',
      title: 'CyberGuard SOC2 Retainer (INV-5520)',
      amount: '₹6,40,000',
      poText: 'PO-9201 matched 100% (exceeds ₹50k policy threshold)',
      expectedOutcome: 'HUMAN APPROVAL (Risk: HIGH)',
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: ShieldAlert,
      description: 'Legitimate high-value annual security retainer requiring dual-control executive sign-off.',
    },
  ];

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amountNum = parseFloat(customAmount) || 30000;
      await onUploadCustom({
        vendorName: customVendor,
        invoiceNumber: customInvoiceNo,
        totalAmount: amountNum,
        subtotal: Math.round(amountNum * 0.82),
        taxAmount: Math.round(amountNum * 0.18),
        currency: 'INR',
        purchaseOrderNumber: customPO || undefined,
        lineItems: [
          {
            id: 'li-c1',
            description: `${customVendor} Operational Services`,
            quantity: 1,
            unitPrice: amountNum,
            total: amountNum,
          },
        ],
        paymentDetails: {
          accountName: customVendor,
          accountNumber: '998877665544',
          bankName: 'Standard Chartered',
          routingOrIfsc: 'SCBL0036001',
          paymentMethod: 'NEFT',
        },
      });
      onClose();
    } catch (err) {
      console.error('Error submitting invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setCustomInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setCustomVendor(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setCustomInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setCustomVendor(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-canvas-900 border border-canvas-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-canvas-800 flex items-center justify-between bg-canvas-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-graphite-100 tracking-tight">
                Ingest & Process Invoice
              </h3>
              <p className="text-xs text-graphite-400 mt-0.5">
                Trigger agentic extraction, verification, reconciliation, and risk evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-graphite-400 hover:text-graphite-100 hover:bg-canvas-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-canvas-800 flex gap-4">
          <button
            onClick={() => setActiveTab('SCENARIOS')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'SCENARIOS'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-graphite-400 hover:text-graphite-200'
            }`}
          >
            Seeded Demo Scenarios (1-Click Run)
          </button>
          <button
            onClick={() => setActiveTab('UPLOAD')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'UPLOAD'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-graphite-400 hover:text-graphite-200'
            }`}
          >
            Custom Document Upload / Form
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'SCENARIOS' ? (
            <div className="space-y-3">
              <p className="text-xs text-graphite-400 mb-2">
                Select one of the official hackathon test matrix scenarios to observe genuine agentic reasoning:
              </p>

              {demoScenarios.map((sc) => {
                const Icon = sc.icon;
                return (
                  <div
                    role="button"
                    tabIndex={0}
                    key={sc.key}
                    onClick={() => {
                      onSelectScenario(sc.key);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectScenario(sc.key);
                        onClose();
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${sc.color}`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                          {sc.badge}
                        </span>
                        <span className="text-sm font-semibold text-graphite-100 group-hover:text-blue-300 transition-colors">
                          {sc.title}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-graphite-100">{sc.amount}</div>
                    </div>

                    <p className="text-xs text-graphite-300 mb-2">{sc.description}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-graphite-400 pt-2 border-t border-canvas-800/80">
                      <span>{sc.poText}</span>
                      <span className="flex items-center gap-1.5 font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                        <span>Expected: {sc.expectedOutcome}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Drag and drop box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-canvas-700 bg-canvas-850 hover:border-canvas-500 hover:bg-canvas-800/60'
                }`}
                title="Click to select file or drag file here"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-xs font-medium text-graphite-100">
                  {uploadedFile ? uploadedFile.name : 'Click to browse or drag & drop invoice PDF / scan'}
                </p>
                <p className="text-[11px] text-graphite-400 mt-1">
                  {uploadedFile ? 'File selected. Ready to ingest into autonomous agent.' : 'Supports PDF, PNG, JPG (Multimodal extraction ready)'}
                </p>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-graphite-400 block mb-1">Vendor Name</label>
                  <input
                    type="text"
                    value={customVendor}
                    onChange={(e) => setCustomVendor(e.target.value)}
                    className="w-full bg-canvas-850 border border-canvas-700 rounded-lg px-3 py-2 text-graphite-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-graphite-400 block mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={customInvoiceNo}
                    onChange={(e) => setCustomInvoiceNo(e.target.value)}
                    className="w-full bg-canvas-850 border border-canvas-700 rounded-lg px-3 py-2 text-graphite-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-graphite-400 block mb-1">Total Amount (₹ INR)</label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-canvas-850 border border-canvas-700 rounded-lg px-3 py-2 text-graphite-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-graphite-400 block mb-1">Purchase Order Reference</label>
                  <input
                    type="text"
                    value={customPO}
                    onChange={(e) => setCustomPO(e.target.value)}
                    placeholder="e.g. PO-7841 or leave empty"
                    className="w-full bg-canvas-850 border border-canvas-700 rounded-lg px-3 py-2 text-graphite-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || isSubmitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing || isSubmitting ? 'Ingesting & Launching Agent...' : 'Ingest & Run Autonomous Agent'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
