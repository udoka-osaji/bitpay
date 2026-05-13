/**
 * useBitPayRead Hook
 * Read-only contract interactions for BitPay contracts
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  ClarityValue,
  principalCV,
  uintCV,
} from '@stacks/transactions';
import {
  getStacksNetwork,
  BITPAY_DEPLOYER_ADDRESS,
  CONTRACT_NAMES,
  CORE_FUNCTIONS,
  StreamData,
  StreamWithId,
  getStreamStatus,
  calculateVestedAmount,
  calculateWithdrawableAmount,
} from '@/lib/contracts/config';
import { useBlockHeight } from './use-block-height';

export interface UseContractReadReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for reading from BitPay contracts
 */
export function useBitPayRead<T = any>(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[] = [],
  enabled: boolean = true
): UseContractReadReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const network = getStacksNetwork();
      const result = await fetchCallReadOnlyFunction({
        network,
        contractAddress: BITPAY_DEPLOYER_ADDRESS,
        contractName,
        functionName,
        functionArgs,
        senderAddress: BITPAY_DEPLOYER_ADDRESS,
      });

      const jsonResult = cvToJSON(result);

      // Handle optional response and extract nested tuple data
      let rawData = jsonResult.value;

      // If it's a tuple, get its value property
      if (rawData && typeof rawData === 'object' && 'value' in rawData) {
        rawData = rawData.value;
      }

      // If this is stream data, extract all the values properly
      if (rawData && typeof rawData === 'object' && 'sender' in rawData) {
        const extractValue = (val: any) => {
          if (val === null || val === undefined) return val;
          if (typeof val === 'object' && 'value' in val) return val.value;
          return val;
        };

        const extractedData = {
          sender: extractValue(rawData.sender),
          recipient: extractValue(rawData.recipient),
          amount: extractValue(rawData.amount),
          'start-block': extractValue(rawData['start-block']),
          'end-block': extractValue(rawData['end-block']),
          withdrawn: extractValue(rawData.withdrawn),
          cancelled: extractValue(rawData.cancelled),
          'cancelled-at-block': extractValue(rawData['cancelled-at-block']),
        };
        setData(extractedData as T);
      } else {
        setData(rawData as T);
      }
    } catch (err) {
      console.error(`Error reading ${contractName}.${functionName}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to read contract');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractName, functionName, enabled, functionArgs.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Get a single stream by ID
 */
export function useStream(streamId: bigint | number | null): UseContractReadReturn<StreamWithId> {
  const { blockHeight } = useBlockHeight();
  const streamIdNum = streamId ? BigInt(streamId) : null;

  const { data: rawStream, isLoading, error, refetch } = useBitPayRead<StreamData | null>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_STREAM,
    streamIdNum ? [uintCV(streamIdNum)] : [],
    streamIdNum !== null
  );

  const [enrichedStream, setEnrichedStream] = useState<StreamWithId | null>(null);

  useEffect(() => {
    if (!rawStream || !streamIdNum || !blockHeight) {
      setEnrichedStream(null);
      return;
    }

    const currentBlock = BigInt(blockHeight);
    const vestedAmount = calculateVestedAmount(rawStream, currentBlock);
    const withdrawableAmount = calculateWithdrawableAmount(rawStream, currentBlock);
    const status = getStreamStatus(
      rawStream['start-block'],
      rawStream['end-block'],
      currentBlock,
      rawStream.cancelled
    );

    setEnrichedStream({
      ...rawStream,
      id: streamIdNum,
      status,
      vestedAmount,
      withdrawableAmount,
    });
  }, [rawStream, streamIdNum, blockHeight]);

  return {
    data: enrichedStream,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get all streams for a user (both sent and received)
 * Now fetches from database API instead of blockchain for better performance
 */
export function useUserStreams(userAddress: string | null): UseContractReadReturn<StreamWithId[]> {
  const { blockHeight } = useBlockHeight();
  const [streams, setStreams] = useState<StreamWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStreams = useCallback(async () => {
    if (!userAddress) {
      setStreams([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Fetching streams from database for user:', userAddress);

      // Fetch from database API
      const response = await fetch(`/api/streams?address=${userAddress}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch streams');
      }

      const data = await response.json();
      const dbStreams = data.streams || [];

      console.log('📊 Streams fetched from database:', dbStreams.length);

      // Calculate dynamic values if we have block height
      if (blockHeight) {
        const currentBlock = BigInt(blockHeight);

        const enrichedStreams = dbStreams.map((stream: any) => {
          try {
            const streamData: StreamData = {
              sender: stream.sender,
              recipient: stream.recipient,
              amount: BigInt(stream.amount),
              'start-block': BigInt(stream.startBlock || stream['start-block']),
              'end-block': BigInt(stream.endBlock || stream['end-block']),
              withdrawn: BigInt(stream.withdrawn || '0'),
              cancelled: stream.status === 'cancelled' || stream.cancelled || false,
              'cancelled-at-block': stream.cancelledAtBlock ? BigInt(stream.cancelledAtBlock) : BigInt(0),
            };

            const vestedAmount = calculateVestedAmount(streamData, currentBlock);
            const withdrawableAmount = calculateWithdrawableAmount(streamData, currentBlock);
            const status = getStreamStatus(
              streamData['start-block'],
              streamData['end-block'],
              currentBlock,
              streamData.cancelled
            );

            return {
              ...streamData,
              id: BigInt(stream.streamId || stream.id),
              status,
              vestedAmount,
              withdrawableAmount,
              // Include cancellation data from database
              vestedPaid: stream.vestedPaid || '0',
              unvestedReturned: stream.unvestedReturned || '0',
              cancelledAt: stream.cancelledAt,
            } as StreamWithId;
          } catch (err) {
            console.error('Error processing stream:', stream.streamId, err);
            return null;
          }
        });

        const validStreams = enrichedStreams.filter((s: any): s is StreamWithId => s !== null);
        setStreams(validStreams);
      } else {
        // No block height yet, return basic stream data
        const basicStreams = dbStreams.map((stream: any) => ({
          sender: stream.sender,
          recipient: stream.recipient,
          amount: BigInt(stream.amount),
          'start-block': BigInt(stream.startBlock || stream['start-block']),
          'end-block': BigInt(stream.endBlock || stream['end-block']),
          withdrawn: BigInt(stream.withdrawn || '0'),
          cancelled: stream.status === 'cancelled' || stream.cancelled || false,
          'cancelled-at-block': stream.cancelledAtBlock ? BigInt(stream.cancelledAtBlock) : BigInt(0),
          id: BigInt(stream.streamId || stream.id),
          status: stream.status || 'active',
          vestedAmount: BigInt(0),
          withdrawableAmount: BigInt(0),
          // Include cancellation data from database
          vestedPaid: stream.vestedPaid || '0',
          unvestedReturned: stream.unvestedReturned || '0',
          cancelledAt: stream.cancelledAt,
        } as StreamWithId));

        setStreams(basicStreams);
      }
    } catch (err) {
      console.error('Error fetching user streams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch streams');
      setStreams([]);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, blockHeight]);

  useEffect(() => {
    fetchAllStreams();
  }, [fetchAllStreams]);

  return {
    data: streams,
    isLoading,
    error,
    refetch: fetchAllStreams,
  };
}

/**
 * Get next stream ID
 */
export function useNextStreamId(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.CORE,
    CORE_FUNCTIONS.GET_NEXT_STREAM_ID
  );
}

/**
 * Check if protocol is paused
 */
export function useIsProtocolPaused(): UseContractReadReturn<boolean> {
  return useBitPayRead<boolean>(
    CONTRACT_NAMES.ACCESS_CONTROL,
    'is-paused'
  );
}

/**
 * Get treasury fee in basis points
 */
export function useTreasuryFeeBps(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.TREASURY,
    'get-fee-bps'
  );
}

/**
 * Get total fees collected by treasury
 */
export function useTotalFeesCollected(): UseContractReadReturn<bigint> {
  return useBitPayRead<bigint>(
    CONTRACT_NAMES.TREASURY,
    'get-total-fees-collected'
  );
}
