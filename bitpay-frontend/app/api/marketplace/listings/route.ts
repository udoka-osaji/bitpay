/**
 * GET /api/marketplace/listings
 * Fetch all active marketplace listings from MongoDB
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET(request: Request) {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get current block height from Stacks API
    const blockResponse = await fetch('https://api.testnet.hiro.so/extended/v2/blocks?limit=1');
    const blockData = await blockResponse.json();
    const currentBlock = blockData.results?.[0]?.height || 0;

    console.log(`📍 Current block height: ${currentBlock}`);

    // Fetch all active listings with stream data using aggregation
    const listings = await db
      .collection('marketplace_listings')
      .aggregate([
        { $match: { status: 'active' } },
        {
          $lookup: {
            from: 'streams',
            localField: 'streamId',
            foreignField: 'streamId',
            as: 'stream',
          },
        },
        { $unwind: '$stream' },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // Filter out and auto-cancel listings that should no longer be active
    const validListings = [];
    const toCancel = [];

    for (const listing of listings) {
      const stream = listing.stream;
      const endBlock = parseInt(stream.endBlock || 0);

      // Check if stream is cancelled, completed, or past end block
      const shouldCancel =
        stream.status === 'cancelled' ||
        stream.status === 'completed' ||
        (endBlock > 0 && currentBlock >= endBlock);

      if (shouldCancel) {
        toCancel.push({
          streamId: listing.streamId,
          reason: stream.status === 'cancelled' ? 'stream_cancelled' :
                  stream.status === 'completed' ? 'stream_completed' :
                  'stream_period_ended'
        });
      } else {
        validListings.push(listing);
      }
    }

    // Auto-cancel invalid listings
    if (toCancel.length > 0) {
      for (const item of toCancel) {
        await db.collection('marketplace_listings').updateOne(
          { streamId: item.streamId, status: 'active' },
          {
            $set: {
              status: 'cancelled',
              cancelledReason: item.reason,
              cancelledAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );
      }
      console.log(`🗑️ Auto-cancelled ${toCancel.length} listings: ${toCancel.map(c => `${c.streamId}(${c.reason})`).join(', ')}`);
    }

    console.log(`📊 Returning ${validListings.length} valid marketplace listings (filtered ${toCancel.length} expired)`);

    return NextResponse.json({
      success: true,
      listings: validListings.map((listing) => ({
        streamId: listing.streamId,
        seller: listing.seller,
        price: listing.price,
        listedAt: listing.listedAt,
        blockHeight: listing.blockHeight,
        txHash: listing.txHash,
        // Include stream data
        stream: {
          amount: listing.stream.amount,
          startBlock: listing.stream.startBlock,
          endBlock: listing.stream.endBlock,
          recipient: listing.stream.recipient,
          withdrawn: listing.stream.withdrawn || '0',
          status: listing.stream.status,
        },
      })),
    });
  } catch (error) {
    console.error('❌ Failed to fetch marketplace listings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
      },
      { status: 500 }
    );
  }
}
