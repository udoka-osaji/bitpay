/**
 * GET /api/streams/[id]
 * Returns a single stream by ID from database with all details
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: streamId } = await params;

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: 'Stream ID required' },
        { status: 400 }
      );
    }

    // Connect to database
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed');
    }

    // Query stream by ID
    const stream = await db.collection('streams').findOne({
      streamId: streamId,
    });

    if (!stream) {
      return NextResponse.json(
        { success: false, error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Format stream for frontend
    const formattedStream = {
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
    };

    return NextResponse.json({
      success: true,
      stream: formattedStream,
    });
  } catch (error) {
    console.error('Error fetching stream from database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stream',
      },
      { status: 500 }
    );
  }
}
