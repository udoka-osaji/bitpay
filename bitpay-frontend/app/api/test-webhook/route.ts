/**
 * POST /api/test-webhook
 * Test endpoint to simulate a chainhook webhook call
 */

import { NextResponse } from 'next/server';
import { saveStreamCreated } from '@/lib/webhooks/database-handlers';

export async function POST(request: Request) {
  try {
    console.log('🧪 ========== TESTING WEBHOOK FLOW ==========');

    // Simulate a stream-created event
    const testData = {
      streamId: 'test-stream-' + Date.now(),
      sender: 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7',
      recipient: 'ST2CYJNB136DKVP1YV7MBM3AH5AD4GD9HT266E42K',
      amount: '20000000',
      startBlock: '3603788',
      endBlock: '3603932',
      context: {
        txHash: 'test-tx-' + Date.now(),
        blockHeight: 3603788,
        blockHash: 'test-block-hash',
        timestamp: Math.floor(Date.now() / 1000),
        sender: 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7',
        contractIdentifier: 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7.bitpay-core-v4',
      },
    };

    console.log('📊 Test data:', testData);
    console.log('💾 Calling saveStreamCreated...');

    await saveStreamCreated(testData);

    console.log('✅ ✅ ✅ Test webhook flow completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Test webhook processed successfully',
      testData,
    });
  } catch (error) {
    console.error('❌ Test webhook failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test webhook flow',
    usage: 'POST /api/test-webhook',
  });
}
