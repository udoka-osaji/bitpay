/**
 * GET /api/streams?address=<user-address>
 * Returns all streams for a user (sent + received) from database
 * Dynamic calculations (vested, progress) are done on frontend with current block
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    // Connect to database
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed');
    }

    // Query streams where user is sender OR recipient
    const streams = await db
      .collection('streams')
      .find({
        $or: [
          { sender: address },
          { recipient: address },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Format streams for frontend
    const formattedStreams = streams.map((stream) => ({
      id: stream.streamId,
      streamId: stream.streamId,
      sender: stream.sender,
      recipient: stream.recipient,
      amount: stream.amount,
      'start-block': stream.startBlock,
      'end-block': stream.endBlock,
      startBlock: stream.startBlock,
      endBlock: stream.endBlock,
      withdrawn: stream.withdrawn || '0',
      cancelled: stream.status === 'cancelled' || stream.cancelled || false,
      status: stream.status || 'active',
      txHash: stream.txHash,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
      // Cancellation data
      'cancelled-at-block': stream.cancelledAtBlock || null,
      cancelledAtBlock: stream.cancelledAtBlock || null,
      vestedPaid: stream.vestedPaid || '0',
      unvestedReturned: stream.unvestedReturned || '0',
      cancelledAt: stream.cancelledAt || null,
      // Note: vested, withdrawable, progress calculated on frontend with current block
    }));

    return NextResponse.json({
      success: true,
      streams: formattedStreams,
      count: formattedStreams.length,
    });
  } catch (error) {
    console.error('Error fetching streams from database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch streams',
      },
      { status: 500 }
    );
  }
}
