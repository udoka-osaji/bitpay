/**
 * POST /api/admin/bootstrap-admins
 * Bootstrap the treasury_admins collection with the deployer
 * Run this once after deploying v5 contracts
 */

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';

const DEPLOYER_ADDRESS = 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7';

export async function POST(request: Request) {
  try {
    console.log('🚀 Bootstrapping treasury admins...');

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if deployer is already in the collection
    const existing = await db.collection('treasury_admins').findOne({
      address: DEPLOYER_ADDRESS,
    });

    if (existing) {
      console.log('✅ Deployer already exists in treasury_admins collection');
      return NextResponse.json({
        success: true,
        message: 'Deployer already exists',
        admin: {
          address: existing.address,
          isActive: existing.isActive,
          addedAt: existing.addedAt,
        },
      });
    }

    // Insert deployer as the first admin
    await db.collection('treasury_admins').insertOne({
      address: DEPLOYER_ADDRESS,
      addedAt: new Date(),
      addedByProposal: 'bootstrap',
      addedTxHash: 'bootstrap',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Deployer added to treasury_admins collection');

    // Create indexes
    await db.collection('treasury_admins').createIndex({ address: 1 }, { unique: true });
    await db.collection('treasury_admins').createIndex({ isActive: 1 });

    console.log('✅ Created indexes on treasury_admins collection');

    return NextResponse.json({
      success: true,
      message: 'Bootstrap complete!',
      admin: {
        address: DEPLOYER_ADDRESS,
        isActive: true,
        addedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Bootstrap failed',
      },
      { status: 500 }
    );
  }
}
