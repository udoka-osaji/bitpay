"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTurnkey, AuthState, ClientState } from "@turnkey/react-wallet-kit";
import { Wallet, Copy, ExternalLink, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function TurnkeyLoginButton() {
  const router = useRouter();
  const turnkeyContext = useTurnkey();

  // Safely access Turnkey properties
  const handleLogin = turnkeyContext.handleLogin;
  const logout = (turnkeyContext as any).logout;
  const authState = turnkeyContext.authState;
  const clientState = turnkeyContext.clientState;
  const currentWallet = (turnkeyContext as any).currentWallet || (turnkeyContext as any).wallet;

  // Show loading state while client is initializing
  if (clientState === ClientState.Loading) {
    return (
      <Button disabled variant="outline">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // Show error state
  if (clientState === ClientState.Error) {
    return (
      <Button
        onClick={() => window.location.reload()}
        variant="destructive"
      >
        Error - Click to Reload
      </Button>
    );
  }

  // If authenticated and wallet exists, show wallet info
  if (authState === AuthState.Authenticated && currentWallet) {
    const stacksAccount = currentWallet.accounts?.find(
      (acc: any) => acc.curve === "CURVE_SECP256K1"
    );

    const address = stacksAccount?.address || currentWallet.accounts[0]?.address;
    const truncatedAddress = address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : "Unknown";

      const copyAddress = () => {
      if (address) {
        navigator.clipboard.writeText(address);
        toast.success("Address copied to clipboard");
      }
    };

    const viewExplorer = () => {
      if (address) {
        const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || "testnet";
        const explorerUrl =
          networkType === "mainnet"
            ? `https://explorer.hiro.so/address/${address}?chain=mainnet`
            : `https://explorer.hiro.so/address/${address}?chain=testnet`;
        window.open(explorerUrl, "_blank");
      }
    };
