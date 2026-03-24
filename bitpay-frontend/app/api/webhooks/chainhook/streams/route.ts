/**
 * POST /api/webhooks/chainhook/streams
 * Handles BitPay Core stream events from Chainhook
 * Events: stream-created, stream-withdrawal, stream-cancelled, stream-sender-updated
 */

import { NextResponse } from 'next/server';
import type {
  ChainhookPayload,
  ChainhookBlock,
  CoreStreamEvent,
  StreamCreatedEvent,
  StreamWithdrawalEvent,
  StreamCancelledEvent,
  StreamSenderUpdatedEvent,
} from '@/types/chainhook';
import {
  verifyWebhookAuth,
  errorResponse,
  successResponse,
  extractPrintEvents,
  parseEventData,
  getWebhookContext,
  logWebhookEvent,
  handleReorg,
  validatePayload,
  webhookRateLimiter,
} from '@/lib/webhooks/chainhook-utils';
import { handleStreamEvent } from './stream-handlers';

export async function POST(request: Request) {
  try {
    console.log('🚀 ========== STREAM WEBHOOK CALLED ==========');
    console.log('📍 Environment:', process.env.NODE_ENV);
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);

    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'chainhook';
    if (!webhookRateLimiter.check(clientId)) {
      console.error('❌ Rate limit exceeded for:', clientId);
      return errorResponse('Rate limit exceeded', 429);
    }

    // Verify authorization
    const authResult = verifyWebhookAuth(request);
    if (!authResult.valid) {
      console.error('❌ Auth verification failed:', authResult.error);
      return errorResponse(authResult.error || 'Unauthorized', 401);
    }
    console.log('✅ Auth verified');

    // Parse and validate payload
    const payload: ChainhookPayload = await request.json();
    console.log('📦 Payload structure:', {
      hasApply: !!payload.apply,
      applyLength: payload.apply?.length || 0,
      hasRollback: !!payload.rollback,
      rollbackLength: payload.rollback?.length || 0,
      chainhookUuid: payload.chainhook?.uuid,
    });

    if (!validatePayload(payload)) {
      console.error('❌ Payload validation failed');
      return errorResponse('Invalid payload structure', 400);
    }
    console.log('✅ Payload validated');

    console.log('📨 Stream events webhook received:', {
      apply: payload.apply?.length || 0,
      rollback: payload.rollback?.length || 0,
      uuid: payload.chainhook?.uuid,
    });

    let processedCount = 0;
    const errors: string[] = [];

    // Handle rollbacks (blockchain reorgs)
    if (payload.rollback && payload.rollback.length > 0) {
      console.warn('⚠️ Rollback detected:', payload.rollback.length, 'blocks');
      const result = await handleReorg(payload.rollback);
      if (!result.success && result.errors) {
        errors.push(...result.errors);
      }
    }

    // Process new blocks
    if (payload.apply && payload.apply.length > 0) {
      for (const block of payload.apply) {
        try {
          const blockResult = await processStreamBlock(block);
          processedCount += blockResult;
        } catch (error) {
          const errorMsg = `Failed to process block ${block.block_identifier.index}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }

    return successResponse({
      success: errors.length === 0,
      eventType: 'stream-events',
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Stream webhook error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    );
  }
}

/**
 * Process a single block for stream events
 */
async function processStreamBlock(block: ChainhookBlock): Promise<number> {
  let processed = 0;

  console.log(`📦 Processing stream events from block ${block.block_identifier.index}`);
  console.log(`📊 Block has ${block.transactions.length} transactions`);

  for (const tx of block.transactions) {
    console.log(`🔍 Processing transaction ${tx.transaction_identifier.hash}`);
    console.log(`✅ Transaction success: ${tx.metadata.success}`);

    if (!tx.metadata.success) {
      console.log(`⏭️ Skipping failed transaction ${tx.transaction_identifier.hash}`);
      continue;
    }

    console.log(`📤 Extracting print events from transaction...`);
    const printEvents = extractPrintEvents(tx);
    console.log(`📤 Found ${printEvents.length} print events`);

    for (const event of printEvents) {
      console.log(`🔍 Print event data:`, JSON.stringify(event, null, 2));

      const eventData = parseEventData<CoreStreamEvent>(event);
      console.log(`📋 Parsed event data:`, eventData);

      if (!eventData) {
        console.warn('❌ Failed to parse event data');
        continue;
      }

      console.log(`✅ Event type: ${eventData.event}`);

      const context = getWebhookContext(tx, block);
      context.contractIdentifier = event.data.contract_identifier;

      try {
        console.log(`🚀 Handling ${eventData.event} event...`);
        await handleStreamEvent(eventData, context);
        processed++;
        console.log(`✅ Successfully handled ${eventData.event} event`);
      } catch (error) {
        console.error(`❌ Failed to handle event ${eventData.event}:`, error);
        throw error;
      }
    }
  }

  console.log(`✅ Block processing complete. Processed ${processed} events.`);
  return processed;
}


/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BitPay Stream Events webhook endpoint',
    status: 'active',
    events: [
      'stream-created',
      'stream-withdrawal',
      'stream-cancelled',
      'stream-sender-updated',
    ],
  });
}
