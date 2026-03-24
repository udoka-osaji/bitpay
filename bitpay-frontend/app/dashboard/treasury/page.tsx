"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  
  AlertCircle,
  Shield,
  BarChart3,
  FileText,
  Plus
} from "lucide-react";
import walletService from "@/lib/wallet/wallet-service";
import { useTreasuryFeeBps, useTotalFeesCollected, useBitPayRead } from "@/hooks/use-bitpay-read";
import { microToDisplay, CONTRACT_NAMES } from "@/lib/contracts/config";
import { principalCV } from "@stacks/transactions";
import { AccessControlPanel } from "@/components/dashboard/AccessControlPanel";
import { AdminProposalsList } from "@/components/dashboard/treasury/multisig/AdminProposalsList";
import { useBlockHeight } from "@/hooks/use-block-height";
import {
  useMultiSigConfig,
  useIsMultiSigAdmin,
  useAdminCount,
  useRequiredSignatures,
  useApproveWithdrawal,
  useExecuteWithdrawal,
  useProposeAddAdmin,
  useProposeRemoveAdmin,
} from "@/hooks/use-multisig-treasury";
import { ProposalCard } from "@/components/dashboard/treasury/proposals/ProposalCard";
import { ProposeWithdrawalModal } from "@/components/dashboard/modals/ProposeWithdrawalModal";
import { MultiSigAdminList } from "@/components/dashboard/treasury/multisig/MultiSigAdminList";
import { TreasuryHeader } from "@/components/dashboard/treasury/overview/TreasuryHeader";
import { TreasuryStats } from "@/components/dashboard/treasury/overview/TreasuryStats";
import { TreasuryOverviewCard } from "@/components/dashboard/treasury/overview/TreasuryOverviewCard";
import { MultiSigConfigCard } from "@/components/dashboard/treasury/multisig/MultiSigConfigCard";
import { WithdrawFeesModal } from "@/components/dashboard/modals/WithdrawFeesModal";
import { ProposeAdminModal } from "@/components/dashboard/modals/ProposeAdminModal";
import { toast } from "sonner";
import { useTreasuryEvents } from "@/hooks/use-realtime";

export default function TreasuryPage() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProposeWithdrawalModal, setShowProposeWithdrawalModal] = useState(false);
  const [showWithdrawFeesModal, setShowWithdrawFeesModal] = useState(false);
  const [showProposeAdminModal, setShowProposeAdminModal] = useState(false);

  // WebSocket real-time updates
  const { proposals: realtimeProposals, admins: realtimeAdmins, balanceUpdate, isConnected } = useTreasuryEvents();

  // Listen for WebSocket events and show toast notifications
  useEffect(() => {
    if (realtimeProposals.length > 0) {
      const latestProposal = realtimeProposals[0];
      if (latestProposal.proposer === userAddress) {
        toast.success("Proposal Created!", {
          description: `Withdrawal proposal #${latestProposal.id} created`,
        });
      } else {
        toast.info("New Withdrawal Proposal", {
          description: `Proposal #${latestProposal.id} requires approval`,
        });
      }
    }
  }, [realtimeProposals.length, userAddress]);

  useEffect(() => {
    if (realtimeAdmins.length > 0) {
      const latestAdmin = realtimeAdmins[realtimeAdmins.length - 1];
      if (latestAdmin.address === userAddress) {
        toast.success("Admin Access Granted!", {
          description: "You are now a treasury admin",
        });
      } else {
        toast.info("Admin Added", {
          description: `${latestAdmin.address.slice(0, 10)}... added as admin`,
        });
      }
    }
  }, [realtimeAdmins.length, userAddress]);

  // Read treasury data
  const { data: feeBps } = useTreasuryFeeBps();
  const { data: totalFees, refetch: refetchFees } = useTotalFeesCollected();
  const { data: treasuryBalance, refetch: refetchBalance } = useBitPayRead(
    CONTRACT_NAMES.TREASURY,
    'get-treasury-balance'
  );

  // Refetch treasury balance when it updates via WebSocket
  useEffect(() => {
    if (balanceUpdate) {
      console.log('💵 Treasury balance updated, refetching...', balanceUpdate);
      refetchBalance();
      refetchFees();
      toast.success('Treasury Updated', {
        description: 'Balance has been updated',
      });
    }
  }, [balanceUpdate, refetchBalance, refetchFees]);

  // Multi-sig data
  const { blockHeight } = useBlockHeight(30000);
  const { data: multiSigConfig } = useMultiSigConfig();
  const { data: isMultiSigAdmin } = useIsMultiSigAdmin(userAddress);
  const { data: adminCount } = useAdminCount();
  const { data: requiredSignatures } = useRequiredSignatures();
  const { approve: approveProposal, isLoading: isApproving } = useApproveWithdrawal();
  const { execute: executeProposal, isLoading: isExecuting } = useExecuteWithdrawal();
  const { proposeAdd: proposeAddAdmin } = useProposeAddAdmin();
  const { proposeRemove: proposeRemoveAdmin } = useProposeRemoveAdmin();

  // Check if user is admin (legacy)
  const { data: isAdminData } = useBitPayRead(
    CONTRACT_NAMES.ACCESS_CONTROL,
    'is-admin',
    userAddress ? [principalCV(userAddress)] : [],
    !!userAddress
  );

  useEffect(() => {
    const loadWallet = async () => {
      const address = await walletService.getCurrentAddress();
      setUserAddress(address);
    };
    loadWallet();
  }, []);

  useEffect(() => {
    const extractedAdminValue = extractValue(isAdminData);
    const extractedMultiSigValue = extractValue(isMultiSigAdmin);

    console.log('🔍 Treasury Access Check:', {
      userAddress,
      rawIsAdminData: isAdminData,
      rawIsMultiSigAdmin: isMultiSigAdmin,
      extractedAdminValue,
      extractedMultiSigValue,
      finalAdminStatus: !!extractedAdminValue,
      finalMultiSigStatus: !!extractedMultiSigValue,
    });

    if (isAdminData !== null && isAdminData !== undefined) {
      setIsAdmin(!!extractedAdminValue);
    }
  }, [isAdminData, isMultiSigAdmin, userAddress]);

  const handleApprove = async (proposalId: number) => {
    const txId = await approveProposal(proposalId);
    if (txId) {
      toast.success("Proposal Approved!", {
        description: `Your approval has been recorded`,
      });
    }
  };

  const handleExecute = async (proposalId: number) => {
    const txId = await executeProposal(proposalId);
    if (txId) {
      toast.success("Withdrawal Executed!", {
        description: "Funds have been transferred",
      });
    }
  };

  const handleProposeAddAdmin = async () => {
    setShowProposeAdminModal(true);
  };

  const handleProposeRemoveAdmin = async (address: string) => {
    setShowProposeAdminModal(true);
  };

  const handleBootstrapAdmins = async () => {
    try {
      toast.info("Bootstrapping admin list...");
      const response = await fetch('/api/admin/bootstrap-admins', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Admin list bootstrapped!", {
          description: data.message,
        });
      } else {
        toast.error("Bootstrap failed", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Bootstrap error:', error);
      toast.error("Bootstrap failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Helper function to safely extract numeric values from contract responses
  const extractValue = (data: any): any => {
    if (data === null || data === undefined) return null;
    
    // Deep extraction - handle nested {type, value} structures
    let current = data;
    while (current && typeof current === 'object' && 'value' in current) {
      current = current.value;
    }
    
    return current;
  };

  const currentFeePercent = feeBps ? Number(extractValue(feeBps)) / 100 : 0;
  
  // Extract bigint value from cvToJSON result if needed
  const getTreasuryBalanceValue = (): string => {
    try {
      const value = extractValue(treasuryBalance);
      if (!value && value !== 0) return "0.000000";
      const bigintValue = typeof value === 'bigint' ? value : BigInt(value.toString());
      return microToDisplay(bigintValue);
    } catch (error) {
      console.error('Error extracting treasury balance:', error, treasuryBalance);
      return "0.000000";
    }
  };
  
  const getTotalFeesValue = (): string => {
    try {
      const value = extractValue(totalFees);
      if (!value && value !== 0) return "0.000000";
      const bigintValue = typeof value === 'bigint' ? value : BigInt(value.toString());
      return microToDisplay(bigintValue);
    } catch (error) {
      console.error('Error extracting total fees:', error, totalFees);
      return "0.000000";
    }
  };
  
  const getAdminCountValue = (): number => {
    try {
      const value = extractValue(adminCount);
      if (!value && value !== 0) return 1;
      const numValue = typeof value === 'number' ? value : Number(value.toString());
      return isNaN(numValue) ? 1 : numValue;
    } catch (error) {
      console.error('Error extracting admin count:', error, adminCount);
      return 1;
    }
  };
  
  const treasuryBalanceDisplay = getTreasuryBalanceValue();

  // Use real-time admins from WebSocket, or show deployer as first admin if no WebSocket data yet
  const displayAdmins = realtimeAdmins.length > 0
    ? realtimeAdmins
    : [
        { address: userAddress || "", isActive: true },
        { address: "", isActive: false },
        { address: "", isActive: false },
        { address: "", isActive: false },
        { address: "", isActive: false },
      ];

  // Check if user is the contract deployer (hardcoded deployer address)
  const DEPLOYER_ADDRESS = 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7';
  const isDeployer = userAddress === DEPLOYER_ADDRESS;

  // Extract properly from contract responses
  const extractedIsAdmin = extractValue(isAdminData);
  const extractedIsMultiSigAdmin = extractValue(isMultiSigAdmin);

  // Debug logging
  console.log('🏛️ Treasury Page Render:', {
    userAddress,
    isDeployer,
    isAdmin,
    isMultiSigAdmin,
    extractedIsAdmin,
    extractedIsMultiSigAdmin,
    hasAccess: isDeployer || isAdmin || !!isMultiSigAdmin || !!extractedIsAdmin || !!extractedIsMultiSigAdmin,
  });

  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
        <p className="text-muted-foreground">Please connect your wallet</p>
      </div>
    );
  }

  // Admin-only access guard (allow deployer, legacy admin, or multi-sig admin)
  // Use both state values AND extracted values to handle async loading
  const hasAdminAccess = isDeployer || isAdmin || !!isMultiSigAdmin || !!extractedIsAdmin || !!extractedIsMultiSigAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Shield className="h-16 w-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You must be an admin to access the Treasury page.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Current address: {userAddress?.slice(0, 10)}...
          </p>
          <div className="text-xs text-muted-foreground mt-4 font-mono">
            <p>Debug Info:</p>
            <p>isDeployer: {String(isDeployer)}</p>
            <p>isAdmin: {String(isAdmin)}</p>
            <p>isMultiSigAdmin: {String(!!isMultiSigAdmin)}</p>
            <p>extractedIsAdmin: {String(!!extractedIsAdmin)}</p>
            <p>extractedIsMultiSigAdmin: {String(!!extractedIsMultiSigAdmin)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TreasuryHeader
        isMultiSigAdmin={!!isMultiSigAdmin}
        isLegacyAdmin={isAdmin}
      />

      <TreasuryStats
        balance={String(treasuryBalanceDisplay || "0.000000")}
        totalFees={String(getTotalFeesValue() || "0.000000")}
        adminCount={Number(getAdminCountValue() || 1)}
        pendingProposals={Number(realtimeProposals.filter(p => !p.executed).length || 0)}
      />

      {/* Withdraw Fees Button - Only for admins */}
      {(isAdmin || isMultiSigAdmin || isDeployer) && parseFloat(treasuryBalanceDisplay) > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Withdraw Treasury Fees</h3>
                <p className="text-sm text-muted-foreground">
                  Available balance: {treasuryBalanceDisplay} sBTC
                </p>
              </div>
              <Button
                onClick={() => setShowWithdrawFeesModal(true)}
                className="bg-brand-pink hover:bg-brand-pink/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Withdraw Fees
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList className="border-b w-full justify-start rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="proposals"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            Proposals ({realtimeProposals.length})
          </TabsTrigger>
          <TabsTrigger
            value="multisig"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <Shield className="h-4 w-4 mr-2" />
            Multi-Sig ({getAdminCountValue()}/5)
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          {(isAdmin || isDeployer) && (
            <TabsTrigger
              value="access-control"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-brand-pink data-[state=active]:bg-transparent"
            >
              <Shield className="h-4 w-4 mr-2" />
              Access Control
            </TabsTrigger>
          )}
        </TabsList>

        {/* Proposals Tab */}
        <TabsContent value="proposals" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Withdrawal Proposals</CardTitle>
                  <CardDescription>
                    3-of-5 multi-sig • 24h timelock (144 blocks) • 100 sBTC daily limit
                  </CardDescription>
                </div>
                {isMultiSigAdmin && (
                  <Button
                    onClick={() => setShowProposeWithdrawalModal(true)}
                    className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Proposal
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {realtimeProposals.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isMultiSigAdmin
                      ? "Create your first withdrawal proposal to get started"
                      : "No withdrawal proposals have been created yet"}
                  </p>
                  {isMultiSigAdmin && (
                    <Button
                      onClick={() => setShowProposeWithdrawalModal(true)}
                      className="bg-brand-pink hover:bg-brand-pink/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Proposal
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {realtimeProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      currentBlock={blockHeight}
                      userAddress={userAddress}
                      isUserAdmin={!!isMultiSigAdmin}
                      onApprove={handleApprove}
                      onExecute={handleExecute}
                      isApproving={isApproving}
                      isExecuting={isExecuting}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Sig Tab */}
        <TabsContent value="multisig" className="space-y-6">
          {/* Bootstrap Button - Only show for deployer */}
          {userAddress === 'ST2F3J1PK46D6XVRBB9SQ66PY89P8G0EBDW5E05M7' && (
            <Card className="border-dashed border-2 border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Admin List Bootstrap
                </CardTitle>
                <CardDescription className="text-xs">
                  Click once to initialize the treasury admins database. Required for notifications to work properly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleBootstrapAdmins}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/50"
                >
                  Initialize Admin List
                </Button>
              </CardContent>
            </Card>
          )}

          <MultiSigAdminList
            admins={displayAdmins}
            totalSlots={5}
            requiredSignatures={3}
            currentUserAddress={userAddress}
            isCurrentUserAdmin={!!isMultiSigAdmin}
            onProposeAdd={handleProposeAddAdmin}
            onProposeRemove={handleProposeRemoveAdmin}
          />

          {/* Admin Proposals Section */}
          <AdminProposalsList
            currentUserAddress={userAddress}
            isCurrentUserAdmin={!!isMultiSigAdmin}
            requiredSignatures={requiredSignatures || 1}
          />

          {multiSigConfig && <MultiSigConfigCard config={multiSigConfig} />}
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <TreasuryOverviewCard
            feeRate={Number(currentFeePercent || 0)}
            balance={String(treasuryBalanceDisplay || "0.000000")}
            totalFees={String(getTotalFeesValue() || "0.000000")}
            adminCount={Number(getAdminCountValue() || 1)}
          />
        </TabsContent>

        {/* Access Control Tab */}
        {(isAdmin || isDeployer) && (
          <TabsContent value="access-control">
            <AccessControlPanel />
          </TabsContent>
        )}
      </Tabs>

      {/* Modals */}
      <ProposeWithdrawalModal
        isOpen={showProposeWithdrawalModal}
        onClose={() => setShowProposeWithdrawalModal(false)}
        treasuryBalance={treasuryBalanceDisplay}
        onSuccess={() => {
          // Refetch proposals
          toast.success("Proposal created successfully!");
        }}
      />

      <WithdrawFeesModal
        isOpen={showWithdrawFeesModal}
        onClose={() => setShowWithdrawFeesModal(false)}
        totalFeesAvailable={treasuryBalanceDisplay}
        onSuccess={() => {
          // Refetch treasury balance
          toast.success("Fees withdrawn successfully!");
        }}
      />

      <ProposeAdminModal
        isOpen={showProposeAdminModal}
        onClose={() => setShowProposeAdminModal(false)}
        currentAdminCount={getAdminCountValue()}
        onSuccess={() => {
          // Refetch admin list
          toast.success("Admin proposal created!");
        }}
      />
    </div>
  );
}
