export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WorkflowStatus = 
  | 'PENDING'
  | 'INGESTING'
  | 'EXTRACTING'
  | 'VERIFYING'
  | 'RECONCILING'
  | 'ANALYZING_RISK'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'VERIFYING_ACTION'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'FAILED';

export type AutonomyDecision = 'AUTO_PROCESS' | 'REQUIRE_APPROVAL' | 'BLOCK';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BankPaymentDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingOrIfsc: string;
  paymentMethod: 'NEFT' | 'RTGS' | 'ACH' | 'WIRE' | 'UPI';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorTaxId?: string;
  vendorAddress?: string;
  invoiceDate: string;
  dueDate: string;
  currency: Currency;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  purchaseOrderNumber?: string;
  paymentDetails: BankPaymentDetails;
  lineItems: LineItem[];
  confidenceScores?: {
    vendor: number;
    invoiceNumber: number;
    totalAmount: number;
    poNumber?: number;
    lineItems: number;
    overall: number;
  };
  fileUrl?: string;
  fileName?: string;
  fileType?: 'application/pdf' | 'image/png' | 'image/jpeg' | 'demo';
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  issueDate: string;
  currency: Currency;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'OPEN' | 'PARTIALLY_BILLED' | 'CLOSED' | 'CANCELLED';
  lineItems: LineItem[];
  department: string;
  approvedBy: string;
}

export interface Vendor {
  id: string;
  name: string;
  taxId: string;
  email: string;
  isVerified: boolean;
  trustScore: number; // 0 - 100
  registeredBankDetails: BankPaymentDetails;
  totalSpendYTD: number;
  status: 'ACTIVE' | 'FLAGGED' | 'SUSPENDED';
}

export interface ReconciliationResult {
  isMatch: boolean;
  poFound: boolean;
  poNumber?: string;
  invoiceTotal: number;
  poTotal: number;
  differenceAmount: number;
  variancePercentage: number;
  discrepancies: {
    field: string;
    invoiceValue: string | number;
    poValue: string | number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    note: string;
  }[];
  vendorMatch: boolean;
  currencyMatch: boolean;
  lineItemsMatched: boolean;
}

export interface AnomalyReport {
  detected: boolean;
  anomalies: {
    type: 
      | 'PO_MISMATCH'
      | 'AMOUNT_DISCREPANCY'
      | 'DUPLICATE_INVOICE'
      | 'MISSING_PO'
      | 'UNKNOWN_VENDOR'
      | 'SUSPICIOUS_PAYMENT_DETAILS'
      | 'FIELD_MATH_INCONSISTENCY'
      | 'HIGH_VALUE_THRESHOLD';
    severity: RiskLevel;
    message: string;
    details?: string;
  }[];
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number; // 0 - 100
  decision: AutonomyDecision;
  reasons: string[];
  factors: {
    name: string;
    weight: number;
    score: number;
    explanation: string;
  }[];
  suggestedAction: string;
  evaluatedAt: string;
}

export interface ApprovalRequest {
  id: string;
  workflowId: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorName: string;
  amount: number;
  currency: Currency;
  riskLevel: RiskLevel;
  reason: string;
  reconciliationSummary?: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export interface AuditLogEntry {
  id: string;
  workflowId: string;
  timestamp: string;
  action: string;
  toolUsed?: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED' | 'BLOCKED' | 'PENDING_USER';
  riskLevel?: RiskLevel;
  explanation: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowTimelineStep {
  id: string;
  name: string;
  toolName: string;
  status: 'COMPLETED' | 'RUNNING' | 'WAITING_APPROVAL' | 'WARNING' | 'BLOCKED' | 'FAILED' | 'PENDING';
  timestamp?: string;
  durationMs?: number;
  summary: string;
  details?: Record<string, unknown>;
}

export interface WorkflowRun {
  id: string;
  invoiceId: string;
  status: WorkflowStatus;
  autonomyDecision: AutonomyDecision;
  riskAssessment?: RiskAssessment;
  reconciliation?: ReconciliationResult;
  anomalies?: AnomalyReport;
  approvalRequest?: ApprovalRequest;
  executionResult?: {
    paymentReference: string;
    adapterUsed: string;
    executedAt: string;
    amount: number;
    currency: Currency;
    verificationStatus: 'VERIFIED' | 'FAILED';
    verificationProof: string;
  };
  timeline: WorkflowTimelineStep[];
  auditLogs: AuditLogEntry[];
  startedAt: string;
  completedAt?: string;
  totalDurationMs?: number;
}

export interface AutonomyPolicyConfig {
  autoApprovalMaxAmount: number; // e.g. 50,000
  requireVerifiedVendor: boolean;
  requireExistingPO: boolean;
  maxAllowedVariancePercent: number; // e.g. 0% for auto
  blockDuplicateInvoices: boolean;
  enableSimulatedPayment: boolean;
}
