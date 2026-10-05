import { db } from '@/db/mockDatabase';
import {
  extractInvoiceTool,
  getVendorTool,
  getPurchaseOrderTool,
  matchInvoiceToPOTool,
  checkDuplicateInvoiceTool,
  detectAnomaliesTool,
  calculateRiskTool,
  createApprovalRequestTool,
  approveActionTool,
  rejectActionTool,
  executePaymentActionTool,
  verifyActionTool,
  writeAuditLogTool,
} from '@/tools';
import {
  WorkflowRun,
  WorkflowTimelineStep,
  WorkflowStatus,
  Invoice,
  PurchaseOrder,
} from '@/types';

export class InvoiceAgentOrchestrator {
  /**
   * Execute full agentic workflow for an invoice.
   * Reason -> Plan -> Tool -> Observe -> Decide -> Act -> Verify
   */
  public async runWorkflow(invoiceId: string): Promise<WorkflowRun> {
    const startTime = Date.now();
    const workflowId = `wf-${invoiceId}-${Date.now().toString().slice(-4)}`;

    const timeline: WorkflowTimelineStep[] = [];

    // Helper to log timeline and audit step
    const addStep = async (
      name: string,
      toolName: string,
      status: WorkflowTimelineStep['status'],
      summary: string,
      details?: Record<string, unknown>,
      auditResult: 'SUCCESS' | 'WARNING' | 'FAILED' | 'BLOCKED' | 'PENDING_USER' = 'SUCCESS'
    ) => {
      const step: WorkflowTimelineStep = {
        id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        toolName,
        status,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        summary,
        details,
      };
      timeline.push(step);

      await writeAuditLogTool({
        workflowId,
        action: name.toUpperCase().replace(/\s+/g, '_'),
        toolUsed: toolName,
        result: auditResult,
        explanation: summary,
        metadata: details,
      });

      return step;
    };

    // STEP 1: Tool extractInvoice
    let invoice: Invoice;
    try {
      const extractRes = await extractInvoiceTool({ invoiceId });
      invoice = extractRes.invoice;
      await addStep(
        'Invoice Ingestion & Extraction',
        'extractInvoice',
        'COMPLETED',
        `Extracted #${invoice.invoiceNumber} from ${invoice.vendorName} (${invoice.currency} ${invoice.totalAmount.toLocaleString('en-IN')})`,
        {
          confidence: extractRes.confidenceScores,
          lineItemCount: invoice.lineItems.length,
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await addStep('Invoice Ingestion', 'extractInvoice', 'FAILED', `Extraction failed: ${message}`, {}, 'FAILED');
      throw err;
    }

    // STEP 2: Tool getVendor
    const vendorRes = await getVendorTool({
      vendorId: invoice.vendorId,
      vendorName: invoice.vendorName,
    });
    if (vendorRes.isVerified) {
      await addStep(
        'Vendor Verification',
        'getVendor',
        'COMPLETED',
        `Vendor verified: "${invoice.vendorName}" (Trust Score: ${vendorRes.trustScore}%)`,
        { vendor: vendorRes.vendor }
      );
    } else {
      await addStep(
        'Vendor Verification',
        'getVendor',
        'WARNING',
        `Unverified vendor: "${invoice.vendorName}". No established payment history.`,
        { trustScore: vendorRes.trustScore },
        'WARNING'
      );
    }

    // STEP 3 & 4: Tool getPurchaseOrder & matchInvoiceToPO
    let poRes: { found: boolean; purchaseOrder?: PurchaseOrder } = { found: false };
    if (invoice.purchaseOrderNumber) {
      poRes = await getPurchaseOrderTool({ poNumber: invoice.purchaseOrderNumber });
    }

    const reconRes = await matchInvoiceToPOTool({
      invoice,
      purchaseOrder: poRes.purchaseOrder,
    });

    if (reconRes.isMatch) {
      await addStep(
        'Purchase Order Reconciliation',
        'matchInvoiceToPO',
        'COMPLETED',
        `Matched PO ${reconRes.poNumber} with 0% variance (₹${reconRes.poTotal.toLocaleString('en-IN')})`,
        { reconciliation: reconRes }
      );
    } else {
      const diffDesc = reconRes.poFound
        ? `PO mismatch: Difference of ₹${reconRes.differenceAmount.toLocaleString('en-IN')} (${reconRes.variancePercentage}% variance)`
        : 'Missing PO: No authorized purchase order located';
      await addStep(
        'Purchase Order Reconciliation',
        'matchInvoiceToPO',
        'WARNING',
        diffDesc,
        { discrepancies: reconRes.discrepancies },
        'WARNING'
      );
    }

    // STEP 5: Tool checkDuplicateInvoice
    const dupRes = await checkDuplicateInvoiceTool({
      invoiceNumber: invoice.invoiceNumber,
      vendorName: invoice.vendorName,
      vendorId: invoice.vendorId,
      currentInvoiceId: invoice.id,
    });

    if (dupRes.isDuplicate) {
      await addStep(
        'Duplicate Detection',
        'checkDuplicateInvoice',
        'BLOCKED',
        `CRITICAL: Duplicate invoice #${invoice.invoiceNumber} already exists in ledger`,
        { duplicateOfId: dupRes.duplicateOfId },
        'BLOCKED'
      );
    } else {
      await addStep(
        'Duplicate Check',
        'checkDuplicateInvoice',
        'COMPLETED',
        `Verified unique invoice record #${invoice.invoiceNumber}`
      );
    }

    // STEP 6: Tool detectAnomalies
    const anomalyRes = await detectAnomaliesTool({
      invoice,
      reconciliation: reconRes,
      vendorData: vendorRes,
      duplicateCheck: dupRes,
    });

    if (anomalyRes.detected) {
      const count = anomalyRes.anomalies.length;
      await addStep(
        'Anomaly Detection',
        'detectAnomalies',
        'WARNING',
        `Flagged ${count} operational anomal${count === 1 ? 'y' : 'ies'} requiring attention`,
        { anomalies: anomalyRes.anomalies },
        'WARNING'
      );
    } else {
      await addStep(
        'Anomaly Detection',
        'detectAnomalies',
        'COMPLETED',
        'No anomalies or compliance red-flags detected'
      );
    }

    // STEP 7: Tool calculateRisk
    const riskRes = await calculateRiskTool({
      invoice,
      reconciliation: reconRes,
      anomalies: anomalyRes,
      vendorData: vendorRes,
    });

    await addStep(
      'Risk Engine Assessment',
      'calculateRisk',
      riskRes.level === 'LOW' ? 'COMPLETED' : riskRes.level === 'CRITICAL' ? 'BLOCKED' : 'WARNING',
      `Risk Level: ${riskRes.level} (Score: ${riskRes.score}/100). Autonomy Policy: ${riskRes.decision}`,
      { factors: riskRes.factors, reasons: riskRes.reasons }
    );

    // STEP 8: Decision Branching
    let workflowStatus: WorkflowStatus = 'COMPLETED';
    let approvalRequest = undefined;
    let executionResult = undefined;

    if (riskRes.decision === 'BLOCK') {
      workflowStatus = 'BLOCKED';
      invoice.status = 'BLOCKED';
      db.saveInvoice(invoice);

      await addStep(
        'Autonomy Policy Enforcement',
        'policyEnforcer',
        'BLOCKED',
        'Action BLOCKED: Disallowed by fraud & risk protection policy',
        undefined,
        'BLOCKED'
      );
    } else if (riskRes.decision === 'REQUIRE_APPROVAL') {
      workflowStatus = 'AWAITING_APPROVAL';
      invoice.status = 'AWAITING_APPROVAL';
      db.saveInvoice(invoice);

      // STEP 9A: Tool createApprovalRequest
      approvalRequest = await createApprovalRequestTool({
        workflowId,
        invoice,
        riskAssessment: riskRes,
        reconciliation: reconRes,
      });

      await addStep(
        'Human-in-the-Loop Gate',
        'createApprovalRequest',
        'WAITING_APPROVAL',
        `Dispatched approval request to Operations Inbox. Awaiting human oversight.`,
        { approvalId: approvalRequest.id },
        'PENDING_USER'
      );

      // Remaining steps queued for execution
      timeline.push({
        id: `t-pending-exec`,
        name: 'Payment Execution',
        toolName: 'executePaymentAction',
        status: 'PENDING',
        summary: 'Halted pending human authorization',
      });
      timeline.push({
        id: `t-pending-verify`,
        name: 'Outcome Verification',
        toolName: 'verifyAction',
        status: 'PENDING',
        summary: 'Pending post-execution ledger settlement',
      });
    } else {
      // SAFE -> AUTO_PROCESS
      workflowStatus = 'EXECUTING';

      // STEP 9B: Tool executePaymentAction
      await addStep(
        'Autonomous Payment Execution',
        'executePaymentAction',
        'COMPLETED',
        `Triggered automated payment dispatch: ${invoice.currency} ${invoice.totalAmount.toLocaleString('en-IN')} to ${invoice.paymentDetails.bankName}`
      );

      const payRes = await executePaymentActionTool({ invoice });

      // STEP 10: Tool verifyAction
      const verifyRes = await verifyActionTool({
        paymentReference: payRes.paymentReference,
      });

      await addStep(
        'Outcome Verification & Reconciliation',
        'verifyAction',
        'COMPLETED',
        `Verified simulated settlement reference ${payRes.paymentReference}. General ledger balanced.`,
        {
          proof: verifyRes.proof,
          clearingNetwork: payRes.settlementDetails.clearingNetwork,
        }
      );

      executionResult = {
        paymentReference: payRes.paymentReference,
        adapterUsed: payRes.adapterUsed,
        executedAt: payRes.executedAt,
        amount: payRes.amount,
        currency: payRes.currency,
        verificationStatus: payRes.verificationStatus,
        verificationProof: verifyRes.proof,
      };

      workflowStatus = 'COMPLETED';
      invoice.status = 'COMPLETED';
      db.saveInvoice(invoice);
    }

    const totalDuration = Date.now() - startTime;

    const workflowRun: WorkflowRun = {
      id: workflowId,
      invoiceId: invoice.id,
      status: workflowStatus,
      autonomyDecision: riskRes.decision,
      riskAssessment: riskRes,
      reconciliation: reconRes,
      anomalies: anomalyRes,
      approvalRequest,
      executionResult,
      timeline,
      auditLogs: db.getAuditLogs().filter((l) => l.workflowId === workflowId),
      startedAt: new Date(startTime).toISOString(),
      completedAt: workflowStatus === 'AWAITING_APPROVAL' ? undefined : new Date().toISOString(),
      totalDurationMs: totalDuration,
    };

    db.saveWorkflow(workflowRun);
    return workflowRun;
  }

  /**
   * Resumes workflow after human approval.
   */
  public async handleHumanApproval(
    approvalId: string,
    approvedBy: string,
    note?: string
  ): Promise<WorkflowRun> {
    const appr = await approveActionTool({ approvalId, approvedBy, note });
    const wf = db.getWorkflow(appr.workflowId);
    const invoice = db.getInvoice(appr.invoiceId);

    if (!wf || !invoice) {
      throw new Error(`Workflow or invoice missing for approval ${approvalId}`);
    }

    // Update approval step in timeline
    const approvalTimelineStep = wf.timeline.find((t) => t.toolName === 'createApprovalRequest');
    if (approvalTimelineStep) {
      approvalTimelineStep.status = 'COMPLETED';
      approvalTimelineStep.summary = `Approved by ${approvedBy} (${note || 'Human sign-off granted'})`;
    }

    await writeAuditLogTool({
      workflowId: wf.id,
      action: 'HUMAN_APPROVAL_GRANTED',
      toolUsed: 'approveAction',
      result: 'SUCCESS',
      explanation: `Approved by ${approvedBy}: ${note || 'Authorized for simulated payment release'}`,
    });

    // Execute payment
    const payRes = await executePaymentActionTool({ invoice, approvedBy });

    const execStep: WorkflowTimelineStep = {
      id: `t-exec-${Date.now()}`,
      name: 'Simulated Payment Execution',
      toolName: 'executePaymentAction',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      summary: `Dispatched payment ${payRes.paymentReference} to ${invoice.paymentDetails.bankName}`,
      details: { ref: payRes.paymentReference, amount: payRes.amount },
    };

    // Replace pending exec step
    const execIdx = wf.timeline.findIndex((t) => t.toolName === 'executePaymentAction');
    if (execIdx >= 0) {
      wf.timeline[execIdx] = execStep;
    } else {
      wf.timeline.push(execStep);
    }

    await writeAuditLogTool({
      workflowId: wf.id,
      action: 'PAYMENT_EXECUTED',
      toolUsed: 'executePaymentAction',
      result: 'SUCCESS',
      explanation: `Payment ${payRes.paymentReference} executed via ${payRes.adapterUsed}`,
    });

    // Verify Action
    const verifyRes = await verifyActionTool({ paymentReference: payRes.paymentReference });

    const verifyStep: WorkflowTimelineStep = {
      id: `t-verify-${Date.now()}`,
      name: 'Outcome Verification',
      toolName: 'verifyAction',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      summary: `Verified settlement proof ${verifyRes.proof}. Internal audit log recorded.`,
    };

    const verifyIdx = wf.timeline.findIndex((t) => t.toolName === 'verifyAction');
    if (verifyIdx >= 0) {
      wf.timeline[verifyIdx] = verifyStep;
    } else {
      wf.timeline.push(verifyStep);
    }

    await writeAuditLogTool({
      workflowId: wf.id,
      action: 'VERIFICATION_CONFIRMED',
      toolUsed: 'verifyAction',
      result: 'SUCCESS',
      explanation: 'General ledger matched. Transaction verified.',
    });

    wf.executionResult = {
      paymentReference: payRes.paymentReference,
      adapterUsed: payRes.adapterUsed,
      executedAt: payRes.executedAt,
      amount: payRes.amount,
      currency: payRes.currency,
      verificationStatus: 'VERIFIED',
      verificationProof: verifyRes.proof,
    };

    wf.status = 'COMPLETED';
    wf.completedAt = new Date().toISOString();
    invoice.status = 'COMPLETED';

    db.saveInvoice(invoice);
    db.saveWorkflow(wf);

    return wf;
  }

  /**
   * Resumes workflow after human rejection.
   */
  public async handleHumanRejection(
    approvalId: string,
    rejectedBy: string,
    reason: string
  ): Promise<WorkflowRun> {
    const appr = await rejectActionTool({ approvalId, rejectedBy, reason });
    const wf = db.getWorkflow(appr.workflowId);
    const invoice = db.getInvoice(appr.invoiceId);

    if (!wf || !invoice) {
      throw new Error(`Workflow or invoice missing for approval ${approvalId}`);
    }

    // Update approval step in timeline
    const approvalTimelineStep = wf.timeline.find((t) => t.toolName === 'createApprovalRequest');
    if (approvalTimelineStep) {
      approvalTimelineStep.status = 'FAILED';
      approvalTimelineStep.summary = `Rejected by ${rejectedBy}: "${reason}"`;
    }

    // Cancel pending steps
    wf.timeline = wf.timeline.filter(
      (t) => t.toolName !== 'executePaymentAction' && t.toolName !== 'verifyAction'
    );

    const cancelStep: WorkflowTimelineStep = {
      id: `t-cancelled-${Date.now()}`,
      name: 'Action Cancelled',
      toolName: 'rejectAction',
      status: 'FAILED',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      summary: `Workflow terminated by human reviewer. No external funds moved.`,
      details: { rejectedBy, reason },
    };
    wf.timeline.push(cancelStep);

    await writeAuditLogTool({
      workflowId: wf.id,
      action: 'HUMAN_REJECTION',
      toolUsed: 'rejectAction',
      result: 'FAILED',
      explanation: `Payment rejected by ${rejectedBy}. Rationale: ${reason}`,
    });

    wf.status = 'REJECTED';
    wf.completedAt = new Date().toISOString();
    invoice.status = 'REJECTED';

    db.saveInvoice(invoice);
    db.saveWorkflow(wf);

    return wf;
  }
}

export const orchestrator = new InvoiceAgentOrchestrator();
