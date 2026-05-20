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