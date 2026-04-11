import { NextResponse } from 'next/server';
import { brands } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(brands);
}

