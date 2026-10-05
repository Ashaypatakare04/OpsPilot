import {
  Invoice,
  PurchaseOrder,
  Vendor,
  WorkflowRun,
  AutonomyPolicyConfig,
  ApprovalRequest,
  AuditLogEntry,
} from '@/types';

export const DEFAULT_AUTONOMY_POLICY: AutonomyPolicyConfig = {
  autoApprovalMaxAmount: 50000, // ₹50,000 INR
  requireVerifiedVendor: true,
  requireExistingPO: true,
  maxAllowedVariancePercent: 0,
  blockDuplicateInvoices: true,
  enableSimulatedPayment: true,
};

export const SEEDED_VENDORS: Vendor[] = [
  {
    id: 'vend-acme',
    name: 'Acme Cloud Services',
    taxId: 'GSTIN29AAACA1234B1Z5',
    email: 'billing@acmecloud.com',
    isVerified: true,
    trustScore: 98,
    totalSpendYTD: 420000,
    status: 'ACTIVE',
    registeredBankDetails: {
      accountName: 'Acme Cloud Services India Pvt Ltd',
      accountNumber: '918237461928',
      bankName: 'HDFC Bank',
      routingOrIfsc: 'HDFC0001824',
      paymentMethod: 'NEFT',
    },
  },
  {
    id: 'vend-cyberguard',
    name: 'CyberGuard Defense Systems',
    taxId: 'GSTIN07AABCC5432D1Z8',
    email: 'finance@cyberguard.security',
    isVerified: true,
    trustScore: 95,
    totalSpendYTD: 1280000,
    status: 'ACTIVE',
    registeredBankDetails: {
      accountName: 'CyberGuard Defense Systems LLP',
      accountNumber: '50200049182741',
      bankName: 'ICICI Bank',
      routingOrIfsc: 'ICIC0000021',
      paymentMethod: 'RTGS',
    },
  },
  {
    id: 'vend-apex',
    name: 'Apex Strategic Consulting',
    taxId: 'GSTIN33XYZAP7788P1Z2',
    email: 'invoicing@apexconsult.io',
    isVerified: false,
    trustScore: 42,
    totalSpendYTD: 0,
    status: 'FLAGGED',
    registeredBankDetails: {
      accountName: 'Apex Consulting Enterprise',
      accountNumber: '110022998844',
      bankName: 'Axis Bank',
      routingOrIfsc: 'UTIB0002914',
      paymentMethod: 'NEFT',
    },
  },
  {
    id: 'vend-slack',
    name: 'Workspace Tools Inc',
    taxId: 'GSTIN19AABCS8899Q1Z1',
    email: 'ar@workspacetools.co',
    isVerified: true,
    trustScore: 99,
    totalSpendYTD: 185000,
    status: 'ACTIVE',
    registeredBankDetails: {
      accountName: 'Workspace Tools Operations',
      accountNumber: '334455667788',
      bankName: 'Kotak Mahindra Bank',
      routingOrIfsc: 'KKBK0000451',
      paymentMethod: 'NEFT',
    },
  },
];

export const SEEDED_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-7841',
    poNumber: 'PO-7841',
    vendorId: 'vend-acme',
    vendorName: 'Acme Cloud Services',
    issueDate: '2026-09-15',
    currency: 'INR',
    subtotal: 36017,
    taxAmount: 6483,
    totalAmount: 42500,
    status: 'OPEN',
    department: 'Engineering / Infrastructure',
    approvedBy: 'DevOps Lead (Sarah Chen)',
    lineItems: [
      {
        id: 'li-po-1',
        description: 'Production Kubernetes Cluster Compute Units (30-day reservation)',
        quantity: 1,
        unitPrice: 28000,
        total: 28000,
      },
      {
        id: 'li-po-2',
        description: 'Managed PostgreSQL High-Availability Storage (500GB)',
        quantity: 1,
        unitPrice: 8017,
        total: 8017,
      },
    ],
  },
  {
    id: 'po-7842',
    poNumber: 'PO-7842',
    vendorId: 'vend-acme',
    vendorName: 'Acme Cloud Services',
    issueDate: '2026-09-20',
    currency: 'INR',
    subtotal: 63559,
    taxAmount: 11441,
    totalAmount: 75000,
    status: 'OPEN',
    department: 'Engineering / Infrastructure',
    approvedBy: 'DevOps Lead (Sarah Chen)',
    lineItems: [
      {
        id: 'li-po-3',
        description: 'Enterprise CDN Bandwidth & Global Edge Cache Tier',
        quantity: 1,
        unitPrice: 63559,
        total: 63559,
      },
    ],
  },
  {
    id: 'po-9201',
    poNumber: 'PO-9201',
    vendorId: 'vend-cyberguard',
    vendorName: 'CyberGuard Defense Systems',
    issueDate: '2026-09-28',
    currency: 'INR',
    subtotal: 542373,
    taxAmount: 97627,
    totalAmount: 640000,
    status: 'OPEN',
    department: 'Security & Compliance',
    approvedBy: 'CTO (Rohan Deshmukh)',
    lineItems: [
      {
        id: 'li-po-4',
        description: 'Annual SOC2 Type II Continuous Audit & Pen-testing Retainer',
        quantity: 1,
        unitPrice: 542373,
        total: 542373,
      },
    ],
  },
];

export const SEEDED_INVOICES: Invoice[] = [
  {
    id: 'inv-1041',
    invoiceNumber: 'INV-1041',
    vendorId: 'vend-acme',
    vendorName: 'Acme Cloud Services',
    vendorTaxId: 'GSTIN29AAACA1234B1Z5',
    vendorAddress: 'Tech Oasis Park, Inner Ring Rd, Bengaluru, KA 560047',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-15',
    currency: 'INR',
    subtotal: 36017,
    taxAmount: 6483,
    totalAmount: 42500,
    purchaseOrderNumber: 'PO-7841',
    status: 'COMPLETED',
    createdAt: '2026-10-02T09:15:00Z',
    updatedAt: '2026-10-02T09:16:30Z',
    fileType: 'demo',
    fileName: 'INV-1041_AcmeCloud.pdf',
    confidenceScores: {
      vendor: 0.99,
      invoiceNumber: 1.0,
      totalAmount: 1.0,
      poNumber: 0.98,
      lineItems: 0.97,
      overall: 0.99,
    },
    paymentDetails: {
      accountName: 'Acme Cloud Services India Pvt Ltd',
      accountNumber: '918237461928',
      bankName: 'HDFC Bank',
      routingOrIfsc: 'HDFC0001824',
      paymentMethod: 'NEFT',
    },
    lineItems: [
      {
        id: 'li-inv-1',
        description: 'Production Kubernetes Cluster Compute Units (30-day reservation)',
        quantity: 1,
        unitPrice: 28000,
        total: 28000,
      },
      {
        id: 'li-inv-2',
        description: 'Managed PostgreSQL High-Availability Storage (500GB)',
        quantity: 1,
        unitPrice: 8017,
        total: 8017,
      },
    ],
  },
  {
    id: 'inv-1042',
    invoiceNumber: 'INV-1042',
    vendorId: 'vend-acme',
    vendorName: 'Acme Cloud Services',
    vendorTaxId: 'GSTIN29AAACA1234B1Z5',
    vendorAddress: 'Tech Oasis Park, Inner Ring Rd, Bengaluru, KA 560047',
    invoiceDate: '2026-10-02',
    dueDate: '2026-10-16',
    currency: 'INR',
    subtotal: 74152.54,
    taxAmount: 13347.46,
    totalAmount: 87500,
    purchaseOrderNumber: 'PO-7842',
    status: 'AWAITING_APPROVAL',
    createdAt: '2026-10-03T10:31:02Z',
    updatedAt: '2026-10-03T10:31:12Z',
    fileType: 'demo',
    fileName: 'INV-1042_AcmeCloud_Overage.pdf',
    confidenceScores: {
      vendor: 0.98,
      invoiceNumber: 0.99,
      totalAmount: 1.0,
      poNumber: 0.94,
      lineItems: 0.95,
      overall: 0.97,
    },
    paymentDetails: {
      accountName: 'Acme Cloud Services India Pvt Ltd',
      accountNumber: '918237461928',
      bankName: 'HDFC Bank',
      routingOrIfsc: 'HDFC0001824',
      paymentMethod: 'NEFT',
    },
    lineItems: [
      {
        id: 'li-inv-3',
        description: 'Enterprise CDN Bandwidth & Global Edge Cache Tier',
        quantity: 1,
        unitPrice: 63559,
        total: 63559,
      },
      {
        id: 'li-inv-4',
        description: 'Unplanned Overage: Egress Bandwidth Traffic Spikes (4.2TB)',
        quantity: 1,
        unitPrice: 10593.54,
        total: 10593.54,
      },
    ],
  },
  {
    id: 'inv-1042-dup',
    invoiceNumber: 'INV-1042',
    vendorId: 'vend-acme',
    vendorName: 'Acme Cloud Services',
    vendorTaxId: 'GSTIN29AAACA1234B1Z5',
    vendorAddress: 'Tech Oasis Park, Inner Ring Rd, Bengaluru, KA 560047',
    invoiceDate: '2026-10-02',
    dueDate: '2026-10-16',
    currency: 'INR',
    subtotal: 74152.54,
    taxAmount: 13347.46,
    totalAmount: 87500,
    purchaseOrderNumber: 'PO-7842',
    status: 'BLOCKED',
    createdAt: '2026-10-03T14:20:00Z',
    updatedAt: '2026-10-03T14:20:05Z',
    fileType: 'demo',
    fileName: 'INV-1042_AcmeCloud_Resubmitted.pdf',
    confidenceScores: {
      vendor: 0.99,
      invoiceNumber: 1.0,
      totalAmount: 1.0,
      poNumber: 0.95,
      lineItems: 0.96,
      overall: 0.98,
    },
    paymentDetails: {
      accountName: 'Acme Cloud Services India Pvt Ltd',
      accountNumber: '918237461928',
      bankName: 'HDFC Bank',
      routingOrIfsc: 'HDFC0001824',
      paymentMethod: 'NEFT',
    },
    lineItems: [
      {
        id: 'li-inv-dup-1',
        description: 'Enterprise CDN Bandwidth & Global Edge Cache Tier',
        quantity: 1,
        unitPrice: 63559,
        total: 63559,
      },
    ],
  },
  {
    id: 'inv-9901',
    invoiceNumber: 'INV-9901',
    vendorId: 'vend-apex',
    vendorName: 'Apex Strategic Consulting',
    vendorTaxId: 'GSTIN33XYZAP7788P1Z2',
    vendorAddress: 'Level 4, Skyline Plaza, Pune, MH 411006',
    invoiceDate: '2026-10-03',
    dueDate: '2026-10-10',
    currency: 'INR',
    subtotal: 80508.47,
    taxAmount: 14491.53,
    totalAmount: 95000,
    purchaseOrderNumber: undefined, // Missing PO!
    status: 'AWAITING_APPROVAL',
    createdAt: '2026-10-04T08:12:00Z',
    updatedAt: '2026-10-04T08:12:10Z',
    fileType: 'demo',
    fileName: 'INV-9901_ApexConsulting_Unverified.pdf',
    confidenceScores: {
      vendor: 0.88,
      invoiceNumber: 0.96,
      totalAmount: 0.98,
      poNumber: 0.0,
      lineItems: 0.91,
      overall: 0.89,
    },
    paymentDetails: {
      accountName: 'Apex Consulting Enterprise',
      accountNumber: '110022998844',
      bankName: 'Axis Bank',
      routingOrIfsc: 'UTIB0002914',
      paymentMethod: 'NEFT',
    },
    lineItems: [
      {
        id: 'li-inv-5',
        description: 'Ad-hoc Strategic Go-To-Market Advisory Sprint',
        quantity: 1,
        unitPrice: 80508.47,
        total: 80508.47,
      },
    ],
  },
  {
    id: 'inv-5520',
    invoiceNumber: 'INV-5520',
    vendorId: 'vend-cyberguard',
    vendorName: 'CyberGuard Defense Systems',
    vendorTaxId: 'GSTIN07AABCC5432D1Z8',
    vendorAddress: 'Aerocity Worldmark 1, New Delhi, DL 110037',
    invoiceDate: '2026-10-03',
    dueDate: '2026-10-24',
    currency: 'INR',
    subtotal: 542373,
    taxAmount: 97627,
    totalAmount: 640000,
    purchaseOrderNumber: 'PO-9201',
    status: 'AWAITING_APPROVAL',
    createdAt: '2026-10-04T09:45:00Z',
    updatedAt: '2026-10-04T09:45:12Z',
    fileType: 'demo',
    fileName: 'INV-5520_CyberGuard_SOC2_Retainer.pdf',
    confidenceScores: {
      vendor: 0.99,
      invoiceNumber: 1.0,
      totalAmount: 1.0,
      poNumber: 0.99,
      lineItems: 0.98,
      overall: 0.99,
    },
    paymentDetails: {
      accountName: 'CyberGuard Defense Systems LLP',
      accountNumber: '50200049182741',
      bankName: 'ICICI Bank',
      routingOrIfsc: 'ICIC0000021',
      paymentMethod: 'RTGS',
    },
    lineItems: [
      {
        id: 'li-inv-6',
        description: 'Annual SOC2 Type II Continuous Audit & Pen-testing Retainer',
        quantity: 1,
        unitPrice: 542373,
        total: 542373,
      },
    ],
  },
];

// In-memory data store with reset capability
class MockDatabase {
  private invoices: Map<string, Invoice> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private workflows: Map<string, WorkflowRun> = new Map();
  private approvals: Map<string, ApprovalRequest> = new Map();
  private auditLogs: AuditLogEntry[] = [];
  private policy: AutonomyPolicyConfig = { ...DEFAULT_AUTONOMY_POLICY };

  constructor() {
    this.seed();
  }

  public seed() {
    this.invoices.clear();
    this.purchaseOrders.clear();
    this.vendors.clear();
    this.workflows.clear();
    this.approvals.clear();
    this.auditLogs = [];
    this.policy = { ...DEFAULT_AUTONOMY_POLICY };

    SEEDED_VENDORS.forEach((v) => this.vendors.set(v.id, { ...v }));
    SEEDED_PURCHASE_ORDERS.forEach((po) => this.purchaseOrders.set(po.poNumber, { ...po }));
    SEEDED_INVOICES.forEach((inv) => this.invoices.set(inv.id, { ...inv }));

    // Seed Completed Workflow for Scenario A (INV-1041)
    const wf1: WorkflowRun = {
      id: 'wf-inv-1041',
      invoiceId: 'inv-1041',
      status: 'COMPLETED',
      autonomyDecision: 'AUTO_PROCESS',
      riskAssessment: {
        level: 'LOW',
        score: 12,
        decision: 'AUTO_PROCESS',
        reasons: ['Invoice matches PO-7841 exactly', 'Known verified vendor (Acme Cloud)', 'Amount within ₹50,000 auto-limit'],
        factors: [
          { name: 'PO Match', weight: 40, score: 0, explanation: '100% exact line item & amount match' },
          { name: 'Vendor Verification', weight: 30, score: 0, explanation: 'Vendor trust score 98%, active status' },
          { name: 'Financial Exposure', weight: 30, score: 20, explanation: 'Amount ₹42,500 < ₹50,000 threshold' },
        ],
        suggestedAction: 'Execute safe payment dispatch to registered bank account',
        evaluatedAt: '2026-10-02T09:15:20Z',
      },
      reconciliation: {
        isMatch: true,
        poFound: true,
        poNumber: 'PO-7841',
        invoiceTotal: 42500,
        poTotal: 42500,
        differenceAmount: 0,
        variancePercentage: 0,
        discrepancies: [],
        vendorMatch: true,
        currencyMatch: true,
        lineItemsMatched: true,
      },
      anomalies: { detected: false, anomalies: [] },
      executionResult: {
        paymentReference: 'DEMO-TXN-881920-AUTO',
        adapterUsed: 'DemoPaymentAdapter (Simulated NEFT)',
        executedAt: '2026-10-02T09:16:15Z',
        amount: 42500,
        currency: 'INR',
        verificationStatus: 'VERIFIED',
        verificationProof: 'SIM-ACK-HDFC-918237461928-SUCCESS',
      },
      timeline: [
        { id: 't-1', name: 'Invoice Ingestion', toolName: 'extractInvoice', status: 'COMPLETED', timestamp: '09:15:02', durationMs: 420, summary: 'Extracted INV-1041 from Acme Cloud Services' },
        { id: 't-2', name: 'Vendor Verification', toolName: 'getVendor', status: 'COMPLETED', timestamp: '09:15:05', durationMs: 230, summary: 'Verified vendor Acme Cloud (Trust Score: 98%)' },
        { id: 't-3', name: 'PO Retrieval & Matching', toolName: 'matchInvoiceToPO', status: 'COMPLETED', timestamp: '09:15:09', durationMs: 310, summary: 'Matched against PO-7841 with 0% variance' },
        { id: 't-4', name: 'Duplicate Check', toolName: 'checkDuplicateInvoice', status: 'COMPLETED', timestamp: '09:15:13', durationMs: 190, summary: 'No duplicate records found in ledger' },
        { id: 't-5', name: 'Risk Assessment', toolName: 'calculateRisk', status: 'COMPLETED', timestamp: '09:15:20', durationMs: 450, summary: 'Risk Level: LOW (Score 12). Decision: AUTO_PROCESS' },
        { id: 't-6', name: 'Payment Execution', toolName: 'executePaymentAction', status: 'COMPLETED', timestamp: '09:16:15', durationMs: 620, summary: 'Dispatched simulated NEFT txn DEMO-TXN-881920-AUTO' },
        { id: 't-7', name: 'Outcome Verification', toolName: 'verifyAction', status: 'COMPLETED', timestamp: '09:16:30', durationMs: 310, summary: 'Verified transaction settlement and ledger reconciliation' },
      ],
      auditLogs: [
        { id: 'al-1', workflowId: 'wf-inv-1041', timestamp: '09:15:02', action: 'INVOICE_INGESTED', toolUsed: 'extractInvoice', result: 'SUCCESS', explanation: 'Extracted 2 line items, total ₹42,500' },
        { id: 'al-2', workflowId: 'wf-inv-1041', timestamp: '09:15:05', action: 'VENDOR_VALIDATED', toolUsed: 'getVendor', result: 'SUCCESS', explanation: 'Vendor verified in registry (Trust: 98%)' },
        { id: 'al-3', workflowId: 'wf-inv-1041', timestamp: '09:15:09', action: 'PO_RECONCILED', toolUsed: 'matchInvoiceToPO', result: 'SUCCESS', explanation: 'Matched PO-7841. Amount difference ₹0.00' },
        { id: 'al-4', workflowId: 'wf-inv-1041', timestamp: '09:15:20', action: 'RISK_EVALUATED', toolUsed: 'calculateRisk', result: 'SUCCESS', riskLevel: 'LOW', explanation: 'Deterministic rules passed. Auto-processing triggered' },
        { id: 'al-5', workflowId: 'wf-inv-1041', timestamp: '09:16:15', action: 'PAYMENT_EXECUTED', toolUsed: 'executePaymentAction', result: 'SUCCESS', explanation: 'Dispatched ₹42,500 to HDFC Bank (Demo Adapter)' },
        { id: 'al-6', workflowId: 'wf-inv-1041', timestamp: '09:16:30', action: 'VERIFICATION_CONFIRMED', toolUsed: 'verifyAction', result: 'SUCCESS', explanation: 'Reconciled against internal general ledger' },
      ],
      startedAt: '2026-10-02T09:15:00Z',
      completedAt: '2026-10-02T09:16:30Z',
      totalDurationMs: 90000,
    };
    this.workflows.set(wf1.id, wf1);
    wf1.auditLogs.forEach((l) => this.auditLogs.push(l));

    // Seed Pending Approval Workflow for Scenario B (INV-1042)
    const approvalReqB: ApprovalRequest = {
      id: 'appr-inv-1042',
      workflowId: 'wf-inv-1042',
      invoiceId: 'inv-1042',
      invoiceNumber: 'INV-1042',
      vendorName: 'Acme Cloud Services',
      amount: 87500,
      currency: 'INR',
      riskLevel: 'HIGH',
      reason: 'Invoice amount (₹87,500) exceeds Purchase Order PO-7842 (₹75,000) by ₹12,500 (16.67% variance). Additional line item detected for unplanned egress bandwidth.',
      reconciliationSummary: 'PO PO-7842 baseline: ₹75,000. Invoice total: ₹87,500. Difference: +₹12,500.',
      requestedAt: '2026-10-03T10:31:12Z',
      status: 'PENDING',
    };
    this.approvals.set(approvalReqB.id, approvalReqB);

    const wf2: WorkflowRun = {
      id: 'wf-inv-1042',
      invoiceId: 'inv-1042',
      status: 'AWAITING_APPROVAL',
      autonomyDecision: 'REQUIRE_APPROVAL',
      riskAssessment: {
        level: 'HIGH',
        score: 78,
        decision: 'REQUIRE_APPROVAL',
        reasons: [
          'Invoice exceeds PO PO-7842 amount by ₹12,500 (16.67% variance)',
          'Total amount (₹87,500) exceeds auto-approval threshold of ₹50,000',
          'Unbudgeted line item: "Unplanned Overage: Egress Bandwidth Traffic Spikes"',
        ],
        factors: [
          { name: 'PO Mismatch', weight: 45, score: 85, explanation: 'Amount difference ₹12,500 exceeds 0% tolerance' },
          { name: 'Value Threshold', weight: 25, score: 75, explanation: 'Amount ₹87,500 exceeds ₹50,000 auto limit' },
          { name: 'Vendor Integrity', weight: 30, score: 10, explanation: 'Known vendor with legitimate contact details' },
        ],
        suggestedAction: 'Require finance lead or departmental approval before releasing funds',
        evaluatedAt: '2026-10-03T10:31:11Z',
      },
      reconciliation: {
        isMatch: false,
        poFound: true,
        poNumber: 'PO-7842',
        invoiceTotal: 87500,
        poTotal: 75000,
        differenceAmount: 12500,
        variancePercentage: 16.67,
        discrepancies: [
          {
            field: 'Total Amount',
            invoiceValue: '₹87,500',
            poValue: '₹75,000',
            severity: 'HIGH',
            note: 'Invoice exceeds PO by ₹12,500 (16.67%)',
          },
          {
            field: 'Line Items',
            invoiceValue: '2 items',
            poValue: '1 item',
            severity: 'MEDIUM',
            note: 'Added item: Egress Bandwidth Traffic Spikes (4.2TB) for ₹10,593.54 subtotal',
          },
        ],
        vendorMatch: true,
        currencyMatch: true,
        lineItemsMatched: false,
      },
      anomalies: {
        detected: true,
        anomalies: [
          {
            type: 'PO_MISMATCH',
            severity: 'HIGH',
            message: 'Invoice total ₹87,500 exceeds approved PO-7842 value of ₹75,000',
            details: 'Difference: ₹12,500 (+16.67%)',
          },
          {
            type: 'HIGH_VALUE_THRESHOLD',
            severity: 'MEDIUM',
            message: 'Invoice amount ₹87,500 exceeds auto-processing cap of ₹50,000',
          },
        ],
      },
      approvalRequest: approvalReqB,
      timeline: [
        { id: 't-201', name: 'Invoice Ingestion', toolName: 'extractInvoice', status: 'COMPLETED', timestamp: '10:31:02', durationMs: 410, summary: 'Extracted INV-1042 for ₹87,500' },
        { id: 't-202', name: 'Vendor Verification', toolName: 'getVendor', status: 'COMPLETED', timestamp: '10:31:06', durationMs: 220, summary: 'Acme Cloud Services verified' },
        { id: 't-203', name: 'PO Reconciliation', toolName: 'matchInvoiceToPO', status: 'WARNING', timestamp: '10:31:09', durationMs: 380, summary: 'PO mismatch: ₹12,500 variance (+16.67%)' },
        { id: 't-204', name: 'Anomaly Detection', toolName: 'detectAnomalies', status: 'WARNING', timestamp: '10:31:10', durationMs: 320, summary: 'Flagged PO price variance & unbudgeted line item' },
        { id: 't-205', name: 'Risk Assessment', toolName: 'calculateRisk', status: 'WARNING', timestamp: '10:31:11', durationMs: 410, summary: 'Risk Level: HIGH. Auto-action BLOCKED. Approval required' },
        { id: 't-206', name: 'Human Approval Request', toolName: 'createApprovalRequest', status: 'WAITING_APPROVAL', timestamp: '10:31:12', durationMs: 150, summary: 'Dispatched approval alert to Operations Inbox' },
        { id: 't-207', name: 'Simulated Execution', toolName: 'executePaymentAction', status: 'PENDING', summary: 'Halted until human signature provided' },
        { id: 't-208', name: 'Settlement Verification', toolName: 'verifyAction', status: 'PENDING', summary: 'Awaiting execution' },
      ],
      auditLogs: [
        { id: 'al-201', workflowId: 'wf-inv-1042', timestamp: '10:31:02', action: 'INVOICE_INGESTED', toolUsed: 'extractInvoice', result: 'SUCCESS', explanation: 'Extracted INV-1042 (₹87,500)' },
        { id: 'al-202', workflowId: 'wf-inv-1042', timestamp: '10:31:06', action: 'VENDOR_VALIDATED', toolUsed: 'getVendor', result: 'SUCCESS', explanation: 'Vendor verified in database' },
        { id: 'al-203', workflowId: 'wf-inv-1042', timestamp: '10:31:09', action: 'PO_MISMATCH_DETECTED', toolUsed: 'matchInvoiceToPO', result: 'WARNING', explanation: 'Discrepancy: ₹87,500 vs PO ₹75,000' },
        { id: 'al-204', workflowId: 'wf-inv-1042', timestamp: '10:31:10', action: 'ANOMALY_RECORDED', toolUsed: 'detectAnomalies', result: 'WARNING', explanation: 'Anomaly: Exceeds authorized purchase order value' },
        { id: 'al-205', workflowId: 'wf-inv-1042', timestamp: '10:31:11', action: 'RISK_EVALUATED', toolUsed: 'calculateRisk', result: 'WARNING', riskLevel: 'HIGH', explanation: 'Autonomy Policy blocked auto-execution' },
        { id: 'al-206', workflowId: 'wf-inv-1042', timestamp: '10:31:12', action: 'APPROVAL_REQUESTED', toolUsed: 'createApprovalRequest', result: 'PENDING_USER', explanation: 'Created approval item #appr-inv-1042 for operations team' },
      ],
      startedAt: '2026-10-03T10:31:02Z',
    };
    this.workflows.set(wf2.id, wf2);
    wf2.auditLogs.forEach((l) => this.auditLogs.push(l));

    // Seed Blocked Workflow for Scenario C (Duplicate INV-1042)
    const wf3: WorkflowRun = {
      id: 'wf-inv-1042-dup',
      invoiceId: 'inv-1042-dup',
      status: 'BLOCKED',
      autonomyDecision: 'BLOCK',
      riskAssessment: {
        level: 'CRITICAL',
        score: 99,
        decision: 'BLOCK',
        reasons: [
          'Duplicate invoice detected: Invoice #INV-1042 already submitted by Acme Cloud Services',
          'Potential duplicate billing or resubmission error',
          'Automatic processing permanently blocked by fraud policy',
        ],
        factors: [
          { name: 'Duplicate Check', weight: 50, score: 100, explanation: 'Exact match with existing active invoice INV-1042' },
          { name: 'Financial Safety', weight: 50, score: 98, explanation: 'Prevents duplicate outflow of ₹87,500' },
        ],
        suggestedAction: 'Reject invoice and alert vendor accounts receivable',
        evaluatedAt: '2026-10-03T14:20:05Z',
      },
      anomalies: {
        detected: true,
        anomalies: [
          {
            type: 'DUPLICATE_INVOICE',
            severity: 'CRITICAL',
            message: 'Duplicate invoice number INV-1042 for vendor Acme Cloud Services',
            details: 'Original record ID inv-1042 exists in system',
          },
        ],
      },
      timeline: [
        { id: 't-301', name: 'Invoice Ingestion', toolName: 'extractInvoice', status: 'COMPLETED', timestamp: '14:20:01', durationMs: 380, summary: 'Extracted INV-1042' },
        { id: 't-302', name: 'Duplicate Detection', toolName: 'checkDuplicateInvoice', status: 'BLOCKED', timestamp: '14:20:03', durationMs: 190, summary: 'CRITICAL: Duplicate invoice number INV-1042 detected' },
        { id: 't-303', name: 'Risk Assessment', toolName: 'calculateRisk', status: 'BLOCKED', timestamp: '14:20:05', durationMs: 250, summary: 'Risk Level: CRITICAL. Policy Action: BLOCK' },
      ],
      auditLogs: [
        { id: 'al-301', workflowId: 'wf-inv-1042-dup', timestamp: '14:20:01', action: 'INVOICE_INGESTED', toolUsed: 'extractInvoice', result: 'SUCCESS', explanation: 'Extracted INV-1042' },
        { id: 'al-302', workflowId: 'wf-inv-1042-dup', timestamp: '14:20:03', action: 'DUPLICATE_DETECTED', toolUsed: 'checkDuplicateInvoice', result: 'BLOCKED', explanation: 'Matches active invoice inv-1042' },
        { id: 'al-303', workflowId: 'wf-inv-1042-dup', timestamp: '14:20:05', action: 'WORKFLOW_TERMINATED', toolUsed: 'calculateRisk', result: 'BLOCKED', riskLevel: 'CRITICAL', explanation: 'Duplicate protection activated. Execution halted.' },
      ],
      startedAt: '2026-10-03T14:20:00Z',
      completedAt: '2026-10-03T14:20:05Z',
      totalDurationMs: 5000,
    };
    this.workflows.set(wf3.id, wf3);
    wf3.auditLogs.forEach((l) => this.auditLogs.push(l));

    // Seed Scenario D (INV-9901 Unknown Vendor)
    const approvalReqD: ApprovalRequest = {
      id: 'appr-inv-9901',
      workflowId: 'wf-inv-9901',
      invoiceId: 'inv-9901',
      invoiceNumber: 'INV-9901',
      vendorName: 'Apex Strategic Consulting',
      amount: 95000,
      currency: 'INR',
      riskLevel: 'HIGH',
      reason: 'Unknown/Unverified vendor "Apex Strategic Consulting" (Trust Score: 42%). No authorized Purchase Order exists for this invoice. Bank account has no prior transaction history.',
      reconciliationSummary: 'Missing Purchase Order. Unverified vendor registry status.',
      requestedAt: '2026-10-04T08:12:10Z',
      status: 'PENDING',
    };
    this.approvals.set(approvalReqD.id, approvalReqD);

    const wf4: WorkflowRun = {
      id: 'wf-inv-9901',
      invoiceId: 'inv-9901',
      status: 'AWAITING_APPROVAL',
      autonomyDecision: 'REQUIRE_APPROVAL',
      riskAssessment: {
        level: 'HIGH',
        score: 84,
        decision: 'REQUIRE_APPROVAL',
        reasons: [
          'Vendor "Apex Strategic Consulting" is unverified with low trust score (42%)',
          'No Purchase Order linked to this invoice',
          'Invoice amount ₹95,000 exceeds ₹50,000 auto-processing threshold',
          'Unrecognized bank account details',
        ],
        factors: [
          { name: 'Vendor Trust', weight: 40, score: 90, explanation: 'Unverified vendor status, flagged for review' },
          { name: 'PO Verification', weight: 35, score: 85, explanation: 'Missing purchase order' },
          { name: 'Financial Exposure', weight: 25, score: 75, explanation: 'Amount ₹95,000 > ₹50,000 limit' },
        ],
        suggestedAction: 'Require verification of vendor credentials and contract before authorization',
        evaluatedAt: '2026-10-04T08:12:09Z',
      },
      reconciliation: {
        isMatch: false,
        poFound: false,
        invoiceTotal: 95000,
        poTotal: 0,
        differenceAmount: 95000,
        variancePercentage: 100,
        discrepancies: [
          {
            field: 'Purchase Order',
            invoiceValue: 'None',
            poValue: 'Missing',
            severity: 'HIGH',
            note: 'No corresponding PO found in system',
          },
        ],
        vendorMatch: false,
        currencyMatch: true,
        lineItemsMatched: false,
      },
      anomalies: {
        detected: true,
        anomalies: [
          {
            type: 'UNKNOWN_VENDOR',
            severity: 'HIGH',
            message: 'Vendor Apex Strategic Consulting is not an approved verified supplier',
          },
          {
            type: 'MISSING_PO',
            severity: 'HIGH',
            message: 'No purchase order reference specified on invoice',
          },
        ],
      },
      approvalRequest: approvalReqD,
      timeline: [
        { id: 't-401', name: 'Invoice Ingestion', toolName: 'extractInvoice', status: 'COMPLETED', timestamp: '08:12:02', durationMs: 440, summary: 'Extracted INV-9901 (₹95,000)' },
        { id: 't-402', name: 'Vendor Verification', toolName: 'getVendor', status: 'WARNING', timestamp: '08:12:04', durationMs: 250, summary: 'Unverified vendor: Apex Strategic Consulting (Trust: 42%)' },
        { id: 't-403', name: 'PO Matching', toolName: 'matchInvoiceToPO', status: 'WARNING', timestamp: '08:12:06', durationMs: 210, summary: 'No matching Purchase Order found' },
        { id: 't-404', name: 'Anomaly Detection', toolName: 'detectAnomalies', status: 'WARNING', timestamp: '08:12:07', durationMs: 280, summary: 'Flagged missing PO and unverified vendor status' },
        { id: 't-405', name: 'Risk Assessment', toolName: 'calculateRisk', status: 'WARNING', timestamp: '08:12:09', durationMs: 420, summary: 'Risk Level: HIGH. Decision: REQUIRE_APPROVAL' },
        { id: 't-406', name: 'Approval Request', toolName: 'createApprovalRequest', status: 'WAITING_APPROVAL', timestamp: '08:12:10', durationMs: 160, summary: 'Sent to Operations Inbox for founder review' },
      ],
      auditLogs: [
        { id: 'al-401', workflowId: 'wf-inv-9901', timestamp: '08:12:02', action: 'INVOICE_INGESTED', toolUsed: 'extractInvoice', result: 'SUCCESS', explanation: 'Extracted INV-9901' },
        { id: 'al-402', workflowId: 'wf-inv-9901', timestamp: '08:12:04', action: 'UNKNOWN_VENDOR', toolUsed: 'getVendor', result: 'WARNING', explanation: 'Vendor unverified' },
        { id: 'al-403', workflowId: 'wf-inv-9901', timestamp: '08:12:06', action: 'PO_NOT_FOUND', toolUsed: 'matchInvoiceToPO', result: 'WARNING', explanation: 'No purchase order linkage' },
        { id: 'al-404', workflowId: 'wf-inv-9901', timestamp: '08:12:09', action: 'RISK_EVALUATED', toolUsed: 'calculateRisk', result: 'WARNING', riskLevel: 'HIGH', explanation: 'High risk detected' },
        { id: 'al-405', workflowId: 'wf-inv-9901', timestamp: '08:12:10', action: 'APPROVAL_REQUESTED', toolUsed: 'createApprovalRequest', result: 'PENDING_USER', explanation: 'Founder sign-off requested' },
      ],
      startedAt: '2026-10-04T08:12:00Z',
    };
    this.workflows.set(wf4.id, wf4);
    wf4.auditLogs.forEach((l) => this.auditLogs.push(l));

    // Seed Scenario E (INV-5520 High Value)
    const approvalReqE: ApprovalRequest = {
      id: 'appr-inv-5520',
      workflowId: 'wf-inv-5520',
      invoiceId: 'inv-5520',
      invoiceNumber: 'INV-5520',
      vendorName: 'CyberGuard Defense Systems',
      amount: 640000,
      currency: 'INR',
      riskLevel: 'HIGH',
      reason: 'Invoice matches PO-9201 exactly, but total amount (₹6,40,000) significantly exceeds startup autonomous execution threshold (₹50,000). Material cash disbursement requires executive confirmation.',
      reconciliationSummary: 'PO PO-9201 matched 100%. Amount: ₹6,40,000. Autonomous limit: ₹50,000.',
      requestedAt: '2026-10-04T09:45:12Z',
      status: 'PENDING',
    };
    this.approvals.set(approvalReqE.id, approvalReqE);

    const wf5: WorkflowRun = {
      id: 'wf-inv-5520',
      invoiceId: 'inv-5520',
      status: 'AWAITING_APPROVAL',
      autonomyDecision: 'REQUIRE_APPROVAL',
      riskAssessment: {
        level: 'HIGH',
        score: 72,
        decision: 'REQUIRE_APPROVAL',
        reasons: [
          'High financial consequence: Invoice amount ₹6,40,000 exceeds ₹50,000 autonomous threshold',
          'PO PO-9201 matches perfectly, but external capital outflow requires dual verification',
          'Responsible AI guardrail: High-value transactions cannot be executed without human confirmation',
        ],
        factors: [
          { name: 'Financial Magnitude', weight: 60, score: 95, explanation: 'Amount ₹6,40,000 represents 12.8x autonomous policy limit' },
          { name: 'PO Integrity', weight: 20, score: 0, explanation: 'PO PO-9201 verified and authorized by CTO' },
          { name: 'Vendor Trust', weight: 20, score: 5, explanation: 'CyberGuard has 95% trust score and established history' },
        ],
        suggestedAction: 'Dual-control founder sign-off before simulated RTGS release',
        evaluatedAt: '2026-10-04T09:45:11Z',
      },
      reconciliation: {
        isMatch: true,
        poFound: true,
        poNumber: 'PO-9201',
        invoiceTotal: 640000,
        poTotal: 640000,
        differenceAmount: 0,
        variancePercentage: 0,
        discrepancies: [],
        vendorMatch: true,
        currencyMatch: true,
        lineItemsMatched: true,
      },
      anomalies: {
        detected: true,
        anomalies: [
          {
            type: 'HIGH_VALUE_THRESHOLD',
            severity: 'HIGH',
            message: 'Invoice amount ₹6,40,000 exceeds maximum automated payment limit of ₹50,000',
            details: 'Requires executive approval per startup risk governance policy',
          },
        ],
      },
      approvalRequest: approvalReqE,
      timeline: [
        { id: 't-501', name: 'Invoice Ingestion', toolName: 'extractInvoice', status: 'COMPLETED', timestamp: '09:45:02', durationMs: 410, summary: 'Extracted INV-5520 (₹6,40,000)' },
        { id: 't-502', name: 'Vendor Verification', toolName: 'getVendor', status: 'COMPLETED', timestamp: '09:45:04', durationMs: 230, summary: 'Verified vendor CyberGuard (Trust: 95%)' },
        { id: 't-503', name: 'PO Reconciliation', toolName: 'matchInvoiceToPO', status: 'COMPLETED', timestamp: '09:45:07', durationMs: 310, summary: 'Matched PO-9201 with 0% variance' },
        { id: 't-504', name: 'Anomaly Detection', toolName: 'detectAnomalies', status: 'WARNING', timestamp: '09:45:09', durationMs: 290, summary: 'Exceeds autonomous payment threshold' },
        { id: 't-505', name: 'Risk Assessment', toolName: 'calculateRisk', status: 'WARNING', timestamp: '09:45:11', durationMs: 430, summary: 'Risk Level: HIGH due to high-value financial exposure' },
        { id: 't-506', name: 'Approval Request', toolName: 'createApprovalRequest', status: 'WAITING_APPROVAL', timestamp: '09:45:12', durationMs: 140, summary: 'Generated high-value approval request' },
      ],
      auditLogs: [
        { id: 'al-501', workflowId: 'wf-inv-5520', timestamp: '09:45:02', action: 'INVOICE_INGESTED', toolUsed: 'extractInvoice', result: 'SUCCESS', explanation: 'Extracted INV-5520 (₹6,40,000)' },
        { id: 'al-502', workflowId: 'wf-inv-5520', timestamp: '09:45:04', action: 'VENDOR_VALIDATED', toolUsed: 'getVendor', result: 'SUCCESS', explanation: 'CyberGuard verified' },
        { id: 'al-503', workflowId: 'wf-inv-5520', timestamp: '09:45:07', action: 'PO_RECONCILED', toolUsed: 'matchInvoiceToPO', result: 'SUCCESS', explanation: 'PO matched' },
        { id: 'al-504', workflowId: 'wf-inv-5520', timestamp: '09:45:11', action: 'RISK_EVALUATED', toolUsed: 'calculateRisk', result: 'WARNING', riskLevel: 'HIGH', explanation: 'High value policy limit reached' },
        { id: 'al-505', workflowId: 'wf-inv-5520', timestamp: '09:45:12', action: 'APPROVAL_REQUESTED', toolUsed: 'createApprovalRequest', result: 'PENDING_USER', explanation: 'Sign-off pending' },
      ],
      startedAt: '2026-10-04T09:45:00Z',
    };
    this.workflows.set(wf5.id, wf5);
    wf5.auditLogs.forEach((l) => this.auditLogs.push(l));
  }

  // Invoices
  public getInvoices(): Invoice[] {
    return Array.from(this.invoices.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  public getInvoiceByNumber(number: string, vendorId?: string): Invoice | undefined {
    return Array.from(this.invoices.values()).find(
      (inv) => inv.invoiceNumber.toLowerCase() === number.toLowerCase() && (!vendorId || inv.vendorId === vendorId)
    );
  }

  public saveInvoice(invoice: Invoice): Invoice {
    this.invoices.set(invoice.id, { ...invoice });
    return invoice;
  }

  // Purchase Orders
  public getPurchaseOrders(): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values());
  }

  public getPurchaseOrder(poNumber: string): PurchaseOrder | undefined {
    return this.purchaseOrders.get(poNumber);
  }

  // Vendors
  public getVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }

  public getVendor(id: string): Vendor | undefined {
    return this.vendors.get(id);
  }

  public findVendorByName(name: string): Vendor | undefined {
    const clean = name.toLowerCase().trim();
    return Array.from(this.vendors.values()).find(
      (v) => v.name.toLowerCase().includes(clean) || clean.includes(v.name.toLowerCase())
    );
  }

  // Workflows
  public getWorkflows(): WorkflowRun[] {
    return Array.from(this.workflows.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public getWorkflow(id: string): WorkflowRun | undefined {
    return this.workflows.get(id);
  }

  public getWorkflowByInvoice(invoiceId: string): WorkflowRun | undefined {
    return Array.from(this.workflows.values()).find((w) => w.invoiceId === invoiceId);
  }

  public saveWorkflow(wf: WorkflowRun): WorkflowRun {
    this.workflows.set(wf.id, { ...wf });
    return wf;
  }

  // Approvals
  public getApprovals(): ApprovalRequest[] {
    return Array.from(this.approvals.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  public getApproval(id: string): ApprovalRequest | undefined {
    return this.approvals.get(id) || Array.from(this.approvals.values()).find(
      (a) => a.invoiceId === id || a.workflowId === id || a.id.includes(id) || id.includes(a.invoiceId)
    );
  }

  public saveApproval(appr: ApprovalRequest): ApprovalRequest {
    this.approvals.set(appr.id, { ...appr });
    return appr;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public addAuditLog(entry: AuditLogEntry): AuditLogEntry {
    this.auditLogs.unshift(entry);
    return entry;
  }

  // Policy
  public getPolicy(): AutonomyPolicyConfig {
    return { ...this.policy };
  }

  public updatePolicy(updated: Partial<AutonomyPolicyConfig>): AutonomyPolicyConfig {
    this.policy = { ...this.policy, ...updated };
    return { ...this.policy };
  }
}

// Global Singleton for runtime consistency across API routes and client hydration
declare global {
  // eslint-disable-next-line no-var
  var __mockDbInstance: MockDatabase | undefined;
}

export const db: MockDatabase = global.__mockDbInstance || new MockDatabase();
if (process.env.NODE_ENV !== 'production') {
  global.__mockDbInstance = db;
}
