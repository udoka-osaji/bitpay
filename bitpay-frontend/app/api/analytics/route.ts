import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Transaction, Stream, User } from '@/models';
import { getTokenFromRequest, verifyToken } from '@/lib/auth/auth';

// GET /api/analytics - Get analytics data for authenticated user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user from database to fetch wallet address
    const user = await User.findById(payload.userId);
    if (!user || !user.walletAddress) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 400 });
    }

    const userAddress = user.walletAddress;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, all

    // Calculate date range
    let dateFilter: any = {};
    if (timeframe !== 'all') {
      const days = parseInt(timeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Fetch cancellation data by month
    const cancellations = await Transaction.aggregate([
      {
        $match: {
          $or: [{ sender: userAddress }, { recipient: userAddress }],
          type: 'cancel',
          status: 'confirmed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $limit: 6,
      },
    ]);

    // Fetch total streams by month for comparison
    const streamsByMonth = await Stream.aggregate([
      {
        $match: {
          $or: [{ sender: userAddress }, { recipient: userAddress }],
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $limit: 6,
      },
    ]);

    // Fetch withdrawal pattern by day of week
    const withdrawals = await Transaction.aggregate([
      {
        $match: {
          recipient: userAddress,
          type: 'withdraw',
          status: 'confirmed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
          totalAmount: { $sum: { $toLong: '$amount' } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fetch NFT transfer activity (from marketplace events)
    // This would come from marketplace transfer events
    // For now, return recent transaction activity as a proxy
    const recentActivity = await Transaction.aggregate([
      {
        $match: {
          $or: [{ sender: userAddress }, { recipient: userAddress }],
          status: 'confirmed',
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          transfers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 7,
      },
    ]);

    // Format cancellation data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cancellationData = cancellations.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      cancellations: item.count,
    }));

    // Format streams by month
    const streamsData = streamsByMonth.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      streams: item.count,
    }));

    // Merge cancellation and streams data
    const mergedMonthlyData = streamsData.map((stream) => {
      const cancellation = cancellationData.find(
        (c) => c.month === stream.month && c.year === stream.year
      );
      return {
        month: stream.month,
        cancellations: cancellation?.cancellations || 0,
        streams: stream.streams,
      };
    });

    // Format withdrawal pattern
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const withdrawalPattern = dayNames.map((day, index) => {
      const data = withdrawals.find((w) => w._id === index + 1) || { count: 0, totalAmount: '0' };
      return {
        day,
        withdrawals: data.count,
        amount: Number(data.totalAmount) / 100_000_000, // Convert to sBTC
      };
    });

    // Format recent activity (last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const nftTransferData = last7Days.map((date, index) => {
      const activity = recentActivity.find((a) => a._id === date) || { transfers: 0 };
      const daysAgo = 6 - index;
      const label = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
      return {
        date: label,
        transfers: activity.transfers,
      };
    });

    // Calculate withdrawal statistics
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.count, 0);
    const peakDay = withdrawals.reduce(
      (max, w) => (w.count > max.count ? w : max),
      { _id: 1, count: 0 }
    );
    const peakDayName = dayNames[peakDay._id - 1] || 'N/A';

    return NextResponse.json({
      success: true,
      data: {
        cancellationData: mergedMonthlyData,
        withdrawalPattern,
        nftTransferData,
        statistics: {
          peakWithdrawalDay: peakDayName,
          totalWithdrawals,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
