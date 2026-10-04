import { NextResponse } from 'next/server';
import { orchestrator } from '@/agents/orchestrator';

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const workflowRun = await orchestrator.runWorkflow(invoiceId);
    return NextResponse.json({ success: true, workflow: workflowRun });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
