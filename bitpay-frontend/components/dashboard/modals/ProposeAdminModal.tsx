"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus, UserMinus, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { useProposeAddAdmin, useProposeRemoveAdmin } from "@/hooks/use-multisig-treasury";

interface ProposeAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdminCount: number;
  onSuccess?: () => void;
}

export function ProposeAdminModal({
  isOpen,
  onClose,
  currentAdminCount,
  onSuccess,
}: ProposeAdminModalProps) {
  const [activeTab, setActiveTab] = useState<"add" | "remove">("add");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const { proposeAdd, isLoading: isAddLoading } = useProposeAddAdmin();
  const { proposeRemove, isLoading: isRemoveLoading } = useProposeRemoveAdmin();

  const isLoading = isAddLoading || isRemoveLoading;

  const handlePropose = async () => {
    setError("");

    // Check if wallet is available
    if (typeof window === 'undefined' || !(window as any).btc) {
      setError("Stacks wallet not detected. Please install Leather or Hiro wallet extension.");
      toast.error("Wallet not detected", {
        description: "Please install Leather or Hiro wallet extension and refresh the page."
      });
      return;
    }

    // Validate address
    if (!address.trim()) {
      setError("Please enter a valid Stacks address");
      return;
    }

    if (!address.startsWith("SP") && !address.startsWith("ST")) {
      setError("Invalid Stacks address format (must start with SP or ST)");
      return;
    }

    if (address.length < 39) {
      setError("Address is too short");
      return;
    }

    // Additional validation for remove
    if (activeTab === "remove" && currentAdminCount <= 1) {
      setError("Cannot remove the last admin");
      return;
    }

    try {
      let txId: string | null = null;

      console.log("🚀 Starting admin proposal...");
      console.log("Wallet available:", !!(window as any).btc);
      console.log("Active tab:", activeTab);
      console.log("Target address:", address);

      if (activeTab === "add") {
        console.log("Proposing to add admin:", address);
        toast.info("Opening wallet to propose admin addition...");
        txId = await proposeAdd(address);
        console.log("proposeAdd returned txId:", txId);
      } else {
        console.log("Proposing to remove admin:", address);
        toast.info("Opening wallet to propose admin removal...");
        txId = await proposeRemove(address);
        console.log("proposeRemove returned txId:", txId);
      }

      if (txId) {
        toast.success("Proposal created!", {
          description: `Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
        });

        if (onSuccess) {
          onSuccess();
        }

        handleClose();
      } else {
        setError("Transaction was cancelled or failed");
      }
    } catch (err) {
      console.error("Error proposing admin change:", err);
      setError(err instanceof Error ? err.message : "Failed to create proposal. Please try again.");
    }
  };

  const handleClose = () => {
    setAddress("");
    setError("");
    setActiveTab("add");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Propose Admin Change</DialogTitle>
          <DialogDescription className="text-xs">
            Create a multi-sig proposal to add or remove an admin
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "add" | "remove")}>
          <TabsList className="grid w-full grid-cols-2 h-8">
            <TabsTrigger value="add" className="gap-1.5 text-xs">
              <UserPlus className="h-3 w-3" />
              Add Admin
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-1.5 text-xs">
              <UserMinus className="h-3 w-3" />
              Remove Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-3 mt-3">
            {/* Current Status */}
            <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">Current Admins</p>
              <p className="text-xl font-bold text-brand-teal">{currentAdminCount}/5</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {5 - currentAdminCount} slot{5 - currentAdminCount !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Address Input */}
            <div className="space-y-1.5">
              <Label htmlFor="add-address" className="text-xs">Admin Address</Label>
              <Input
                id="add-address"
                placeholder="SP... or ST..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                className={`h-8 text-xs ${error ? "border-red-500" : ""}`}
              />
              {error && <p className="text-[11px] text-red-500">{error}</p>}
            </div>

            {/* Info Alert */}
            <Alert className="py-2">
              <Info className="h-3 w-3 text-brand-teal" />
              <AlertDescription className="text-xs">
                <p className="font-medium mb-0.5">Multi-Sig Process</p>
                <ol className="text-[11px] space-y-0 ml-3 list-decimal">
                  <li>Create proposal to add admin</li>
                  <li>Requires 3 admin approvals</li>
                  <li>Execute after approval threshold met</li>
                </ol>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="remove" className="space-y-3 mt-3">
            {/* Warning for low admin count */}
            {currentAdminCount <= 1 && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">
                  Cannot remove admin. At least one admin must remain in the system.
                </AlertDescription>
              </Alert>
            )}

            {/* Current Status */}
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-2.5">
              <p className="text-xs text-muted-foreground">Current Admins</p>
              <p className="text-xl font-bold text-red-600">{currentAdminCount}/5</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {currentAdminCount > 1 ? 'Can remove admins' : 'Must keep at least 1 admin'}
              </p>
            </div>

            {/* Address Input */}
            <div className="space-y-1.5">
              <Label htmlFor="remove-address" className="text-xs">Admin Address to Remove</Label>
              <Input
                id="remove-address"
                placeholder="SP... or ST..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                disabled={currentAdminCount <= 1}
                className={`h-8 text-xs ${error ? "border-red-500" : ""}`}
              />
              {error && <p className="text-[11px] text-red-500">{error}</p>}
            </div>

            {/* Warning Alert */}
            <Alert className="border-yellow-500/50 bg-yellow-500/5 py-2">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-0.5">⚠️ Important</p>
                <p className="text-[11px]">
                  Removing an admin revokes their treasury access. This action requires 3 admin approvals and cannot be reversed easily.
                </p>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            onClick={handlePropose}
            disabled={isLoading || !address || (activeTab === "remove" && currentAdminCount <= 1)}
            className={`h-8 text-xs ${
              activeTab === "add"
                ? "bg-brand-teal hover:bg-brand-teal/90"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {activeTab === "add" ? (
                  <UserPlus className="h-3 w-3 mr-1.5" />
                ) : (
                  <UserMinus className="h-3 w-3 mr-1.5" />
                )}
                Create Proposal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
