/**
 * Stream Event Handlers
 * Exported for use by both streams webhook and treasury webhook (for misrouted events)
 */

import type {
  CoreStreamEvent,
  StreamCreatedEvent,
  StreamWithdrawalEvent,
  StreamCancelledEvent,
  StreamSenderUpdatedEvent,
} from '@/types/chainhook';
import {
  logWebhookEvent,
} from '@/lib/webhooks/chainhook-utils';
import {
  saveStreamCreated,
  saveStreamWithdrawal,
  saveStreamCancelled,
} from '@/lib/webhooks/database-handlers';
import {
  notifyStreamCreated,
  notifyStreamWithdrawal,
  notifyStreamCancelled,
} from '@/lib/notifications/notification-service';
import connectToDatabase from '@/lib/db';
import * as NotificationService from '@/lib/notifications/notification-service';
import { broadcastToUser, broadcastToStream } from '@/lib/socket/client-broadcast';

/**
 * Route stream events to appropriate handlers
 */
export async function handleStreamEvent(
  event: CoreStreamEvent,
  context: any
): Promise<void> {
  switch (event.event) {
    case 'stream-created':
      await handleStreamCreated(event, context);
      break;

    case 'stream-withdrawal':
      await handleStreamWithdrawal(event, context);
      break;

    case 'stream-cancelled':
      await handleStreamCancelled(event, context);
      break;

    case 'stream-sender-updated':
      await handleStreamSenderUpdated(event, context);
      break;

    default:
      console.warn(`Unknown stream event: ${(event as any).event}`);
  }
}

/**
 * Handle stream-created event
 */
async function handleStreamCreated(
  event: StreamCreatedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-created', event, context);

  await saveStreamCreated({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient: event.recipient,
    amount: event.amount.toString(),
    startBlock: event['start-block'].toString(),
    endBlock: event['end-block'].toString(),
    context,
  });

  // Send notifications
  await notifyStreamCreated({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient: event.recipient,
    amount: event.amount.toString(),
    startBlock: event['start-block'].toString(),
    endBlock: event['end-block'].toString(),
    txHash: context.txHash,
  });

  // Broadcast real-time updates via WebSocket
  const streamData = {
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient: event.recipient,
    amount: event.amount.toString(),
    startBlock: event['start-block'].toString(),
    endBlock: event['end-block'].toString(),
    txHash: context.txHash,
    blockHeight: context.blockHeight,
    timestamp: context.timestamp,
  };

  // Notify sender
  broadcastToUser(event.sender, 'stream:created', {
    type: 'stream-created',
    role: 'sender',
    data: streamData,
  });

  // Notify recipient
  broadcastToUser(event.recipient, 'stream:created', {
    type: 'stream-created',
    role: 'recipient',
    data: streamData,
  });

  // Broadcast to stream room
  broadcastToStream(event['stream-id'].toString(), 'stream:updated', {
    type: 'created',
    data: streamData,
  });
}

/**
 * Handle stream-withdrawal event
 */
async function handleStreamWithdrawal(
  event: StreamWithdrawalEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-withdrawal', event, context);

  await saveStreamWithdrawal({
    streamId: event['stream-id'].toString(),
    recipient: event.recipient,
    amount: event.amount.toString(),
    context,
  });

  // Fetch stream details from database
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  let sender = '';
  let remainingAmount = '0';

  if (db) {
    const stream = await db.collection('streams').findOne({
      streamId: event['stream-id'].toString(),
    });

    if (stream) {
      sender = stream.sender || '';
      // Calculate remaining: total amount - withdrawn amount
      const totalAmount = parseFloat(stream.amount || '0');
      const withdrawn = parseFloat(stream.withdrawn || '0');
      remainingAmount = (totalAmount - withdrawn).toString();
    }
  }

  await notifyStreamWithdrawal({
    streamId: event['stream-id'].toString(),
    recipient: event.recipient,
    sender,
    amount: event.amount.toString(),
    remainingAmount,
    txHash: context.txHash,
  });
}

/**
 * Handle stream-cancelled event
 */
async function handleStreamCancelled(
  event: StreamCancelledEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-cancelled', event, context);

  await saveStreamCancelled({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    unvestedReturned: event['unvested-returned'].toString(),
    vestedPaid: event['vested-paid'].toString(),
    cancelledAtBlock: event['cancelled-at-block'].toString(),
    context,
  });

  // Fetch recipient and check if listing existed
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  let recipient = '';
  let hadActiveListing = false;

  if (db) {
    const stream = await db.collection('streams').findOne({
      streamId: event['stream-id'].toString(),
    });

    if (stream) {
      recipient = stream.recipient || '';
    }

    // Check if there was an active listing that got auto-cancelled
    const cancelledListing = await db.collection('marketplace_listings').findOne({
      streamId: event['stream-id'].toString(),
      status: 'cancelled',
      cancelledReason: 'stream_cancelled',
    });

    if (cancelledListing) {
      hadActiveListing = true;

      // Broadcast marketplace listing cancellation
      const { broadcastToMarketplace } = await import('@/lib/socket/client-broadcast');
      broadcastToMarketplace('marketplace:listing-cancelled', {
        streamId: event['stream-id'].toString(),
        seller: event.sender,
        reason: 'stream_cancelled',
        txHash: context.txHash,
      });

      console.log(`📢 Broadcasted auto-cancelled listing for stream: ${event['stream-id']}`);
    }
  }

  await notifyStreamCancelled({
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient,
    vestedPaid: event['vested-paid'].toString(),
    unvestedReturned: event['unvested-returned'].toString(),
    txHash: context.txHash,
  });

  // Broadcast cancellation to sender and recipient via WebSocket for real-time UI update
  const cancellationData = {
    streamId: event['stream-id'].toString(),
    sender: event.sender,
    recipient,
    vestedPaid: event['vested-paid'].toString(),
    unvestedReturned: event['unvested-returned'].toString(),
    cancelledAtBlock: event['cancelled-at-block'].toString(),
    txHash: context.txHash,
  };

  broadcastToUser(event.sender, 'stream:cancelled', cancellationData);
  if (recipient) {
    broadcastToUser(recipient, 'stream:cancelled', cancellationData);
  }
  broadcastToStream(event['stream-id'].toString(), 'stream:cancelled', cancellationData);

  console.log(`📢 Broadcasted stream cancellation to sender and recipient: ${event['stream-id']}`);
}

/**
 * Handle stream-sender-updated event
 */
async function handleStreamSenderUpdated(
  event: StreamSenderUpdatedEvent,
  context: any
): Promise<void> {
  logWebhookEvent('stream-sender-updated', event, context);

  const streamId = event['stream-id'].toString();
  const oldSender = event['old-sender'];
  const newSender = event['new-sender'];

  // Update stream ownership in database
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  if (db) {
    await db.collection('streams').updateOne(
      { streamId },
      {
        $set: {
          sender: newSender,
          updatedAt: new Date(),
        },
        $push: {
          senderHistory: {
            oldSender,
            newSender,
            updatedAt: new Date(context.timestamp * 1000),
            txHash: context.txHash,
            blockHeight: context.blockHeight,
          },
        } as any,
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'stream-sender-updated',
      streamId,
      data: {
        streamId,
        oldSender,
        newSender,
        updatedAt: new Date(context.timestamp * 1000),
      },
      context,
      processedAt: new Date(),
    });
  }

  // Send notification to old sender
  await NotificationService.createNotification(
    oldSender,
    'stream_sender_updated',
    '🔄 Stream Ownership Transferred',
    `You have transferred ownership of stream #${streamId} to ${newSender.slice(0, 10)}...`,
    {
      streamId,
      newSender,
    },
    {
      priority: 'normal',
      actionUrl: `/dashboard/streams/${streamId}`,
      actionText: 'View Stream',
    }
  );

  // Send notification to new sender
  await NotificationService.createNotification(
    newSender,
    'stream_sender_updated',
    '🎁 Stream Ownership Received',
    `You are now the sender of stream #${streamId}. You can manage this stream.`,
    {
      streamId,
      oldSender,
    },
    {
      priority: 'high',
      actionUrl: `/dashboard/streams/${streamId}`,
      actionText: 'Manage Stream',
    }
  );

  console.log(`✅ Stream sender updated: ${streamId} from ${oldSender} to ${newSender}`);
}
