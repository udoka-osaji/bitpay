"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

interface BlockSyncCountdownProps {
  startBlock: bigint;
  currentBlock: number | null;
  className?: string;
}

export function BlockSyncCountdown({ startBlock, currentBlock, className = "" }: BlockSyncCountdownProps) {
  const [blocksRemaining, setBlocksRemaining] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!currentBlock) return;

    const startBlockNum = Number(startBlock);
    const remaining = startBlockNum - currentBlock;

    // Only show countdown if stream hasn't started yet and is within 2 blocks
    if (remaining <= 0) {
      setBlocksRemaining(0);
      // Fade out animation
      setIsVisible(false);
      return;
    }

    if (remaining > 2) {
      setBlocksRemaining(0);
      setIsVisible(true);
      return;
    }

    setBlocksRemaining(remaining);
    setIsVisible(true);
  }, [startBlock, currentBlock]);

  if (blocksRemaining === 0 || !isVisible) return null;

  return (
    <Alert className={`border-blue-500/50 bg-blue-500/5 transition-all duration-500 animate-in fade-in-50 ${className}`}>
      <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      <AlertDescription className="text-sm">
        <span className="font-medium text-blue-800">Stream starting soon!</span>
        <span className="text-muted-foreground ml-2">
          Waiting for block synchronization: <span className="font-semibold text-blue-700 tabular-nums">{blocksRemaining}</span> block{blocksRemaining !== 1 ? 's' : ''} remaining
        </span>
      </AlertDescription>
    </Alert>
  );
}
