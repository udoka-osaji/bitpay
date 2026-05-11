"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminProposal,
  useNextProposalId,
  useApproveAdminProposal,
  useExecuteAdminProposal,
  type AdminProposal,
} from "@/hooks/use-multisig-treasury";

interface AdminProposalsListProps {
  currentUserAddress: string | null;
  isCurrentUserAdmin: boolean;
  requiredSignatures: number;
}

export function AdminProposalsList({
  currentUserAddress,
  isCurrentUserAdmin,
  requiredSignatures,
}: AdminProposalsListProps) {
  console.log('🎯 AdminProposalsList component mounted!');

  const [proposals, setProposals] = useState<AdminProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get next proposal ID to know how many proposals exist
  const { data: nextProposalId } = useNextProposalId();

  console.log('📊 useNextProposalId raw data:', nextProposalId);

  const { approve: approveProposal, isLoading: isApproving } = useApproveAdminProposal();
  const { execute: executeProposal, isLoading: isExecuting } = useExecuteAdminProposal();

  // Fetch all admin proposals from database
  const fetchProposals = async () => {
    console.log('🔍 AdminProposalsList: Fetching from database...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/treasury/admin-proposals', {
        cache: 'no-store', // Force fresh data
      });
      console.log('📄 Admin proposals API response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Admin proposals data:', data);

        if (data.success && data.proposals) {
          setProposals(data.proposals);
          console.log(`✅ Fetched ${data.proposals.length} pending proposals from database`);
        } else {
          console.log('⚠️ No proposals found or API error');
          setProposals([]);
        }
      } else {
        console.error('❌ Failed to fetch proposals:', response.statusText);
        setProposals([]);
      }
    } catch (error) {
      console.error('❌ Error fetching admin proposals:', error);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProposals();
  }, []);

  // Refetch every 10 seconds (since WebSocket is failing)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refetching admin proposals...');
      fetchProposals();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (proposalId: number) => {
    try {
      toast.info("Opening wallet to approve proposal...");
      const txId = await approveProposal(proposalId);

      if (txId) {
        toast.success("Approval submitted!", {
          description: `Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
        });

        // Refresh proposals after a delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to approve proposal:", error);
      toast.error("Failed to approve proposal");
    }
  };

  const handleExecute = async (proposalId: number) => {
    try {
      toast.info("Opening wallet to execute proposal...");
      const txId = await executeProposal(proposalId);

      if (txId) {
        toast.success("Proposal executed!", {
          description: `Transaction ID: ${txId.slice(0, 8)}...${txId.slice(-8)}`,
        });

        // Refresh page after execution
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      toast.error("Failed to execute proposal");
    }
  };

  const hasUserApproved = (proposal: AdminProposal) => {
    return (
      currentUserAddress &&
      proposal.approvals.some(
        (addr) => addr.toLowerCase() === currentUserAddress.toLowerCase()
      )
    );
  };

  const canExecute = (proposal: AdminProposal) => {
    return proposal.approvals.length >= requiredSignatures && !proposal.executed;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Proposals</CardTitle>
          <CardDescription>Loading proposals...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-pink" />
          Admin Management Proposals
        </CardTitle>
        <CardDescription>
          Pending proposals to add or remove multi-sig administrators
        </CardDescription>
      </CardHeader>

      <CardContent>
        {proposals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Pending Proposals</h3>
            <p className="text-sm text-muted-foreground">
              No admin management proposals are currently pending
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const userApproved = hasUserApproved(proposal);
              const canExec = canExecute(proposal);

              return (
                <div
                  key={proposal.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        proposal.action === 'add'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}>
                        {proposal.action === 'add' ? (
                          <UserPlus className={`h-5 w-5 ${
                            proposal.action === 'add' ? 'text-green-500' : 'text-red-500'
                          }`} />
                        ) : (
                          <UserMinus className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {proposal.action === 'add' ? 'Add' : 'Remove'} Admin #{proposal.id}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Proposed by {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <Badge variant={canExec ? "default" : "secondary"} className={canExec ? "bg-green-500" : ""}>
                      {proposal.approvals.length}/{requiredSignatures} Approvals
                    </Badge>
                  </div>

                  {/* Target Admin */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Target Admin:</p>
                    <p className="font-mono text-sm">{proposal.targetAdmin}</p>
                  </div>

                  {/* Approvals */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Approvals:</p>
                    <div className="flex flex-wrap gap-2">
                      {proposal.approvals.map((approver, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {approver.slice(0, 6)}...{approver.slice(-4)}
                        </Badge>
                      ))}
                      {proposal.approvals.length === 0 && (
                        <span className="text-xs text-muted-foreground italic">
                          No approvals yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {isCurrentUserAdmin && (
                    <div className="flex gap-2 pt-2 border-t">
                      {!userApproved && !canExec && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(proposal.id)}
                          disabled={isApproving}
                          className="flex-1 bg-brand-teal hover:bg-brand-teal/90"
                        >
                          {isApproving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      )}

                      {userApproved && !canExec && (
                        <div className="flex-1 flex items-center justify-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>You approved this proposal</span>
                        </div>
                      )}

                      {canExec && (
                        <Button
                          size="sm"
                          onClick={() => handleExecute(proposal.id)}
                          disabled={isExecuting}
                          className="flex-1 bg-brand-pink hover:bg-brand-pink/90"
                        >
                          {isExecuting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Execute Proposal
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Alert */}
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Admin proposals require {requiredSignatures} approvals to execute.
            Once approved, any admin can execute the proposal to add or remove the administrator.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
