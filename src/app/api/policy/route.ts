import { NextResponse } from 'next/server';
import { db } from '@/db/mockDatabase';

export async function GET() {
  const policy = db.getPolicy();
  return NextResponse.json({ policy });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const policy = db.updatePolicy(body);
    return NextResponse.json({ success: true, policy });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
