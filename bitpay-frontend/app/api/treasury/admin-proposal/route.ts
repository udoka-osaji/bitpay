import { NextResponse } from 'next/server';
import { fetchCallReadOnlyFunction } from '@stacks/transactions';
import { getStacksNetwork } from '@/lib/contracts/config';
import { BITPAY_DEPLOYER_ADDRESS, CONTRACT_NAMES } from '@/lib/contracts/config';
import { uintCV, cvToJSON } from '@stacks/transactions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (proposalId === null) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    const network = getStacksNetwork();

    // Call get-admin-proposal function
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress: BITPAY_DEPLOYER_ADDRESS,
      contractName: CONTRACT_NAMES.TREASURY,
      functionName: 'get-admin-proposal',
      functionArgs: [uintCV(parseInt(proposalId))],
      senderAddress: BITPAY_DEPLOYER_ADDRESS,
    });

    const jsonResult = cvToJSON(result);

    // Extract the proposal data
    let proposal = null;
    if (jsonResult.value && jsonResult.value.value) {
      const data = jsonResult.value.value;

      proposal = {
        proposer: data.proposer?.value || '',
        action: data.action?.value === 'add' ? 'add' : 'remove',
        targetAdmin: data['target-admin']?.value || data.targetAdmin?.value || '',
        approvals: data.approvals?.value?.map((a: any) => a.value) || [],
        executed: data.executed?.value || false,
        proposedAt: parseInt(data['proposed-at']?.value || data.proposedAt?.value || '0'),
        expiresAt: parseInt(data['expires-at']?.value || data.expiresAt?.value || '0'),
      };
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error('Failed to fetch admin proposal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proposal',
      },
      { status: 500 }
    );
  }
}
