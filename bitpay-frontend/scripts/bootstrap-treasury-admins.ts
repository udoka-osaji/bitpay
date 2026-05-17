/**
 * Bootstrap Treasury Admins
 * Initializes the treasury_admins collection with the deployer address
 * Run this once after deploying v5 contracts
 *
 * NOTE: Make sure MONGODB_URI is set in your environment or .env.local
 */

import connectToDatabase from '../lib/db';

const DEPLOYER_ADDRESS = 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7';

async function bootstrapTreasuryAdmins() {
  try {
    console.log('🚀 Bootstrapping treasury admins...');

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection failed');
    }

    // Check if deployer is already in the collection
    const existing = await db.collection('treasury_admins').findOne({
      address: DEPLOYER_ADDRESS,
    });

    if (existing) {
      console.log('✅ Deployer already exists in treasury_admins collection');
      console.log('   Address:', existing.address);
      console.log('   Is Active:', existing.isActive);
      return;
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
    console.log('   Address:', DEPLOYER_ADDRESS);
    console.log('   Status: Active');

    // Create index on address field for faster queries
    await db.collection('treasury_admins').createIndex({ address: 1 }, { unique: true });
    await db.collection('treasury_admins').createIndex({ isActive: 1 });

    console.log('✅ Created indexes on treasury_admins collection');
    console.log('\n🎉 Bootstrap complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrapTreasuryAdmins();
