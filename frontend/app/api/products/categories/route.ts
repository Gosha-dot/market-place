import { NextResponse } from 'next/server';
import { categories } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(categories);
}

