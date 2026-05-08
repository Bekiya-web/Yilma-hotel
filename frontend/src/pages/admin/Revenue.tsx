import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, CreditCard, Download, Filter, TrendingDown, Users, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBookings } from "@/lib/supabase";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

const AdminRevenue = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings
  });

  // Calculate revenue statistics
  const calculateStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let filteredBookings = bookings;

    // Apply time filter
    if (timeFilter === "today") {
      filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at || '');
        return bookingDate.toDateString() === now.toDateString();
      });
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at || '');
        return bookingDate >= weekAgo;
      });
    } else if (timeFilter === "month") {
      filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at || '');
        return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
      });
    } else if (timeFilter === "year") {
      filteredBookings = bookings.filter(b => {
        const bookingDate = new Date(b.created_at || '');
        return bookingDate.getFullYear() === thisYear;
      });
    }

    // Apply payment filter
    if (paymentFilter !== "all") {
      filteredBookings = filteredBookings.filter(b => b.payment_method === paymentFilter);
    }

    const totalRevenue = filteredBookings.reduce((sum, b) => sum + Number(b.amount), 0);
    const paidRevenue = filteredBookings.filter(b => b.payment_status === 'verified').reduce((sum, b) => sum + Number(b.amount), 0);
    const pendingRevenue = filteredBookings.filter(b => b.payment_status === 'pending').reduce((sum, b) => sum + Number(b.amount), 0);
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;

    // Payment method breakdown
    const telebirrRevenue = filteredBookings.filter(b => b.payment_method === 'telebirr').reduce((sum, b) => sum + Number(b.amount), 0);
    const bankRevenue = filteredBookings.filter(b => b.payment_method === 'bank').reduce((sum, b) => sum + Number(b.amount), 0);
    const hotelRevenue = filteredBookings.filter(b => b.payment_method === 'hotel').reduce((sum, b) => sum + Number(b.amount), 0);

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      confirmedBookings,
      totalBookings: filteredBookings.length,
      telebirrRevenue,
      bankRevenue,
      hotelRevenue,
      filteredBookings
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const prepareMonthlyData = () => {
    const monthlyData: { [key: string]: { revenue: number, bookings: number } } = {};
    
    stats.filteredBookings.forEach(booking => {
      const date = new Date(booking.created_at || '');
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, bookings: 0 };
      }
      
      monthlyData[monthKey].revenue += Number(booking.amount);
      monthlyData[monthKey].bookings += 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        bookings: data.bookings
      }));
  };

  const prepareDailyData = () => {
    const dailyData: { [key: string]: number } = {};
    
    stats.filteredBookings.forEach(booking => {
      const date = new Date(booking.created_at || '');
      const dayKey = date.toISOString().split('T')[0];
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = 0;
      }
      
      dailyData[dayKey] += Number(booking.amount);
    });

    return Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14) // Last 14 days
      .map(([day, revenue]) => ({
        day: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue
      }));
  };

  const paymentMethodData = [
    { name: 'Telebirr', value: stats.telebirrRevenue, color: '#8b5cf6' },
    { name: 'Bank Transfer', value: stats.bankRevenue, color: '#3b82f6' },
    { name: 'Pay at Hotel', value: stats.hotelRevenue, color: '#10b981' }
  ].filter(item => item.value > 0);

  const statusData = [
    { name: 'Verified', value: stats.paidRevenue, color: '#10b981' },
    { name: 'Pending', value: stats.pendingRevenue, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  const monthlyData = prepareMonthlyData();
  const dailyData = prepareDailyData();

  // Calculate growth rate
  const calculateGrowth = () => {
    if (monthlyData.length < 2) return 0;
    const current = monthlyData[monthlyData.length - 1].revenue;
    const previous = monthlyData[monthlyData.length - 2].revenue;
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const growthRate = calculateGrowth();

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const formatCurrency = (amount: number) => `ETB ${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "telebirr": return "Telebirr";
      case "bank": return "Bank Transfer";
      case "hotel": return "Pay at Hotel";
      default: return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-500 mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl mb-2">Revenue & Analytics</h1>
            <p className="text-muted-foreground">Track revenue, financial reports, and analytics.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="telebirr">Telebirr</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="hotel">Pay at Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Loading revenue data...</p>
        ) : (
          <>
            {/* Revenue Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${Number(growthRate) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Number(growthRate) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-medium">{Math.abs(Number(growthRate))}%</span>
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Total Revenue</h3>
                <p className="text-3xl font-serif font-semibold text-yellow-500">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-2">{stats.totalBookings} bookings</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-500" />
                  </div>
                  <Percent className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Paid Revenue</h3>
                <p className="text-3xl font-serif font-semibold text-green-500">{formatCurrency(stats.paidRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.totalRevenue > 0 ? ((stats.paidRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}% of total
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Pending Revenue</h3>
                <p className="text-3xl font-serif font-semibold text-orange-500">{formatCurrency(stats.pendingRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-2">Awaiting verification</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-1">Avg. Booking Value</h3>
                <p className="text-3xl font-serif font-semibold text-blue-500">
                  {formatCurrency(stats.totalBookings > 0 ? stats.totalRevenue / stats.totalBookings : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">{stats.confirmedBookings} confirmed</p>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend Chart */}
              <Card className="p-6 bg-gradient-to-br from-card to-card/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl">Revenue Trend</h2>
                  <div className="text-xs text-muted-foreground">Last 6 months</div>
                </div>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                      <XAxis 
                        dataKey="month" 
                        stroke="currentColor" 
                        className="text-muted-foreground"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        className="text-muted-foreground"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#eab308" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
                    <p>No revenue data yet</p>
                    <p className="text-xs mt-1">Data will appear when bookings are made</p>
                  </div>
                )}
              </Card>

              {/* Daily Revenue Chart */}
              <Card className="p-6 bg-gradient-to-br from-card to-card/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-xl">Daily Revenue</h2>
                  <div className="text-xs text-muted-foreground">Last 14 days</div>
                </div>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                      <XAxis 
                        dataKey="day" 
                        stroke="currentColor" 
                        className="text-muted-foreground"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="currentColor" 
                        className="text-muted-foreground"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#eab308" 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <Calendar className="w-12 h-12 mb-3 opacity-20" />
                    <p>No daily data yet</p>
                    <p className="text-xs mt-1">Data will appear when bookings are made</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Payment Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Payment Methods Pie Chart */}
              <Card className="p-6 bg-gradient-to-br from-card to-card/50">
                <h2 className="font-serif text-xl mb-6">Revenue by Payment Method</h2>
                {paymentMethodData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={1000}
                          paddingAngle={2}
                        >
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-4 min-w-[180px]">
                      {paymentMethodData.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-lg font-serif font-semibold" style={{ color: item.color }}>
                              {formatCurrency(item.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {((item.value / stats.totalRevenue) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                    <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                    <p>No payment data yet</p>
                    <p className="text-xs mt-1">Data will appear when payments are made</p>
                  </div>
                )}
              </Card>

              {/* Payment Status Pie Chart */}
              <Card className="p-6 bg-gradient-to-br from-card to-card/50">
                <h2 className="font-serif text-xl mb-6">Payment Status Distribution</h2>
                {statusData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          innerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={1000}
                          paddingAngle={2}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-4 min-w-[180px]">
                      {statusData.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-lg font-serif font-semibold" style={{ color: item.color }}>
                              {formatCurrency(item.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {((item.value / stats.totalRevenue) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mb-3 opacity-20" />
                    <p>No status data yet</p>
                    <p className="text-xs mt-1">Data will appear when payments are verified</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="p-6">
              <h2 className="font-serif text-2xl mb-6">Recent Transactions</h2>
              {stats.filteredBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No transactions found for the selected filters.</p>
              ) : (
                <div className="space-y-4">
                  {stats.filteredBookings.slice(0, 10).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium">{booking.booking_id}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.payment_status === 'verified'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-orange-500/10 text-orange-600'
                          }`}>
                            {booking.payment_status === 'verified' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'Unknown'} • {getPaymentMethodLabel(booking.payment_method || '')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(booking.created_at || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-serif font-semibold text-yellow-500">
                          {formatCurrency(booking.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {booking.room?.name || 'Unknown Room'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminRevenue;
