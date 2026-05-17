/**
 * Database handlers for persisting Chainhook events
 * Integrates with MongoDB to store blockchain events
 */

import connectToDatabase from '@/lib/db';
import { retryOperation } from './chainhook-utils';
import type { WebhookContext } from '@/types/chainhook';

// Get MongoDB connection
async function getDb() {
  console.log('🔌 Attempting MongoDB connection...');
  console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);

  try {
    const mongoose = await connectToDatabase();
    console.log('✅ Mongoose connected, readyState:', mongoose.connection.readyState);

    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database instance is null');
      throw new Error('Failed to connect to database');
    }

    console.log('✅ Database instance acquired:', db.databaseName);
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

// ============================================================================
// Stream Events Database Handlers
// ============================================================================

export async function saveStreamCreated(data: {
  streamId: string;
  sender: string;
  recipient: string;
  amount: string;
  startBlock: string;
  endBlock: string;
  context: WebhookContext;
}) {
  console.log('💾 saveStreamCreated called for stream:', data.streamId);
  console.log('📊 Stream data:', {
    streamId: data.streamId,
    sender: data.sender,
    recipient: data.recipient,
    amount: data.amount,
    startBlock: data.startBlock,
    endBlock: data.endBlock,
  });

  return retryOperation(async () => {
    console.log('🔄 Inside retryOperation for stream:', data.streamId);

    const db = await getDb();
    console.log('✅ Got DB connection for stream:', data.streamId);

    const streamEvent = {
      streamId: data.streamId,
      sender: data.sender,
      recipient: data.recipient,
      amount: data.amount,
      startBlock: data.startBlock,
      endBlock: data.endBlock,
      withdrawn: 0, // Initialize as number, not string
      status: 'active',
      createdAt: new Date(data.context.timestamp * 1000),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
      blockHash: data.context.blockHash,
    };

    console.log('💾 Upserting stream document...');
    // Upsert stream document
    const upsertResult = await db.collection('streams').updateOne(
      { streamId: data.streamId },
      {
        $set: streamEvent,
        $setOnInsert: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    console.log('✅ Upsert result:', {
      matched: upsertResult.matchedCount,
      modified: upsertResult.modifiedCount,
      upserted: upsertResult.upsertedCount,
      upsertedId: upsertResult.upsertedId,
    });

    console.log('💾 Inserting blockchain event...');
    // Log event in transaction history
    const insertResult = await db.collection('blockchain_events').insertOne({
      type: 'stream-created',
      streamId: data.streamId,
      data: streamEvent,
      context: data.context,
      processedAt: new Date(),
    });

    console.log('✅ Blockchain event inserted:', insertResult.insertedId);
    console.log(`✅ ✅ ✅ Saved stream-created event: ${data.streamId}`);
  });
}

export async function saveStreamWithdrawal(data: {
  streamId: string;
  recipient: string;
  amount: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    // First, ensure withdrawn field is a number (fix legacy string values)
    const stream = await db.collection('streams').findOne({ streamId: data.streamId });
    if (stream && typeof stream.withdrawn === 'string') {
      await db.collection('streams').updateOne(
        { streamId: data.streamId },
        { $set: { withdrawn: parseFloat(stream.withdrawn) || 0 } }
      );
    }

    // Refetch stream to get current withdrawn amount
    const currentStream = await db.collection('streams').findOne({ streamId: data.streamId });
    if (!currentStream) {
      console.error(`❌ Stream not found: ${data.streamId}`);
      return;
    }

    const currentWithdrawn = typeof currentStream.withdrawn === 'number' ? currentStream.withdrawn : parseFloat(currentStream.withdrawn || '0');
    const newWithdrawn = currentWithdrawn + parseFloat(data.amount);
    const totalAmount = parseFloat(currentStream.amount);

    // Check if stream is now fully withdrawn
    const isFullyWithdrawn = newWithdrawn >= totalAmount;

    // Update stream's withdrawn amount and status if completed
    const updateData: any = {
      $inc: { withdrawn: parseFloat(data.amount) },
      $set: { updatedAt: new Date() },
    };

    if (isFullyWithdrawn && currentStream.status !== 'completed') {
      updateData.$set.status = 'completed';
      updateData.$set.completedAt = new Date(data.context.timestamp * 1000);
      console.log(`🏁 Stream ${data.streamId} is now fully withdrawn - marking as completed`);
    }

    await db.collection('streams').updateOne(
      { streamId: data.streamId },
      updateData
    );

    // If stream is completed, auto-cancel any active marketplace listing
    if (isFullyWithdrawn) {
      const listingUpdateResult = await db.collection('marketplace_listings').updateOne(
        { streamId: data.streamId, status: 'active' },
        {
          $set: {
            status: 'cancelled',
            cancelledReason: 'stream_completed',
            cancelledAt: new Date(data.context.timestamp * 1000),
            cancelledTxHash: data.context.txHash,
            updatedAt: new Date(),
          },
        }
      );

      if (listingUpdateResult.modifiedCount > 0) {
        console.log(`🗑️ Auto-cancelled marketplace listing for completed stream: ${data.streamId}`);

        // Broadcast listing cancellation via WebSocket
        const { broadcastToMarketplace } = await import('@/lib/socket/client-broadcast');
        broadcastToMarketplace('marketplace:listing-cancelled', {
          streamId: data.streamId,
          reason: 'stream_completed',
          txHash: data.context.txHash,
        });
      }
    }

    // Log withdrawal event
    await db.collection('blockchain_events').insertOne({
      type: 'stream-withdrawal',
      streamId: data.streamId,
      data: {
        streamId: data.streamId,
        recipient: data.recipient,
        amount: data.amount,
        withdrawnAt: new Date(data.context.timestamp * 1000),
        isFullyWithdrawn,
      },
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved stream-withdrawal event: ${data.streamId} (fully withdrawn: ${isFullyWithdrawn})`);
  });
}

export async function saveStreamCancelled(data: {
  streamId: string;
  sender: string;
  unvestedReturned: string;
  vestedPaid: string;
  cancelledAtBlock: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    // Update stream status
    await db.collection('streams').updateOne(
      { streamId: data.streamId },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(data.context.timestamp * 1000),
          cancelledAtBlock: data.cancelledAtBlock,
          unvestedReturned: data.unvestedReturned,
          vestedPaid: data.vestedPaid,
          updatedAt: new Date(),
        },
      }
    );

    // Auto-cancel any active marketplace listing for this cancelled stream
    const listingUpdateResult = await db.collection('marketplace_listings').updateOne(
      { streamId: data.streamId, status: 'active' },
      {
        $set: {
          status: 'cancelled',
          cancelledReason: 'stream_cancelled',
          cancelledAt: new Date(data.context.timestamp * 1000),
          cancelledTxHash: data.context.txHash,
          updatedAt: new Date(),
        },
      }
    );

    if (listingUpdateResult.modifiedCount > 0) {
      console.log(`🗑️ Auto-cancelled marketplace listing for cancelled stream: ${data.streamId}`);
    }

    // Log cancellation event
    await db.collection('blockchain_events').insertOne({
      type: 'stream-cancelled',
      streamId: data.streamId,
      data,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved stream-cancelled event: ${data.streamId}`);
  });
}

// ============================================================================
// Marketplace Events Database Handlers
// ============================================================================

export async function saveDirectPurchase(data: {
  streamId: string;
  seller: string;
  buyer: string;
  price: string;
  marketplaceFee: string;
  saleId: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const sale = {
      saleId: data.saleId,
      streamId: data.streamId,
      seller: data.seller,
      buyer: data.buyer,
      price: data.price,
      marketplaceFee: data.marketplaceFee,
      saleType: 'direct',
      soldAt: new Date(data.context.timestamp * 1000),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
    };

    await db.collection('marketplace_sales').insertOne(sale);

    // Update stream ownership
    await db.collection('streams').updateOne(
      { streamId: data.streamId },
      {
        $set: {
          sender: data.buyer,
          updatedAt: new Date(),
        },
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'direct-purchase-completed',
      streamId: data.streamId,
      data: sale,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved direct purchase: ${data.saleId}`);
  });
}

export async function saveGatewayPurchase(data: {
  streamId: string;
  seller: string;
  buyer: string;
  price: string;
  marketplaceFee: string;
  paymentId: string;
  saleId: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const sale = {
      saleId: data.saleId,
      streamId: data.streamId,
      seller: data.seller,
      buyer: data.buyer,
      price: data.price,
      marketplaceFee: data.marketplaceFee,
      paymentId: data.paymentId,
      saleType: 'gateway',
      soldAt: new Date(data.context.timestamp * 1000),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
    };

    await db.collection('marketplace_sales').insertOne(sale);

    // Update pending purchase status
    await db.collection('pending_purchases').updateOne(
      { streamId: data.streamId, paymentId: data.paymentId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
        },
      }
    );

    // Update stream ownership
    await db.collection('streams').updateOne(
      { streamId: data.streamId },
      {
        $set: {
          sender: data.buyer,
          updatedAt: new Date(),
        },
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'gateway-purchase-completed',
      streamId: data.streamId,
      data: sale,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved gateway purchase: ${data.saleId}`);
  });
}

export async function savePurchaseInitiated(data: {
  streamId: string;
  seller: string;
  buyer: string;
  paymentId: string;
  initiatedAt: string;
  expiresAt: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const purchase = {
      streamId: data.streamId,
      seller: data.seller,
      buyer: data.buyer,
      paymentId: data.paymentId,
      status: 'pending',
      initiatedAt: new Date(parseInt(data.initiatedAt)),
      expiresAt: new Date(parseInt(data.expiresAt)),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
    };

    await db.collection('pending_purchases').insertOne(purchase);

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'purchase-initiated',
      streamId: data.streamId,
      data: purchase,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved purchase-initiated: ${data.paymentId}`);
  });
}

// ============================================================================
// Treasury Events Database Handlers
// ============================================================================

export async function saveFeeCollected(data: {
  streamId: string;
  amount: string;
  collectedFrom: string;
  feeType: 'cancellation' | 'marketplace';
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const feeEvent = {
      streamId: data.streamId,
      amount: data.amount,
      collectedFrom: data.collectedFrom,
      feeType: data.feeType,
      collectedAt: new Date(data.context.timestamp * 1000),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
    };

    await db.collection('treasury_fees').insertOne(feeEvent);

    // Update treasury totals
    await db.collection('treasury_stats').updateOne(
      { key: 'current' } as any,
      {
        $inc: {
          totalFees: parseFloat(data.amount),
          [`${data.feeType}Fees`]: parseFloat(data.amount),
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: `${data.feeType}-fee-collected`,
      streamId: data.streamId,
      data: feeEvent,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved ${data.feeType}-fee-collected: ${data.amount}`);
  });
}

export async function saveWithdrawalProposal(data: {
  proposalId: string;
  proposer: string;
  recipient: string;
  amount: string;
  proposedAt: string;
  timelockExpires: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const proposal = {
      proposalId: data.proposalId,
      type: 'withdrawal',
      proposer: data.proposer,
      recipient: data.recipient,
      amount: data.amount,
      status: 'pending',
      approvals: [data.proposer],
      approvalCount: 1,
      proposedAt: new Date(parseInt(data.proposedAt)),
      timelockExpires: new Date(parseInt(data.timelockExpires)),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
    };

    await db.collection('treasury_proposals').insertOne(proposal);

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'withdrawal-proposed',
      proposalId: data.proposalId,
      data: proposal,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved withdrawal-proposed: ${data.proposalId}`);
  });
}

export async function saveWithdrawalApproval(data: {
  proposalId: string;
  approver: string;
  approvalCount: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    await db.collection('treasury_proposals').updateOne(
      { proposalId: data.proposalId },
      {
        $addToSet: { approvals: data.approver },
        $set: {
          approvalCount: parseInt(data.approvalCount),
          updatedAt: new Date(),
        },
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'withdrawal-approved',
      proposalId: data.proposalId,
      data,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved withdrawal-approved: ${data.proposalId}`);
  });
}

// ============================================================================
// Admin Proposal Handlers
// ============================================================================

export async function saveAdminProposal(data: {
  proposalId: string;
  proposer: string;
  action: 'add' | 'remove';
  targetAdmin: string;
  proposedAt: string;
  expiresAt: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    const proposal = {
      proposalId: data.proposalId,
      type: 'admin-management',
      action: data.action,
      proposer: data.proposer,
      targetAdmin: data.targetAdmin,
      status: 'pending',
      approvals: [data.proposer], // Proposer auto-approves
      approvalCount: 1,
      proposedAt: new Date(parseInt(data.proposedAt)),
      expiresAt: new Date(parseInt(data.expiresAt)),
      txHash: data.context.txHash,
      blockHeight: data.context.blockHeight,
      createdAt: new Date(data.context.timestamp * 1000),
    };

    await db.collection('admin_proposals').insertOne(proposal);

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: `admin-${data.action}-proposed`,
      proposalId: data.proposalId,
      data: proposal,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved admin-${data.action}-proposed: ${data.proposalId}`);
  });
}

export async function saveAdminProposalApproval(data: {
  proposalId: string;
  approver: string;
  approvalCount: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    await db.collection('admin_proposals').updateOne(
      { proposalId: data.proposalId },
      {
        $addToSet: { approvals: data.approver },
        $set: {
          approvalCount: parseInt(data.approvalCount),
          updatedAt: new Date(),
        },
      }
    );

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'admin-proposal-approved',
      proposalId: data.proposalId,
      data,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved admin-proposal-approved: ${data.proposalId}`);
  });
}

export async function saveAdminProposalExecution(data: {
  proposalId: string;
  executor: string;
  action: 'add' | 'remove';
  targetAdmin: string;
  context: WebhookContext;
}) {
  return retryOperation(async () => {
    const db = await getDb();

    // Update proposal status
    await db.collection('admin_proposals').updateOne(
      { proposalId: data.proposalId },
      {
        $set: {
          status: 'executed',
          executedBy: data.executor,
          executedAt: new Date(data.context.timestamp * 1000),
          executedTxHash: data.context.txHash,
          updatedAt: new Date(),
        },
      }
    );

    // Update admins collection - maintain list of current active admins
    if (data.action === 'add') {
      await db.collection('treasury_admins').updateOne(
        { address: data.targetAdmin },
        {
          $set: {
            address: data.targetAdmin,
            addedAt: new Date(data.context.timestamp * 1000),
            addedByProposal: data.proposalId,
            addedTxHash: data.context.txHash,
            isActive: true,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`➕ Added admin to treasury_admins collection: ${data.targetAdmin}`);
    } else {
      await db.collection('treasury_admins').updateOne(
        { address: data.targetAdmin },
        {
          $set: {
            isActive: false,
            removedAt: new Date(data.context.timestamp * 1000),
            removedByProposal: data.proposalId,
            removedTxHash: data.context.txHash,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`➖ Removed admin from treasury_admins collection: ${data.targetAdmin}`);
    }

    // Log event
    await db.collection('blockchain_events').insertOne({
      type: 'admin-proposal-executed',
      proposalId: data.proposalId,
      data,
      context: data.context,
      processedAt: new Date(),
    });

    console.log(`✅ Saved admin-proposal-executed: ${data.proposalId} (${data.action} ${data.targetAdmin})`);
  });
}

// ============================================================================
// Reorg Handlers
// ============================================================================

export async function markTransactionsAsRolledBack(blockHeight: number) {
  return retryOperation(async () => {
    const db = await getDb();

    await db.collection('blockchain_events').updateMany(
      { 'context.blockHeight': blockHeight },
      {
        $set: {
          status: 'rolled_back',
          rolledBackAt: new Date(),
        },
      }
    );

    console.log(`✅ Marked transactions from block ${blockHeight} as rolled back`);
  });
}
