import { useMemo, useState, useEffect } from 'react';
import { useBlockHeight } from './use-block-height';
import { calculateVestedAmount, calculateWithdrawableAmount, getStreamStatus } from '@/lib/contracts/config';

export interface StreamWithRole {
  stream: any;
  userRole: 'sender' | 'recipient';
}

export function useUserStreamsByRole(userAddress: string | null) {
  const [allStreams, setAllStreams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { blockHeight } = useBlockHeight();

  // Fetch streams from database API
  useEffect(() => {
    const fetchStreams = async () => {
      if (!userAddress) {
        setAllStreams([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/streams?address=${userAddress}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAllStreams(data.streams || []);
        } else {
          console.error('Failed to fetch streams:', response.statusText);
          setAllStreams([]);
        }
      } catch (error) {
        console.error('Error fetching streams:', error);
        setAllStreams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreams();
  }, [userAddress]);

  // Calculate dynamic values using current block height
  const enrichedStreams = useMemo(() => {
    if (!blockHeight || allStreams.length === 0) return allStreams;

    const currentBlock = BigInt(blockHeight);

    return allStreams.map((stream) => {
      try {
        const vestedAmount = calculateVestedAmount(
          {
            amount: BigInt(stream.amount),
            'start-block': BigInt(stream.startBlock || stream['start-block']),
            'end-block': BigInt(stream.endBlock || stream['end-block']),
            withdrawn: BigInt(stream.withdrawn || '0'),
            sender: stream.sender,
            recipient: stream.recipient,
            cancelled: stream.cancelled || false,
            'cancelled-at-block': stream.cancelledAtBlock ? BigInt(stream.cancelledAtBlock) : BigInt(0),
          },
          currentBlock
        );

        const withdrawableAmount = calculateWithdrawableAmount(
          {
            amount: BigInt(stream.amount),
            'start-block': BigInt(stream.startBlock || stream['start-block']),
            'end-block': BigInt(stream.endBlock || stream['end-block']),
            withdrawn: BigInt(stream.withdrawn || '0'),
            sender: stream.sender,
            recipient: stream.recipient,
            cancelled: stream.cancelled || false,
            'cancelled-at-block': stream.cancelledAtBlock ? BigInt(stream.cancelledAtBlock) : BigInt(0),
          },
          currentBlock
        );

        const status = getStreamStatus(
          BigInt(stream.startBlock || stream['start-block']),
          BigInt(stream.endBlock || stream['end-block']),
          currentBlock,
          stream.cancelled
        );

        // Calculate progress percentage
        const startBlock = BigInt(stream.startBlock || stream['start-block']);
        const endBlock = BigInt(stream.endBlock || stream['end-block']);
        const totalBlocks = endBlock - startBlock;
        const elapsed = currentBlock - startBlock;
        const progress = totalBlocks > BigInt(0)
          ? Number((elapsed * BigInt(100)) / totalBlocks)
          : 0;

        return {
          ...stream,
          startBlock: stream.startBlock || stream['start-block'],
          endBlock: stream.endBlock || stream['end-block'],
          vestedAmount: vestedAmount.toString(),
          withdrawableAmount: withdrawableAmount.toString(),
          status,
          progress: Math.min(Math.max(progress, 0), 100),
        };
      } catch (error) {
        console.error('Error calculating stream values:', stream.streamId, error);
        return stream;
      }
    });
  }, [allStreams, blockHeight]);

  const streamsByRole = useMemo(() => {
    if (!enrichedStreams || !userAddress) {
      return {
        outgoingStreams: [],
        incomingStreams: [],
        hasOutgoing: false,
        hasIncoming: false,
        totalOutgoing: 0,
        totalIncoming: 0,
      };
    }

    const normalizedAddress = userAddress.toLowerCase();

    console.log('🔍 Filtering streams for user:', userAddress);
    console.log('📊 Total streams fetched:', enrichedStreams.length);

    // Debug: log all streams
    enrichedStreams.forEach((stream, index) => {
      console.log(`Stream ${index + 1}:`, {
        id: stream.id?.toString(),
        sender: stream.sender,
        recipient: stream.recipient,
        isSender: stream.sender?.toLowerCase() === normalizedAddress,
        isRecipient: stream.recipient?.toLowerCase() === normalizedAddress,
      });
    });

    // Streams where user is the sender
    const outgoingStreams = enrichedStreams.filter(stream =>
      stream.sender && stream.sender.toLowerCase() === normalizedAddress
    );

    // Streams where user is the recipient
    const incomingStreams = enrichedStreams.filter(stream =>
      stream.recipient && stream.recipient.toLowerCase() === normalizedAddress
    );

    console.log('📤 Outgoing (Obligation NFTs):', outgoingStreams.length);
    console.log('📥 Incoming (Recipient NFTs):', incomingStreams.length);

    return {
      outgoingStreams,
      incomingStreams,
      hasOutgoing: outgoingStreams.length > 0,
      hasIncoming: incomingStreams.length > 0,
      totalOutgoing: outgoingStreams.length,
      totalIncoming: incomingStreams.length,
    };
  }, [enrichedStreams, userAddress]);

  // Refetch function to manually refresh streams
  const refetch = async () => {
    if (!userAddress) return;

    try {
      const response = await fetch(`/api/streams?address=${userAddress}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAllStreams(data.streams || []);
      }
    } catch (error) {
      console.error('Error refetching streams:', error);
    }
  };

  return {
    ...streamsByRole,
    isLoading,
    refetch,
    allStreams: enrichedStreams || [],
  };
}

// Helper to determine user's role in a specific stream
export function getUserRoleInStream(stream: any, userAddress: string): 'sender' | 'recipient' | null {
  if (!stream || !userAddress) return null;

  const normalized = userAddress.toLowerCase();

  if (stream.sender.toLowerCase() === normalized) return 'sender';
  if (stream.recipient.toLowerCase() === normalized) return 'recipient';

  return null;
}
