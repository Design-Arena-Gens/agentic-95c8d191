import { NextResponse } from 'next/server';
import { analyzeMarket } from '@/lib/analyzer';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await analyzeMarket();
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to analyze market data right now.';
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}
