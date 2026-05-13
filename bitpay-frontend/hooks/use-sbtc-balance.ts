/**
 * Hook to fetch sBTC balance from the bitpay-sbtc-helper contract
 * Now uses backend API proxy to avoid CORS and rate limiting
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseSBTCBalanceReturn {
  balance: bigint | null;
  balanceDisplay: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSBTCBalance(address: string | null): UseSBTCBalanceReturn {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🔧 useSBTCBalance hook mounted with address:', address);

  const fetchBalance = useCallback(async () => {
    console.log('🔧 fetchBalance called with address:', address);

    if (!address) {
      console.log('⚠️ No address provided, skipping balance fetch');
      setBalance(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('📞 Fetching sBTC balance from API for:', address);

      // Use backend API route to avoid CORS and rate limiting
      const response = await fetch(`/api/stacks/balance/${address}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch balance');
      }

      const balanceValue = BigInt(data.balance);

      console.log('✅ sBTC Balance:', balanceValue.toString(), 'satoshis');
      setBalance(balanceValue);
    } catch (err) {
      console.error('❌ Error fetching sBTC balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Convert balance to display format (8 decimals)
  const balanceDisplay = balance !== null
    ? (Number(balance) / 100_000_000).toFixed(8)
    : '0.00000000';

  return {
    balance,
    balanceDisplay,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
