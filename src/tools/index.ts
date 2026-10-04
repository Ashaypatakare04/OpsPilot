import { db } from '@/db/mockDatabase';
import { paymentAdapter } from '@/services/adapters/paymentAdapter';
import { geminiProvider } from '@/services/ai/geminiProvider';
import {
  Invoice,
  PurchaseOrder,
  Vendor,
  ReconciliationResult,
  AnomalyReport,
  RiskAssessment,
  ApprovalRequest,
  AuditLogEntry,
  Currency,
  RiskLevel,
  AutonomyDecision,
} from '@/types';

// ==========================================
// TOOL 1: extractInvoice
// ==========================================
export interface ExtractInvoiceInput {
  invoiceId?: string;
  rawText?: string;
  fileBuffer?: string;
}

export interface ExtractInvoiceOutput {
  success: boolean;
  invoice: Invoice;
  confidenceScores: {
    vendor: number;
    invoiceNumber: number;
    totalAmount: number;
    poNumber?: number;
    overall: number;
  };
}

export async function extractInvoiceTool(input: ExtractInvoiceInput): Promise<ExtractInvoiceOutput> {
  if (input.invoiceId) {
    const existing = db.getInvoice(input.invoiceId);
    if (existing) {
      return {
        success: true,
        invoice: existing,
        confidenceScores: existing.confidenceScores || {
          vendor: 0.98,
          invoiceNumber: 0.99,
          totalAmount: 1.0,
          poNumber: existing.purchaseOrderNumber ? 0.95 : 0.0,
          overall: 0.98,
        },
      };
    }
  }

  throw new Error(`Failed to extract invoice: record not found for input ${JSON.stringify(input)}`);
}

// ==========================================
// TOOL 2: getVendor
// ==========================================
export interface GetVendorInput {
  vendorId?: string;
  vendorName?: string;
}

export interface GetVendorOutput {
  found: boolean;
  vendor?: Vendor;
  isVerified: boolean;
  trustScore: number;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED' | 'UNKNOWN';
}

export async function getVendorTool(input: GetVendorInput): Promise<GetVendorOutput> {
  let vendor: Vendor | undefined;
  if (input.vendorId) {
    vendor = db.getVendor(input.vendorId);
  } else if (input.vendorName) {
    vendor = db.findVendorByName(input.vendorName);
  }

  if (vendor) {
    return {
      found: true,
      vendor,
      isVerified: vendor.isVerified,
      trustScore: vendor.trustScore,
      status: vendor.status,
    };
  }

  return {
    found: false,
    isVerified: false,
    trustScore: 0,
    status: 'UNKNOWN',
  };
}

// ==========================================
// TOOL 3: getPurchaseOrder
// ==========================================
export interface GetPurchaseOrderInput {
  poNumber: string;
}

export interface GetPurchaseOrderOutput {
  found: boolean;
  purchaseOrder?: PurchaseOrder;
}

export async function getPurchaseOrderTool(input: GetPurchaseOrderInput): Promise<GetPurchaseOrderOutput> {
  const po = db.getPurchaseOrder(input.poNumber);
  return {
    found: !!po,
    purchaseOrder: po,
  };
}

// ==========================================
// TOOL 4: matchInvoiceToPO
// ==========================================
export interface MatchInvoiceToPOInput {
  invoice: Invoice;
  purchaseOrder?: PurchaseOrder;
}

export async function matchInvoiceToPOTool(input: MatchInvoiceToPOInput): Promise<ReconciliationResult> {
  const { invoice, purchaseOrder } = input;

  if (!purchaseOrder) {
    return {
      isMatch: false,
      poFound: false,
      invoiceTotal: invoice.totalAmount,
      poTotal: 0,
      differenceAmount: invoice.totalAmount,
      variancePercentage: 100,
      discrepancies: [
        {
          field: 'Purchase Order',
          invoiceValue: invoice.purchaseOrderNumber || 'None',
          poValue: 'Missing',
          severity: 'HIGH',
          note: 'No authorized Purchase Order found in system ledger.',
        },
      ],
      vendorMatch: false,
      currencyMatch: true,
      lineItemsMatched: false,
    };
  }

  const discrepancies: ReconciliationResult['discrepancies'] = [];
  const diff = invoice.totalAmount - purchaseOrder.totalAmount;
  const variancePct = purchaseOrder.totalAmount > 0 
    ? Math.round(((diff / purchaseOrder.totalAmount) * 100) * 100) / 100 
    : 0;

  // Check vendor match
  const vendorMatch = invoice.vendorName.toLowerCase().includes(purchaseOrder.vendorName.toLowerCase()) ||
    purchaseOrder.vendorName.toLowerCase().includes(invoice.vendorName.toLowerCase());

  if (!vendorMatch) {
    discrepancies.push({
      field: 'Vendor Name',
      invoiceValue: invoice.vendorName,
      poValue: purchaseOrder.vendorName,
      severity: 'HIGH',
      note: 'Invoice vendor does not match Purchase Order authorized vendor.',
    });
  }

  // Check currency
  const currencyMatch = invoice.currency === purchaseOrder.currency;
  if (!currencyMatch) {
    discrepancies.push({
      field: 'Currency',
      invoiceValue: invoice.currency,
      poValue: purchaseOrder.currency,
      severity: 'HIGH',
      note: 'Currency mismatch between invoice and purchase order.',
    });
  }

  // Check amount
  if (Math.abs(diff) > 0.5) {
    discrepancies.push({
      field: 'Total Amount',
      invoiceValue: `${invoice.currency} ${invoice.totalAmount.toLocaleString('en-IN')}`,
      poValue: `${purchaseOrder.currency} ${purchaseOrder.totalAmount.toLocaleString('en-IN')}`,
      severity: diff > 0 ? 'HIGH' : 'MEDIUM',
      note: diff > 0
        ? `Invoice exceeds PO by ${invoice.currency} ${diff.toLocaleString('en-IN')} (${variancePct}% overage)`
        : `Invoice is lower than PO by ${invoice.currency} ${Math.abs(diff).toLocaleString('en-IN')}`,
    });
  }

  // Check line items count
  const lineItemsMatched = invoice.lineItems.length === purchaseOrder.lineItems.length && diff === 0;
  if (invoice.lineItems.length !== purchaseOrder.lineItems.length) {
    discrepancies.push({
      field: 'Line Items Count',
      invoiceValue: `${invoice.lineItems.length} items`,
      poValue: `${purchaseOrder.lineItems.length} items`,
      severity: 'MEDIUM',
      note: `Line item count mismatch (${invoice.lineItems.length} on invoice vs ${purchaseOrder.lineItems.length} on PO)`,
    });
  }

  const isMatch = discrepancies.length === 0;

  return {
    isMatch,
    poFound: true,
    poNumber: purchaseOrder.poNumber,
    invoiceTotal: invoice.totalAmount,
    poTotal: purchaseOrder.totalAmount,
    differenceAmount: diff,
    variancePercentage: variancePct,
    discrepancies,
    vendorMatch,
    currencyMatch,
    lineItemsMatched,
  };
}

// ==========================================
// TOOL 5: checkDuplicateInvoice
// ==========================================
export interface CheckDuplicateInput {
  invoiceNumber: string;
  vendorId?: string;
  vendorName: string;
  currentInvoiceId: string;
}

export interface CheckDuplicateOutput {
  isDuplicate: boolean;
  duplicateOfId?: string;
  explanation?: string;
}

export async function checkDuplicateInvoiceTool(input: CheckDuplicateInput): Promise<CheckDuplicateOutput> {
  const existingInvoices = db.getInvoices();
  const currentInv = db.getInvoice(input.currentInvoiceId);
  const currentTime = currentInv?.createdAt ? new Date(currentInv.createdAt).getTime() : Date.now();

  const match = existingInvoices.find(
    (inv) =>
      inv.id !== input.currentInvoiceId &&
      inv.invoiceNumber.toLowerCase().trim() === input.invoiceNumber.toLowerCase().trim() &&
      inv.vendorName.toLowerCase().trim() === input.vendorName.toLowerCase().trim() &&
      (currentInv ? new Date(inv.createdAt).getTime() < currentTime : true)
  );

  if (match) {
    return {
      isDuplicate: true,
      duplicateOfId: match.id,
      explanation: `Invoice #${input.invoiceNumber} already exists in the system for vendor "${input.vendorName}" (Record ID: ${match.id}, Status: ${match.status}). Duplicate submission prevented.`,
    };
  }

  return {
    isDuplicate: false,
  };
}

// ==========================================
// TOOL 6: detectAnomalies
// ==========================================
export interface DetectAnomaliesInput {
  invoice: Invoice;
  reconciliation: ReconciliationResult;
  vendorData?: GetVendorOutput;
  duplicateCheck: CheckDuplicateOutput;
}

export async function detectAnomaliesTool(input: DetectAnomaliesInput): Promise<AnomalyReport> {
  const anomalies: AnomalyReport['anomalies'] = [];
  const policy = db.getPolicy();

  // 1. Duplicate
  if (input.duplicateCheck.isDuplicate) {
    anomalies.push({
      type: 'DUPLICATE_INVOICE',
      severity: 'CRITICAL',
      message: `Duplicate invoice #${input.invoice.invoiceNumber} detected`,
      details: input.duplicateCheck.explanation,
    });
  }

  // 2. Unknown vendor
  if (!input.vendorData?.isVerified) {
    anomalies.push({
      type: 'UNKNOWN_VENDOR',
      severity: 'HIGH',
      message: `Vendor "${input.invoice.vendorName}" is unverified in vendor registry`,
      details: `Trust score: ${input.vendorData?.trustScore ?? 0}%. Registration check required.`,
    });
  }

  // 3. Missing PO
  if (!input.reconciliation.poFound) {
    anomalies.push({
      type: 'MISSING_PO',
      severity: 'HIGH',
      message: 'Missing Purchase Order linkage',
      details: 'Invoice has no matching authorized Purchase Order in internal records.',
    });
  }

  // 4. Amount discrepancy / PO mismatch
  if (input.reconciliation.differenceAmount > 0) {
    anomalies.push({
      type: 'PO_MISMATCH',
      severity: 'HIGH',
      message: `Invoice exceeds PO amount by ₹${input.reconciliation.differenceAmount.toLocaleString('en-IN')}`,
      details: `Variance of +${input.reconciliation.variancePercentage}% over authorized ceiling.`,
    });
  }

  // 5. High-value threshold
  if (input.invoice.totalAmount > policy.autoApprovalMaxAmount) {
    anomalies.push({
      type: 'HIGH_VALUE_THRESHOLD',
      severity: 'MEDIUM',
      message: `Invoice value (₹${input.invoice.totalAmount.toLocaleString('en-IN')}) exceeds auto-processing cap of ₹${policy.autoApprovalMaxAmount.toLocaleString('en-IN')}`,
      details: 'Material cash outflow policy requires human sign-off.',
    });
  }

  // 6. Math check: line items sum vs total
  const lineItemsSum = input.invoice.lineItems.reduce((acc, item) => acc + item.total, 0);
  if (Math.abs(lineItemsSum - input.invoice.subtotal) > 2) {
    anomalies.push({
      type: 'FIELD_MATH_INCONSISTENCY',
      severity: 'MEDIUM',
      message: 'Internal calculation discrepancy: Line items sum does not match invoice subtotal',
      details: `Line items sum: ${lineItemsSum}, declared subtotal: ${input.invoice.subtotal}`,
    });
  }

  return {
    detected: anomalies.length > 0,
    anomalies,
  };
}

// ==========================================
// TOOL 7: calculateRisk
// ==========================================
export interface CalculateRiskInput {
  invoice: Invoice;
  reconciliation: ReconciliationResult;
  anomalies: AnomalyReport;
  vendorData?: GetVendorOutput;
}

export async function calculateRiskTool(input: CalculateRiskInput): Promise<RiskAssessment> {
  const { invoice, reconciliation, anomalies, vendorData } = input;
  const policy = db.getPolicy();

  // Query AI engine for contextual evaluation & concise explanation
  const aiResult = await geminiProvider.analyzeInvoiceOperation({
    invoiceData: {
      vendorName: invoice.vendorName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      poNumber: invoice.purchaseOrderNumber,
      lineItems: invoice.lineItems,
    },
    poData: reconciliation.poFound
      ? {
          poNumber: reconciliation.poNumber || 'UNKNOWN',
          vendorName: invoice.vendorName,
          totalAmount: reconciliation.poTotal,
          currency: invoice.currency,
          lineItems: [],
        }
      : null,
    vendorData: vendorData?.vendor
      ? {
          name: vendorData.vendor.name,
          isVerified: vendorData.isVerified,
          trustScore: vendorData.trustScore,
          status: vendorData.status,
        }
      : null,
    anomaliesDetected: anomalies.anomalies.map((a) => a.message),
  });

  // Calculate deterministic factors
  const factors: RiskAssessment['factors'] = [];
  const reasons: string[] = [];

  // Critical checks
  if (anomalies.anomalies.some((a) => a.type === 'DUPLICATE_INVOICE')) {
    factors.push({
      name: 'Duplicate Invoice Check',
      weight: 50,
      score: 100,
      explanation: 'Exact invoice record match found in ledger.',
    });
    reasons.push('Duplicate invoice detected — payment permanently blocked.');
  }

  // PO Match Factor
  if (!reconciliation.poFound) {
    factors.push({
      name: 'PO Linkage',
      weight: 35,
      score: 85,
      explanation: 'No approved purchase order found.',
    });
    reasons.push('Missing purchase order authorization.');
  } else if (reconciliation.differenceAmount > 0) {
    factors.push({
      name: 'PO Amount Variance',
      weight: 35,
      score: Math.min(100, Math.round(50 + reconciliation.variancePercentage * 2)),
      explanation: `Invoice exceeds PO by ₹${reconciliation.differenceAmount.toLocaleString('en-IN')} (+${reconciliation.variancePercentage}%).`,
    });
    reasons.push(`Invoice exceeds PO amount by ₹${reconciliation.differenceAmount.toLocaleString('en-IN')}.`);
  } else {
    factors.push({
      name: 'PO Amount Match',
      weight: 35,
      score: 0,
      explanation: 'Invoice matches PO total exactly.',
    });
  }

  // Vendor Trust Factor
  if (!vendorData?.isVerified) {
    factors.push({
      name: 'Vendor Trust',
      weight: 30,
      score: 85,
      explanation: 'Vendor not in verified registry.',
    });
    reasons.push('Unverified vendor requires compliance check.');
  } else {
    factors.push({
      name: 'Vendor Trust',
      weight: 30,
      score: Math.max(0, 100 - (vendorData?.trustScore ?? 0)),
      explanation: `Verified vendor (Trust: ${vendorData?.trustScore ?? 0}%).`,
    });
  }

  // Financial Exposure Factor
  if (invoice.totalAmount > policy.autoApprovalMaxAmount) {
    factors.push({
      name: 'Financial Magnitude',
      weight: 25,
      score: 75,
      explanation: `Amount ₹${invoice.totalAmount.toLocaleString('en-IN')} exceeds auto threshold of ₹${policy.autoApprovalMaxAmount.toLocaleString('en-IN')}.`,
    });
    reasons.push(`High monetary value (₹${invoice.totalAmount.toLocaleString('en-IN')}) requires executive sign-off.`);
  } else {
    factors.push({
      name: 'Financial Magnitude',
      weight: 25,
      score: 15,
      explanation: `Amount ₹${invoice.totalAmount.toLocaleString('en-IN')} is within autonomous safe limit.`,
    });
  }

  // Final risk level determination
  let level: RiskLevel = 'LOW';
  let decision: AutonomyDecision = 'AUTO_PROCESS';

  if (anomalies.anomalies.some((a) => a.severity === 'CRITICAL')) {
    level = 'CRITICAL';
    decision = 'BLOCK';
  } else if (
    anomalies.anomalies.some((a) => a.severity === 'HIGH') ||
    invoice.totalAmount > policy.autoApprovalMaxAmount ||
    !reconciliation.poFound ||
    reconciliation.differenceAmount > 0 ||
    !vendorData?.isVerified
  ) {
    level = 'HIGH';
    decision = 'REQUIRE_APPROVAL';
  } else if (anomalies.anomalies.some((a) => a.severity === 'MEDIUM')) {
    level = 'MEDIUM';
    decision = 'REQUIRE_APPROVAL';
  }

  const score = aiResult.riskScore || (level === 'CRITICAL' ? 98 : level === 'HIGH' ? 76 : level === 'MEDIUM' ? 52 : 12);

  return {
    level,
    score,
    decision,
    reasons: reasons.length > 0 ? reasons : ['Invoice verified and cleared for routine automation'],
    factors,
    suggestedAction: aiResult.decisionExplanation,
    evaluatedAt: new Date().toISOString(),
  };
}

// ==========================================
// TOOL 8: createApprovalRequest
// ==========================================
export interface CreateApprovalInput {
  workflowId: string;
  invoice: Invoice;
  riskAssessment: RiskAssessment;
  reconciliation: ReconciliationResult;
}

export async function createApprovalRequestTool(input: CreateApprovalInput): Promise<ApprovalRequest> {
  const req: ApprovalRequest = {
    id: `appr-${input.invoice.id}-${Date.now().toString().slice(-4)}`,
    workflowId: input.workflowId,
    invoiceId: input.invoice.id,
    invoiceNumber: input.invoice.invoiceNumber,
    vendorName: input.invoice.vendorName,
    amount: input.invoice.totalAmount,
    currency: input.invoice.currency,
    riskLevel: input.riskAssessment.level,
    reason: input.riskAssessment.suggestedAction,
    reconciliationSummary: input.reconciliation.poFound
      ? `PO ${input.reconciliation.poNumber}: ₹${input.reconciliation.poTotal.toLocaleString('en-IN')} vs Invoice ₹${input.invoice.totalAmount.toLocaleString('en-IN')} (Diff: ₹${input.reconciliation.differenceAmount.toLocaleString('en-IN')})`
      : 'No Purchase Order linked.',
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
  };

  db.saveApproval(req);
  return req;
}

// ==========================================
// TOOL 9: approveAction
// ==========================================
export interface ApproveActionInput {
  approvalId: string;
  approvedBy: string;
  note?: string;
}

export async function approveActionTool(input: ApproveActionInput): Promise<ApprovalRequest> {
  const appr = db.getApproval(input.approvalId);
  if (!appr) {
    throw new Error(`Approval request ${input.approvalId} not found`);
  }

  appr.status = 'APPROVED';
  appr.decidedBy = input.approvedBy;
  appr.decidedAt = new Date().toISOString();
  appr.decisionNote = input.note || 'Approved by operations human-in-the-loop oversight';

  db.saveApproval(appr);
  return appr;
}

// ==========================================
// TOOL 10: rejectAction
// ==========================================
export interface RejectActionInput {
  approvalId: string;
  rejectedBy: string;
  reason: string;
}

export async function rejectActionTool(input: RejectActionInput): Promise<ApprovalRequest> {
  const appr = db.getApproval(input.approvalId);
  if (!appr) {
    throw new Error(`Approval request ${input.approvalId} not found`);
  }

  appr.status = 'REJECTED';
  appr.decidedBy = input.rejectedBy;
  appr.decidedAt = new Date().toISOString();
  appr.decisionNote = input.reason;

  db.saveApproval(appr);
  return appr;
}

// ==========================================
// TOOL 11: executePaymentAction
// ==========================================
export interface ExecutePaymentInput {
  invoice: Invoice;
  approvedBy?: string;
}

export async function executePaymentActionTool(input: ExecutePaymentInput) {
  return await paymentAdapter.executePayment({
    invoiceId: input.invoice.id,
    invoiceNumber: input.invoice.invoiceNumber,
    vendorName: input.invoice.vendorName,
    amount: input.invoice.totalAmount,
    currency: input.invoice.currency,
    bankDetails: input.invoice.paymentDetails,
  });
}

// ==========================================
// TOOL 12: verifyAction
// ==========================================
export interface VerifyActionInput {
  paymentReference: string;
}

export async function verifyActionTool(input: VerifyActionInput) {
  return await paymentAdapter.verifySettlement(input.paymentReference);
}

// ==========================================
// TOOL 13: writeAuditLog
// ==========================================
export interface WriteAuditLogInput {
  workflowId: string;
  action: string;
  toolUsed?: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED' | 'BLOCKED' | 'PENDING_USER';
  riskLevel?: RiskLevel;
  explanation: string;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLogTool(input: WriteAuditLogInput): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    workflowId: input.workflowId,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    action: input.action,
    toolUsed: input.toolUsed,
    result: input.result,
    riskLevel: input.riskLevel,
    explanation: input.explanation,
    metadata: input.metadata,
  };

  db.addAuditLog(entry);
  return entry;
}
