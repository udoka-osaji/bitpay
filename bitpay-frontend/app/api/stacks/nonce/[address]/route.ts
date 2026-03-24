import { NextRequest, NextResponse } from 'next/server';
import { STACKS_API_URL } from '@/lib/contracts/config';

// GET /api/stacks/nonce/[address] - Get account nonce
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${STACKS_API_URL}/v2/accounts/${address}?proof=0`,
      {
        next: { revalidate: 10 }, // Cache for 10 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`Stacks API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      nonce: data.nonce || 0,
      address,
    });
  } catch (error) {
    console.error('Error fetching nonce:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch nonce',
        nonce: 0, // Return 0 as fallback
      },
      { status: 500 }
    );
  }
}
