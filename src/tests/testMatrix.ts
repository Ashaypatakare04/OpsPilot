import { orchestrator } from '../agents/orchestrator';
import { db } from '../db/mockDatabase';

async function runTestMatrix() {
  console.log('====================================================');
  console.log('  OPSPILOT AGENTIC VERIFICATION & TEST MATRIX');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  // TEST 1: Scenario A (Safe Invoice INV-1041)
  console.log('--- Test 1: Scenario A (Safe Invoice) ---');
  db.seed();
  const wfA = await orchestrator.runWorkflow('inv-1041');
  assert(wfA.autonomyDecision === 'AUTO_PROCESS', 'Decision must be AUTO_PROCESS', `Got: ${wfA.autonomyDecision}`);
  assert(wfA.status === 'COMPLETED', 'Workflow status must be COMPLETED', `Got: ${wfA.status}`);
  assert(wfA.riskAssessment?.level === 'LOW', 'Risk level must be LOW', `Got: ${wfA.riskAssessment?.level}`);
  assert(wfA.reconciliation?.differenceAmount === 0, 'Reconciliation variance must be 0', `Got: ${wfA.reconciliation?.differenceAmount}`);
  assert(wfA.executionResult?.verificationStatus === 'VERIFIED', 'Simulated payment must be VERIFIED', `Got: ${wfA.executionResult?.verificationStatus}`);

  // TEST 2: Scenario B (Mismatch Invoice INV-1042)
  console.log('\n--- Test 2: Scenario B (Mismatch Invoice) ---');
  const wfB = await orchestrator.runWorkflow('inv-1042');
  assert(wfB.autonomyDecision === 'REQUIRE_APPROVAL', 'Decision must be REQUIRE_APPROVAL', `Got: ${wfB.autonomyDecision}`);
  assert(wfB.status === 'AWAITING_APPROVAL', 'Workflow status must be AWAITING_APPROVAL', `Got: ${wfB.status}`);
  assert(wfB.riskAssessment?.level === 'HIGH', 'Risk level must be HIGH', `Got: ${wfB.riskAssessment?.level}`);
  assert(wfB.reconciliation?.differenceAmount === 12500, 'Difference must be ₹12,500', `Got: ${wfB.reconciliation?.differenceAmount}`);
  assert(wfB.reconciliation?.variancePercentage === 16.67, 'Variance must be 16.67%', `Got: ${wfB.reconciliation?.variancePercentage}`);
  assert(!!wfB.approvalRequest, 'Approval request must be generated', `Got: ${!!wfB.approvalRequest}`);

  // TEST 3: Human-in-the-Loop Approval Execution
  console.log('\n--- Test 3: Human Approval Flow ---');
  if (wfB.approvalRequest) {
    const wfBApproved = await orchestrator.handleHumanApproval(
      wfB.approvalRequest.id,
      'Sarah Chen (Finance Lead)',
      'Approved after verifying CDN bandwidth overage spikes'
    );
    assert(wfBApproved.status === 'COMPLETED', 'Status after approval must be COMPLETED', `Got: ${wfBApproved.status}`);
    assert(wfBApproved.executionResult?.verificationStatus === 'VERIFIED', 'Payment must be executed and verified', `Got: ${wfBApproved.executionResult?.verificationStatus}`);
  }

  // TEST 4: Scenario C (Duplicate Invoice)
  console.log('\n--- Test 4: Scenario C (Duplicate Protection) ---');
  const wfC = await orchestrator.runWorkflow('inv-1042-dup');
  assert(wfC.autonomyDecision === 'BLOCK', 'Decision must be BLOCK', `Got: ${wfC.autonomyDecision}`);
  assert(wfC.status === 'BLOCKED', 'Workflow status must be BLOCKED', `Got: ${wfC.status}`);
  assert(wfC.riskAssessment?.level === 'CRITICAL', 'Risk level must be CRITICAL', `Got: ${wfC.riskAssessment?.level}`);
  assert(wfC.anomalies?.anomalies.some((a) => a.type === 'DUPLICATE_INVOICE') ?? false, 'Must flag DUPLICATE_INVOICE anomaly');

  // TEST 5: Scenario D (Unknown Vendor & Missing PO)
  console.log('\n--- Test 5: Scenario D (Unknown Vendor & Missing PO) ---');
  const wfD = await orchestrator.runWorkflow('inv-9901');
  assert(wfD.autonomyDecision === 'REQUIRE_APPROVAL', 'Decision must be REQUIRE_APPROVAL', `Got: ${wfD.autonomyDecision}`);
  assert(wfD.reconciliation?.poFound === false, 'PO must be marked as not found');
  assert(wfD.anomalies?.anomalies.some((a) => a.type === 'UNKNOWN_VENDOR') ?? false, 'Must flag UNKNOWN_VENDOR');
  assert(wfD.anomalies?.anomalies.some((a) => a.type === 'MISSING_PO') ?? false, 'Must flag MISSING_PO');

  // TEST 6: Human-in-the-Loop Rejection Flow
  console.log('\n--- Test 6: Human Rejection Flow ---');
  if (wfD.approvalRequest) {
    const wfDRejected = await orchestrator.handleHumanRejection(
      wfD.approvalRequest.id,
      'Rohan Deshmukh (CTO)',
      'Unrecognized vendor invoice. No consulting contract executed.'
    );
    assert(wfDRejected.status === 'REJECTED', 'Status after rejection must be REJECTED', `Got: ${wfDRejected.status}`);
    assert(!wfDRejected.executionResult, 'No payment must be executed upon rejection');
  }

  // TEST 7: Scenario E (High Value Threshold Guardrail)
  console.log('\n--- Test 7: Scenario E (High Value Guardrail) ---');
  const wfE = await orchestrator.runWorkflow('inv-5520');
  assert(wfE.autonomyDecision === 'REQUIRE_APPROVAL', 'Decision must be REQUIRE_APPROVAL for high value');
  assert(wfE.reconciliation?.isMatch === true, 'PO must match 100%');
  assert(wfE.anomalies?.anomalies.some((a) => a.type === 'HIGH_VALUE_THRESHOLD') ?? false, 'Must flag HIGH_VALUE_THRESHOLD');

  // TEST 8: Audit Trail Integrity
  console.log('\n--- Test 8: Audit Trail Integrity ---');
  const logs = db.getAuditLogs();
  assert(logs.length > 15, 'Audit trail must contain rich chronological entries', `Got: ${logs.length}`);
  assert(logs.every((l) => !!l.timestamp && !!l.workflowId && !!l.action), 'All audit logs must have required fields');

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestMatrix().catch((err) => {
  console.error('Test matrix execution error:', err);
  process.exit(1);
});
