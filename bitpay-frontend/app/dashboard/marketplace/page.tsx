"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Tag,
  TrendingUp,
  Info,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUserStreamsByRole } from "@/hooks/use-user-streams";
import { useAllMarketplaceListings, useListing } from "@/hooks/use-marketplace";
import { useMarketplaceEvents } from "@/hooks/use-realtime";
import { useBlockHeight } from "@/hooks/use-block-height";
import { StreamStatus, microToDisplay } from "@/lib/contracts/config";
import { ListObligationNFTModal } from "@/components/dashboard/modals/ListObligationNFTModal";
import { BuyObligationNFTModal } from "@/components/dashboard/modals/BuyObligationNFTModal";
import { NFTGridSkeleton } from "@/components/dashboard/NFTCardSkeleton";
import { MarketplaceHeader } from "@/components/dashboard/marketplace/listings/MarketplaceHeader";
import { MarketplaceFilters } from "@/components/dashboard/marketplace/filters/MarketplaceFilters";
import { ListingCard } from "@/components/dashboard/marketplace/listings/ListingCard";
import { EmptyMarketplace } from "@/components/dashboard/marketplace/listings/EmptyMarketplace";
import { MarketStats } from "@/components/dashboard/marketplace/analytics/MarketStats";
import { MarketInsights } from "@/components/dashboard/marketplace/analytics/MarketInsights";
import { toast } from "sonner";

interface MarketplaceListing {
  streamId: string;
  seller: string;
  price: number;
  discount: number;
  totalAmount: number;
  vestedAmount: number;
  remainingAmount: number;
  endBlock: number;
  daysRemaining: number;
  apr: number;
  listed: string;
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const userAddress = user?.walletAddress || null;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [selectedNFTToList, setSelectedNFTToList] = useState<any | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyMethod, setBuyMethod] = useState<"direct" | "gateway">("direct");
  const [sortBy, setSortBy] = useState("discount");
  const [filterDiscount, setFilterDiscount] = useState("all");

  const { outgoingStreams, isLoading: userStreamsLoading } = useUserStreamsByRole(userAddress);
  const { data: allListings, isLoading: listingsLoading } = useAllMarketplaceListings();
  const { blockHeight } = useBlockHeight(30000);

  // Fetch initial listings from database
  const [dbListings, setDbListings] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        const response = await fetch('/api/marketplace/listings');
        const data = await response.json();
        if (data.success && data.listings) {
          setDbListings(data.listings);
        }
      } catch (error) {
        console.error('Failed to fetch marketplace listings:', error);
      } finally {
        setDbLoading(false);
      }
    }
    fetchListings();
  }, []);

  // WebSocket real-time updates
  const { listings: realtimeListings, sales: realtimeSales, isConnected } = useMarketplaceEvents();

  // Listen for WebSocket events and show toast notifications
  useEffect(() => {
    if (realtimeListings.length > 0) {
      const latestListing = realtimeListings[0];
      if (latestListing.seller === userAddress) {
        toast.success("NFT Listed!", {
          description: `Stream #${latestListing.streamId} is now listed for sale`,
        });
      } else {
        toast.info("New Listing!", {
          description: `Stream #${latestListing.streamId} listed on marketplace`,
        });
      }
    }
  }, [realtimeListings.length, userAddress]);

  useEffect(() => {
    if (realtimeSales.length > 0) {
      const latestSale = realtimeSales[0];
      if (latestSale.buyer === userAddress) {
        toast.success("Purchase Completed!", {
          description: `You now own stream #${latestSale.streamId}`,
        });
      } else if (latestSale.seller === userAddress) {
        toast.success("NFT Sold!", {
          description: `Stream #${latestSale.streamId} has been sold`,
        });
      } else {
        toast.info("Sale Completed!", {
          description: `Stream #${latestSale.streamId} was purchased`,
        });
      }
    }
  }, [realtimeSales.length, userAddress]);

  // Merge database listings with WebSocket real-time updates
  const marketplaceListings = useMemo(() => {
    // Combine both sources of listings
    const allListingsMap = new Map();

    // Add database listings first (with stream data calculations)
    dbListings.forEach((listing: any) => {
      if (!listing.stream) return; // Skip if no stream data

      const totalAmount = Number(microToDisplay(listing.stream.amount || 0));
      const withdrawn = Number(microToDisplay(listing.stream.withdrawn || 0));
      const price = Number(microToDisplay(listing.price || 0));

      // Calculate vested amount based on time progression
      const currentBlock = blockHeight || 0;
      const startBlock = Number(listing.stream.startBlock || 0);
      const endBlock = Number(listing.stream.endBlock || 0);
      const totalBlocks = endBlock - startBlock;
      const blocksElapsed = Math.max(0, Math.min(currentBlock - startBlock, totalBlocks));

      // Vested amount = (total amount * blocks elapsed) / total blocks
      const vestedAmount = totalBlocks > 0
        ? (totalAmount * blocksElapsed) / totalBlocks
        : 0;

      // Remaining amount = total - vested (this is what the buyer will receive)
      const remainingAmount = Math.max(0, totalAmount - vestedAmount);

      const discount = totalAmount > 0 ? ((totalAmount - price) / totalAmount) * 100 : 0;

      // Calculate time remaining
      const blocksRemaining = Math.max(0, endBlock - currentBlock);
      const daysRemaining = Math.ceil(blocksRemaining / 144); // ~144 blocks per day

      // Calculate APR based on remaining amount
      const profit = remainingAmount - price;
      const apr = price > 0 && daysRemaining > 0
        ? (profit / price) * (365 / daysRemaining) * 100
        : 0;

      allListingsMap.set(listing.streamId, {
        streamId: listing.streamId,
        seller: listing.seller,
        price,
        discount,
        totalAmount,
        vestedAmount: withdrawn,
        remainingAmount,
        endBlock,
        daysRemaining,
        apr,
        listed: listing.listedAt || "Recently",
        blockHeight: listing.blockHeight,
        txHash: listing.txHash,
      });
    });

    // Overlay WebSocket listings (newer data)
    realtimeListings.forEach((listing: any) => {
      allListingsMap.set(listing.streamId?.toString() || "", {
        streamId: listing.streamId?.toString() || "",
        seller: listing.seller || "",
        price: Number(microToDisplay(listing.price || 0)),
        discount: listing.discount || 0,
        totalAmount: Number(microToDisplay(listing.totalAmount || 0)),
        vestedAmount: Number(microToDisplay(listing.vestedAmount || 0)),
        remainingAmount: Number(microToDisplay(listing.remainingAmount || 0)),
        endBlock: listing.endBlock || 0,
        daysRemaining: listing.daysRemaining || 0,
        apr: listing.apr || 0,
        listed: listing.listedAt || "Recently",
      });
    });

    return Array.from(allListingsMap.values());
  }, [dbListings, realtimeListings, blockHeight]);

  // Filter active obligation NFTs that can be listed
  const listableNFTs = outgoingStreams.filter(
    (stream) => stream.status === StreamStatus.ACTIVE
  );

  // Filter user's own listings
  const myListings = marketplaceListings.filter(
    (listing) => listing.seller === userAddress
  );

  // Filter and sort listings
  let filteredListings = marketplaceListings.filter((listing) =>
    listing.streamId.includes(searchTerm) ||
    listing.seller.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterDiscount !== "all") {
    const minDiscount = parseInt(filterDiscount);
    filteredListings = filteredListings.filter((l) => l.discount >= minDiscount);
  }

  // Sort listings
  filteredListings.sort((a, b) => {
    switch (sortBy) {
      case "discount":
        return b.discount - a.discount;
      case "apr":
        return b.apr - a.apr;
      case "amount":
        return b.remainingAmount - a.remainingAmount;
      case "time":
        return a.daysRemaining - b.daysRemaining;
      default:
        return 0;
    }
  });

  const calculateDiscount = (price: number, totalAmount: number) => {
    return ((totalAmount - price) / totalAmount) * 100;
  };

  const isLoading = userStreamsLoading || listingsLoading || dbLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <MarketplaceHeader hasListableNFTs={false} onListClick={() => {}} />
        <NFTGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MarketplaceHeader
        hasListableNFTs={listableNFTs.length > 0}
        onListClick={() => setShowListModal(true)}
      />

      {/* Info Alert */}
      <Alert className="border-brand-teal/30 bg-brand-teal/5">
        <Info className="h-4 w-4 text-brand-teal" />
        <AlertDescription>
          <p className="font-medium text-brand-teal mb-1">What is Invoice Factoring?</p>
          <p className="text-sm">
            Obligation NFTs represent future payment streams. Sellers can list them at a discount for
            immediate liquidity, while buyers earn returns by collecting the full stream amount over time.
          </p>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Browse Listings ({filteredListings.length})
          </TabsTrigger>
          <TabsTrigger value="my-listings">
            <Tag className="h-4 w-4 mr-2" />
            My Listings ({myListings.length})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Analytics
          </TabsTrigger>
        </TabsList>

        {/* Browse Listings Tab */}
        <TabsContent value="browse" className="space-y-6">
          <MarketplaceFilters
            searchTerm={searchTerm}
            sortBy={sortBy}
            filterDiscount={filterDiscount}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onDiscountFilterChange={setFilterDiscount}
          />

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <EmptyMarketplace
              hasListableNFTs={listableNFTs.length > 0}
              isFiltered={searchTerm !== "" || filterDiscount !== "all"}
              onListClick={() => setShowListModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.streamId}
                  listing={listing}
                  onBuyDirect={() => {
                    setSelectedListing(listing);
                    setBuyMethod("direct");
                    setShowBuyModal(true);
                  }}
                  onBuyViaGateway={() => {
                    setSelectedListing(listing);
                    setBuyMethod("gateway");
                    setShowBuyModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings" className="space-y-6">
          {myListings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    You haven't listed any obligation NFTs for sale yet.
                  </p>
                  {listableNFTs.length > 0 && (
                    <Button
                      onClick={() => setShowListModal(true)}
                      className="bg-brand-pink hover:bg-brand-pink/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      List Your First NFT
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((listing) => (
                <ListingCard
                  key={listing.streamId}
                  listing={listing}
                  onBuyDirect={() => {
                    setSelectedListing(listing);
                    setBuyMethod("direct");
                    setShowBuyModal(true);
                  }}
                  onBuyViaGateway={() => {
                    setSelectedListing(listing);
                    setBuyMethod("gateway");
                    setShowBuyModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Market Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <MarketStats
            avgDiscount={
              marketplaceListings.length > 0
                ? marketplaceListings.reduce((sum, l) => sum + l.discount, 0) / marketplaceListings.length
                : 0
            }
            avgAPR={
              marketplaceListings.length > 0
                ? marketplaceListings.reduce((sum, l) => sum + l.apr, 0) / marketplaceListings.length
                : 0
            }
            totalVolume={
              marketplaceListings.reduce((sum, l) => sum + l.remainingAmount, 0)
            }
          />

          <MarketInsights
            activeListings={marketplaceListings.length}
            avgDaysRemaining={
              marketplaceListings.length > 0
                ? Math.round(marketplaceListings.reduce((sum, l) => sum + l.daysRemaining, 0) / marketplaceListings.length)
                : 0
            }
            bestDiscount={
              marketplaceListings.length > 0
                ? Math.max(...marketplaceListings.map(l => l.discount))
                : 0
            }
            bestAPR={
              marketplaceListings.length > 0
                ? Math.max(...marketplaceListings.map(l => l.apr))
                : 0
            }
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedNFTToList && (
        <ListObligationNFTModal
          isOpen={showListModal}
          onClose={() => {
            setShowListModal(false);
            setSelectedNFTToList(null);
          }}
          streamId={selectedNFTToList.id?.toString() || ""}
          obligationTokenId={selectedNFTToList.id?.toString() || ""}
          currentAmount={microToDisplay(selectedNFTToList.totalAmount || BigInt(0)).toString()}
          onSuccess={() => {
            setShowListModal(false);
            setSelectedNFTToList(null);
            // Refresh listings
          }}
        />
      )}

      {selectedListing && (
        <BuyObligationNFTModal
          isOpen={showBuyModal}
          onClose={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onSuccess={() => {
            setShowBuyModal(false);
            setSelectedListing(null);
            // Refresh listings
          }}
        />
      )}
    </div>
  );
}
