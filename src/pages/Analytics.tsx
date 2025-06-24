
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, DollarSign, TrendingUp, Users, Download, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number; transactions: number }>;
  topFiles: Array<{ name: string; revenue: number; downloads: number }>;
  paymentMethods: Array<{ method: string; count: number; revenue: number }>;
  dailyStats: Array<{ date: string; revenue: number; downloads: number }>;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenueData: [],
    topFiles: [],
    paymentMethods: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      // Fetch revenue data by month
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          created_at,
          net_amount,
          payment_method,
          files!inner(title)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Process revenue data by month
      const revenueByMonth = transactions?.reduce((acc, tx) => {
        const month = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { revenue: 0, transactions: 0 };
        }
        acc[month].revenue += tx.net_amount || 0;
        acc[month].transactions += 1;
        return acc;
      }, {} as Record<string, { revenue: number; transactions: number }>) || {};

      const revenueData = Object.entries(revenueByMonth).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        transactions: data.transactions
      }));

      // Process daily stats
      const dailyStats = transactions?.reduce((acc, tx) => {
        const date = new Date(tx.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { revenue: 0, downloads: 0 };
        }
        acc[date].revenue += tx.net_amount || 0;
        acc[date].downloads += 1;
        return acc;
      }, {} as Record<string, { revenue: number; downloads: number }>) || {};

      const dailyStatsArray = Object.entries(dailyStats).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        downloads: data.downloads
      })).slice(-7); // Last 7 days

      // Process payment methods
      const paymentMethodStats = transactions?.reduce((acc, tx) => {
        const method = tx.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, revenue: 0 };
        }
        acc[method].count += 1;
        acc[method].revenue += tx.net_amount || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>) || {};

      const paymentMethods = Object.entries(paymentMethodStats).map(([method, data]) => ({
        method,
        count: data.count,
        revenue: data.revenue
      }));

      // Fetch top files
      const { data: files } = await supabase
        .from('files')
        .select('title, total_revenue, total_downloads')
        .eq('user_id', user.id)
        .order('total_revenue', { ascending: false })
        .limit(5);

      const topFiles = files?.map(file => ({
        name: file.title,
        revenue: file.total_revenue || 0,
        downloads: file.total_downloads || 0
      })) || [];

      setAnalytics({
        revenueData,
        topFiles,
        paymentMethods,
        dailyStats: dailyStatsArray
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))'
    },
    transactions: {
      label: 'Transactions',
      color: 'hsl(var(--chart-2))'
    },
    downloads: {
      label: 'Downloads',
      color: 'hsl(var(--chart-3))'
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track your revenue and file performance</p>
          </div>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="files">Top Files</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="var(--color-revenue)" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                  <CardDescription>Recent daily performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="downloads" fill="var(--color-downloads)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Detailed revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analytics.revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                      <Bar dataKey="transactions" fill="var(--color-transactions)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Files</CardTitle>
                <CardDescription>Files with highest revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">{file.downloads} downloads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${file.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.paymentMethods}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ method, count }) => `${method}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.paymentMethods.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="space-y-4">
                    {analytics.paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span>{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{method.count} transactions</p>
                          <p className="text-sm text-gray-500">${method.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
