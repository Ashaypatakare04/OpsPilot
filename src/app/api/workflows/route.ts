import { NextResponse } from 'next/server';
import { db } from '@/db/mockDatabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const invoiceId = searchParams.get('invoiceId');

  if (id) {
    const wf = db.getWorkflow(id);
    if (!wf) return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    return NextResponse.json({ workflow: wf });
  }

  if (invoiceId) {
    const wf = db.getWorkflowByInvoice(invoiceId);
    return NextResponse.json({ workflow: wf || null });
  }

  const workflows = db.getWorkflows();
  return NextResponse.json({ workflows });
}
