/**
 * GET /api/stacks/balance/[address]
 * Proxies sBTC balance queries to avoid CORS and rate limiting
 * Caches for 30 seconds
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  principalCV,
} from '@stacks/transactions';
import {
  getStacksNetwork,
  BITPAY_DEPLOYER_ADDRESS,
  CONTRACT_NAMES,
} from '@/lib/contracts/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    const network = getStacksNetwork();

    console.log('📞 Fetching sBTC balance for:', address);

    // Call get-user-balance function on bitpay-sbtc-helper contract
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: BITPAY_DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAMES.SBTC_HELPER,
      functionName: 'get-user-balance',
      functionArgs: [principalCV(address)],
      senderAddress: address,
    });

    const jsonResult = cvToJSON(result);

    // Extract balance from response
    let balanceValue: string = '0';

    if (jsonResult && typeof jsonResult === 'object') {
      if ('value' in jsonResult) {
        const innerValue = jsonResult.value;
        if (typeof innerValue === 'object' && 'value' in innerValue) {
          balanceValue = String(innerValue.value);
        } else if (typeof innerValue === 'string' || typeof innerValue === 'number') {
          balanceValue = String(innerValue);
        }
      } else if (typeof jsonResult === 'string' || typeof jsonResult === 'number') {
        balanceValue = String(jsonResult);
      }
    }

    console.log('✅ sBTC Balance:', balanceValue, 'satoshis');

    return NextResponse.json(
      {
        success: true,
        balance: balanceValue,
        address,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching sBTC balance:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
      },
      { status: 500 }
    );
  }
}
