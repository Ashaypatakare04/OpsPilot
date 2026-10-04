import { NextResponse } from 'next/server';
import { orchestrator } from '@/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const { approvalId, rejectedBy, reason } = await request.json();
    if (!approvalId) {
      return NextResponse.json({ error: 'approvalId is required' }, { status: 400 });
    }

    const workflow = await orchestrator.handleHumanRejection(
      approvalId,
      rejectedBy || 'Operations Lead',
      reason || 'Discrepancy not justified by vendor'
    );

    return NextResponse.json({ success: true, workflow });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
