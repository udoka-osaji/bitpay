/**
 * GET /api/test-db
 * Test endpoint to verify MongoDB connection
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

export async function GET() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    console.log('📍 MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('📍 MONGODB_URI preview:', process.env.MONGODB_URI?.substring(0, 30) + '...');

    // Test mongoose connection
    const mongoose = await connectToDatabase();
    console.log('✅ Mongoose connected, readyState:', mongoose.connection.readyState);

    // Test database access
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database instance is null');
    }

    console.log('✅ Database name:', db.databaseName);

    // Test collections access
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections found:', collections.map(c => c.name));

    // Test writing to streams collection
    const testStream = {
      streamId: 'test-' + Date.now(),
      sender: 'TEST_SENDER',
      recipient: 'TEST_RECIPIENT',
      amount: '1000000',
      startBlock: '1000',
      endBlock: '2000',
      withdrawn: '0',
      status: 'test',
      createdAt: new Date(),
      txHash: 'test-hash',
      blockHeight: 1000,
    };

    console.log('💾 Attempting to write test document...');
    const insertResult = await db.collection('streams').insertOne(testStream);
    console.log('✅ Test document inserted:', insertResult.insertedId);

    // Clean up test document
    await db.collection('streams').deleteOne({ _id: insertResult.insertedId });
    console.log('🧹 Test document cleaned up');

    // Count existing streams
    const streamCount = await db.collection('streams').countDocuments();
    console.log('📊 Total streams in database:', streamCount);

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection is working!',
      details: {
        connected: true,
        readyState: mongoose.connection.readyState,
        databaseName: db.databaseName,
        collections: collections.map(c => c.name),
        streamCount,
        testWrite: 'successful',
      },
    });
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          mongoUriExists: !!process.env.MONGODB_URI,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
        },
      },
      { status: 500 }
    );
  }
}
