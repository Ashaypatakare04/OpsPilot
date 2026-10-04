import { NextResponse } from 'next/server';
import { db } from '@/db/mockDatabase';

export async function POST() {
  db.seed();
  return NextResponse.json({ success: true, message: 'Database reset to default seeded scenarios' });
}
