import { NextResponse } from 'next/server';
import { db } from '@/db/mockDatabase';

export async function GET() {
  const logs = db.getAuditLogs();
  return NextResponse.json({ logs });
}
