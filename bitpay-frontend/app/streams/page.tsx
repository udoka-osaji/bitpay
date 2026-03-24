"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Waves,
  Users,
  DollarSign,
  Activity,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useUserEvents } from "@/hooks/use-realtime";

export default function StreamsExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const { events, isConnected } = useUserEvents();

  // Mock data - replace with real API calls
  const globalStats = {
    totalStreams: 1247,
    activeStreams: 486,
    totalValueLocked: "12,450,000", // in sats
    totalVolumeAllTime: "156,780,000", // in sats
    uniqueUsers: 3891,
  };

  const recentActivity = [
    { type: "created", amount: "500000", from: "SP2J...9EJ7", to: "SP3F...VTE", time: "2 mins ago" },
    { type: "withdrawn", amount: "125000", from: "SP1A...2BC", to: "SP4D...8XY", time: "5 mins ago" },
    { type: "cancelled", amount: "300000", from: "SP5E...3FG", to: "SP6H...9IJ", time: "8 mins ago" },
    { type: "created", amount: "1000000", from: "SP7K...4LM", to: "SP8N...0OP", time: "12 mins ago" },
  ];

  const publicStreams = [
    {
      id: 1,
      sender: "SP2J...9EJ7",
      recipient: "SP3F...VTE",
      amount: 1000000,
      withdrawn: 250000,
      startBlock: 100,
      endBlock: 200,
      currentBlock: 125,
      status: "active",
      description: "Employee compensation - 4 year vesting",
      duration: "~4 years"
    },
    {
      id: 2,
      sender: "SP1A...2BC",
      recipient: "SP4D...8XY",
      amount: 500000,
      withdrawn: 400000,
      startBlock: 50,
      endBlock: 150,
      currentBlock: 130,
      status: "active",
      description: "Freelance contract - 30 days",
      duration: "~30 days"
    },
    {
      id: 3,
      sender: "SP5E...3FG",
      recipient: "SP6H...9IJ",
      amount: 2000000,
      withdrawn: 2000000,
      startBlock: 10,
      endBlock: 110,
      currentBlock: 150,
      status: "completed",
      description: "Grant payment",
      duration: "~90 days"
    },
  ];

  const getProgressPercentage = (stream: any) => {
    const elapsed = stream.currentBlock - stream.startBlock;
    const duration = stream.endBlock - stream.startBlock;
    return Math.min((elapsed / duration) * 100, 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "created":
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case "withdrawn":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Waves className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-pink to-brand-teal bg-clip-text text-transparent">
            Stream Explorer
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover active Bitcoin streams and explore the streaming economy in real-time
          </p>
        </motion.div>

        {/* Global Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Total Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalStreams.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{globalStats.activeStreams.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Value Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalValueLocked}</div>
              <div className="text-xs text-muted-foreground">sats</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.totalVolumeAllTime}</div>
              <div className="text-xs text-muted-foreground">sats</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Unique Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats.uniqueUsers.toLocaleString()}</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Stream List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by address or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="largest">Largest Amount</SelectItem>
                        <SelectItem value="ending">Ending Soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Public Streams */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Public Streams</h2>
              <div className="space-y-4">
                {publicStreams.map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <Waves className="h-5 w-5 text-brand-teal" />
                              Stream #{stream.id}
                              <Badge variant={stream.status === "active" ? "default" : stream.status === "completed" ? "secondary" : "outline"}>
                                {stream.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>{stream.description}</CardDescription>
                          </div>
                          <Link href={`/dashboard/streams/${stream.id}`}>
                            <Button variant="ghost" size="sm">
                              View <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">From</div>
                            <div className="font-mono font-semibold">{stream.sender}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">To</div>
                            <div className="font-mono font-semibold">{stream.recipient}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Amount</div>
                            <div className="font-semibold">{stream.amount.toLocaleString()} sats</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-semibold">{stream.duration}</div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{getProgressPercentage(stream).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${getProgressPercentage(stream)}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-brand-pink to-brand-teal"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Withdrawn: {stream.withdrawn.toLocaleString()} sats</span>
                            <span>Remaining: {(stream.amount - stream.withdrawn).toLocaleString()} sats</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center py-4">
                <Button variant="outline" className="w-full md:w-auto">
                  Load More Streams
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Live Activity */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Activity
                  </CardTitle>
                  <CardDescription>Real-time stream events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold capitalize">{activity.type}</span>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.from} → {activity.to}
                          </div>
                          <div className="text-sm font-mono font-semibold">
                            {parseInt(activity.amount).toLocaleString()} sats
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <Link href="/dashboard/streams/create">
                      <Button className="w-full bg-gradient-to-r from-brand-pink to-brand-teal hover:from-brand-pink/90 hover:to-brand-teal/90">
                        <Waves className="mr-2 h-4 w-4" />
                        Create Your Stream
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Featured Use Cases */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Popular Use Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-sm mb-1">Employee Vesting</div>
                      <div className="text-xs text-muted-foreground">4-year equity vesting schedules</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-sm mb-1">Freelance Contracts</div>
                      <div className="text-xs text-muted-foreground">30-90 day project payments</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-sm mb-1">Creator Support</div>
                      <div className="text-xs text-muted-foreground">Monthly recurring payments</div>
                    </div>
                    <Link href="/dashboard/templates">
                      <Button variant="outline" className="w-full mt-2" size="sm">
                        View All Templates
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
